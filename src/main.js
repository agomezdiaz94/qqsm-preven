import { preguntas } from "./preguntas.js";

let totalGrupos = 1;
let grupoActual = 1;
let puntajes = {};
let indicePregunta = 0;
let tiempo = 20;
let intervalo;

// ELEMENTOS
const pantallaInicio = document.getElementById("pantalla-inicio");
const pantallaListos = document.getElementById("pantalla-listos");
const pantallaJuego = document.getElementById("pantalla-juego");
const pantallaFinal = document.getElementById("pantalla-final");

const preguntaBox = document.getElementById("pregunta");
const contador = document.getElementById("contador");
const grupoActualTexto = document.getElementById("grupo-actual");

// BOTONES
document.getElementById("btnContinuarGrupos").addEventListener("click", () => {
    totalGrupos = parseInt(document.getElementById("cantidadGrupos").value);
    mostrarPantalla(pantallaInicio, pantallaListos);
    document.getElementById("mensajeListos").textContent =
        `¿Está listo el grupo ${grupoActual}?`;
});

document.getElementById("btnListosSi").addEventListener("click", () => {
    iniciarJuego();
});

document.getElementById("btnListosNo").addEventListener("click", () => {
    alert("Avisen cuando estén listos 🙂");
});

function mostrarPantalla(ocultar, mostrar) {
    ocultar.classList.remove("visible");
    ocultar.classList.add("oculto");

    mostrar.classList.remove("oculto");
    mostrar.classList.add("visible");
}

function iniciarJuego() {
    mostrarPantalla(pantallaListos, pantallaJuego);
    grupoActualTexto.textContent = `Grupo ${grupoActual}`;
    puntajes[grupoActual] = 0;
    indicePregunta = 0;
    cargarPregunta();
}

function cargarPregunta() {
    if (indicePregunta >= preguntas.length) {
        siguienteGrupo();
        return;
    }

    const p = preguntas[indicePregunta];
    preguntaBox.textContent = p.pregunta;

    document.getElementById("btnA").textContent = "A) " + p.respuestas.A;
    document.getElementById("btnB").textContent = "B) " + p.respuestas.B;
    document.getElementById("btnC").textContent = "C) " + p.respuestas.C;
    document.getElementById("btnD").textContent = "D) " + p.respuestas.D;

    tiempo = 20;
    contador.textContent = tiempo;

    clearInterval(intervalo);
    intervalo = setInterval(() => {
        tiempo--;
        contador.textContent = tiempo;

        if (tiempo <= 0) {
            clearInterval(intervalo);
            indicePregunta++;
            cargarPregunta();
        }
    }, 1000);
}

window.seleccionarRespuesta = function (letra) {
    const p = preguntas[indicePregunta];

    if (letra === p.correcta) {
        puntajes[grupoActual]++;
    }

    indicePregunta++;
    cargarPregunta();
};

function siguienteGrupo() {
    grupoActual++;

    if (grupoActual > totalGrupos) {
        mostrarResultados();
        return;
    }

    mostrarPantalla(pantallaJuego, pantallaListos);
    document.getElementById("mensajeListos").textContent =
        `¿Está listo el grupo ${grupoActual}?`;
}

function mostrarResultados() {
    mostrarPantalla(pantallaJuego, pantallaFinal);

    document.getElementById("resultado-grupo1").textContent =
        puntajes[1] !== undefined ? `Grupo 1: ${puntajes[1]} puntos` : "";

    document.getElementById("resultado-grupo2").textContent =
        puntajes[2] !== undefined ? `Grupo 2: ${puntajes[2]} puntos` : "";

    document.getElementById("resultado-grupo3").textContent =
        puntajes[3] !== undefined ? `Grupo 3: ${puntajes[3]} puntos` : "";

    document.getElementById("resultado-grupo4").textContent =
        puntajes[4] !== undefined ? `Grupo 4: ${puntajes[4]} puntos` : "";
}
