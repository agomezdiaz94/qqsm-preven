import { preguntas } from "./preguntas.js";

let preguntasDisponibles = [...preguntas];
let preguntaActual = null;
let timer = null;
let tiempo = 20;
let grupoActual = 1;
let totalGrupos = 1;
let puntajes = { 1: 0, 2: 0, 3: 0, 4: 0 };

/* ================================
   CAMBIO DE PANTALLAS
================================ */

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
    document.getElementById(id).classList.remove("oculto");
    document.getElementById(id).classList.add("visible");
}

/* ================================
   INICIO
================================ */

document.getElementById("btnContinuarGrupos").addEventListener("click", () => {
    totalGrupos = parseInt(document.getElementById("cantidadGrupos").value);
    grupoActual = 1;
    document.getElementById("mensajeListos").innerText = `¿Está listo el Grupo A?`;
    mostrarPantalla("pantalla-listos");
});

/* ================================
   PANTALLA LISTOS
================================ */

document.getElementById("btnListosSi").addEventListener("click", () => {
    iniciarJuego();
});

document.getElementById("btnListosNo").addEventListener("click", () => {
    alert("Avisen cuando estén listos 🙂");
});

/* ================================
   JUEGO
================================ */

function iniciarJuego() {
    preguntasDisponibles = [...preguntas];
    siguientePregunta();
    mostrarPantalla("pantalla-juego");
    iniciarCronometro();
}

function iniciarCronometro() {
    tiempo = 20;
    document.getElementById("contador").innerText = tiempo;

    clearInterval(timer);
    timer = setInterval(() => {
        tiempo--;
        document.getElementById("contador").innerText = tiempo;

        if (tiempo <= 0) {
            clearInterval(timer);
            bloquearRespuestas();
            setTimeout(siguienteGrupo, 1500);
        }
    }, 1000);
}

function siguientePregunta() {
    if (preguntasDisponibles.length === 0) {
        siguienteGrupo();
        return;
    }

    const randomIndex = Math.floor(Math.random() * preguntasDisponibles.length);
    preguntaActual = preguntasDisponibles[randomIndex];
    preguntasDisponibles.splice(randomIndex, 1);

    document.getElementById("pregunta").innerText = preguntaActual.pregunta;

    document.getElementById("btnA").innerText = `A) ${preguntaActual.respuestas.A}`;
    document.getElementById("btnB").innerText = `B) ${preguntaActual.respuestas.B}`;
    document.getElementById("btnC").innerText = `C) ${preguntaActual.respuestas.C}`;
    document.getElementById("btnD").innerText = `D) ${preguntaActual.respuestas.D}`;

    limpiarRespuestas();
}

function limpiarRespuestas() {
    document.querySelectorAll(".opcion").forEach(b => {
        b.classList.remove("correcta", "incorrecta");
        b.disabled = false;
    });
}

function bloquearRespuestas() {
    document.querySelectorAll(".opcion").forEach(b => b.disabled = true);
}

/* ================================
   MANEJO DE RESPUESTAS
================================ */

document.querySelectorAll(".opcion").forEach(boton => {
    boton.addEventListener("click", () => seleccionarRespuesta(boton.id.replace("btn", "")));
});

function seleccionarRespuesta(letra) {
    clearInterval(timer);

    const correcta = preguntaActual.correcta;
    const botonCorrecto = document.getElementById(`btn${correcta}`);
    const botonElegido = document.getElementById(`btn${letra}`);

    if (letra === correcta) {
        botonElegido.classList.add("correcta");
        puntajes[grupoActual]++;
    } else {
        botonElegido.classList.add("incorrecta");
        botonCorrecto.classList.add("correcta");
    }

    bloquearRespuestas();

    setTimeout(() => {
        siguientePregunta();
        iniciarCronometro();
    }, 1300);
}

/* ================================
   CAMBIO DE GRUPO
================================ */

function siguienteGrupo() {
    clearInterval(timer);

    if (grupoActual < totalGrupos) {
        grupoActual++;
        const letra = String.fromCharCode(64 + grupoActual);
        document.getElementById("mensajeListos").innerText = `¿Está listo el Grupo ${letra}?`;
        mostrarPantalla("pantalla-listos");
    } else {
        mostrarResultados();
    }
}

/* ================================
   RESULTADOS FINALES
================================ */

function mostrarResultados() {
    mostrarPantalla("pantalla-final");

    document.getElementById("resultado-grupo1").innerText =
        `Grupo A: ${puntajes[1]} puntos`;

    if (totalGrupos >= 2)
        document.getElementById("resultado-grupo2").innerText =
            `Grupo B: ${puntajes[2]} puntos`;

    if (totalGrupos >= 3)
        document.getElementById("resultado-grupo3").innerText =
            `Grupo C: ${puntajes[3]} puntos`;

    if (totalGrupos >= 4)
        document.getElementById("resultado-grupo4").innerText =
            `Grupo D: ${puntajes[4]} puntos`;
}
