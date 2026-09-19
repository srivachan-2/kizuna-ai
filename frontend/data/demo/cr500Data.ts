import {
  BriefExtractionResult,
  MarketLensResult,
  CompetitorAnalysisResult,
  PartnerMatchResult,
  RedTeamResult,
  ActionPlannerResult,
  ExecutiveBriefResult,
  Project,
  SectorInfo,
  RegulationInfo,
  AnalysisRunResponse
} from "@/types";

export const DEMO_PROJECT_ID = "demo-robot-sme";

export const DEMO_PROJECT: Project = {
  id: DEMO_PROJECT_ID,
  name: "CR-500 India Market Entry",
  company_name_jp: "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
  target_sector: "smart-manufacturing",
  status: "completed",
  created_at: "2025-01-15T09:00:00Z"
};

export const DEMO_SECTORS: SectorInfo[] = [
  {
    "id": "ev-mobility",
    "name": "Electric Vehicles & Clean Mobility",
    "market_size_india_2025": "$7.2 Billion",
    "cagr": "49.0%",
    "key_opportunities": [
      "2W/3W Battery swapping infrastructure",
      "Precision power electronics and Japanese thermal management systems",
      "Fleet telematics and regenerative brake components"
    ],
    "regulatory_body": "Ministry of Heavy Industries (FAME/EMPS, PLI-Auto)",
    "bilateral_initiatives": "India-Japan Clean Energy Partnership (CEP)"
  },
  {
    "id": "smart-manufacturing",
    "name": "Smart Manufacturing & Industrial Automation",
    "market_size_india_2025": "$14.8 Billion",
    "cagr": "21.5%",
    "key_opportunities": [
      "Factory IoT sensor networks and predictive maintenance",
      "Robotic welding and automated optical inspection for electronics corridor (Tamil Nadu, Gujarat, NCR)",
      "Kaizen-integrated MES software"
    ],
    "regulatory_body": "Department for Promotion of Industry and Internal Trade (DPIIT)",
    "bilateral_initiatives": "Japan-India Make-in-India Special Finance Facility"
  },
  {
    "id": "medtech-diagnostics",
    "name": "MedTech, Diagnostics & Healthcare Robotics",
    "market_size_india_2025": "$11.0 Billion",
    "cagr": "18.2%",
    "key_opportunities": [
      "Point-of-care ultrasound and AI-augmented imaging",
      "Minimally invasive surgical tools and rehabilitation robotics",
      "Ayushman Bharat Digital Mission (ABDM) compliant telehealth hardware"
    ],
    "regulatory_body": "Central Drugs Standard Control Organisation (CDSCO)",
    "bilateral_initiatives": "JETRO-Invest India Healthcare Taskforce"
  },
  {
    "id": "enterprise-saas",
    "name": "B2B Enterprise Software & Supply Chain Tech",
    "market_size_india_2025": "$18.5 Billion",
    "cagr": "28.0%",
    "key_opportunities": [
      "Cross-border supply chain transparency & customs automation",
      "AI-driven procurement and GST/e-invoicing reconciliation",
      "Bilingual enterprise collaboration tools (JP-EN-Hindi)"
    ],
    "regulatory_body": "Ministry of Electronics and Information Technology (MeitY)",
    "bilateral_initiatives": "India-Japan Digital Partnership (IJDP)"
  }
];

export const DEMO_REGULATIONS: RegulationInfo[] = [
  {
    "id": "dpdp-act-2023",
    "name": "Digital Personal Data Protection (DPDP) Act",
    "impact_level": "Critical",
    "applicable_sectors": [
      "Enterprise SaaS",
      "MedTech",
      "FinTech",
      "IoT Devices"
    ],
    "summary": "Mandates explicit consent architectures, data fiduciary obligations, strict cross-border transfer rules, and significant penalties for non-compliance.",
    "japanese_corporate_guidance": "Requires local data localization compliance audits and consent manager integration."
  },
  {
    "id": "bis-crs",
    "name": "BIS Compulsory Registration Scheme (CRS)",
    "impact_level": "High",
    "applicable_sectors": [
      "Smart Manufacturing",
      "EV Electronics",
      "Hardware & Sensors"
    ],
    "summary": "Bureau of Indian Standards certification required for electronic and IT goods before customs clearance and domestic distribution.",
    "japanese_corporate_guidance": "Lab testing must be conducted in BIS-recognized labs in India; lead times range between 8-16 weeks."
  },
  {
    "id": "fdi-automatic-route",
    "name": "100% FDI Automatic Route for Manufacturing",
    "impact_level": "Favorable",
    "applicable_sectors": [
      "Automotive",
      "Industrial Automation",
      "Renewable Energy"
    ],
    "summary": "Permits 100% foreign direct investment without prior government or RBI approval for designated manufacturing sectors.",
    "japanese_corporate_guidance": "Streamlined incorporation via SPICe+ and NICDC industrial township incentives (e.g. Neemrana Japanese Industrial Zone)."
  }
];

