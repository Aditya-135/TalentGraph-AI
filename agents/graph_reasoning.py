"""
agents/graph_reasoning.py
Calculates alignment by traversing and comparing graph structures.
"""
import networkx as nx

class GraphReasoningEngine:
    def compute_structural_alignment(self, source_graph: nx.DiGraph, target_graph: nx.DiGraph, source_root: str, target_root: str) -> tuple:
        """
        Traverses both graphs to find overlapping nodes and missing structural paths.
        Returns: (alignment_score_percentage, matched_nodes_list, missing_nodes_list)
        """
        # Extract direct successors (paths) from the roots
        target_paths = list(target_graph.successors(target_root))
        source_paths = list(source_graph.successors(source_root))
        
        matched_nodes = []
        missing_nodes = []
        
        # Traverse and compare
        for target_node in target_paths:
            if target_node in source_paths:
                matched_nodes.append(target_node)
            else:
                missing_nodes.append(target_node)

        total_required = len(target_paths)
        
        # Handle edge cases (e.g., empty job description)
        if total_required == 0:
            return 100.0, source_paths, []

        alignment_score = len(matched_nodes) / total_required

        return round(alignment_score * 100, 2), matched_nodes, missing_nodes