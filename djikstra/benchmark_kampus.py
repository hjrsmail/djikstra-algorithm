"""Benchmark kampus: jalankan dengan Python; tanpa pustaka shortest-path."""
import time, statistics, platform, json, random
from pathlib import Path
from math import inf
G=[[] for _ in range(6)]
for u,v,w in [(0,1,400),(1,2,300),(0,2,500),(0,3,200),
              (3,4,300),(2,4,400),(3,5,600),(4,5,200)]:
    G[u].append((v,w)); G[v].append((u,w))
for row in G: row.sort()
X=[0,100,250,200,500,700]

def greedy(g,s,t,h=None):
    n=len(g); d=[inf]*n; done=[False]*n; d[s]=0
    for _ in range(n):
        u=None; best=inf
        for v in range(n):
            if not done[v] and d[v]!=inf:
                f=d[v] if h is None else d[v]+h[v]
                if f<best: u=v; best=f
        if u is None: break
        if u==t: return d[t]
        done[u]=True
        for v,w in g[u]:
            if not done[v] and d[u]+w<d[v]: d[v]=d[u]+w
    return d[t]

def astar(g,s,t):
    h=[abs(x-X[t]) for x in X]
    return greedy(g,s,t,h)

def bellman(g,s,t):
    n=len(g); d=[inf]*n; d[s]=0
    edges=[(u,v,w) for u in range(n) for v,w in g[u]]
    for _ in range(n-1):
        changed=False
        for u,v,w in edges:
            if d[u]!=inf and d[u]+w<d[v]:
                d[v]=d[u]+w; changed=True
        if not changed: break
    for u,v,w in edges:
        if d[u]!=inf and d[u]+w<d[v]:
            raise ValueError("Siklus negatif")
    return d[t]

def main():
    funcs={"Dijkstra":greedy,"Bellman–Ford":bellman,"A*":astar}
    for s in range(6):
        for t in range(6):
            h=[abs(x-X[t]) for x in X]
            assert all(h[u]<=w+h[v] for u in range(6) for v,w in G[u])
            assert len({fn(G,s,t) for fn in funcs.values()})==1
    assert all(fn(G,0,5)==700 for fn in funcs.values())
    for fn in funcs.values():
        for _ in range(1000): fn(G,0,5)
    count=10000; samples={k:[] for k in funcs}
    rng=random.Random(20261009)
    for batch in range(7):
        order=list(funcs); rng.shuffle(order)
        for name in order:
            start=time.perf_counter_ns()
            for _ in range(count): funcs[name](G,0,5)
            us=(time.perf_counter_ns()-start)/count/1000
            samples[name].append(us)
    result={"python":platform.python_version(),"os":platform.platform(),
            "calls_per_batch":count,"batches":7,"raw_us":samples,
            "summary":{k:{"mean":statistics.mean(v),"std":statistics.stdev(v)}
                       for k,v in samples.items()}}
    Path("benchmark_runtime.json").write_text(json.dumps(result,indent=2))
    print(json.dumps(result,indent=2))
if __name__=="__main__": main()
