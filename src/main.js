import { preguntas } from "./preguntas.js";

// PANTALLAS
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaListos = document.getElementById("pantalla-listos");
const pantallaJuego = document.getElementById("pantalla-juego");
const pantallaFinal = document.getElementById("pantalla-final");

// ELEMENTOS
const selectorGrupos = document.getElementById("cantidadGrupos");
const btnContinuarGrupos = document.getElementById("btnContinuarGrupos");

const btnListosSi = document.getElementById("btnListosSi");
const btnListosNo = document.getElementById("btnListosNo");

const grupoActualTexto = document.getElementById("grupo-actual");
const preguntaDiv = document.getElementById("pregunta");
const contadorDiv = document.getElementById("contador");

const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");
const btnC = document.getElementById("btnC");
const btnD = document.getElementById("btnD");

const comodin5050 = document.getElementById("comodin5050");
const comodinPublico = document.getElementById("comodinPublico");

// RESULTADOS
const res1 = document.getElementById("resultado-grupo1");
const res2 = document.getElementById("resultado-grupo2");
const res3 = document.getElementById("resultado-grupo3");
const res4 = document.getElementById("resultado-grupo4");

// VARIABLES
let grupos = [];
let preguntasSeleccionadas = {};
let indicePregunta = 0;
let turnoGrupo = 0;
let timer = null;
let tiempo = 20;

let puntajes = {};
["A", "B", "C", "D"].forEach(g => {
    puntajes[g] = { buenas: 0, malas: 0 };
});

// SONIDOS (Correctos)
const sonidoPregunta = new Audio("/sounds/pregunta.mp3");
const sonidoCorrecto = new Audio("/sounds/correcto.mp3");
const sonidoIncorrecto = new Audio("/sounds/incorrecto.mp3");

// --------------------------------------
// OCULTAR TODO
// --------------------------------------
function ocultarTodo() {
    pantallaInicio.classList.add("oculto");
    pantallaListos.classList.add("oculto");
    pantallaJuego.classList.add("oculto");
    pantallaFinal.classList.add("oculto");
}

// --------------------------------------
// SELECCIÓN DE PREGUNTAS
// --------------------------------------
function seleccionarPreguntas() {
    grupos.forEach(g => {
        let copia = [...preguntas];
        preguntasSeleccionadas[g] = [];

        for (let i = 0; i < 5; i++) {
            const idx = Math.floor(Math.random() * copia.length);
            preguntasSeleccionadas[g].push(copia.splice(idx, 1)[0]);
        }
    });
}

// --------------------------------------
// FLUJO INICIAL
// --------------------------------------
btnContinuarGrupos.addEventListener("click", () => {
    const cantidad = parseInt(selectorGrupos.value);
    grupos = ["A", "B", "C", "D"].slice(0, cantidad);

    seleccionarPreguntas();

    document.getElementById("mensajeListos").textContent =
        `¿Está listo el Grupo ${grupos[0]}?`;

    ocultarTodo();
    pantallaListos.classList.remove("oculto");
});

btnListosNo.addEventListener("click", () => {
    alert("Avísenme cuando estén listos 😄");
});

btnListosSi.addEventListener("click", () => {
    ocultarTodo();
    pantallaJuego.classList.remove("oculto");
    iniciarRonda();
});

// --------------------------------------
// MOSTRAR PREGUNTA
// --------------------------------------
function iniciarRonda() {
    indicePregunta = 0;
    mostrarPregunta();
}

function mostrarPregunta() {
    const grupo = grupos[turnoGrupo];

    grupoActualTexto.textContent = `Grupo ${grupo}`;

    const p = preguntasSeleccionadas[grupo][indicePregunta];
    preguntaDiv.textContent = p.pregunta;

    btnA.textContent = `A) ${p.respuestas.A}`;
    btnB.textContent = `B) ${p.respuestas.B}`;
    btnC.textContent = `C) ${p.respuestas.C}`;
    btnD.textContent = `D) ${p.respuestas.D}`;

    document.querySelectorAll(".opcion").forEach(b => {
        b.disabled = false;
        b.classList.remove("correcta", "incorrecta");
        b.style.visibility = "visible";
    });

    tiempo = 20;
    contadorDiv.textContent = tiempo;
    contadorDiv.style.color = "white";

    sonidoPregunta.play();

    iniciarCronometro();
}

