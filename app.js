'use strict';
const CASES={
 manual:{names:['A','B','C','D','E'],positions:[[80,165],[230,65],[230,270],[410,165],[540,270]],edges:[[0,1,4],[0,2,2],[1,3,4],[2,3,3],[2,4,7],[3,4,2]],description:'Graf A–E dari Bab III. Dari A ke E: A → C → D → E, total bobot 7.',unit:'bobot'},
 campus:{names:['Rektorat','Perpustakaan','Laboratorium','Kantin','Kelas','Parkiran'],positions:[[80,140],[230,50],[420,90],[200,255],[420,255],[545,175]],edges:[[0,1,400],[1,2,300],[0,2,500],[0,3,200],[3,4,300],[2,4,400],[3,5,600],[4,5,200]],description:'Enam lokasi kampus. Jarak dalam meter ilustratif; bukan hasil pengukuran lapangan.',unit:'m'},
 indirect:{names:['A','B','C'],positions:[[100,165],[300,60],[500,165]],edges:[[0,1,2],[1,2,3],[0,2,10]],description:'Dari A ke C, jalur A → B → C = 5 lebih murah daripada sisi langsung berbobot 10.',unit:'bobot'},
 isolated:{names:['A','B','C','D'],positions:[[90,165],[270,165],[450,165],[490,285]],edges:[[0,1,2],[1,2,3]],description:'D tidak terhubung. Dari A menuju D, jarak akhir tetap ∞ dan tidak ada rute.',unit:'bobot'},
 zero:{names:['A','B','C'],positions:[[100,165],[300,60],[500,165]],edges:[[0,1,0],[1,2,2],[0,2,4]],description:'Bobot nol diperbolehkan. Dari A ke C melalui B, total bobot 0 + 2 = 2.',unit:'bobot'}
};
const fmt=x=>Number.isFinite(x)?String(x):'∞';
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function adjacency(g){const a=g.names.map(()=>[]);g.edges.forEach(([u,v,w],id)=>{a[u].push({v,w,id});a[v].push({v:u,w,id});});a.forEach(row=>row.sort((x,y)=>x.v-y.v));return a;}

