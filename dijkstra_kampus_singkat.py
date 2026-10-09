from math import inf

def dijkstra(graf, sumber, tujuan):
    n = len(graf)
    d = [inf] * n
    prev = [None] * n
    done = [False] * n
    d[sumber] = 0
    for _ in range(n):
        u = None
        for v in range(n):
            if not done[v] and (u is None or d[v] < d[u]):
                u = v
        if u is None or d[u] == inf:
            break
        done[u] = True
        if u == tujuan:
            break
        for v, w in graf[u]:
            if not done[v] and d[u] + w < d[v]:
                d[v] = d[u] + w
                prev[v] = u
    rute, v = [], tujuan
    while v is not None and d[tujuan] != inf:
        rute.append(v)
        if v == sumber:
            break
        v = prev[v]
    return d[tujuan], rute[::-1]

nama = ["Rektorat", "Perpustakaan", "Laboratorium",
        "Kantin", "Kelas", "Parkiran"]
graf = [[] for _ in nama]
for u, v, w in [(0,1,400),(1,2,300),(0,2,500),(0,3,200),
                 (3,4,300),(2,4,400),(3,5,600),(4,5,200)]:
    graf[u].append((v, w))
    graf[v].append((u, w))
jarak, rute = dijkstra(graf, 0, 5)
print("Rute:", " → ".join(nama[v] for v in rute))
print("Jarak:", jarak, "meter ilustratif")
