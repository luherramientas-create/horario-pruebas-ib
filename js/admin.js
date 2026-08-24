import { auth, db, provider, collection, doc, getDoc, serverTimestamp, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';
import { getDocs, query, orderBy, writeBatch, setDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const ADMIN_EMAIL = 'lujimenez1002@gmail.com';
const $ = s => document.querySelector(s);
const state = { user:null, programs:[], results:[] };

function isAdmin(user){ return user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(); }
function setMessage(text,error=false){ $('#message').textContent=text; $('#message').style.color=error?'#a33a3a':''; }
function context(p){ return `${p.cursoLectivo} · ${p.periodo} · ${p.numeroPruebas}`; }

async function getActiveProgramId(){
  const activeSnap=await getDoc(doc(db,'configuracion','activeProgram'));
  if(!activeSnap.exists()) return null;
  const activeId=activeSnap.data().programacionId;
  if(!activeId) return null;
  const programSnap=await getDoc(doc(db,'programaciones',activeId));
  if(!programSnap.exists()){
    await setDoc(doc(db,'configuracion','activeProgram'),{programacionId:null,updatedAt:serverTimestamp()});
    return null;
  }
  return activeId;
}

async function loadPrograms(){
  const snap=await getDocs(query(collection(db,'programaciones'),orderBy('cursoLectivo','desc')));
  state.programs=snap.docs.map(d=>({id:d.id,...d.data()}));
  const activeId=await getActiveProgramId();
  const active=activeId?state.programs.find(p=>p.id===activeId):null;
  $('#active-box').className=`status ${active?'open':''}`;
  $('#active-box').innerHTML=active
    ? `<strong>🟢 ${context(active)}</strong><br><span class="muted">${active.nombre||'Programación abierta'}</span><div class="actions"><button id="close-active" class="secondary danger" type="button">Cerrar programación</button></div>`
    : 'No hay una programación activa.';
  $('#close-active')?.addEventListener('click',()=>closeProgram(active));
  renderList(activeId);
  populateProgramFilter();
}

function renderList(activeId){
  const list=$('#program-list');list.innerHTML='';
  if(!state.programs.length){list.innerHTML='<p class="muted">Todavía no hay programaciones.</p>';return;}
  state.programs.forEach(p=>{
    const row=document.createElement('div');row.className='program-row';
    const status=p.id===activeId?'🟢 ABIERTA':`⚪ ${p.estado==='cerrada'?'CERRADA':'INACTIVA'}`;
    row.innerHTML=`<div><strong>${context(p)}</strong><br><span class="muted">${p.nombre||''}</span></div><div>${status}</div>`;
    list.appendChild(row);
  });
}

async function closeProgram(active){
  if(!active)return;
  if(!confirm(`¿Cerrar ${context(active)}? Los docentes ya no podrán registrar nuevas pruebas.`))return;
  setMessage('Cerrando programación…');
  try{
    const batch=writeBatch(db);
    batch.update(doc(db,'programaciones',active.id),{estado:'cerrada',updatedAt:serverTimestamp()});
    batch.set(doc(db,'configuracion','activeProgram'),{programacionId:null,updatedAt:serverTimestamp()});
    await batch.commit();
    setMessage('Programación cerrada correctamente.');
    await loadPrograms();
  }catch(e){console.error(e);setMessage(e.message||'No fue posible cerrar la programación.',true);}
}

async function createProgram(){
  const cursoLectivo=Number($('#year').value),periodo=$('#period').value,numeroPruebas=$('#tests').value;
  if(!Number.isInteger(cursoLectivo)||cursoLectivo<2020){setMessage('Indique un curso lectivo válido.',true);return;}
  if(!['I','II'].includes(periodo)||!['I','II'].includes(numeroPruebas)){setMessage('Periodo y número de pruebas deben ser I o II.',true);return;}
  const duplicate=state.programs.find(p=>Number(p.cursoLectivo)===cursoLectivo&&p.periodo===periodo&&p.numeroPruebas===numeroPruebas);
  if(duplicate){setMessage(`Ya existe la programación ${context(duplicate)}.`,true);return;}
  const activeId=await getActiveProgramId();
  if(activeId){setMessage('Primero cierre la programación activa.',true);return;}
  setMessage('Creando programación…');$('#create').disabled=true;
  try{
    const id=`${cursoLectivo}-${periodo}-${numeroPruebas}`;
    const pRef=doc(db,'programaciones',id);
    if((await getDoc(pRef)).exists())throw new Error(`Ya existe la programación ${cursoLectivo} · ${periodo} · ${numeroPruebas}.`);
    const data={cursoLectivo,periodo,numeroPruebas,nombre:`Pruebas ${cursoLectivo} · Periodo ${periodo} · Pruebas ${numeroPruebas}`,estado:'abierta',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
    await setDoc(pRef,data);
    await setDoc(doc(db,'configuracion','activeProgram'),{programacionId:id,updatedAt:serverTimestamp()});
    setMessage(`Programación ${cursoLectivo} · ${periodo} · ${numeroPruebas} creada y abierta.`);
    await loadPrograms();
  }catch(e){console.error(e);setMessage(e.message||'No fue posible crear la programación.',true);}finally{$('#create').disabled=false;}
}

function populateProgramFilter(){
  const select=$('#results-program');
  const current=select.value;
  select.innerHTML='<option value="">Todas</option>';
  state.programs.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=context(p);select.appendChild(o);});
  if([...select.options].some(o=>o.value===current))select.value=current;
}

function populateSubjectFilter(){
  const select=$('#results-subject');
  const current=select.value;
  const subjects=[...new Set(state.results.filter(r=>!$('#results-level').value||String(r.nivel)===$('#results-level').value).map(r=>r.materia).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  select.innerHTML='<option value="">Todas</option>';
  subjects.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;select.appendChild(o);});
  if(subjects.includes(current))select.value=current;
}

function formatTimestamp(value){
  if(!value)return '';
  if(typeof value.toDate==='function')return value.toDate().toLocaleString('es-CR');
  return String(value);
}

function renderResults(){
  populateSubjectFilter();
  const program=$('#results-program').value, level=$('#results-level').value, subject=$('#results-subject').value;
  const rows=state.results.filter(r=>(!program||r.programacionId===program)&&(!level||String(r.nivel)===level)&&(!subject||r.materia===subject));
  $('#results-count').textContent=`${rows.length} registro${rows.length===1?'':'s'} encontrado${rows.length===1?'':'s'}.`;
  const box=$('#results-box');
  if(!rows.length){box.innerHTML='<div class="empty">Todavía no hay registros que coincidan con los filtros.</div>';return;}
  rows.sort((a,b)=>{
    const da=a.createdAt?.seconds||0, db=b.createdAt?.seconds||0;
    return db-da;
  });
  const table=document.createElement('table');table.className='results-table';
  table.innerHTML='<thead><tr><th>Programación</th><th>Docente</th><th>Nivel</th><th>Materia</th><th>Prueba</th><th>Sugerido</th><th>Utilizado</th><th>Apoyo</th><th>Extra</th><th>Planificación</th><th>Fecha</th></tr></thead>';
  const tbody=document.createElement('tbody');
  rows.forEach(r=>{
    const tr=document.createElement('tr');
    const programText=r.cursoLectivo!=null?`${r.cursoLectivo} · ${r.periodo} · ${r.numeroPruebas}`:r.programacionId||'';
    const levelText=r.nivelIB?`${r.nivel}.º · ${r.nivelIB}`:`${r.nivel||''}.º`;
    const support=r.usaTiempoExtra?'Sí':'No';
    const extra=r.usaTiempoExtra?`${r.minutosExtra||0} min (${r.porcentajeExtra||0}%)`:'—';
    tr.innerHTML=`<td>${programText}</td><td>${r.docenteEmail||''}</td><td>${levelText}</td><td>${r.materia||''}</td><td>${r.componente||''}</td><td>${r.duracionSugeridaMinutos==null?'—':r.duracionSugeridaMinutos+' min'}</td><td>${r.duracionMinutos||''} min</td><td><span class="badge">${support}</span></td><td>${extra}</td><td><strong>${r.minutosPlanificacion||r.duracionMinutos||''} min</strong></td><td>${formatTimestamp(r.createdAt)}</td>`;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);box.innerHTML='';box.appendChild(table);
}

async function loadResults(){
  $('#results-box').innerHTML='<p class="muted">Cargando resultados…</p>';
  try{
    const snap=await getDocs(collection(db,'solicitudesPruebas'));
    state.results=snap.docs.map(d=>({id:d.id,...d.data()}));
    renderResults();
  }catch(e){
    console.error(e);
    $('#results-box').innerHTML='<div class="empty">No fue posible cargar los resultados. Revise las reglas de Firestore.</div>';
  }
}

$('#login-google').addEventListener('click',async()=>{try{await signInWithPopup(auth,provider);}catch(e){console.error(e);$('#login-message').textContent=`No fue posible iniciar sesión: ${e.code||e.message}`;}});
$('#logout').addEventListener('click',()=>signOut(auth));
$('#create').addEventListener('click',createProgram);
$('#refresh-results').addEventListener('click',loadResults);
$('#results-program').addEventListener('change',renderResults);
$('#results-level').addEventListener('change',renderResults);
$('#results-subject').addEventListener('change',renderResults);

onAuthStateChanged(auth,async user=>{
  state.user=user||null;
  if(!user){$('#login-panel').hidden=false;$('#admin-app').hidden=true;$('#auth-status').textContent='No autenticado';return;}
  if(!isAdmin(user)){$('#login-panel').hidden=false;$('#admin-app').hidden=true;$('#auth-status').textContent='Acceso no autorizado';$('#login-message').textContent='Esta cuenta no tiene permisos de administrador.';await signOut(auth);return;}
  $('#login-panel').hidden=true;$('#admin-app').hidden=false;$('#auth-status').textContent=`Administrador · ${user.email}`;
  try{await loadPrograms();await loadResults();}catch(e){console.error(e);setMessage('No fue posible cargar las programaciones. Revise las reglas de Firestore.',true);}
});