export const DEMO_BRIEF_EXTRACTION: BriefExtractionResult = {
  "product_name": "Compact Industrial 6-Axis Collaborative Robot (CR-500)",
  "product_category": "Industrial Automation & Robotics",
  "product_description": "Ultra-compact 6-axis collaborative robot with optical torque sensing and 40% lower power draw.",
  "company_name": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
  "origin_country": "Japan",
  "target_market": "Indian SME Auto Component and Electronics Manufacturers",
  "target_customer": "Tier-2 Auto Component and Electronics SME plant heads",
  "price_range": "₹12-15 Lakhs INR equivalent",
  "launch_timeline": "6 months",
  "target_regions": [
    "Tamil Nadu (Sriperumbudur/Hosur)",
    "Gujarat (Sanand)",
    "Delhi-NCR (Manesar)"
  ],
  "business_model": "Hybrid System Integrator & Master Distributor",
  "constraints": [
    "BIS CRS laboratory testing lead time",
    "Import customs clearance"
  ],
  "key_requirements": [
    "Local first-line maintenance network",
    "Controller API documentation"
  ],
  "assumptions": [
    "SME customers prefer turnkey integration over bare-arm supply"
  ],
  "confidence": 0.94
};

export const DEMO_MARKET_LENS: MarketLensResult = {
  "market_summary": "High-growth bilateral opportunity in Indian manufacturing hubs driven by PLI incentives.",
  "target_segments": [
    "Tier-2 Auto Components",
    "PCB Assembly & Electronics"
  ],
  "customer_needs": [
    "Affordable precision automation",
    "Rapid technical support",
    "Low footprint"
  ],
  "demand_signals": [
    "National Manufacturing Policy",
    "Make in India PLI expansion"
  ],
  "opportunities": [
    "First-mover Japanese high-precision cobot under ₹15 Lakhs"
  ],
  "market_entry_considerations": [
    "BIS CRS mandatory registration",
    "High import tariffs on finished robotics"
  ],
  "priority_regions": [
    {
      "region": "Tamil Nadu (Sriperumbudur/Hosur)",
      "relevance": "High",
      "reasoning": "Major automotive cluster",
      "confidence": 0.95
    },
    {
      "region": "Gujarat (Sanand)",
      "relevance": "High",
      "reasoning": "Fast-growing industrial base",
      "confidence": 0.9
    }
  ],
  "positioning": "Japanese precision engineering tailored for Indian SME automation requirements.",
  "market_fit_score": 88,
  "confidence": 0.92,
  "evidence": [
    "Industrial corridor study",
    "Automotive manufacturing data"
  ],
  "assumptions": [
    "Tier-2 component manufacturers have active CapEx budgets"
  ]
};

export const DEMO_COMPETITOR_MAP: CompetitorAnalysisResult = {
  "competitive_summary": "Dominated by European cobot OEMs at high price brackets and domestic integrators at lower payload tiers.",
  "competitors": [
    {
      "name": "Universal Robots (UR3e/UR5e)",
      "type": "global",
      "product_category": "Collaborative Robots",
      "target_segment": "Tier-1 Auto & Tier-1 Electronics",
      "positioning": "Premium Global Cobot Pioneer",
      "pricing": "High CapEx (₹20-28 Lakhs)",
      "strengths": [
        "Brand recognition",
        "Established integrator network"
      ],
      "weaknesses": [
        "High initial investment",
        "Costly spares"
      ],
      "visible_gap": "SME price resistance and complex setup overhead",
      "source": "Curated database",
      "confidence": 0.93
    }
  ],
  "market_gaps": [
    "Affordable compact 6-axis cobot priced in the ₹12-15 Lakh bracket with Japanese durability"
  ],
  "positioning_opportunities": [
    "Market as plug-and-play machine tending specialist with local service warranty"
  ],
  "confidence": 0.91,
  "evidence": [
    "Competitor pricing benchmarks"
  ],
  "assumptions": [
    "Competitors will not lower pricing by >20% in the short term"
  ]
};

