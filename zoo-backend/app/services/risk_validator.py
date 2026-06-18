from app.schemas.risk_matrix import RiskMatrixEntryBase
from typing import Dict, Any, Optional

class RiskPolicyViolation(Exception):
    pass

def validate_risk_entry(entry_in: RiskMatrixEntryBase):
    """
    Validates risk entry against defined policies.
    Raises RiskPolicyViolation if policy is breached.
    """
    # Example Policy: Manual control cannot have high frequency
    # Assuming 'frequency' values: 'D'(Daily), 'S'(Weekly), 'M'(Monthly), 'A'(Annual), etc.
    # Assuming 'automation_level': 'A'(Automated), 'S'(Semi), 'M'(Manual)
    
    if entry_in.automation_level == 'M':
        if entry_in.frequency in ['D', 'S']: # Daily or Weekly
            raise RiskPolicyViolation(
                "Policy Violation: Manual controls ('M') are not allowed for high frequency "
                "tasks (Daily 'D' or Weekly 'S'). Consider 'Automated' ('A') or 'Semi' ('S')."
            )

    # Future: Add more policies here based on metadata or other factors
