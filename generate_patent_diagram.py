"""
generate_patent_diagram.py
──────────────────────────
Utility script to generate high-resolution Knowledge Graph figures 
for the patent application.
"""
import networkx as nx
import matplotlib.pyplot as plt

def generate_patent_figure():
    G = nx.DiGraph()

    candidate = "Aditya (Candidate)"
    job = "Backend Engineer (Job)"
    
    matched_skills = ["Python", "FastAPI"]
    missing_skills = ["Docker", "PostgreSQL", "AWS"]

    G.add_node(candidate, type="candidate")
    G.add_node(job, type="job")

    for skill in matched_skills:
        G.add_node(skill, type="matched")
        G.add_edge(job, skill, label="REQUIRES")
        G.add_edge(candidate, skill, label="HAS_SKILL")

    for skill in missing_skills:
        G.add_node(skill, type="missing")
        G.add_edge(job, skill, label="REQUIRES")
        G.add_edge(candidate, skill, label="MISSING", style="dashed")

    # 🚨 FIX: Explicit coordinates for a clean, symmetrical patent figure
    pos = {
        candidate: (-1, 0.5),
        job: (1, 0.5),
        "Python": (0, 2.5),
        "FastAPI": (0, 1.25),
        "Docker": (0, 0),
        "PostgreSQL": (0, -1.25),
        "AWS": (0, -2.5)
    }

    plt.figure(figsize=(12, 8))

    # Draw Nodes
    nx.draw_networkx_nodes(G, pos, nodelist=[candidate], node_color="lightblue", node_size=4000, edgecolors="black")
    nx.draw_networkx_nodes(G, pos, nodelist=[job], node_color="lightgreen", node_size=4000, edgecolors="black")
    nx.draw_networkx_nodes(G, pos, nodelist=matched_skills, node_color="gold", node_size=3000, edgecolors="black")
    nx.draw_networkx_nodes(G, pos, nodelist=missing_skills, node_color="lightcoral", node_size=3000, edgecolors="black")

    # Draw Edges with a slight curve (arc3) so they don't overlap
    solid_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get("style") != "dashed"]
    nx.draw_networkx_edges(G, pos, edgelist=solid_edges, arrowstyle="-|>", arrowsize=20, width=2.0, connectionstyle="arc3,rad=0.05")

    dashed_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get("style") == "dashed"]
    nx.draw_networkx_edges(G, pos, edgelist=dashed_edges, arrowstyle="-|>", arrowsize=20, width=2.0, style="dashed", edge_color="red", connectionstyle="arc3,rad=0.05")

    # Draw Node Labels
    nx.draw_networkx_labels(G, pos, font_size=10, font_weight="bold")
    
    # Draw Edge Labels (moved slightly towards the start of the line for clarity)
    edge_labels = {(u, v): d["label"] for u, v, d in G.edges(data=True)}
    nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8, font_color="darkblue", label_pos=0.3)

    plt.title("Figure 1: Knowledge Graph Traversal and Structural Alignment (XAI)", fontsize=16, fontweight="bold", pad=20)
    plt.axis("off")
    plt.tight_layout()
    
    file_name = "patent_figure_1_clean.png"
    plt.savefig(file_name, dpi=300, bbox_inches="tight")
    print(f"[SUCCESS] Clean patent diagram saved as: {file_name}")

if __name__ == "__main__":
    generate_patent_figure()