const COORDS={manual:[0,2,2,5,7],campus:[0,100,250,200,500,700],indirect:[0,2,5],isolated:[0,2,5,0],zero:[0,0,2]};
function heuristic(g,t){const k=Object.keys(CASES).find(k=>CASES[k]===g);return COORDS[k].map(x=>Math.abs(x-COORDS[k][t]));}
const LABEL={dijkstra:'Dijkstra',bf:'Bellman–Ford',astar:'A*'};
function buildTrace(g,s,algorithm,t=g.names.length-1,mode="target"){
 const n=g.names.length,a=adjacency(g),d=Array(n).fill(Infinity),prev=Array(n).fill(null),done=Array(n).fill(false);d[s]=0; const h=heuristic(g,t);
 let count={checks:0,updates:0,scans:0,selected:0,pass:0},events=[];
 const add=(kind,title,text,extra={})=>events.push({kind,title,text,d:[...d],prev:[...prev],done:[...done],h:[...h],count:{...count},line:0,u:null,v:null,edge:null,formula:'',complete:false,...extra});
 add('init','Mulai dari sumber '+g.names[s],`Jarak ${g.names[s]} = 0. Simpul lainnya ∞ karena lintasannya belum ditemukan. Pendahulu belum tersedia.`,{line:0});
 if(algorithm==='dijkstra'||algorithm==='astar'){
  for(let it=0;it<n;it++){
   let u=null;for(let v=0;v<n;v++){count.scans++;if(!done[v]&&d[v]!==Infinity&&(u===null||(d[v]+(algorithm==='astar'?h[v]:0))<(d[u]+(algorithm==='astar'?h[u]:0))))u=v;}
   if(u===null||d[u]===Infinity){add('stop','Simpul tersisa tidak terjangkau','Estimasi minimum yang tersisa adalah ∞. Tidak ada lintasan dari sumber ke simpul-simpul tersebut.',{line:2});break;}
   done[u]=true;count.selected++;
   add('select','Pilih '+g.names[u]+' · jarak '+fmt(d[u]),`${g.names[u]} memiliki ${algorithm==='astar'?'prioritas g + h':'jarak d'} terkecil di antara simpul yang belum final. ${algorithm==='astar'?'Dengan heuristik consistent, simpul aman ditutup.':'Dengan bobot non-negatif, jaraknya aman ditetapkan final.'}`,{u,line:3,formula:algorithm==='astar'?('g = '+d[u]+' · h = '+h[u]+' · f = '+(d[u]+h[u])):('d = '+d[u])});
   if(u===t&&(mode==='target'||algorithm==='astar')){add('finish','Tujuan sudah final',g.names[t]+' dipilih sebagai minimum. Biaya tujuan '+d[t]+' sudah optimal; simpul lain yang belum dipilih masih sementara.',{line:6,complete:true,targetOnly:true});return events;}
   for(const {v,w,id} of a[u]){
    count.checks++;const old=d[v],alt=d[u]+w;
    if(done[v]){add('skip',g.names[v]+' sudah final',`Sisi ${g.names[u]} → ${g.names[v]} diperiksa. Implementasi ini tidak memperbarui simpul yang sudah final.`,{u,v,edge:id,line:4,formula:`d[${g.names[v]}] = ${fmt(old)} · tetap`});continue;}
    if(alt<d[v]){d[v]=alt;prev[v]=u;count.updates++;add('update','Perbaiki jarak '+g.names[v],`Melalui ${g.names[u]}, jarak ${g.names[v]} lebih kecil. Pendahulu ${g.names[v]} menjadi ${g.names[u]}. Jarak ini masih sementara sampai simpulnya dipilih.`,{u,v,edge:id,line:5,formula:`${fmt(d[u])} + ${w} = ${alt} < ${fmt(old)} · ${fmt(old)} → ${alt}`,old});}
    else add('check','Pertahankan jarak '+g.names[v],`Jalur melalui ${g.names[u]} tidak memberi biaya lebih rendah. Jarak dan pendahulu ${g.names[v]} tetap.`,{u,v,edge:id,line:4,formula:`${fmt(d[u])} + ${w} = ${alt} ≥ ${fmt(old)} · tetap`});
   }
  }
  add('finish','Seluruh jarak selesai','Semua simpul yang terjangkau sudah final. Gunakan predecessor untuk menelusuri rute dari tujuan ke sumber.',{line:6,complete:true});
 }else{
  const arcs=[];a.forEach((arr,u)=>arr.forEach(e=>arcs.push({u,...e})));
  for(let pass=1;pass<n;pass++){
   count.pass=pass;let changed=false;add('pass',`Putaran ${pass} dimulai`,`Periksa ${arcs.length} sisi berarah sesuai urutan daftar. Setiap sisi tidak berarah muncul dua kali. Jarak tidak difinalkan satu per satu.`,{line:1});
   for(const {u,v,w,id} of arcs){
    count.checks++;const old=d[v],alt=d[u]+w;
    if(d[u]===Infinity){add('skip','Lewati '+g.names[u]+' → '+g.names[v],`Jarak ${g.names[u]} masih ∞. Belum ada lintasan dari sumber, sehingga sisi ini belum bisa memperbaiki jarak.`,{u,v,edge:id,line:3,formula:`∞ + ${w} = ∞ · tidak diperbarui`});continue;}
    if(alt<d[v]){d[v]=alt;prev[v]=u;count.updates++;changed=true;add('update','Perbaiki jarak '+g.names[v],`Jalur melalui ${g.names[u]} lebih murah. Pembaruan langsung dapat dipakai oleh sisi berikutnya dalam putaran yang sama.`,{u,v,edge:id,line:4,old,formula:`${fmt(d[u])} + ${w} = ${alt} < ${fmt(old)} · ${fmt(old)} → ${alt}`});}
    else add('check','Pertahankan jarak '+g.names[v],`Sisi ${g.names[u]} → ${g.names[v]} tidak memberi jarak lebih kecil. Lanjutkan ke sisi berikutnya.`,{u,v,edge:id,line:3,formula:`${fmt(d[u])} + ${w} = ${alt} ≥ ${fmt(old)} · tetap`});
   }
   add('endpass',changed?`Putaran ${pass} selesai · ada perbaikan`:`Putaran ${pass} selesai · tanpa perbaikan`,changed?'Ada jarak yang berubah. Periksa seluruh sisi lagi jika batas n − 1 putaran belum tercapai.':'Tidak ada jarak berubah sepanjang putaran ini. Penghentian dini menghentikan putaran relaxation.',{line:5});
   if(!changed)break;
  }
  // Match report: one additional edge pass checks for a reachable negative cycle.
  let negative=false;for(const {u,v,w,id} of arcs){count.checks++;if(d[u]!==Infinity&&d[u]+w<d[v])negative=true;add('verify','Verifikasi '+g.names[u]+' → '+g.names[v],'Pemeriksaan tambahan mencari sisi yang masih dapat menurunkan jarak. Pada graf ini tidak ada siklus negatif terjangkau.',{u,v,edge:id,line:6,formula:fmt(d[u])+' + '+w+' ≥ '+fmt(d[v])});}
  add('verify','Verifikasi siklus negatif',`Satu pemeriksaan tambahan atas ${arcs.length} sisi berarah selesai. ${negative?'Terdeteksi siklus negatif terjangkau.':'Tidak ada sisi yang masih bisa memperbaiki jarak.'}`,{line:6});
  add('finish','Seluruh jarak selesai','Jarak akhir valid tanpa siklus negatif terjangkau. Ikuti predecessor untuk memperoleh lintasan minimum.',{line:7,complete:true});
 }
 return events;
}
function routeOf(prev,s,t){let out=[],u=t,seen=new Set();while(u!==null&&!seen.has(u)){seen.add(u);out.push(u);if(u===s)return out.reverse();u=prev[u];}return [];}

