import { preguntas } from '../preguntas.js';

// Pantallas
const pantallaInicio = document.getElementById('pantalla-inicio');
const pantallaListos = document.getElementById('pantalla-listos');
const pantallaJuego = document.getElementById('pantalla-juego');
const pantallaFinal = document.getElementById('pantalla-final');

// Botones y elementos
const btnContinuarGrupos = document.getElementById('btnContinuarGrupos');
const btnListosSi = document.getElementById('btnListosSi');
const btnListosNo = document.getElementById('btnListosNo');
const btnReiniciar = document.getElementById('btnReiniciar');

const mensajeListos = document.getElementById('mensajeListos');
const grupoActualTexto = document.getElementById('grupo-actual');
const preguntaBox = document.getElementById('pregunta');
const contadorDiv = document.getElementById('contador');

const btnA = document.getElementById('btnA');
const btnB = document.getElementById('btnB');
const btnC = document.getElementById('btnC');
const btnD = document.getElementById('btnD');

const comodin5050 = document.getElementById('comodin5050');
const comodinPublico = document.getElementById('comodinPublico');

const resultado1 = document.getElementById('resultado-grupo1');
const resultado2 = document.getElementById('resultado-grupo2');
const resultado3 = document.getElementById('resultado-grupo3');
const resultado4 = document.getElementById('resultado-grupo4');

// Sonidos (asegúrate que existen en public/sounds)
const sonidoPregunta = new Audio('public/sounds/pregunta.mp3');
const sonidoCorrecto = new Audio('public/sounds/correcto.mp3');
const sonidoIncorrecto = new Audio('public/sounds/incorrecto.mp3');

// Estado
let grupos = [];
let preguntasPorGrupo = {};
let turnoGrupo = 0;
let indicePregunta = 0;
let tiempo = 20;
let timer = null;

let usado5050 = false;
let usadoPublico = false;

let puntajes = { A:{buenas:0,malas:0}, B:{buenas:0,malas:0}, C:{buenas:0,malas:0}, D:{buenas:0,malas:0} };

// UTILIDADES
function ocultarTodo(){
  pantallaInicio.classList.add('oculto');
  pantallaListos.classList.add('oculto');
  pantallaJuego.classList.add('oculto');
  pantallaFinal.classList.add('oculto');
}
function mostrar(pantalla){
  pantalla.classList.remove('oculto'); pantalla.classList.add('visible');
}

// Seleccionar preguntas aleatorias por grupo (5 c/u)
function seleccionarPreguntas(){
  const copia = [...preguntas];
  grupos.forEach(g=>{
    preguntasPorGrupo[g] = [];
    for(let i=0;i<5;i++){
      if(copia.length===0) break;
      const idx = Math.floor(Math.random()*copia.length);
      preguntasPorGrupo[g].push(copia.splice(idx,1)[0]);
    }
  });
}

// FLUJO
btnContinuarGrupos.addEventListener('click', ()=>{
  const cantidad = parseInt(document.getElementById('cantidadGrupos').value,10);
  grupos = ['A','B','C','D'].slice(0,cantidad);
  seleccionarPreguntas();
  turnoGrupo = 0; indicePregunta = 0;
  mensajeListos.textContent = `¿Está listo el Grupo ${grupos[turnoGrupo]}?`;
  ocultarTodo(); mostrar(pantallaListos);
});

btnListosNo.addEventListener('click', ()=> alert('Ok, avísenme cuando estén listos.'));

btnListosSi.addEventListener('click', ()=>{
  ocultarTodo(); mostrar(pantallaJuego);
  indicePregunta = 0;
  usado5050 = false; usadoPublico = false;
  mostrarPregunta();
});

// Mostrar pregunta actual
function mostrarPregunta(){
  const grupo = grupos[turnoGrupo];
  grupoActualTexto.textContent = `Grupo ${grupo}`;
  const p = preguntasPorGrupo[grupo][indicePregunta];
  if(!p){ terminarGrupo(); return; }

  preguntaBox.textContent = p.pregunta;
  btnA.textContent = `A) ${p.respuestas.A}`;
  btnB.textContent = `B) ${p.respuestas.B}`;
  btnC.textContent = `C) ${p.respuestas.C}`;
  btnD.textContent = `D) ${p.respuestas.D}`;

  document.querySelectorAll('.opcion').forEach(b=>{
    b.disabled = false; b.classList.remove('correcta','incorrecta'); b.style.visibility='visible';
  });

  try{ sonidoPregunta.play(); }catch(e){ /* autoplay bloqueo */ }
  iniciarCronometro();
}

