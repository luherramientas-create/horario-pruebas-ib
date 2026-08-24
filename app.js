import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:'AIzaSyCjE7kpwMZcFRVJsJcWPIQwEzgH-YrcXk0',
  authDomain:'registro-edu-aa4c8.firebaseapp.com',
  projectId:'registro-edu-aa4c8',
  storageBucket:'registro-edu-aa4c8.firebasestorage.app',
  messagingSenderId:'1032924835108',
  appId:'1:1032924835108:web:f21d00c988d9898b3497b1'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({prompt:'select_account'});

const catalog = {
  '12': {
    NS: {
      'Lengua A: Literatura': [
        {id:'lit-ns-p1', name:'Prueba 1', minutes:135},
        {id:'lit-ns-p2', name:'Prueba 2', minutes:105},
        {id:'lit-ns-p3', name:'Prueba 3', minutes:null}
      ],
      'Historia': [
        {id:'hist-ns-p1', name:'Prueba 1', minutes:60},
        {id:'hist-ns-p2', name:'Prueba 2', minutes:90},
        {id:'hist-ns-p3', name:'Prueba 3', minutes:150}
      ],
      'Sociedad Digital': [
        {id:'sd-ns-p1', name:'Prueba 1', minutes:135},
        {id:'sd-ns-p2', name:'Prueba 2', minutes:75},
        {id:'sd-ns-p3', name:'Prueba 3', minutes:75}
      ]
    },
    NM: {
      'Matemática: Aplicaciones e Interpretación': [
        {id:'mai-nm-p1', name:'Prueba 1', minutes:90},
        {id:'mai-nm-p2', name:'Prueba 2', minutes:90}
      ],
      'Lengua B: Inglés': [
        {id:'eng-nm-p1', name:'Prueba 1', minutes:75},
        {id:'eng-nm-reading', name:'Reading', minutes:60},
        {id:'eng-nm-listening', name:'Listening', minutes:45}
      ],
      'Biología': [
        {id:'bio-nm-p1', name:'Prueba 1', minutes:90},
        {id:'bio-nm-p2', name:'Prueba 2', minutes:90}
      ]
    }
  },
  '11': {
    general: {
      'Estudios Sociales': [{id:'sociales-11', name:'Prueba', minutes:80}],
      'Cívica': [{id:'civica-11', name:'Prueba', minutes:80}]
    }
  }
};

const state = { user:null, level:null, ibLevel:null, subject:null, tests:[] };
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function showLogin(message='') {
  $('#login-panel').hidden = false;
  $('#app').hidden = true;
  $('#login-message').textContent = message;
}
function showApp() {
  $('#login-panel').hidden = true;
  $('#app').hidden = false;
  $('#auth-status').textContent = state.user?.email || 'Docente autenticado';
}
function setMessage(text, error=false) {
  $('#save-message').textContent = text;
  $('#save-message').style.color = error ? '#a33a3a' : '';
}
function roundInt(n){ return Math.round(n); }
function extraFor(minutes, percent){ return roundInt(minutes * percent / 100); }
function formatMinutes(n){ return `${n} min`; }

function resetForm() {
  state.level=null; state.ibLevel=null; state.subject=null; state.tests=[];
  $$('.choice').forEach(x=>x.classList.remove('selected'));
  $('#ib-level').value='';
  $('#ib-level-wrap').hidden=true;
  $('#subject-section').hidden=true;
  $('#tests-section').hidden=true;
  $('#success-section').hidden=true;
  $('#tests-list').innerHTML='';
  $('#save').disabled=true;
  setMessage('');
}

function selectLevel(level, button) {
  state.level=level; state.ibLevel=null; state.subject=null;
  $$('.choice').forEach(x=>x.classList.remove('selected'));
  button.classList.add('selected');
  $('#ib-level-wrap').hidden = level !== '12';
  $('#subject-section').hidden = level === '12';
  $('#tests-section').hidden=true;
  $('#success-section').hidden=true;
  $('#subject-grid').innerHTML='';
  if(level==='11') renderSubjects('11','general');
}

function renderSubjects(level, ibLevel) {
  const subjects = Object.keys(catalog[level][ibLevel] || {});
  const grid=$('#subject-grid');
  grid.innerHTML='';
  subjects.forEach(subject=>{
    const b=document.createElement('button');
    b.type='button'; b.className='subject'; b.textContent=subject;
    b.addEventListener('click',()=>selectSubject(subject,b));
    grid.appendChild(b);
  });
  $('#subject-section').hidden=false;
}

function selectSubject(subject, button) {
  state.subject=subject;
  $$('.subject').forEach(x=>x.classList.remove('selected'));
  button.classList.add('selected');
  state.tests = catalog[state.level][state.level==='12'?state.ibLevel:'general'][subject];
  renderTests();
}

