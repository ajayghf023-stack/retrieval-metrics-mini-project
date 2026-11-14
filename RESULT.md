## Evaluation Results and Observations

Evaluation Results and Observations
The semantic search system performs better overall than keyword search. It achieves an MRR of
0.67 compared to 0.30 for keyword search, meaning that it generally ranks relevant results higher.
Semantic search also achieves a Recall@10 of 1.00, while keyword search achieves 0.60,
meaning semantic search finds at least one relevant result for all ten queries. Keyword search
performs better for queries such as "redis or memcached for caching" and "sql or nosql for a new
product", where specific terms are useful for matching results. Semantic search performs better on
the remaining queries, especially those expressed as problems or natural-language questions. A
team may still keep keyword search because it can retrieve relevant results for certain exact-term
queries where semantic search ranks them lower.
Make sure your README includes:
● The comparison table.
● Your 4–6 sentence interpretation.