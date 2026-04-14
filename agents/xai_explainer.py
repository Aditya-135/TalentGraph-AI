"""
agents/xai_explainer.py
Generates human-readable reasoning from graph traversal data.
"""

class GraphXAI:
    def generate_explanation(self, source_name: str, alignment_score: float, matched: list, missing: list) -> dict:
        """
        Translates structural alignment data into business logic explanations.
        """
        reasons = []
        
        if alignment_score >= 75.0:
            decision = "AUTO_ACCEPT"
            reasons.append(f"Strong structural alignment detected. Critical paths matching {len(matched)} required concepts were successfully traversed.")
        elif alignment_score >= 40.0:
            decision = "REVIEW_REQUIRED"
            reasons.append(f"Partial structural alignment. Graph traversal broke at {len(missing)} required nodes.")
        else:
            decision = "BLOCK_AUTOMATION"
            reasons.append("Critical path failure. The source graph lacks the majority of structural requirements.")

        # Detail the specific path failures for transparency
        if missing:
            broken_paths = ", ".join(missing[:3])
            reasons.append(f"Broken Path Analysis: Connection from '{source_name}' to concepts [{broken_paths}] could not be verified.")

        return {
            "xai_decision": decision,
            "xai_explanation": " | ".join(reasons),
            "matched_nodes": matched,
            "missing_nodes": missing
        }