function renderTests(){
  const list=$('#tests-list'); list.innerHTML='';
  state.tests.forEach(test=>{
    const card=document.createElement('article'); card.className='test-card';
    const suggested=test.minutes;
    card.innerHTML=`
      <div class="test-main">
        <input class="test-check" type="checkbox" data-id="${test.id}" ${suggested===null?'':' '}>
        <div><div class="test-name">${test.name}</div><div class="test-meta">Tiempo sugerido: ${suggested===null?'no definido':formatMinutes(suggested)}</div></div>
      </div>
      <div class="test-options">
        <label>Tiempo a utilizar (min)
          <input class="number-input duration" type="number" min="1" step="1" value="${suggested ?? ''}" placeholder="Ingrese minutos">
        </label>
        <div class="support-percent-wrap">
          <label>Porcentaje adicional sugerido
            <input class="number-input percent" type="number" min="0" max="200" step="1" value="25">
          </label>
        </div>
      </div>
      <label class="support"><input class="support-check" type="checkbox"> Considerar tiempo adicional para estudiantes que requieren este apoyo</label>
      <div class="calc">Tiempo adicional: <strong class="extra">0 min</strong> · Tiempo para planificación: <strong class="total">—</strong></div>
    `;
    const check=card.querySelector('.test-check');
    const duration=card.querySelector('.duration');
    const percent=card.querySelector('.percent');
    const support=card.querySelector('.support-check');
    const extra=card.querySelector('.extra');
    const total=card.querySelector('.total');
    function refresh(){
      const d=Number(duration.value)||0; const p=Number(percent.value)||0;
      const e=support.checked?extraFor(d,p):0;
      extra.textContent=`${e} min`;
      total.textContent=d?`${d+e} min`:'—';
      card.classList.toggle('selected',check.checked);
      $('#save').disabled=!$$('.test-check:checked').length;
    }
    check.addEventListener('change',refresh);
    duration.addEventListener('input',refresh);
    percent.addEventListener('input',refresh);
    support.addEventListener('change',refresh);
    list.appendChild(card);
    refresh();
  });
  $('#tests-section').hidden=false;
  $('#success-section').hidden=true;
}

async function saveSelected(){
  setMessage('Guardando…');
  $('#save').disabled=true;
  try{
    const selected=[];
    $$('.test-card').forEach(card=>{
      if(!card.querySelector('.test-check').checked)return;
      const test=state.tests.find(t=>t.id===card.querySelector('.test-check').dataset.id);
      const duration=Number(card.querySelector('.duration').value);
      const support=card.querySelector('.support-check').checked;
      const percent=Number(card.querySelector('.percent').value)||0;
      if(!Number.isInteger(duration)||duration<1) throw new Error(`Indique un tiempo válido para ${test.name}.`);
      const extra=support?extraFor(duration,percent):0;
      selected.push({
        testId:test.id,
        component:test.name,
        durationSuggestedMinutes:test.minutes,
        durationMinutes:duration,
        timeSupport:support,
        extraPercent:support?percent:0,
        extraMinutes:extra,
        planningMinutes:duration+extra
      });
    });
    if(!selected.length) throw new Error('Seleccione al menos una prueba.');
    const submissionId=`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await Promise.all(selected.map(item=>addDoc(collection(db,'solicitudesPruebas'),{
      submissionId,
      docente:{uid:state.user.uid,email:state.user.email||''},
      nivel:state.level,
      nivelIB:state.level==='12'?state.ibLevel:null,
      materia:state.subject,
      ...item,
      estado:'registrada',
      createdAt:serverTimestamp(),
      updatedAt:serverTimestamp()
    })));
    $('#success-message').textContent=`Se registraron ${selected.length} prueba${selected.length===1?'':'s'} de ${state.subject}.`;
    $('#success-section').hidden=false;
    $('#tests-section').hidden=true;
    setMessage('');
  }catch(error){
    console.error(error);
    setMessage(error.message || 'No fue posible guardar el registro.',true);
    $('#save').disabled=false;
  }
}

$('#email-login').addEventListener('submit',async e=>{
  e.preventDefault(); $('#login-message').textContent='Iniciando sesión…';
  try{await signInWithEmailAndPassword(auth,$('#email').value.trim(),$('#password').value)}
  catch(error){console.error(error);$('#login-message').textContent=`No fue posible iniciar sesión: ${error.code||error.message}`;}
});
$('#login-google').addEventListener('click',async()=>{
  $('#login-message').textContent='Abriendo acceso de Google…';
  try{await signInWithPopup(auth,provider)}
  catch(error){console.error(error);$('#login-message').textContent=`No fue posible iniciar sesión: ${error.code||error.message}`;}
});
$('#logout').addEventListener('click',()=>signOut(auth));
$$('.choice').forEach(b=>b.addEventListener('click',()=>selectLevel(b.dataset.level,b)));
$('#ib-level').addEventListener('change',e=>{
  state.ibLevel=e.target.value; state.subject=null; $('#tests-section').hidden=true;
  if(state.ibLevel) renderSubjects('12',state.ibLevel); else $('#subject-section').hidden=true;
});
$('#save').addEventListener('click',saveSelected);
$('#reset').addEventListener('click',()=>{state.subject=null;$('#tests-section').hidden=true;$('#subject-grid').querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));setMessage('');});
$('#another').addEventListener('click',()=>resetForm());
$('#finish').addEventListener('click',()=>{resetForm();$('#app').hidden=false;window.scrollTo({top:0,behavior:'smooth'});});

onAuthStateChanged(auth,user=>{
  state.user=user||null;
  if(!user){$('#auth-status').textContent='No autenticado';showLogin();return;}
  if(user.isAnonymous){signOut(auth);showLogin('Esta aplicación requiere una cuenta docente.');return;}
  showApp();
});
