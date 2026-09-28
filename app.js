'use strict';
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const ld=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},sv=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch{}};
const S=Object.assign({theme:'system',angle:'deg',haptic:true,sep:true,prec:10,sci:'auto'},ld('nc.s',{}));
let H=ld('nc.h',[]),M=ld('nc.m',0),expr='',just=false,view='calc',sci=false,dp=null;
/* ---------- expression engine (no eval) ---------- */
const DE='Domain error',DZ='Division by zero',IE='Invalid expression';
const af=()=>({deg:Math.PI/180,rad:1,grad:Math.PI/200})[S.angle],a2r=x=>x*af(),r2a=x=>x/af(),z=v=>Math.abs(v)<1e-14?0:v;
const fact=n=>{if(n<0||n%1||n>170)throw DE;let r=1;for(let i=2;i<=n;i++)r*=i;return r};
const chk=(n,k)=>{if(n<0||k<0||k>n||n%1||k%1)throw DE};
const nz=(v,e)=>{if(Math.abs(v)<1e-12)throw e;return v};
const FN={sin:x=>z(Math.sin(a2r(x))),cos:x=>z(Math.cos(a2r(x))),tan:x=>z(Math.sin(a2r(x))/nz(Math.cos(a2r(x)),DE)),cot:x=>z(Math.cos(a2r(x))/nz(Math.sin(a2r(x)),DZ)),sec:x=>1/nz(Math.cos(a2r(x)),DZ),csc:x=>1/nz(Math.sin(a2r(x)),DZ),
asin:x=>{if(Math.abs(x)>1)throw DE;return r2a(Math.asin(x))},acos:x=>{if(Math.abs(x)>1)throw DE;return r2a(Math.acos(x))},atan:x=>r2a(Math.atan(x)),sinh:Math.sinh,cosh:Math.cosh,tanh:Math.tanh,
log:x=>{if(x<=0)throw DE;return Math.log10(x)},ln:x=>{if(x<=0)throw DE;return Math.log(x)},sqrt:x=>{if(x<0)throw DE;return Math.sqrt(x)},cbrt:Math.cbrt,abs:Math.abs,floor:Math.floor,ceil:Math.ceil,rand:()=>Math.random(),
nroot:(n,x)=>{if(!n)throw DZ;if(x<0&&n%2===0)throw DE;return x<0?-Math.pow(-x,1/n):Math.pow(x,1/n)},
ncr:(n,k)=>{chk(n,k);let r=1;k=Math.min(k,n-k);for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r)},
npr:(n,k)=>{chk(n,k);let r=1;for(let i=0;i<k;i++)r*=n-i;return r},
mod:(a,b)=>{if(!b)throw DZ;return a-b*Math.floor(a/b)}};
const CT={pi:Math.PI,e:Math.E,phi:(1+Math.sqrt(5))/2};
function tok(s){const t=[];s=s.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/√/g,' sqrt ').replace(/π/g,' pi ').replace(/φ/g,' phi ');let i=0,m;
while(i<s.length){const c=s[i],r=s.slice(i);if(/\s/.test(c)){i++;continue}
if(m=/^(\d+\.?\d*|\.\d+)(E[+-]?\d+)?/.exec(r)){t.push({n:parseFloat(m[0])});i+=m[0].length}
else if(m=/^[a-z]+/i.exec(r)){const w=m[0].toLowerCase();t.push(w==='of'?{o:'*'}:{w});i+=m[0].length}
else if('+-*/^()!%,'.includes(c)){t.push({o:c});i++}else throw IE}
return t}
function calc(s){const t=tok(s);if(!t.length)return null;let p=0,pc=false;
const op=c=>t[p]&&t[p].o===c,need=c=>{if(op(c))p++;else if(!(c===')'&&p>=t.length))throw IE};
const E=()=>{let a=T();while(op('+')||op('-')){const o=t[p++].o,b=T(),q=pc,d=q?a*b:b;a=o==='+'?a+d:a-d;pc=false}return a};
const T=()=>{let a=U();for(;;){const k=t[p];if(!k)break;let o;if(k.o==='*'||k.o==='/')o=t[p++].o;else if(k.n!==undefined||k.w||k.o==='(')o='*';else break;const b=U();if(o==='/'&&b===0)throw DZ;a=o==='*'?a*b:a/b;pc=false}return a};
const U=()=>{if(op('-')){p++;return -U()}if(op('+')){p++;return U()}return W()};
const W=()=>{const b=Q();if(op('^')){p++;const v=Math.pow(b,U());if(isNaN(v))throw DE;return v}return b};
const Q=()=>{let v=P();for(;;){if(op('!')){p++;v=fact(v);pc=false}else if(op('%')){p++;v/=100;pc=true}else break}return v};
const P=()=>{const k=t[p++];pc=false;if(!k)throw IE;if(k.n!==undefined)return k.n;
if(k.o==='('){const v=E();need(')');pc=false;return v}
if(k.w){if(k.w in CT)return CT[k.w];if(!(k.w in FN))throw IE;const a=[];if(op('(')){p++;if(!op(')')){a.push(E());while(op(',')){p++;a.push(E())}}need(')')}else a.push(Q());pc=false;return FN[k.w](...a)}
throw IE};
const v=E();if(p<t.length)throw IE;if(isNaN(v))throw DE;if(!isFinite(v))throw DE;return v}
const raw=v=>String(+v.toPrecision(12)).replace('e','E');
function fmt(n){n=+n.toPrecision(12);const a=Math.abs(n);
if((S.sci==='always'&&n)||a>=1e15||(a&&a<1e-9))return n.toExponential(Math.min(+S.prec,9)).replace(/\.?0+e/,'e').replace('e+','E').replace('e','E');
return n.toLocaleString('en-US',{useGrouping:!!S.sep,maximumFractionDigits:+S.prec})}
/* ---------- calculator UI ---------- */
const BAS=[['AC','AC'],['(','('],[')',')'],['%','%','o'],...'789'.split('').map(x=>[x]),['÷','÷','o'],...'456'.split('').map(x=>[x]),['×','×','o'],...'123'.split('').map(x=>[x]),['−','−','o'],['±'],['0'],['.'],['+','+','o']];
const SC=[['sin','sin('],['cos','cos('],['tan','tan('],['asin','asin('],['acos','acos('],['atan','atan('],['sinh','sinh('],['cosh','cosh('],['tanh','tanh('],['cot','cot('],['sec','sec('],['csc','csc('],['log','log('],['ln','ln('],['√','√('],['ⁿ√','nroot('],['x²','^2'],['x³','^3'],['xʸ','^'],['n!','!'],['|x|','abs('],['1/x','1/('],['π','π'],['e','e'],['φ','φ'],['EXP','E'],['nCr','ncr('],['nPr','npr('],['mod','mod('],['⌊x⌋','floor('],['⌈x⌉','ceil('],['rand','rand()'],['√2','sqrt(2)'],['ln2','ln(2)'],['ln10','ln(10)'],[',',',']];
const kb=([l,i,c])=>`<button class="k ${c||''}" data-i="${i||l}" aria-label="${l}">${l}</button>`;
const cur=()=>{try{return calc(expr)??0}catch{return 0}};
const setM=v=>{M=v;sv('nc.m',M)};
const MEM={MC:()=>setM(0),MR:()=>{if(just)expr='';just=false;expr+=raw(M)},'M+':()=>setM(M+cur()),'M-':()=>setM(M-cur()),MS:()=>setM(cur())};
function press(i){if(S.haptic&&navigator.vibrate)navigator.vibrate(6);
if(i==='=')return eq();
if(i==='AC'){expr='';just=false}else if(i==='⌫'){expr=expr.replace(/([a-z]+\(|.)$/i,'');just=false}
else if(i==='±')neg();else if(MEM[i])MEM[i]();
else{const o=/^(\^|!|%|[+×÷−])/.test(i);if(just&&!o)expr='';just=false;expr+=i}upd()}
function neg(){if(/\(-(\d*\.?\d+)\)$/.test(expr))expr=expr.replace(/\(-(\d*\.?\d+)\)$/,'$1');else if(/(\d*\.?\d+)$/.test(expr))expr=expr.replace(/(\d*\.?\d+)$/,'(-$1)');else expr+='(-'}
function eq(){try{const v=calc(expr);if(v===null)return;H.unshift({e:expr,r:fmt(v),t:Date.now()});H=H.slice(0,200);sv('nc.h',H);expr=raw(v);just=true;upd();$('#pv').textContent=fmt(v)}catch(x){upd();$('#pv').textContent=typeof x==='string'?x:IE;$('#pv').className='err'}}
function upd(){$('#ex').textContent=expr||'0';let r='';try{const v=calc(expr);if(v!==null&&/[^\d.]/.test(expr))r=fmt(v)}catch{}const p=$('#pv');p.textContent=r;p.className='';$('#mi').hidden=!M;$('#an').textContent=S.angle.toUpperCase();$('#ex').scrollLeft=1e6}
/* ---------- units ---------- */
const UN={Length:{mm:.001,cm:.01,m:1,km:1e3,in:.0254,ft:.3048,yd:.9144,mi:1609.344,'nautical mi':1852},
Area:{'mm²':1e-6,'cm²':1e-4,'m²':1,'km²':1e6,'in²':6.4516e-4,'ft²':.09290304,'yd²':.83612736,acre:4046.8564224,hectare:1e4},
Volume:{mL:1e-3,L:1,'m³':1e3,tsp:.00492892159375,tbsp:.01478676478125,'fl oz':.0295735295625,cup:.2365882365,pint:.473176473,quart:.946352946,gallon:3.785411784},
Mass:{mg:1e-6,g:1e-3,kg:1,'metric ton':1e3,oz:.028349523125,lb:.45359237,stone:6.35029318},
Time:{ms:.001,second:1,minute:60,hour:3600,day:86400,week:604800,month:2629800,year:31557600},
Speed:{'m/s':1,'km/h':1/3.6,mph:.44704,knot:.514444444,'ft/s':.3048},
Temperature:{'°C':0,'°F':0,K:0},
Data:{bit:1,byte:8,KB:8192,MB:8388608,GB:8589934592,TB:8796093022208,PB:9007199254740992}};
function cv(v,f,t,c){if(c==='Temperature'){const C=f==='°C'?v:f==='°F'?(v-32)*5/9:v-273.15;return t==='°C'?C:t==='°F'?C*9/5+32:C+273.15}return v*UN[c][f]/UN[c][t]}
function fill(){const u=Object.keys(UN[$('#cat').value]),o=u.map(x=>`<option>${x}</option>`).join('');$('#fu').innerHTML=o;$('#tu').innerHTML=o;$('#tu').selectedIndex=1;doCv()}
function doCv(){const v=parseFloat($('#fv').value);$('#tv').textContent=isNaN(v)?'—':fmt(cv(v,$('#fu').value,$('#tu').value,$('#cat').value))}
/* ---------- dates ---------- */
const D=s=>new Date(s+'T00:00:00Z'),iso=d=>d.toISOString().slice(0,10);
function doDt(){let a=D($('#d1').value),b=D($('#d2').value),o='';if(!isNaN(a)&&!isNaN(b)){let sg=b<a?-1:1;if(sg<0)[a,b]=[b,a];const d=Math.round((b-a)/864e5);let m=(b.getUTCFullYear()-a.getUTCFullYear())*12+b.getUTCMonth()-a.getUTCMonth();if(b.getUTCDate()<a.getUTCDate())m--;
o=`${sg<0?'−':''}${d} days\n${sg<0?'−':''}${(d/7).toFixed(2)} weeks\n${sg<0?'−':''}${m} months\n${sg<0?'−':''}${(m/12).toFixed(2)} years`}$('#dr').textContent=o;
const c=D($('#d3').value),n=parseInt($('#dn').value,10);if(!isNaN(c)&&!isNaN(n)){const x=new Date(c),y=new Date(c);x.setUTCDate(x.getUTCDate()+n);y.setUTCDate(y.getUTCDate()-n);$('#da').textContent=`+${n} days: ${iso(x)}\n−${n} days: ${iso(y)}`}else $('#da').textContent=''}
/* ---------- history ---------- */
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function rh(){$('#hl').innerHTML=H.length?H.map((h,i)=>`<li><button class="hu" data-u="${i}" aria-label="Reuse result ${esc(h.r)}"><span>${esc(h.e)}</span><b>${esc(h.r)}</b></button><button data-c="${i}" aria-label="Copy result">Copy</button><button data-d="${i}" aria-label="Delete entry">✕</button></li>`).join(''):'<li class="em">No calculations yet.</li>'}
/* ---------- theme, views, settings ---------- */
function theme(){document.documentElement.dataset.theme=S.theme;const d=S.theme==='dark'||(S.theme==='system'&&matchMedia('(prefers-color-scheme:dark)').matches);$('meta[name=theme-color]').content=d?'#000000':'#f1f1ee'}
const NAV=[['calc','Calc'],['sci','Sci'],['conv','Convert'],['date','Date'],['hist','History'],['set','Settings']];
function show(v){view=v==='sci'?'calc':v;sci=v==='sci';$$('section').forEach(s=>s.hidden=s.id!=='v-'+view);$('#v-calc').classList.toggle('sci',sci);$$('#nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===v?'page':'false'));if(v==='hist')rh()}
const sel=(id,o,val)=>`<select id="${id}">${o.map(([k,l])=>`<option value="${k}"${String(k)===String(val)?' selected':''}>${l}</option>`).join('')}</select>`;
const LOGO='<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="currentColor"><circle cx="20" cy="20" r="6"/><circle cx="35" cy="20" r="6"/><circle cx="50" cy="20" r="6"/><circle cx="65" cy="20" r="6"/><circle cx="80" cy="20" r="6"/><circle cx="20" cy="50" r="6"/><circle cx="50" cy="50" r="6"/><circle cx="80" cy="50" r="6"/><circle cx="20" cy="65" r="6"/><circle cx="50" cy="65" r="6"/><circle cx="80" cy="65" r="6"/><circle cx="20" cy="80" r="6"/><circle cx="50" cy="80" r="6"/></g><circle cx="80" cy="80" r="6" fill="#d71921"/></svg>';
function build(){const today=iso(new Date());
$('#nav').innerHTML=NAV.map(([k,l])=>`<button data-v="${k}">${l}</button>`).join('');
$('#main').innerHTML=`<section id="v-calc"><div class="hd">${LOGO}<b>NOTHING CALCULATOR</b><button class="txt" id="ins" hidden>Install</button></div><div class="card"><div class="disp"><div class="top"><span id="mi" hidden>M</span><button id="an" aria-label="Angle mode, tap to change"></button><button data-i="⌫" aria-label="Backspace">⌫</button></div><div id="ex"></div><div id="pv" aria-live="polite"></div></div><div class="mem">${['MC','MR','M+','M-','MS'].map(x=>kb([x])).join('')}</div><div class="sciP">${SC.map(kb).join('')}</div><div class="pad">${BAS.map(kb).join('')}${kb(['=','=','eq'])}</div></div></section>
<section id="v-conv" hidden><h2>CONVERTER</h2><div class="f"><label>Category<select id="cat">${Object.keys(UN).map(k=>`<option>${k}</option>`).join('')}</select></label><label>Value<input id="fv" type="number" step="any" value="1" inputmode="decimal"></label><div class="r"><label style="flex:1">From<select id="fu"></select></label><label style="flex:1">To<select id="tu"></select></label></div><div class="big" id="tv" aria-live="polite"></div></div></section>
<section id="v-date" hidden><h2>DATES</h2><div class="f"><label>From<input type="date" id="d1" value="${today}"></label><label>To<input type="date" id="d2" value="${today}"></label><div class="out big" id="dr" aria-live="polite" style="font-size:20px"></div></div><div class="f" style="margin-top:12px"><label>Start date<input type="date" id="d3" value="${today}"></label><label>Days<input type="number" id="dn" value="30" inputmode="numeric"></label><div class="out" id="da" aria-live="polite"></div></div></section>
<section id="v-hist" hidden><div class="r"><h2>HISTORY</h2><button class="txt" id="hc">Clear all</button></div><ul id="hl"></ul></section>
<section id="v-set" hidden><h2>SETTINGS</h2><div class="f"><label>Theme${sel('sT',[['system','System'],['light','Light'],['dark','Dark']],S.theme)}</label><label>Angle mode${sel('sA',[['deg','Degrees'],['rad','Radians'],['grad','Gradians']],S.angle)}</label><label>Decimal places${sel('sP',[[4,4],[6,6],[8,8],[10,10],[12,12]],S.prec)}</label><label>Scientific notation${sel('sS',[['auto','Only for very large or small numbers'],['always','Always']],S.sci)}</label><label>Thousands separators${sel('sG',[[1,'On'],[0,'Off']],S.sep?1:0)}</label><label>Vibration${sel('sH',[[1,'On'],[0,'Off']],S.haptic?1:0)}</label><button class="txt" id="hc2">Clear history</button><button class="txt" id="ins2" hidden>Install calculator</button><p class="mono" id="ih" style="font-size:12px;color:var(--mu);margin:0">To install: use your browser menu → Add to Home Screen (or Install app).</p><p style="font-size:12px;color:var(--mu);margin:0">NOTHING CALCULATOR 1.0. Runs fully offline. No tracking, no accounts.</p></div></section>`;
fill();theme();upd();show('calc');doDt()}
build();
$('#nav').onclick=e=>{const b=e.target.closest('button');if(b)show(b.dataset.v)};
$('#v-calc').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='an'){S.angle={deg:'rad',rad:'grad',grad:'deg'}[S.angle];sv('nc.s',S);upd();return}if(b.dataset.i){press(b.dataset.i);if(e.detail)b.blur()}});
$('#cat').onchange=fill;['fv','fu','tu'].forEach(i=>$('#'+i).oninput=doCv);['d1','d2','d3','dn'].forEach(i=>$('#'+i).oninput=doDt);
$('#hl').onclick=e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.u!==undefined){expr=H[d.u].r.replace(/,/g,'');just=true;show('calc');upd()}else if(d.c!==undefined){navigator.clipboard&&navigator.clipboard.writeText(H[d.c].r.replace(/,/g,'')).then(()=>{b.textContent='Copied';setTimeout(rh,900)},()=>{})}else if(d.d!==undefined){H.splice(d.d,1);sv('nc.h',H);rh()}};
const clr=()=>{H=[];sv('nc.h',H);rh()};$('#hc').onclick=clr;$('#hc2').onclick=clr;
const opt=(id,f)=>$('#'+id).onchange=e=>{f(e.target.value);sv('nc.s',S);theme();upd();doCv()};
opt('sT',v=>S.theme=v);opt('sA',v=>S.angle=v);opt('sP',v=>S.prec=+v);opt('sS',v=>S.sci=v);opt('sG',v=>S.sep=v==='1');opt('sH',v=>S.haptic=v==='1');
addEventListener('keydown',e=>{if(view!=='calc'||e.ctrlKey||e.metaKey||e.altKey)return;if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;const k=e.key,m={'*':'×','/':'÷','-':'−','Escape':'AC','Backspace':'⌫','Enter':'=','=':'='};
if(k==='Enter'&&e.target.tagName==='BUTTON')return;
const i=m[k]||('0123456789+.()^!%,'.includes(k)&&k.length===1?k:null);if(i){e.preventDefault();press(i)}});
matchMedia('(prefers-color-scheme:dark)').addEventListener('change',theme);
const inst=matchMedia('(display-mode:standalone)').matches||navigator.standalone;
const showIns=()=>{if(!inst&&dp){$('#ins').hidden=false;$('#ins2').hidden=false;$('#ih').hidden=true}};
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;showIns()});
const doIns=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;$('#ins').hidden=true;$('#ins2').hidden=true};$('#ins').onclick=doIns;$('#ins2').onclick=doIns;
addEventListener('appinstalled',()=>{$('#ins').hidden=true;$('#ins2').hidden=true});
if(inst)$('#ih').hidden=true;
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
