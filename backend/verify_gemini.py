import asyncio
from services.llm import get_llm_provider, GeminiProvider, MockLLMProvider
from api.llm import get_llm_status, test_llm_connection
from core.config import settings

async def run_tests():
    print("=== 1. Testing Default / Mock Provider Architecture ===")
    provider = get_llm_provider()
    print(f"Active Provider Type: {type(provider).__name__}")
    
    # Test generation with mock
    mock_res = await provider.generate_response(
        system_prompt="You are Kizuna AI.",
        user_prompt="Analyze Indian industrial corridor."
    )
    print("Mock Output Sample:", mock_res[:80], "...")
    assert "KIZUNA AI" in mock_res, "Mock generation failed"
    print("✓ Mock provider test passed.")

    print("\n=== 2. Testing Safe Status Endpoint (Zero Secret Leakage) ===")
    status_response = get_llm_status()
    status_dict = status_response.model_dump()
    print("Status response payload:", status_dict)
    assert "api_key" not in status_dict, "SECURITY BREACH: api_key in status response"
    assert "key" not in status_dict, "SECURITY BREACH: key in status response"
    assert status_dict["provider"] in ["Google Gemini", "Mock Provider"]
    print("✓ Status endpoint is completely safe and leak-free.")

    print("\n=== 3. Testing Test Connection Endpoint ===")
    test_res = await test_llm_connection()
    print("Test connection response:", test_res.model_dump())
    assert test_res.provider in ["mock", "gemini"]
    print("✓ Test connection endpoint executed successfully.")

    print("\n=== 4. Testing Gemini Provider Error Handling (Simulated Invalid Key) ===")
    gemini_invalid = GeminiProvider(api_key="AIzaSy_INVALID_KEY_FOR_TESTING", model_name="gemini-1.5-flash")
    conn_result = await gemini_invalid.test_connection()
    print("Invalid Key Connection Test:", conn_result)
    assert conn_result["success"] is False, "Expected error on invalid key"
    assert "AIzaSy_INVALID_KEY_FOR_TESTING" not in str(conn_result), "SECURITY BREACH: Key echoed in error result"
    print("✓ Graceful error handling verified with zero key leakage.")

    print("\nALL BACKEND GEMINI ARCHITECTURE TESTS PASSED!")

if __name__ == "__main__":
    asyncio.run(run_tests())
