import { preguntas } from "../preguntas.js";

let preguntasDisponibles = [...preguntas];
let preguntaActual = null;

let timer = null;
let tiempo = 20;

let grupoActual = 1;
let totalGrupos = 1;

let puntajes = { 1: 0, 2: 0, 3: 0, 4: 0 };

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.add("oculto"));
    document.getElementById(id).classList.remove("oculto");
    document.getElementById(id).classList.add("visible");
}

/* INICIO */
document.getElementById("btnContinuarGrupos").addEventListener("click", () => {
    totalGrupos = parseInt(document.getElementById("cantidadGrupos").value);
    grupoActual = 1;
    document.getElementById("mensajeListos").innerText = `¿Está listo el Grupo A?`;
    mostrarPantalla("pantalla-listos");
});

/* LISTOS */
document.getElementById("btnListosSi").addEventListener("click", () => iniciarJuego());
document.getElementById("btnListosNo").addEventListener("click", () => alert("Avisen cuando estén listos 🙂"));

/* JUEGO */
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
            bloquear();
            setTimeout(siguienteGrupo, 1500);
        }
    }, 1000);
}

function siguientePregunta() {
    if (preguntasDisponibles.length === 0) return siguienteGrupo();

    const i = Math.floor(Math.random() * preguntasDisponibles.length);
    preguntaActual = preguntasDisponibles.splice(i, 1)[0];

    document.getElementById("pregunta").innerText = preguntaActual.pregunta;

    document.getElementById("btnA").innerText = `A) ${preguntaActual.respuestas.A}`;
    document.getElementById("btnB").innerText = `B) ${preguntaActual.respuestas.B}`;
    document.getElementById("btnC").innerText = `C) ${preguntaActual.respuestas.C}`;
    document.getElementById("btnD").innerText = `D) ${preguntaActual.respuestas.D}`;

    limpiar();
}

function limpiar() {
    document.querySelectorAll(".opcion").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("correcta", "incorrecta");
    });
}

function bloquear() {
    document.querySelectorAll(".opcion").forEach(btn => btn.disabled = true);
}

document.querySelectorAll(".opcion").forEach(btn => {
    btn.addEventListener("click", () => {
        let letra = btn.id.replace("btn", "");
        seleccionarRespuesta(letra);
    });
});

function seleccionarRespuesta(letra) {
    clearInterval(timer);

    const correcta = preguntaActual.correcta;
    const btnCorrecto = document.getElementById(`btn${correcta}`);
    const btnElegido = document.getElementById(`btn${letra}`);

    if (letra === correcta) {
        puntajes[grupoActual]++;
        btnElegido.classList.add("correcta");
    } else {
        btnElegido.classList.add("incorrecta");
        btnCorrecto.classList.add("correcta");
    }

    bloquear();
    setTimeout(() => { siguientePregunta(); iniciarCronometro(); }, 1500);
}

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

/* FINAL */
function mostrarResultados() {
    mostrarPantalla("pantalla-final");
    document.getElementById("resultado-grupo1").innerText = `Grupo A: ${puntajes[1]} puntos`;
    if (totalGrupos >= 2) document.getElementById("resultado-grupo2").innerText = `Grupo B: ${puntajes[2]} puntos`;
    if (totalGrupos >= 3) document.getElementById("resultado-grupo3").innerText = `Grupo C: ${puntajes[3]} puntos`;
    if (totalGrupos >= 4) document.getElementById("resultado-grupo4").innerText = `Grupo D: ${puntajes[4]} puntos`;
}
