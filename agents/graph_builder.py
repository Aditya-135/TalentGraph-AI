"""
agents/graph_builder.py
Constructs Directed Knowledge Graphs using NetworkX.
"""
import networkx as nx

class DynamicKnowledgeGraph:
    
    def build_document_graph(self, root_entity: str, root_type: str, entities: list, edge_relation: str) -> nx.DiGraph:
        """
        Generic method to build a new graph from a list of entities.
        """
        # 🚨 FIX: Create a brand NEW graph instance in memory every time
        graph = nx.DiGraph()
        
        # Add the central root node (e.g., the Candidate or the Job)
        graph.add_node(root_entity, type=root_type)

        # Add satellite nodes and directed edges
        for entity in entities:
            clean_entity = entity.strip().lower()
            if clean_entity:
                graph.add_node(clean_entity, type="Concept")
                graph.add_edge(root_entity, clean_entity, relation=edge_relation, weight=1.0)
                
        return graph

    def build_resume_graph(self, candidate_name: str, skills: list) -> nx.DiGraph:
        return self.build_document_graph(candidate_name, "Candidate", skills, "HAS_SKILL")

    def build_job_graph(self, job_title: str, required_skills: list) -> nx.DiGraph:
        return self.build_document_graph(job_title, "Job", required_skills, "REQUIRES_SKILL")