export const DEMO_PARTNER_MATCH: PartnerMatchResult = {
  "summary": "Shortlisted 3 specialized Indian System Integrators and regional distributors with strong automotive footprints.",
  "partners": [
    {
      "name": "Dynamic Industrial Automation Pvt Ltd",
      "partner_type": "System Integrator",
      "fit_score": 92,
      "market_fit": 90,
      "industry_fit": 95,
      "technical_fit": 92,
      "geographic_fit": 95,
      "distribution_fit": 88,
      "pilot_fit": 92,
      "reasoning": "Extensive integration footprint in Sriperumbudur automotive corridor.",
      "strengths": [
        "15+ dedicated robotics engineers",
        "Demonstration facility in Chennai"
      ],
      "concerns": [
        "Requires upfront training in Japanese controller firmware"
      ],
      "recommended_role": "Primary Turnkey System Integration & Demo Partner",
      "confidence": 0.94
    }
  ],
  "selection_criteria": [
    "Proven track record in CNC machine tending",
    "In-house demonstration lab"
  ],
  "market_entry_strategy": "Appoint Dynamic Industrial Automation as primary SI partner while utilizing a regional distributor for spares consignment.",
  "confidence": 0.93,
  "evidence": [
    "Curated Partner Registry"
  ],
  "assumptions": [
    "Integrator can allocate 2 dedicated engineers for onboarding"
  ]
};

export const DEMO_RED_TEAM: RedTeamResult = {
  "overall_risk": "Medium",
  "challenge_summary": "Red Team identifies BIS CRS testing lead time (8-16 weeks) and spare parts logistics as primary hurdles.",
  "risks": [
    {
      "category": "Regulatory",
      "title": "BIS CRS Certification Lead Time",
      "description": "Robotics controller safety testing in BIS-recognized labs requires 8-16 weeks.",
      "likelihood": 4,
      "impact": 4,
      "risk_score": 16,
      "severity": "Critical",
      "mitigation": "Initiate sample testing in Bengaluru lab concurrently in Month 1.",
      "evidence": [
        "BIS Compulsory Registration Scheme schedule"
      ],
      "assumption": "Standard testing window is 8-16 weeks"
    },
    {
      "category": "After-sales",
      "title": "SME Downtime & Spares",
      "description": "Downtime exceeding 24h destroys customer retention.",
      "likelihood": 3,
      "impact": 4,
      "risk_score": 12,
      "severity": "High",
      "mitigation": "Establish consignment spare parts depot in Chennai.",
      "evidence": [
        "SME factory interview data"
      ],
      "assumption": "Consignment spares buffer reduces downtime to <8h"
    }
  ],
  "weak_assumptions": [
    "Assumes 6-month launch is achievable without concurrent BIS filing"
  ],
  "recommendation_challenges": [
    "Direct import without local warranty leads to rapid distributor disengagement"
  ],
  "mitigations": [
    "Pre-clear BIS testing in Month 1",
    "Establish consignment buffer in Chennai"
  ],
  "confidence": 0.92,
  "evidence": [
    "Regulatory compendium",
    "Failure mode analysis"
  ]
};

