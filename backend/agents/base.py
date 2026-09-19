import json
import logging
import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Type, Optional
from pydantic import BaseModel, ValidationError
from services.llm import BaseLLMProvider, get_llm_provider
from agents.schemas import AgentExecutionOutput

logger = logging.getLogger("kizuna.agent")

class BaseAgent(ABC):
    """
    Abstract Base Class for all KIZUNA AI intelligence agents.
    Provides standard execution lifecycle, validation, and safe error handling.
    """
    def __init__(self, agent_name: str, description: str, llm_provider: Optional[BaseLLMProvider] = None):
        self.agent_name = agent_name
        self.description = description
        self.llm = llm_provider or get_llm_provider()

    @abstractmethod
    def get_system_prompt(self) -> str:
        """Returns the specialized system prompt for the agent."""
        pass

    @abstractmethod
    def build_user_prompt(self, context: Dict[str, Any]) -> str:
        """Constructs the structured input prompt from the pipeline context."""
        pass

    @abstractmethod
    def get_schema(self) -> Type[BaseModel]:
        """Returns the Pydantic schema class used to validate output."""
        pass

    def clean_json_string(self, raw_text: str) -> str:
        """Strips markdown backticks and trims whitespace for clean JSON parsing."""
        text = raw_text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()

    async def execute(self, context: Dict[str, Any]) -> AgentExecutionOutput:
        """
        Executes the agent workflow:
        1. Formats prompts
        2. Calls LLM Provider via get_llm_provider()
        3. Parses and validates response against Pydantic schema
        4. Performs 1 retry if JSON parsing fails
        5. Returns structured AgentExecutionOutput
        """
        start_time = time.time()
        system_prompt = self.get_system_prompt()
        user_prompt = self.build_user_prompt(context)
        input_summary = str(context.get("product_name", "Product Brief Context"))[:200]

        try:
            # First attempt
            raw_response = await self.llm.generate_response(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.1
            )
            
            cleaned_json = self.clean_json_string(raw_response)
            parsed_dict = None
            try:
                parsed_dict = json.loads(cleaned_json)
            except json.JSONDecodeError as json_err:
                logger.warning(f"[{self.agent_name}] JSON parsing error on attempt 1: {json_err}. Retrying with correction instruction...")
                # Single retry with correction prompt
                correction_prompt = (
                    f"{user_prompt}\n\n"
                    f"CRITICAL: Your previous response was not valid JSON. Error: {str(json_err)}. "
                    f"Return ONLY valid JSON matching the exact schema."
                )
                retry_response = await self.llm.generate_response(
                    system_prompt=system_prompt,
                    user_prompt=correction_prompt,
                    temperature=0.0
                )
                cleaned_retry = self.clean_json_string(retry_response)
                parsed_dict = json.loads(cleaned_retry)

            # Validate against Pydantic schema
            schema_class = self.get_schema()
            validated_obj = schema_class.model_validate(parsed_dict)
            data_dict = validated_obj.model_dump()
            confidence = getattr(validated_obj, "confidence", 0.9)

            duration = round(time.time() - start_time, 2)
            return AgentExecutionOutput(
                agent_name=self.agent_name,
                status="completed",
                data=data_dict,
                confidence=confidence,
                input_summary=input_summary,
                execution_time_seconds=duration
            )

        except (json.JSONDecodeError, ValidationError) as schema_err:
            duration = round(time.time() - start_time, 2)
            logger.error(f"[{self.agent_name}] Schema validation failed: {schema_err}")
            return AgentExecutionOutput(
                agent_name=self.agent_name,
                status="failed",
                error=f"Output validation failed: {str(schema_err)}",
                input_summary=input_summary,
                execution_time_seconds=duration
            )
        except Exception as e:
            duration = round(time.time() - start_time, 2)
            logger.error(f"[{self.agent_name}] Execution error: {e}")
            return AgentExecutionOutput(
                agent_name=self.agent_name,
                status="failed",
                error=str(e),
                input_summary=input_summary,
                execution_time_seconds=duration
            )