const CODE={
dijkstra:['d[s] = 0; # lainnya = inf','u = minimum(d, belum_final)','if u is None: break','done[u] = True','for v, w in graf[u]:','    if not done[v] and d[u]+w < d[v]:','        d[v], prev[v] = d[u]+w, u'],
bf:['d[s] = 0; # lainnya = inf','for putaran in range(n-1):','    changed = False','    for u, v, w in semua_sisi:','        if d[u]+w < d[v]: update(v)','    if not changed: break','cek_siklus_negatif(semua_sisi)','return d, prev'],
astar:['g[s] = 0; # lainnya = inf','u = minimum(g+h, belum_ditutup)','if u is None: break','closed[u] = True','for v, w in graf[u]:','    if not closed[v] and g[u]+w < g[v]:','        g[v], prev[v] = g[u]+w, u']};
let current=CASES.campus,source=0,target=5,view='dijkstra',mode='target',traces={},indices={dijkstra:0,bf:0,astar:0},timer=null;
const $=id=>document.getElementById(id);
const visible=()=>view==='both'?['dijkstra','bf']:view==='astar-pair'?['dijkstra','astar']:view==='all'?['dijkstra','bf','astar']:[view];
function pause(){if(timer){clearInterval(timer);timer=null;}if($('play'))$('play').textContent='Putar';}
function setup(){pause();traces={};for(const a of ['dijkstra','bf','astar'])traces[a]=buildTrace(current,source,a,target,mode);indices={dijkstra:0,bf:0,astar:0};$('scenario-description').textContent=current.description;$('graph-stats').textContent=current.names.length+' simpul · '+current.edges.length+' ruas · dua arah';render();}
function edgePath(route,id){const [u,v]=current.edges[id];return route.some((x,i)=>i>0&&((x===u&&route[i-1]===v)||(x===v&&route[i-1]===u)));}
function graphSVG(e,algo){
 const ready=algo!=='bf'?e.done[target]:e.complete,path=ready?routeOf(e.prev,source,target):[];
 let svg=`<svg class="graph" viewBox="0 0 620 340" role="img" aria-label="Graf ${algo!=='bf'?LABEL[algo]:'Bellman–Ford'}, langkah ${indices[algo]}. Jarak ditampilkan di bawah simpul."><defs><marker id="arrow-${algo}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#e2921f"/></marker></defs>`;
 current.edges.forEach(([u,v,w],id)=>{const [x1,y1]=current.positions[u],[x2,y2]=current.positions[v];let active=id===e.edge,isPath=edgePath(path,id);svg+=`<line class="edge ${active?'active':isPath?'path':''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;let dx=x2-x1,dy=y2-y1,ln=Math.hypot(dx,dy),mx=(x1+x2)/2,my=(y1+y2)/2;
 if(active){let ux=e.u===u?x1:x2,uy=e.u===u?y1:y2,vx=e.u===u?x2:x1,vy=e.u===u?y2:y1;let ddx=(vx-ux)/ln,ddy=(vy-uy)/ln;svg+=`<line x1="${ux+ddx*36}" y1="${uy+ddy*36}" x2="${vx-ddx*35}" y2="${vy-ddy*35}" stroke="#e2921f" stroke-width="4" marker-end="url(#arrow-${algo})"/>`;}
 svg+=`<rect x="${mx-23}" y="${my-13}" width="46" height="26" rx="6" fill="${active?'#fff0d8':'#f8fafc'}"/><text class="edge-label" text-anchor="middle" x="${mx}" y="${my+6}">${w}</text>`;
 });
 current.names.forEach((name,i)=>{const [x,y]=current.positions[i],isActive=e.u===i||e.kind==='update'&&e.v===i,final=algo!=='bf'?e.done[i]:e.complete&&Number.isFinite(e.d[i]);svg+=`<g class="node ${isActive?'active':''} ${final?'visited':''} ${target===i?'target':''}" data-node="${i}" transform="translate(${x},${y})" role="button" tabindex="0" aria-label="${escapeHTML(name)}, jarak ${fmt(e.d[i])}. Pilih sebagai tujuan"><title>${escapeHTML(name)} · d = ${fmt(e.d[i])}</title>${target===i?'<circle class="target-ring" r="36"/>':''}<circle r="29"/><text class="label" text-anchor="middle" y="7">${current===CASES.campus?String.fromCharCode(65+i):name}</text><text class="distance" text-anchor="middle" y="57">d = ${fmt(e.d[i])}</text>${source===i?'<text class="source-label" text-anchor="middle" y="-43">SUMBER</text>':''}</g>`;});
 return svg+'</svg>';
}

function renderCard(algo){
 const idx=indices[algo],events=traces[algo],e=events[idx],isD=algo==='dijkstra',isA=algo==='astar',name=LABEL[algo],route=routeOf(e.prev,source,target),ready=algo==='bf'?e.complete:e.done[target]||e.complete,finite=Number.isFinite(e.d[target]);
 const displayName=i=>current===CASES.campus?String.fromCharCode(65+i):current.names[i];
 const card=$(algo+'-card');
 let codeLine=e.line;
 const stopTarget=e.complete&&e.targetOnly;
 if(e.complete)codeLine=-1;
 const routeLabel=!finite?(e.complete?'Tidak ada rute':'Belum ditemukan'):route.map(displayName).join(' → ');
 card.innerHTML=`<div class="progress"><i style="width:${idx/(events.length-1)*100}%"></i></div>
 <div class="algo-header"><div class="algo-title"><span class="num">${isD?'01':isA?'03':'02'}</span><h2>${name}</h2></div><span class="badge">${isD?'FOKUS UTAMA':'PEMBANDING'}</span></div>
 <div class="algo-sub">${isD?'Pilih minimum d · greedy':isA?'Pilih minimum f = g + h · heuristic consistent':'Periksa seluruh sisi · ulang hingga stabil'} · ${e.complete?'selesai':'langkah '+idx+'/'+(events.length-1)}</div>
 <div class="graph-wrap">${graphSVG(e,algo)}</div>
 <div class="legend"><span><i class="dot blue"></i>Aktif</span><span><i class="dot pale"></i>Final / ditutup</span><span><i class="dot amber"></i>Sisi diperiksa</span><span><i class="dot blue"></i>Rute tujuan</span></div>
 <div class="explanation" aria-live="polite"><small>Langkah ${idx} / ${events.length-1}</small><h3>${escapeHTML(e.title)}</h3><p>${escapeHTML(e.text)}</p>${e.formula?`<div class="formula">${escapeHTML(e.formula)}</div>`:''}</div>
 <div class="live-code"><div class="code-heading">Potongan program · baris aktif disorot</div><div class="pseudocode">${CODE[algo].map((l,i)=>`<div class="code-line ${i===codeLine&&!stopTarget?'highlight':''}"><span class="ln">${i+1}</span>${escapeHTML(l)}</div>`).join('')}</div>
 <p class="code-note">${stopTarget?'Tujuan dipilih: program satu tujuan berhenti sebelum memeriksa tetangganya.':isD?'Jarak diperbarui saat lebih murah; jarak final ketika simpul dipilih.':isA?'g adalah biaya dari sumber; h perkiraan sisa; f menentukan urutan pemilihan.':'Pembaruan langsung dipakai oleh sisi berikutnya dalam putaran yang sama.'}</p></div>
 <div class="metric-row"><div class="metric"><strong>${e.count.checks}</strong><span>Sisi diperiksa${algo==='bf'?' + verifikasi':''}</span></div><div class="metric"><strong>${e.count.updates}</strong><span>Pembaruan jarak</span></div><div class="metric"><strong>${algo==='bf'?e.count.pass:e.count.selected}</strong><span>${algo==='bf'?'Putaran relaxation':'Simpul dipilih'}</span></div></div>
 <div class="table-wrap"><table><thead><tr><th>Simpul</th><th>${isA?'g':'d'}</th>${isA?'<th>h</th><th>f</th>':''}<th>Prev</th><th>Status</th></tr></thead><tbody>${current.names.map((n,i)=>{const final=algo==='bf'?e.complete:e.done[i];return `<tr class="${e.kind==='update'&&e.v===i?'changed':final?'final':''}"><td>${displayName(i)}${current===CASES.campus?' · '+escapeHTML(n):''}</td><td><b>${fmt(e.d[i])}</b></td>${isA?`<td>${e.h[i]}</td><td>${fmt(e.d[i]+e.h[i])}</td>`:''}<td>${e.prev[i]===null?'—':displayName(e.prev[i])}</td><td>${final&&Number.isFinite(e.d[i])?'Final':e.complete&&!Number.isFinite(e.d[i])?'Tak terjangkau':Number.isFinite(e.d[i])?'Sementara':'Belum ditemukan'}</td></tr>`}).join('')}</tbody></table></div>
 <div class="route"><div><small>${escapeHTML(current.names[source])} ke ${escapeHTML(current.names[target])} · ${ready?'final':'sementara'}</small><span>${escapeHTML(routeLabel)}</span></div><strong>${fmt(e.d[target])}<small>${current.unit}</small></strong></div>
 <details class="details"><summary>Jejak empat langkah terakhir</summary><ol class="history">${events.slice(Math.max(0,idx-3),idx+1).map(ev=>`<li>${escapeHTML(ev.title)}</li>`).join('')}</ol></details>
 <div class="card-footer"><span>${algo==='bf'?'Kedua arah sisi diperiksa.':'Posisi dipindai: '+e.count.scans}</span><button data-alone="${algo}" ${idx===events.length-1?'disabled':''}>Langkah ${name}</button></div>`;
 card.querySelectorAll('[data-node]').forEach(el=>{const fn=()=>{target=Number(el.dataset.node);$('target').value=target;setup();};el.onclick=fn;el.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();fn();}};});
 card.querySelector('[data-alone]').onclick=()=>{pause();advance([algo],1);};
}
function render(){
 for(const a of ['dijkstra','bf','astar']){$(a+'-card').hidden=!visible().includes(a);if(!$(a+'-card').hidden)renderCard(a);}
 $('compare').classList.toggle('single',visible().length===1);$('compare').classList.toggle('triple',visible().length===3);
 const end=visible().every(a=>indices[a]===traces[a].length-1);
 for(const id of ['next','finish','play'])$(id).disabled=end;
 $('back').disabled=visible().every(a=>indices[a]===0);if(end)pause();
 $('mode-note').textContent=mode==='target'?'Dijkstra dan A* berhenti saat tujuan dipilih. Bellman–Ford menyelesaikan relaxation dan verifikasi; ketiganya dibandingkan pada biaya tujuan yang sama.':'Dijkstra dan Bellman–Ford menghitung semua jarak (SSSP). A* tetap mencari satu tujuan; jarak simpul yang belum ditutup masih sementara.';
}
function advance(algs,amount){algs.forEach(a=>indices[a]=Math.max(0,Math.min(traces[a].length-1,indices[a]+amount)));render();}
function autoplay(){if(timer){pause();return;}if(visible().every(a=>indices[a]===traces[a].length-1))return;$('play').textContent='Jeda';timer=setInterval(()=>advance(visible(),1),Number($('speed').value));}
function populate(){for(const id of ['source','target'])$(id).innerHTML=current.names.map((n,i)=>`<option value="${i}">${escapeHTML(n)}</option>`).join('');$('source').value=source;$('target').value=target;}
let activeTab='simulation',presentation=false;
function switchTab(id){
 pause();activeTab=id;
 document.querySelectorAll('[data-tab]').forEach(b=>{const yes=b.dataset.tab===id;b.setAttribute('aria-selected',yes);b.tabIndex=yes?0:-1;$(b.dataset.tab).hidden=!yes;});
 const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.findIndex(b=>b.dataset.tab===id);
 $('slide-count').textContent=(i+1)+' / '+tabs.length;
 $('slide-prev').disabled=i===0;$('slide-next').disabled=i===tabs.length-1;
 $('slide-title').textContent=tabs[i].textContent;
 window.scrollTo({top:0,behavior:'instant'});
}
function stepSlide(delta){const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.findIndex(b=>b.dataset.tab===activeTab);switchTab(tabs[Math.max(0,Math.min(tabs.length-1,i+delta))].dataset.tab);}
function initialize(){
 populate();setup();switchTab('simulation');
 $('scenario').onchange=()=>{current=CASES[$('scenario').value];source=0;target=current.names.length-1;populate();setup();};
 $('source').onchange=()=>{source=Number($('source').value);setup();};
 $('target').onchange=()=>{target=Number($('target').value);setup();};
 $('mode').onchange=()=>{mode=$('mode').value;setup();};
 $('reset').onclick=setup;$('play').onclick=autoplay;$('next').onclick=()=>{pause();advance(visible(),1);};
 $('back').onclick=()=>{pause();advance(visible(),-1);};
 $('finish').onclick=()=>{pause();visible().forEach(a=>indices[a]=traces[a].length-1);render();};
 $('speed').oninput=()=>{$('speed-label').textContent=(Number($('speed').value)/1000).toLocaleString('id-ID')+' dtk';if(timer){pause();autoplay();}};
 document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{pause();view=b.dataset.view;document.querySelectorAll('[data-view]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',x===b);});render();});
 document.querySelectorAll('[data-tab]').forEach(b=>{b.onclick=()=>switchTab(b.dataset.tab);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const tabs=[...document.querySelectorAll('[data-tab]')],i=tabs.indexOf(b),next=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];switchTab(next.dataset.tab);next.focus();};});
 $('presentation').onclick=()=>{presentation=!presentation;document.body.classList.toggle('presenting',presentation);$('presentation').textContent=presentation?'Keluar presentasi':'Mode presentasi';$('presentation').setAttribute('aria-pressed',presentation);if(presentation)switchTab('overview');};
 $('notes').onclick=()=>{const on=document.body.classList.toggle('show-notes');$('notes').setAttribute('aria-pressed',on);};
 $('slide-prev').onclick=()=>stepSlide(-1);$('slide-next').onclick=()=>stepSlide(1);
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{$('fullscreen').textContent='Gunakan F11';}};
 document.addEventListener('fullscreenchange',()=>{$('fullscreen').textContent=document.fullscreenElement?'Keluar layar penuh':'Layar penuh';});
 document.addEventListener('keydown',e=>{
 if(presentation&&['PageDown','PageUp'].includes(e.key)){e.preventDefault();stepSlide(e.key==='PageDown'?1:-1);return;}
 if(e.target.closest('input,select,button,summary,[role="button"]'))return;
 if(activeTab!=='simulation')return;
 if(e.key===' '){e.preventDefault();autoplay();}if(e.key==='ArrowRight'){e.preventDefault();pause();advance(visible(),1);}if(e.key==='ArrowLeft'){e.preventDefault();pause();advance(visible(),-1);}
 });drawBenchmark();drawCampusRuntime();
}
function drawCampusRuntime(){
 const rows=[['Dijkstra',2.5563254,.14403334,'#255dd5'],['Bellman–Ford',3.97308473,.07279436,'#d99935'],['A*',2.62525096,.06525484,'#178775']];
 const nf=x=>x.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3});
 $('campus-runtime-table').innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td>${nf(r[1])} ± ${nf(r[2])}</td><td>700</td></tr>`).join('');
 let svg='',y=x=>310-x/5*250;for(let t=0;t<=5;t++)svg+=`<line x1="65" y1="${y(t)}" x2="610" y2="${y(t)}" stroke="#e1e8f2"/><text x="50" y="${y(t)+5}" text-anchor="end" fill="#5c6e81" font-size="15">${t}</text>`;
 rows.forEach((r,i)=>{const x=120+i*175;svg+=`<rect x="${x}" y="${y(r[1])}" width="95" height="${310-y(r[1])}" rx="5" fill="${r[3]}"/><path d="M${x+47} ${y(r[1]-r[2])}V${y(r[1]+r[2])}M${x+38} ${y(r[1]-r[2])}h18M${x+38} ${y(r[1]+r[2])}h18" stroke="#14273f" stroke-width="2"/><text x="${x+47}" y="${y(r[1]+r[2])-12}" text-anchor="middle" fill="#14273f" font-size="18" font-weight="700">${nf(r[1])}</text><text x="${x+47}" y="339" text-anchor="middle" fill="#14273f" font-size="16">${r[0]}</text>`;});
 svg+='<text x="18" y="182" transform="rotate(-90 18 182)" text-anchor="middle" fill="#5c6e81" font-size="16">Waktu per pencarian (µs)</text>';
 $('campus-runtime-chart').innerHTML=svg;
}
function drawBenchmark(){const rows=[[100,300,.2925804,.02166465,.2010066,.00779948],[200,600,1.2582316,.08750438,.4541514,.05385999],[400,1200,4.1574586,.14863241,1.2756498,.07297569],[800,2400,20.2290724,.65141392,2.9532104,.17864493],[1600,4800,70.6271876,1.41894860,8.1062376,.78723326]];const nf=x=>x.toLocaleString('id-ID',{minimumFractionDigits:3,maximumFractionDigits:3});$('benchmark-table').innerHTML=rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${nf(r[2])} ± ${nf(r[3])}</td><td>${nf(r[4])} ± ${nf(r[5])}</td></tr>`).join('');let s='',x=n=>68+n/1600*550,y=t=>315-t/80*260;for(let t=0;t<=80;t+=20)s+=`<line x1="68" y1="${y(t)}" x2="625" y2="${y(t)}" stroke="#e4eaf2"/><text x="54" y="${y(t)+5}" text-anchor="end" fill="#617289" font-size="14">${t}</text>`;rows.forEach(r=>s+=`<text x="${x(r[0])}" y="341" text-anchor="middle" fill="#617289" font-size="14">${r[0]}</text>`);s+='<text x="337" y="367" text-anchor="middle" fill="#617289" font-size="14">Jumlah simpul n</text><text x="18" y="190" transform="rotate(-90 18 190)" text-anchor="middle" fill="#617289" font-size="14">Waktu rata-rata (ms)</text>';let theory=[];for(let n=0;n<=1600;n+=40)theory.push(`${x(n)},${y(rows[4][2]*(n/1600)**2)}`);s+=`<polyline points="${theory.join(' ')}" fill="none" stroke="#8090a5" stroke-width="2" stroke-dasharray="5 5"/>`;[[2,'#255dd5'],[4,'#d99935']].forEach(([col,color])=>{s+=`<polyline points="${rows.map(r=>`${x(r[0])},${y(r[col])}`).join(' ')}" stroke="${color}" stroke-width="3" fill="none"/>`;rows.forEach(r=>s+=`<circle cx="${x(r[0])}" cy="${y(r[col])}" r="5" fill="${color}"><title>n=${r[0]}: ${nf(r[col])} ms</title></circle>`);});$('benchmark-chart').innerHTML=s;}

if(typeof document!=='undefined')initialize();
if(typeof module!=='undefined')module.exports={CASES,COORDS,heuristic,adjacency,buildTrace,routeOf};