export const DEMO_ACTION_PLAN: ActionPlannerResult = {
  "executive_recommendation": "Proceed with phased India market entry starting with a 90-day proof-of-concept pilot in the Sriperumbudur/Chennai industrial corridor.",
  "entry_strategy": "Direct Import PoC (Months 1-3) -> Authorized Integration Partner (Months 4-6) -> Domestic Sub-assembly (Year 2).",
  "priority_actions": [
    {
      "action": "Initiate BIS Compulsory Registration Scheme (CRS) lab testing for robot controller units in Bengaluru.",
      "why_now": "BIS compliance requires 8-16 weeks lead time; starting immediately prevents commercial shipment bottlenecks.",
      "expected_outcome": "Formal testing application submitted to BIS-recognized lab with assigned tracking number.",
      "dependency": "Shipment of 2 production sample units to Bengaluru lab"
    },
    {
      "action": "Execute mutual NDA and bilateral technical evaluation with Dynamic Industrial Automation in Chennai.",
      "why_now": "Enables validation of application engineering bandwidth and demonstration lab scheduling.",
      "expected_outcome": "Signed bilateral NDA and scheduled 5-day on-site controller API integration workshop.",
      "dependency": "None"
    },
    {
      "action": "Conduct structured validation interviews with 10 Tier-2 auto component SME plant managers.",
      "why_now": "Validates willingness to pay in the ₹12-15 Lakh bracket and confirms CNC machine tending pain points.",
      "expected_outcome": "Qualified shortlist of 2 anchor pilot manufacturing customer candidates.",
      "dependency": "Drafting standardized Japanese-English technical brief"
    }
  ],
  "days_1_30": [
    {
      "task": "BIS CRS Certification Application Filing",
      "description": "Submit robot controller technical documentation and sample hardware to BIS-accredited testing facility in Bengaluru.",
      "priority": "Critical",
      "owner": "Regulatory Compliance Lead",
      "dependency": "Sample hardware customs clearance",
      "expected_outcome": "Formal BIS lab intake report",
      "success_metric": "Lab test schedule confirmed within 14 days",
      "risk_addressed": "Regulatory: BIS CRS testing lead time bottleneck"
    }
  ],
  "days_31_60": [
    {
      "task": "Establish Consignment Spare Parts Buffer",
      "description": "Warehouse critical replacement joint actuators and control boards at Chennai partner depot.",
      "priority": "High",
      "owner": "Operations Lead",
      "dependency": "Distributor warehousing agreement signoff",
      "expected_outcome": "Operational local consignment inventory capable of 8-hour dispatch",
      "success_metric": "<8h delivery SLA established across Tamil Nadu corridor",
      "risk_addressed": "After-sales: Spare parts air-freight delay risk"
    }
  ],
  "days_61_90": [
    {
      "task": "Launch 30-Day On-Site Pilot Trial",
      "description": "Deploy CR-500 unit into live CNC machine tending cell at anchor Tier-2 auto component plant.",
      "priority": "Critical",
      "owner": "Partner Lead Integration Engineer",
      "dependency": "Demonstration cell technical validation signoff",
      "expected_outcome": "Verified 99.2% uptime and 18% cycle time reduction over manual loading",
      "success_metric": ">99% equipment availability and zero safety incidents",
      "risk_addressed": "Technical: Optical sensing reliability under factory dust conditions"
    }
  ],
  "key_dependencies": [
    "BIS testing lab queue",
    "Partner engineer training"
  ],
  "success_metrics": [
    "10 validated customer discovery sessions",
    "1 live pilot trial with >99% uptime"
  ],
  "decision_gates": [
    {
      "gate": "Gate 1: Market Validation",
      "question": "Do at least 7/10 interviewed SME plant managers confirm willingness to buy at target price?",
      "required_evidence": [
        "Customer interview transcripts",
        "Price sensitivity matrix"
      ],
      "decision_owner": "Head of Market Strategy",
      "status": "Open"
    },
    {
      "gate": "Gate 2: Partner Technical Readiness",
      "question": "Has the System Integrator completed controller training and demonstration cell assembly?",
      "required_evidence": [
        "Demonstration cell signoff",
        "Service SLA contract"
      ],
      "decision_owner": "Chief Technology Officer",
      "status": "Open"
    }
  ],
  "outreach_pack": {
    "recipient_type": "Managing Director, Dynamic Industrial Automation Pvt Ltd",
    "subject": "Strategic Collaboration Proposal: Precision Japanese Collaborative Robotics",
    "message": "We have developed the CR-500 compact collaborative robot and are exploring a partnership in Tamil Nadu.",
    "call_to_action": "30-minute exploratory virtual discussion"
  },
  "confidence": 0.94,
  "evidence": [
    "Market Lens Study",
    "Curated Partner Registry",
    "Red Team Risk Assessment"
  ],
  "assumptions": [
    "Integrator allocates 2 dedicated engineers for onboarding"
  ]
};

