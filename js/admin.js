import { auth, db, provider, collection, doc, getDoc, serverTimestamp, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';
import { getDocs, query, orderBy, writeBatch, setDoc } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const ADMIN_EMAIL = 'lujimenez1002@gmail.com';
const $ = s => document.querySelector(s);
const state = { user:null, programs:[] };

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

$('#login-google').addEventListener('click',async()=>{try{await signInWithPopup(auth,provider);}catch(e){console.error(e);$('#login-message').textContent=`No fue posible iniciar sesión: ${e.code||e.message}`;}});
$('#logout').addEventListener('click',()=>signOut(auth));
$('#create').addEventListener('click',createProgram);

onAuthStateChanged(auth,async user=>{
  state.user=user||null;
  if(!user){$('#login-panel').hidden=false;$('#admin-app').hidden=true;$('#auth-status').textContent='No autenticado';return;}
  if(!isAdmin(user)){$('#login-panel').hidden=false;$('#admin-app').hidden=true;$('#auth-status').textContent='Acceso no autorizado';$('#login-message').textContent='Esta cuenta no tiene permisos de administrador.';await signOut(auth);return;}
  $('#login-panel').hidden=true;$('#admin-app').hidden=false;$('#auth-status').textContent=`Administrador · ${user.email}`;
  try{await loadPrograms();}catch(e){console.error(e);setMessage('No fue posible cargar las programaciones. Revise las reglas de Firestore.',true);}
});
