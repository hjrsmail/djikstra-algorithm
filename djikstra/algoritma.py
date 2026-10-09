"""Algoritma eksplisit tanpa library shortest-path; mengikuti laporan."""
import random
from math import inf

def dijkstra(g, s, trace=False):
    n=len(g); d=[inf]*n; prev=[None]*n; done=[False]*n; d[s]=0; steps=[]
    for _ in range(n):
        u=None
        for v in range(n):
            if not done[v] and (u is None or d[v]<d[u]): u=v
        if u is None or d[u]==inf: break
        done[u]=True
        for v,w in g[u]:
            if not done[v] and d[u]+w<d[v]:
                d[v]=d[u]+w; prev[v]=u
        if trace: steps.append((u,d.copy(),prev.copy()))
    return d,prev,steps

def bellman_ford(g,s):
    n=len(g);d=[inf]*n;d[s]=0
    edges=[(u,v,w) for u in range(n) for v,w in g[u]]
    for _ in range(n-1):
        changed=False
        for u,v,w in edges:
            if d[u]!=inf and d[u]+w<d[v]: d[v]=d[u]+w;changed=True
        if not changed:break
    for u,v,w in edges:
        if d[u]!=inf and d[u]+w<d[v]:raise ValueError('Siklus negatif terjangkau')
    return d

def path(prev,s,t):
    p=[];v=t
    while v is not None:
        p.append(v)
        if v==s:return p[::-1]
        v=prev[v]
    return []

def graph(n,seed):
    r=random.Random(seed); pairs={(i,i+1) for i in range(n-1)}
    while len(pairs)<3*n:
        a,b=r.sample(range(n),2);pairs.add((min(a,b),max(a,b)))
    g=[[] for _ in range(n)]
    for a,b in sorted(pairs):
        w=r.randint(1,100);g[a].append((b,w));g[b].append((a,w))
    return g