export const DEMO_EXECUTIVE_BRIEF_EN: ExecutiveBriefResult = {
  "title": "KIZUNA AI — India Market Entry Brief",
  "company": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
  "product": "Compact Industrial 6-Axis Collaborative Robot (CR-500)",
  "target_market": "Indian SME Auto Component and Electronics Manufacturers",
  "executive_summary": "株式会社 日本ロボティクス (Nippon Robotics Corp.) aims to introduce Compact Industrial 6-Axis Collaborative Robot (CR-500) into the Indian SME Auto Component and Electronics Manufacturers within a 6 months horizon. The Indian industrial automation sector demonstrates strong demand signals driven by manufacturing modernization and supply chain localization, particularly across Tamil Nadu (Sriperumbudur/Hosur), Gujarat (Sanand). Competitive analysis indicates established European and domestic alternatives, but highlights a distinct market gap for Japanese high-precision, low-power automation priced for SME ROI. The recommended Go-To-Market strategy utilizes a hybrid model partnering with Dynamic Industrial Automation Pvt Ltd for turnkey application engineering and demonstration. Key launch risks identified by the Red Team—including BIS CRS certification lead time (8-16 weeks) and after-sales spare parts response—are actively mitigated in the 90-day launch plan through concurrent regulatory filings and a regional consignment spare parts buffer in Chennai. Initial execution focuses on 3 immediate priority actions to de-risk pilot deployment.",
  "market_opportunity": "High-growth bilateral opportunity in Indian manufacturing hubs driven by PLI incentives.\n\nKey Demand Drivers:\n• National Manufacturing Policy\n• Make in India PLI expansion\n\nStrategic Opportunities:\n• First-mover Japanese high-precision cobot under ₹15 Lakhs",
  "competitive_position": "Dominated by European cobot OEMs at high price brackets and domestic integrators at lower payload tiers.\n\nStrategic Positioning: Japanese precision engineering tailored for Indian SME automation requirements.\n\nCompetitor Gaps Identified:\n• Universal Robots (UR3e/UR5e): Premium Global Cobot Pioneer (Gap: SME price resistance and complex setup overhead)",
  "partner_strategy": "Recommended Strategy: Appoint Dynamic Industrial Automation as primary SI partner while utilizing a regional distributor for spares consignment.\n\nTop Shortlisted Partners:\n• Dynamic Industrial Automation Pvt Ltd (Score: 92/100, Type: System Integrator): Extensive integration footprint in Sriperumbudur automotive corridor.",
  "risk_summary": "Overall Launch Risk: Medium\nRed Team Challenge Summary: Red Team identifies BIS CRS testing lead time (8-16 weeks) and spare parts logistics as primary hurdles.\n\nCritical Risk Vectors & Mitigations:\n• [Critical] BIS CRS Certification Lead Time: Robotics controller safety testing in BIS-recognized labs requires 8-16 weeks. (Mitigation: Initiate sample testing in Bengaluru lab concurrently in Month 1.)\n• [High] SME Downtime & Spares: Downtime exceeding 24h destroys customer retention. (Mitigation: Establish consignment spare parts depot in Chennai.)",
  "entry_strategy": "Direct Import PoC (Months 1-3) -> Authorized Integration Partner (Months 4-6) -> Domestic Sub-assembly (Year 2).",
  "plan_90_day": "=== DAYS 1-30: VALIDATION & PREPARATION ===\n• BIS CRS Certification Application Filing (Owner: Regulatory Compliance Lead, Risk: Regulatory: BIS CRS testing lead time bottleneck)\n\n=== DAYS 31-60: PARTNER & PILOT PREPARATION ===\n• Establish Consignment Spare Parts Buffer (Owner: Operations Lead, Risk: After-sales: Spare parts air-freight delay risk)\n\n=== DAYS 61-90: PILOT EXECUTION & SCALE DECISION ===\n• Launch 30-Day On-Site Pilot Trial (Owner: Partner Lead Integration Engineer, Metric: >99% equipment availability and zero safety incidents)",
  "next_actions": [
    {
      "action": "Initiate BIS Compulsory Registration Scheme (CRS) lab testing for robot controller units in Bengaluru.",
      "why_now": "BIS compliance requires 8-16 weeks lead time; starting immediately prevents commercial shipment bottlenecks.",
      "expected_outcome": "Formal testing application submitted to BIS-recognized lab with assigned tracking number.",
      "dependency": "Shipment of 2 production sample units to Bengaluru lab"
    },
    {
      "action": "Execute mutual NDA and bilateral technical evaluation with Dynamic Industrial Automation in Chennai.",
      "why_now": "Enables validation of application engineering bandwidth and demonstration lab scheduling.",
      "expected_outcome": "Signed bilateral NDA and scheduled 5-day on-site controller API integration workshop.",
      "dependency": "None"
    },
    {
      "action": "Conduct structured validation interviews with 10 Tier-2 auto component SME plant managers.",
      "why_now": "Validates willingness to pay in the ₹12-15 Lakh bracket and confirms CNC machine tending pain points.",
      "expected_outcome": "Qualified shortlist of 2 anchor pilot manufacturing customer candidates.",
      "dependency": "Drafting standardized Japanese-English technical brief"
    }
  ],
  "decision_gates": [
    {
      "gate": "Gate 1: Market Validation",
      "question": "Do at least 7/10 interviewed SME plant managers confirm willingness to buy at target price?",
      "required_evidence": [
        "Customer interview transcripts",
        "Price sensitivity matrix"
      ],
      "decision_owner": "Head of Market Strategy",
      "status": "Open"
    },
    {
      "gate": "Gate 2: Partner Technical Readiness",
      "question": "Has the System Integrator completed controller training and demonstration cell assembly?",
      "required_evidence": [
        "Demonstration cell signoff",
        "Service SLA contract"
      ],
      "decision_owner": "Chief Technology Officer",
      "status": "Open"
    }
  ],
  "key_assumptions": [
    "SME customers prefer turnkey integration over bare-arm supply",
    "Tier-2 component manufacturers have active CapEx budgets",
    "Competitors will not lower pricing by >20% in the short term",
    "Integrator can allocate 2 dedicated engineers for onboarding",
    "Integrator allocates 2 dedicated engineers for onboarding"
  ],
  "evidence": [
    {
      "category": "SOURCE DATA",
      "statement": "Product specifications and timeline submitted by 株式会社 日本ロボティクス (Nippon Robotics Corp.) for Compact Industrial 6-Axis Collaborative Robot (CR-500).",
      "source_stage": "Brief Extraction Agent"
    },
    {
      "category": "SOURCE DATA",
      "statement": "Industrial corridor profile verified for Tamil Nadu (Sriperumbudur/Hosur).",
      "source_stage": "Market Lens Agent"
    },
    {
      "category": "SOURCE DATA",
      "statement": "Industrial corridor profile verified for Gujarat (Sanand).",
      "source_stage": "Market Lens Agent"
    },
    {
      "category": "SOURCE DATA",
      "statement": "Verified incorporation and integration footprint for Dynamic Industrial Automation Pvt Ltd.",
      "source_stage": "Partner Match Agent"
    },
    {
      "category": "AI INFERENCE",
      "statement": "Projected market fit score of 88/100 based on SME automation demand elasticity.",
      "source_stage": "Market Lens Agent"
    },
    {
      "category": "AI INFERENCE",
      "statement": "Exploitable gap identified in European cobot pricing and domestic system payload reliability.",
      "source_stage": "Competitor Agent"
    },
    {
      "category": "AI INFERENCE",
      "statement": "Composite risk level evaluated as Medium based on 8-16 week BIS CRS lead time.",
      "source_stage": "Red Team Agent"
    },
    {
      "category": "ASSUMPTION",
      "statement": "SME customers prefer turnkey integration over bare-arm supply",
      "source_stage": "Multi-Agent Pipeline"
    },
    {
      "category": "ASSUMPTION",
      "statement": "Tier-2 component manufacturers have active CapEx budgets",
      "source_stage": "Multi-Agent Pipeline"
    },
    {
      "category": "ASSUMPTION",
      "statement": "Competitors will not lower pricing by >20% in the short term",
      "source_stage": "Multi-Agent Pipeline"
    }
  ],
  "indicators": {
    "market_fit_score": 88,
    "partner_fit_score": 92,
    "launch_risk_level": "Medium",
    "confidence_score": 0.93,
    "disclaimer": "KIZUNA decision-support indicators are AI-assisted analytical scores, not objective market truth."
  },
  "confidence": 0.93,
  "language": "en",
  "generated_at": "2026-09-19T16:24:45.645731+00:00"
};

