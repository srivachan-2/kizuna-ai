# KIZUNA AI (絆 AI)
### Agentic India–Japan Market Entry Intelligence Platform for Japanese Enterprises

KIZUNA AI is an enterprise B2B market intelligence and strategic decision-support platform designed specifically to guide Japanese manufacturing, robotics, and technology enterprises entering high-growth Indian industrial corridors.

---

## 1. Problem Statement

Japanese enterprises evaluating market entry into India face complex, multi-dimensional challenges:
- **Fragmented Market & Industrial Data:** Navigating disparate state-level industrial ecosystems (e.g., Sriperumbudur in Tamil Nadu, Mandal-Becharaji in Gujarat, Gurgaon/Manesar in Delhi-NCR).
- **Partner Discovery & Qualification Friction:** Difficulty identifying and vetting high-reliability regional system integrators, master distributors, and joint-venture candidates.
- **Regulatory & Compliance Uncertainty:** Complex certification pathways (such as Bureau of Indian Standards / BIS CRS, DPDP Act data privacy, import tariff schedules).
- **Competitive Pressure:** Squeezed between low-cost domestic alternatives and established European/US incumbents.
- **Cross-Border Execution Complexity:** Translating Tokyo board directives into actionable 90-day on-the-ground operational milestones.

---

## 2. The KIZUNA AI Solution

KIZUNA converts a product brief into an end-to-end, boardroom-ready market entry strategy through an autonomous 6-agent sequential pipeline:

```
[Japanese Product Brief]
          ↓
[1. Brief Extraction Agent]      → Extracts product specs, price targets & IP moat
          ↓
[2. Market Lens Agent]          → Identifies priority regional industrial clusters & TAM fit
          ↓
[3. Competitor Map Agent]       → Analyzes price-to-performance tiers & white-spaces
          ↓
[4. Partner Match Agent]        → Deterministic multi-criteria fit scoring of regional partners
          ↓
[5. Adversarial Red Team Agent] → Stress-tests regulatory, FX, and execution risks (10 categories)
          ↓
[6. Action Planner Agent]       → Synthesizes 90-day roadmap, decision gates & outreach pack
          ↓
[7. Executive Brief & Export]   → Bilingual (EN/JP) Memorandum + Corporate PDF & Markdown
```

---

## 3. Core Agent Architecture

| Agent | Core Objective | Key Output Schema |
| :--- | :--- | :--- |
| **Brief Extraction** | Ingests Japanese specifications and positioning | `BriefExtractionResult` (Product, Target SME, IP Moat, Constraints) |
| **Market Lens** | Maps industrial clusters & customer demand | `MarketLensResult` (Corridors, Demand Signals, Market Fit Score) |
| **Competitor Map** | Benchmarks incumbents & domestic players | `CompetitorAnalysisResult` (Global/Domestic Matrix, Price Gaps) |
| **Partner Match** | Deterministic multi-criteria partner ranking | `PartnerMatchResult` (6-dimension scoring, Integrator/Distributor roles) |
| **Adversarial Red Team** | Stress-tests entry risks & weak assumptions | `RedTeamResult` (Likelihood × Impact matrix across 10 dimensions) |
| **Action Planner** | Operationalizes entry into 90-day roadmap | `ActionPlannerResult` (Days 1-30, 31-60, 61-90, 4 Decision Gates, Outreach) |
| **Executive Brief** | Synthesizes board-level deliverable | `ExecutiveBrief` (1-Minute Boardroom Summary, bilingual EN & JA) |

---

## 4. Decision-Support Indicators & Methodology

KIZUNA AI uses transparent, AI-assisted decision-support indicators with rigorous evidence classification:

- **Market Fit Score (0–100):** Evaluates product-market alignment against regional industrial demand.
- **Partner Fit Score (0–100):** Multi-criteria deterministic evaluation (Market 25%, Industry 20%, Technical 20%, Geographic 15%, Distribution 10%, Pilot 10%).
- **Launch Risk Level:** Severity matrix derived from likelihood $\times$ impact across 10 operational and regulatory categories.
- **Evidence Audit Trail:** Categorized into:
  - `SOURCE DATA`: Direct OEM-provided product specifications or official regulatory schedules.
  - `AI INFERENCE`: Analytical derivations grounded in industrial datasets.
  - `ASSUMPTIONS`: Key hypotheses requiring on-the-ground validation.

> **Important Disclaimer:**  
> *KIZUNA decision-support indicators are AI-assisted analytical scores, not objective market truth. Curated market, competitor, and partner records are benchmark demonstration data unless independently verified.*

---

## 5. Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** SQLite with SQLAlchemy ORM
- **LLM Integration:** Google Gemini API (`gemini-2.5-flash` / configurable via `GEMINI_MODEL`) with graceful zero-crash fallback
- **Document Generation:** ReportLab (Corporate A4 PDF with Japanese CID font support) & Markdown

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide React
- **Design System:** Precision B2B Dark Theme with bilingual English / 日本語 toggle

---

## 6. Getting Started & Demo Walkthrough

### 1. Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- (Optional) Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend runs at `http://localhost:8000` (API Docs at `http://localhost:8000/docs`).*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`.*

---

## 7. Benchmark Demo Scenario (Nippon Robotics Corp.)

1. **Launch:** Click **"Launch Demo Scenario"** on the home page.
2. **Review Brief:** Inspect **株式会社 日本ロボティクス (Nippon Robotics Corp.) — CR-500 Compact Cobot**.
3. **Execute Pipeline:** Click **"Run Full Analysis"** to observe real-time progress across all 6 sequential agents.
4. **Explore Workspace:** Navigate through Market Lens, Competitor Map, Partner Match, Red Team, and 90-Day Plan.
5. **Executive Brief:** Open Stage 7 for the 1-Minute Boardroom Summary.
6. **Bilingual Toggle:** Switch between English and **日本語**.
7. **Export Deliverables:** Download publication-grade **PDF** and **Markdown** entry briefs.
8. **Reset Demo:** Use the **"Reset Demo"** button to restart the benchmark scenario safely at any time.

---

## 8. Verification & Quality Assurance

Run the automated test suites:
```bash
cd backend
.\venv\Scripts\python test_phase3.py
```

Frontend production build check:
```bash
cd frontend
npm run build
```
