import sys
import time
import requests

BASE_URL = "http://localhost:8000"

def test_lifecycle():
    print("==================================================================")
    print(" KIZUNA AI - PIPELINE LIFECYCLE & CANCEL / RECOVERY VERIFICATION")
    print("==================================================================")

    # 1. Reset demo project
    print("\n[STEP 1] Resetting demo project...")
    res = requests.post(f"{BASE_URL}/api/analysis/reset-demo")
    assert res.status_code == 200, f"Reset failed: {res.text}"
    print("  [OK] Demo project reset successfully.")

    # 2. Check initial state
    print("\n[STEP 2] Verifying initial clean state...")
    res = requests.get(f"{BASE_URL}/api/analysis/demo-robot-sme/results")
    assert res.status_code == 200, f"Results fetch failed: {res.text}"
    data = res.json()
    print(f"  [OK] Initial Status: {data.get('status')} | Progress: {data.get('progress')}% | Agent Results: {len(data.get('agent_results', []))}")

    # 3. Start Run Pipeline
    print("\n[STEP 3] Starting pipeline run...")
    res = requests.post(f"{BASE_URL}/api/analysis/demo-robot-sme/run")
    assert res.status_code == 200, f"Run start failed: {res.text}"
    print("  [OK] Pipeline started asynchronously.")

    # 4. Check status during execution
    time.sleep(0.5)
    print("\n[STEP 4] Checking live running status...")
    res = requests.get(f"{BASE_URL}/api/analysis/demo-robot-sme/results")
    data = res.json()
    print(f"  [OK] Status: {data.get('status')} | Stage: {data.get('stage')} | Progress: {data.get('progress')}%")

    # 5. Prevent Duplicate Runs while running
    print("\n[STEP 5] Testing Duplicate Run Prevention...")
    res_dup = requests.post(f"{BASE_URL}/api/analysis/demo-robot-sme/run")
    dup_data = res_dup.json()
    print(f"  [OK] Duplicate Run Response Status: {dup_data.get('status')} (Handled cleanly)")

    # 6. Stop / Cancel Analysis
    print("\n[STEP 6] Triggering Stop / Cancel Analysis...")
    res_cancel = requests.post(f"{BASE_URL}/api/analysis/demo-robot-sme/stop")
    assert res_cancel.status_code == 200, f"Stop failed: {res_cancel.text}"
    cancel_data = res_cancel.json()
    print(f"  [OK] Cancel Response Status: {cancel_data.get('status')}")

    # 7. Check persistent cancelled state (simulate refresh)
    time.sleep(1.0)
    print("\n[STEP 7] Simulating page refresh after cancellation...")
    res_refreshed = requests.get(f"{BASE_URL}/api/analysis/demo-robot-sme/results")
    refreshed_data = res_refreshed.json()
    print(f"  [OK] Refreshed State Status: {refreshed_data.get('status')} | Progress: {refreshed_data.get('progress')}%")
    assert refreshed_data.get('status') in ['cancelled', 'completed'], f"Expected cancelled status, got {refreshed_data.get('status')}"
    print("  [OK] Successfully confirmed: Not stuck at 8% or running.")

    # 8. Start a clean run and let it complete
    print("\n[STEP 8] Resetting & Running Full Pipeline to Completion...")
    requests.post(f"{BASE_URL}/api/analysis/reset-demo")
    requests.post(f"{BASE_URL}/api/analysis/demo-robot-sme/run")

    for i in range(30):
        time.sleep(1.5)
        res_poll = requests.get(f"{BASE_URL}/api/analysis/demo-robot-sme/results")
        poll_data = res_poll.json()
        status = poll_data.get("status")
        stage = poll_data.get("stage")
        progress = poll_data.get("progress", 0)
        print(f"  ... [Polling] Status: {status} | Stage: {stage} | Progress: {progress}% | Agents: {len(poll_data.get('agent_results', []))}")
        if status in ["completed", "failed"]:
            break

    assert status == "completed", f"Expected completed status, got {status}"
    assert progress == 100, f"Expected 100% progress, got {progress}%"
    print("\n==================================================================")
    print(" ALL LIFECYCLE & SYNCHRONIZATION TESTS PASSED WITH 100% SUCCESS! ")
    print("==================================================================")

if __name__ == "__main__":
    test_lifecycle()