export const DEMO_EXECUTIVE_BRIEF_JA: ExecutiveBriefResult = {
  "title": "KIZUNA AI — インド市場参入戦略エグゼクティブ・ブリーフ",
  "company": "株式会社 日本ロボティクス (Nippon Robotics Corp.)",
  "product": "Compact Industrial 6-Axis Collaborative Robot (CR-500)",
  "target_market": "インド中堅・中小製造業（SME）および自動車・電子部品クラスター",
  "executive_summary": "株式会社 日本ロボティクス (Nippon Robotics Corp.)は、6ヶ月以内のタイムラインで小型高精度協働ロボット「Compact Industrial 6-Axis Collaborative Robot (CR-500)」のインド市場参入を計画しています。インドの産業自動化市場は、製造業の近代化およびサプライチェーンの現地化政策を背景に極めて強い需要を示しており、特にタミル・ナードゥ州およびグジャラート州の製造業集積地で高い導入意欲が確認されています。競合分析では欧州大手および現地プレイヤーが存在するものの、中堅企業向けの高精度・省電力・費用対効果に優れた製品帯に明確な市場ギャップが存在します。推奨される市場参入戦略は、現地有力システムインテグレーター（SIer）との提携によるターンキー導入および実機デモ実証を中心とするハイブリッドモデルです。レッドチームが指摘したBIS規格認証リードタイム（8〜16週間）およびアフターサービス体制の課題に対しては、初月からの認証申請およびチェンナイでの予備部品デポ設置によりリスクを低減します。",
  "market_opportunity": "インド製造業および自動化集積地における高成長機会。\n\n主要な需要要因:\n• 中堅・中小製造業における熟練工不足と品質均一化の要求\n• インド政府の製造業振興策（PLIスキーム）による自動化設備投資の加速\n• 自動車Tier-2部品メーカーにおけるCNCマシンテンディング需要の急増\n\n戦略的市場機会:\n• 日本品質の高信頼性と小型省スペース設計による差別化\n• 早期パイロット導入による現地リファレンス顧客の確立\n• 現地SIerとの協業による迅速なエンジニアリングサポート提供",
  "competitive_position": "欧州多国籍企業およびインド国内競合とのベンチマーク比較。\n\n推奨ポジショニング: 日本品質の超高精度と中小企業向け投資回収モデルの両立\n\n競合ギャップ分析:\n• 欧州大手（Universal Robots等）: 高価格帯および複雑な導入設定が中小企業の障壁\n• インド国内SIer製品: 価格競争力はあるが、可搬重量と長期耐久性に課題\n• 参入余地: 高精度・省電力・手頃な価格帯でのニッチ市場リーダーシップの確立",
  "partner_strategy": "推奨パートナー戦略: 有力システムインテグレーター（SIer）と販売代理店のデュアルトラック体制\n\n選定候補パートナー:\n• Dynamic Industrial Automation（チェンナイ）: 自動車回廊での豊富な導入実績（適合スコア: 88/100）\n• Apex Mechatronics India（バンガロール）: 精密電子機器向けターンキー対応力（適合スコア: 82/100）",
  "risk_summary": "総合参入リスク水準: 中（Medium）\nレッドチーム検証概要: BIS認証期間および現地保守部品のリードタイムが重要課題\n\n主要リスクと対抗策:\n• [規制リスク] BIS CRS認証遅延 (8-16週) → バンガロール指定試験所への第1週先行申請\n• [アフター保守] SMEの稼働停止リスク → チェンナイでの予備部品委託デポ設置\n• [価格抵抗] 初期設備投資への懸念 → RaaS（従量課金/リース）モデルの検討",
  "entry_strategy": "第1段階: 実証パイロット（1〜3ヶ月） → 第2段階: 正規代理店・SI契約（4〜6ヶ月） → 第3段階: 現地ノックダウン組立検討（2年目）",
  "plan_90_day": "=== 1〜30日目: 検証および準備フェーズ ===\n• BIS CRS認証申請およびバンガロール試験所へのサンプル機器発送（担当: 規制コンプライアンス責任者）\n• ターゲットSME工場長10社へのヒアリング調査と価格受容性検証（担当: 市場戦略責任者）\n• 有力SIパートナーとの機密保持契約（NDA）締結および技術適合検証（担当: パートナーシップ責任者）\n\n=== 31〜60日目: パートナー準備およびパイロット環境構築 ===\n• 現地エンジニア向けコントローラーAPI技術講習会の実施（担当: 技術責任者）\n• チェンナイ予備部品デポの開設および緊急配送SLAの締結（担当: オペレーション責任者）\n• パイロット導入先自動車部品工場の最終選定（担当: 事業開発責任者）\n\n=== 61〜90日目: 実機パイロット稼働および本格展開判定 ===\n• アンカー顧客工場での30日間実機稼働トライアルの開始（担当: 現地SIプロジェクトマネージャー）\n• 稼働率99%以上およびサイクルタイム短縮効果の測定（担当: 技術責任者）\n• 意思決定ゲート4に基づく商業展開・代理店本契約の締結判定（担当: 経営委員会）",
  "next_actions": [
    {
      "action": "バンガロールのBIS認定試験所へロボットコントローラーのCRS認証試験を申請する。",
      "why_now": "認証取得に8〜16週間を要するため、即時申請が商用出荷遅延を防ぐ最優先事項です。",
      "expected_outcome": "BIS申請受領証および試験追跡番号の発行。",
      "dependency": "サンプル機器2台の通関完了"
    },
    {
      "action": "チェンナイのDynamic Industrial Automation社と相互NDAを締結し技術検証を開始する。",
      "why_now": "現地エンジニアの技術習熟とデモ実証環境の構築に先行着手するため。",
      "expected_outcome": "NDA締結および5日間の現地API統合ワークショップの日程確定。",
      "dependency": "なし"
    },
    {
      "action": "スリペルンブドゥール地域のTier-2自動車部品メーカー10社と適合性ヒアリングを実施する。",
      "why_now": "価格帯（120万〜150万ルピー）に対する受容性とマシンテンディング需要を検証するため。",
      "expected_outcome": "パイロット候補企業2社の特定。",
      "dependency": "日英バイリンガル製品資料の作成"
    }
  ],
  "decision_gates": [
    {
      "gate": "ゲート1: 市場受容性の検証",
      "question": "ヒアリングを実施したSME工場長の70%以上が目標価格帯での導入意向を示しているか？",
      "required_evidence": [
        "顧客ヒアリング記録票",
        "価格感度分析レポート"
      ],
      "decision_owner": "市場戦略責任者",
      "status": "Open"
    },
    {
      "gate": "ゲート2: パートナー技術適合性",
      "question": "選定SIerがコントローラーAPI講習を修了しデモ機の立ち上げに成功したか？",
      "required_evidence": [
        "デモ機動作検証サインオフ",
        "サービスSLA契約案"
      ],
      "decision_owner": "最高技術責任者（CTO）",
      "status": "Open"
    },
    {
      "gate": "ゲート3: パイロット準備完了",
      "question": "BIS試験受領証が発行され、チェンナイ保守デポに初期予備品が配備されたか？",
      "required_evidence": [
        "BIS受領証",
        "予備部品在庫証明書"
      ],
      "decision_owner": "オペレーション統括",
      "status": "Open"
    },
    {
      "gate": "ゲート4: 本格展開および販売拡大の決定",
      "question": "30日間のパイロット稼働において設備稼働率99%以上を達成し顧客の継続利用意向が得られたか？",
      "required_evidence": [
        "パイロット運用報告書",
        "顧客満足度評価書",
        "商業代理店本契約書"
      ],
      "decision_owner": "取締役会 / 経営委員会",
      "status": "Open"
    }
  ],
  "key_assumptions": [
    "選定されたシステムインテグレーターが日本人技術者による初期研修を受講する体制を維持できること。",
    "BIS CRS試験所の混雑状況が標準期間（8〜16週間）以内に収まること。",
    "現地顧客が初期設備投資回収期間として18〜24ヶ月を許容すること。"
  ],
  "evidence": [
    {
      "category": "SOURCE DATA",
      "statement": "株式会社 日本ロボティクス (Nippon Robotics Corp.)より提出されたCompact Industrial 6-Axis Collaborative Robot (CR-500)の製品仕様および参入要件データ。",
      "source_stage": "Brief Extraction Agent"
    },
    {
      "category": "SOURCE DATA",
      "statement": "タミル・ナードゥ州およびグジャラート州の産業集積地データ（検証済み）。",
      "source_stage": "Market Lens Agent"
    },
    {
      "category": "SOURCE DATA",
      "statement": "選定パートナー企業の法人登記およびエンジニアリング実績記録。",
      "source_stage": "Partner Match Agent"
    },
    {
      "category": "AI INFERENCE",
      "statement": "SMEの自動化投資意欲に基づく市場適合性スコア: 88/100。",
      "source_stage": "Market Lens Agent"
    },
    {
      "category": "AI INFERENCE",
      "statement": "欧州製協働ロボットの高価格帯に対するニッチギャップの特定。",
      "source_stage": "Competitor Agent"
    },
    {
      "category": "AI INFERENCE",
      "statement": "BIS認証リードタイム等を加味した総合参入リスク評価: 総合参入リスク水準: 中（Medium）。",
      "source_stage": "Red Team Agent"
    },
    {
      "category": "ASSUMPTION",
      "statement": "選定SIパートナーが専任エンジニア2名を初期講習にアサイン可能であること。",
      "source_stage": "Multi-Agent Pipeline"
    }
  ],
  "indicators": {
    "market_fit_score": 88,
    "partner_fit_score": 92,
    "launch_risk_level": "Medium",
    "confidence_score": 0.93,
    "disclaimer": "KIZUNA decision-support indicators are AI-assisted analytical scores, not objective market truth."
  },
  "confidence": 0.93,
  "language": "ja",
  "generated_at": "2026-09-19T16:24:45.647713+00:00"
};

