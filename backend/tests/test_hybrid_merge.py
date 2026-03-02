from app.services.retrieval import hybrid_merge_rerank

def test_hybrid_merge_contains_union():
    sem=[{"chunk_id":"c1","doc_id":"d1","chunk_index":0,"content":"a","distance":0.1}]
    kw=[{"chunk_id":"c2","doc_id":"d2","chunk_index":0,"content":"b","score":10.0}]
    out = hybrid_merge_rerank(semantic=sem, keyword=kw, alpha=0.5, top_k=10)
    assert {r["chunk_id"] for r in out} == {"c1","c2"}