// Cronometro
function iniciarCronometro(){
  clearInterval(timer);
  tiempo = 20;
  contadorDiv.textContent = tiempo;
  contadorDiv.style.color = 'white';
  timer = setInterval(()=>{
    tiempo--;
    contadorDiv.textContent = tiempo;
    if(tiempo<=5) contadorDiv.style.color = 'red';
    if(tiempo<=0){
      clearInterval(timer);
      registrarRespuesta(null);
    }
  },1000);
}

// Responder
window.seleccionarRespuesta = function(letra){
  clearInterval(timer);
  registrarRespuesta(letra);
};

function registrarRespuesta(letra){
  const grupo = grupos[turnoGrupo];
  const p = preguntasPorGrupo[grupo][indicePregunta];
  const correcta = p.correcta;
  const botones = { A:btnA, B:btnB, C:btnC, D:btnD };

  if(letra === correcta){
    try{ sonidoCorrecto.play(); }catch(e){}
    botones[letra].classList.add('correcta');
    puntajes[grupo].buenas++;
  } else {
    if(letra!==null){ try{ sonidoIncorrecto.play(); }catch(e){} botones[letra].classList.add('incorrecta'); }
    botones[correcta].classList.add('correcta');
    puntajes[grupo].malas++;
  }

  Object.values(botones).forEach(b=> b.disabled = true);

  // esperar 3s antes de siguiente
  setTimeout(()=> {
    indicePregunta++;
    if(indicePregunta >= preguntasPorGrupo[grupo].length){
      terminarGrupo();
    } else {
      mostrarPregunta();
    }
  }, 3000);
}

function terminarGrupo(){
  turnoGrupo++;
  indicePregunta = 0;
  if(turnoGrupo >= grupos.length){
    finalizarJuego();
    return;
  }
  mensajeListos.textContent = `¿Está listo el Grupo ${grupos[turnoGrupo]}?`;
  ocultarTodo(); mostrar(pantallaListos);
}

// COMODINES
comodin5050.addEventListener('click', ()=>{
  if(usado5050) return;
  const grupo = grupos[turnoGrupo]; const p = preguntasPorGrupo[grupo][indicePregunta];
  const incorrectas = ['A','B','C','D'].filter(x=> x !== p.correcta);
  const aEliminar = incorrectas.sort(()=>Math.random()-0.5).slice(0,2);
  aEliminar.forEach(l => document.getElementById('btn'+l).style.visibility = 'hidden');
  usado5050 = true; comodin5050.disabled = true;
});

comodinPublico.addEventListener('click', ()=>{
  if(usadoPublico) return;
  clearInterval(timer);
  usadoPublico = true; comodinPublico.disabled = true;
  alert('Comodín del público: tiempo detenido.'); // simulación simple
});

// FINAL
function finalizarJuego(){
  ocultarTodo(); mostrar(pantallaFinal);
  if(grupos[0]) resultado1.textContent = `Grupo ${grupos[0]} → Buenas: ${puntajes[grupos[0]].buenas} / Malas: ${puntajes[grupos[0]].malas}`;
  if(grupos[1]) resultado2.textContent = `Grupo ${grupos[1]} → Buenas: ${puntajes[grupos[1]].buenas} / Malas: ${puntajes[grupos[1]].malas}`;
  if(grupos[2]) resultado3.textContent = `Grupo ${grupos[2]} → Buenas: ${puntajes[grupos[2]].buenas} / Malas: ${puntajes[grupos[2]].malas}`;
  if(grupos[3]) resultado4.textContent = `Grupo ${grupos[3]} → Buenas: ${puntajes[grupos[3]].buenas} / Malas: ${puntajes[grupos[3]].malas}`;
}

// Reiniciar
btnReiniciar?.addEventListener('click', ()=> location.reload());