// --------------------------------------
// CRONÓMETRO
// --------------------------------------
function iniciarCronometro() {
    clearInterval(timer);

    timer = setInterval(() => {
        tiempo--;
        contadorDiv.textContent = tiempo;

        if (tiempo <= 5) contadorDiv.style.color = "red";

        if (tiempo <= 0) {
            clearInterval(timer);
            registrarIncorrecta();
        }
    }, 1000);
}

// --------------------------------------
// RESPUESTAS
// --------------------------------------
window.seleccionarRespuesta = function (letra) {
    clearInterval(timer);

    const grupo = grupos[turnoGrupo];
    const p = preguntasSeleccionadas[grupo][indicePregunta];
    const correcta = p.correcta;

    const botones = { A: btnA, B: btnB, C: btnC, D: btnD };

    if (letra === correcta) {
        sonidoCorrecto.play();
        botones[letra].classList.add("correcta");
        puntajes[grupo].buenas++;
    } else {
        sonidoIncorrecto.play();
        botones[letra].classList.add("incorrecta");
        puntajes[grupo].malas++;
    }

    botones[correcta].classList.add("correcta");

    Object.values(botones).forEach(b => b.disabled = true);

    setTimeout(avanzar, 2000);
};

function registrarIncorrecta() {
    const grupo = grupos[turnoGrupo];
    puntajes[grupo].malas++;
    avanzar();
}

// --------------------------------------
// AVANZAR
// --------------------------------------
function avanzar() {
    indicePregunta++;

    if (indicePregunta >= 5) {
        turnoGrupo++;

        if (turnoGrupo >= grupos.length) {
            finalizarJuego();
            return;
        }

        document.getElementById("mensajeListos").textContent =
            `¿Está listo el Grupo ${grupos[turnoGrupo]}?`;

        ocultarTodo();
        pantallaListos.classList.remove("oculto");
        return;
    }

    mostrarPregunta();
}

// --------------------------------------
// COMODINES
// --------------------------------------
comodin5050.addEventListener("click", () => {
    const grupo = grupos[turnoGrupo];
    const p = preguntasSeleccionadas[grupo][indicePregunta];
    const incorrectas = ["A","B","C","D"].filter(x => x !== p.correcta);

    const aEliminar = incorrectas.sort(() => Math.random() - 0.5).slice(0,2);

    aEliminar.forEach(letra => {
        document.getElementById("btn" + letra).style.visibility = "hidden";
    });

    comodin5050.disabled = true;
});

comodinPublico.addEventListener("click", () => {
    clearInterval(timer);
    alert("El público votó. ¡Piensen con calma!");
    comodinPublico.disabled = true;
});

// --------------------------------------
// FINAL
// --------------------------------------
function finalizarJuego() {
    ocultarTodo();
    pantallaFinal.classList.remove("oculto");

    res1.textContent = grupos[0] ? `Grupo ${grupos[0]} → Buenas: ${puntajes[grupos[0]].buenas}, Malas: ${puntajes[grupos[0]].malas}` : "";
    res2.textContent = grupos[1] ? `Grupo ${grupos[1]} → Buenas: ${puntajes[grupos[1]].buenas}, Malas: ${puntajes[grupos[1]].malas}` : "";
    res3.textContent = grupos[2] ? `Grupo ${grupos[2]} → Buenas: ${puntajes[grupos[2]].buenas}, Malas: ${puntajes[grupos[2]].malas}` : "";
    res4.textContent = grupos[3] ? `Grupo ${grupos[3]} → Buenas: ${puntajes[grupos[3]].buenas}, Malas: ${puntajes[grupos[3]].malas}` : "";
}
