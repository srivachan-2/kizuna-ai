import json
import os
from typing import List, Dict, Any

class MarketDataService:
    def __init__(self):
        # Resolve path to data/seed folder relative to project root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.abspath(os.path.join(current_dir, "..", "..", "data", "seed"))

    def get_sectors(self) -> List[Dict[str, Any]]:
        sectors_file = os.path.join(self.data_dir, "sectors.json")
        if os.path.exists(sectors_file):
            with open(sectors_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def get_regulations(self) -> List[Dict[str, Any]]:
        reg_file = os.path.join(self.data_dir, "regulations.json")
        if os.path.exists(reg_file):
            with open(reg_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def get_competitors(self, sector_id: str = None) -> List[Dict[str, Any]]:
        comp_file = os.path.join(self.data_dir, "competitors.json")
        if os.path.exists(comp_file):
            with open(comp_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                if sector_id:
                    return [c for c in data if c.get("sector_id") == sector_id]
                return data
        return []

    def get_partners(self) -> List[Dict[str, Any]]:
        partner_file = os.path.join(self.data_dir, "partners.json")
        if os.path.exists(partner_file):
            with open(partner_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

market_service = MarketDataService()
