import asyncio
import json
import sys
from dotenv import load_dotenv

# Ensure stdout uses UTF-8 where supported
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

async def test_live_gemini():
    print("==========================================================")
    print(" KIZUNA AI - LIVE GOOGLE GEMINI GENERATION VERIFICATION   ")
    print("==========================================================")

    # 1. Load settings from backend/.env
    from core.config import settings
    from services.llm import get_llm_provider, GeminiProvider

    key_present = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 0)
    print(f"1. GEMINI_API_KEY detected in environment: {key_present}")
    print(f"2. Configured Model: {settings.GEMINI_MODEL}")

    if not key_present:
        print("[FAIL] GEMINI_API_KEY is not detected in environment.")
        return False

    # 2. Resolve provider through architecture abstraction
    provider = get_llm_provider()
    print(f"3. Provider resolved via factory: {type(provider).__name__}")
    assert isinstance(provider, GeminiProvider), f"Expected GeminiProvider, got {type(provider).__name__}"

    # 3. Perform Live Generation Request
    system_prompt = "You are an AI intelligence assistant for KIZUNA AI India-Japan market entry platform. Always output valid JSON only."
    user_prompt = "Return a JSON object with product, target_market, and confidence for a Japanese precision industrial sensor entering India."

    print("\n4. Sending live prompt to Gemini API...")
    try:
        response_text = await provider.generate_response(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.1
        )
        print("5. Response successfully received from Gemini API!")
        print("\n--- GEMINI RESPONSE OUTPUT ---")
        print(response_text.strip())
        print("------------------------------")

        # Clean potential markdown code blocks for JSON validation
        cleaned_json_text = response_text.strip()
        if cleaned_json_text.startswith("```json"):
            cleaned_json_text = cleaned_json_text[7:]
        if cleaned_json_text.startswith("```"):
            cleaned_json_text = cleaned_json_text[3:]
        if cleaned_json_text.endswith("```"):
            cleaned_json_text = cleaned_json_text[:-3]
        cleaned_json_text = cleaned_json_text.strip()

        parsed = json.loads(cleaned_json_text)
        print("\n6. JSON Parse Verification: SUCCESS")
        print(f"   - Product: {parsed.get('product')}")
        print(f"   - Target Market: {parsed.get('target_market')}")
        print(f"   - Confidence: {parsed.get('confidence')}")

    except Exception as e:
        print(f"\n[FAIL] Live Gemini generation failed: {type(e).__name__} - {e}")
        return False

    # 4. Verify test_connection method
    print("\n7. Verifying provider.test_connection() handshake...")
    conn_result = await provider.test_connection()
    print(f"   Connection result: success={conn_result.get('success')}, status='{conn_result.get('status')}'")
    assert conn_result.get("success") is True, "test_connection failed"

    # 5. Verify error handling with simulated invalid key (ensure API key is never exposed)
    print("\n8. Verifying error handling on bad key...")
    bad_provider = GeminiProvider(api_key="AIzaSy_INVALID_SIMULATED_KEY_12345", model_name=settings.GEMINI_MODEL)
    bad_result = await bad_provider.test_connection()
    assert bad_result.get("success") is False, "Expected error on bad key"
    assert "AIzaSy_INVALID_SIMULATED_KEY_12345" not in str(bad_result), "SECURITY: Key was leaked in error!"
    print("   Error handling on bad key: VERIFIED (Zero credential leak)")

    print("\n==========================================================")
    print(" LIVE GEMINI GENERATION TEST COMPLETED SUCCESSFULLY!      ")
    print("==========================================================")
    return True

if __name__ == "__main__":
    success = asyncio.run(test_live_gemini())
    sys.exit(0 if success else 1)