export const DEMO_COMPLETED_RUN_RESPONSE: AnalysisRunResponse = {
  analysis_run_id: "demo-run-cr500-completed",
  project_id: DEMO_PROJECT_ID,
  stage: "completed",
  status: "completed",
  current_agent: "ActionPlannerAgent",
  progress: 100,
  result_data: {
    brief: DEMO_BRIEF_EXTRACTION,
    market_lens: DEMO_MARKET_LENS,
    competitor_map: DEMO_COMPETITOR_MAP,
    partner_match: DEMO_PARTNER_MATCH,
    red_team: DEMO_RED_TEAM,
    action_plan: DEMO_ACTION_PLAN
  },
  agent_results: [
    {
      id: "res-brief-1",
      agent_name: "BriefExtractorAgent",
      status: "completed",
      confidence: 0.94,
      output: DEMO_BRIEF_EXTRACTION,
      created_at: "2025-01-15T09:00:01Z",
      completed_at: "2025-01-15T09:00:02Z"
    },
    {
      id: "res-market-2",
      agent_name: "MarketLensAgent",
      status: "completed",
      confidence: 0.92,
      output: DEMO_MARKET_LENS,
      created_at: "2025-01-15T09:00:02Z",
      completed_at: "2025-01-15T09:00:03Z"
    },
    {
      id: "res-comp-3",
      agent_name: "CompetitorAgent",
      status: "completed",
      confidence: 0.95,
      output: DEMO_COMPETITOR_MAP,
      created_at: "2025-01-15T09:00:03Z",
      completed_at: "2025-01-15T09:00:04Z"
    },
    {
      id: "res-partner-4",
      agent_name: "PartnerMatchAgent",
      status: "completed",
      confidence: 0.93,
      output: DEMO_PARTNER_MATCH,
      created_at: "2025-01-15T09:00:04Z",
      completed_at: "2025-01-15T09:00:05Z"
    },
    {
      id: "res-red-5",
      agent_name: "RedTeamAgent",
      status: "completed",
      confidence: 0.91,
      output: DEMO_RED_TEAM,
      created_at: "2025-01-15T09:00:05Z",
      completed_at: "2025-01-15T09:00:06Z"
    },
    {
      id: "res-action-6",
      agent_name: "ActionPlannerAgent",
      status: "completed",
      confidence: 0.94,
      output: DEMO_ACTION_PLAN,
      created_at: "2025-01-15T09:00:06Z",
      completed_at: "2025-01-15T09:00:07Z"
    }
  ]
};
