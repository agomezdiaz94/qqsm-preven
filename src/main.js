/* Juego estilo “¿Quién quiere ser millonario?” sin frameworks */

// Elementos principales
const screenStart = document.getElementById("screen-start");
const screenReady = document.getElementById("screen-ready");
const screenGame = document.getElementById("screen-game");
const screenResults = document.getElementById("screen-results");

const btnStart = document.getElementById("btn-start");
const groupCountSelect = document.getElementById("group-count");

const readyText = document.getElementById("ready-text");
const btnReadyYes = document.getElementById("btn-ready-yes");
const btnReadyNo = document.getElementById("btn-ready-no");

const groupNameEl = document.getElementById("group-name");
const timerEl = document.getElementById("timer");
const lifeline5050 = document.getElementById("lifeline-5050");
const lifelineAudience = document.getElementById("lifeline-audience");

const questionTextEl = document.getElementById("question-text");
const answerButtons = Array.from(document.querySelectorAll(".answer-btn"));
const answerLabels = {
  A: document.getElementById("answer-A"),
  B: document.getElementById("answer-B"),
  C: document.getElementById("answer-C"),
  D: document.getElementById("answer-D"),
};

const resultsList = document.getElementById("results-list");
const btnRestart = document.getElementById("btn-restart");

// Sonidos
const sfxQuestion = document.getElementById("sfx-question");
const sfxCorrect = document.getElementById("sfx-correct");
const sfxIncorrect = document.getElementById("sfx-incorrect");

// Estado de juego
let totalGroups = 1;
let groups = []; // [{name:'A', score:0}]
let currentGroupIndex = 0;

let questionsPool = [];
let currentQuestionIndex = 0;

let timerValue = 20;
let timerInterval = null;
let isPaused = false;

let lifelinesUsed = {
  "50/50": false,
  "audience": false
};

// Utilidad: cambiar pantalla
function showScreen(id) {
  [screenStart, screenReady, screenGame, screenResults].forEach(s => s.classList.remove("active"));
  const map = {
    "start": screenStart,
    "ready": screenReady,
    "game": screenGame,
    "results": screenResults
  };
  map[id].classList.add("active");
}

// Inicializar grupos
function initGroups(n) {
  const names = ["A", "B", "C", "D"];
  groups = [];
  for (let i = 0; i < n; i++) {
    groups.push({ name: names[i], score: 0, answered: 0 });
  }
  currentGroupIndex = 0;
}

// Preparar preguntas (copia para el juego)
function initQuestions() {
  // Copia profunda simple
  questionsPool = PREGUNTAS.map(q => ({ ...q, respuestas: { ...q.respuestas } }));
  currentQuestionIndex = 0;
}

// Configurar pantalla de “¿Están listos?”
function updateReadyText() {
  const g = groups[currentGroupIndex];
  readyText.textContent = `¿Está listo el Grupo ${g.name}?`;
}

// Iniciar cronómetro
function startTimer() {
  clearInterval(timerInterval);
  timerValue = 20;
  isPaused = false;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    if (isPaused) return;
    timerValue--;
    updateTimerDisplay();
    if (timerValue <= 0) {
      clearInterval(timerInterval);
      // Tiempo agotado: cerrar la pregunta y avanzar
      lockAnswers();
      revealCorrect(false);
      proceedAfterQuestion();
    }
  }, 1000);
}

function pauseTimer() {
  isPaused = true;
}

function resumeTimer() {
  isPaused = false;
}

function updateTimerDisplay() {
  timerEl.textContent = String(timerValue);
}

// Habilitar/Deshabilitar respuestas
function resetAnswers() {
  answerButtons.forEach(btn => {
    btn.classList.remove("correct", "incorrect", "disabled");
    btn.disabled = false;
    // Restaurar visibilidad
    btn.style.visibility = "visible";
    btn.style.opacity = "1";
  });
}
function lockAnswers() {
  answerButtons.forEach(btn => {
    btn.disabled = true;
  });
}

// Cargar pregunta actual
function loadQuestion() {
  const q = questionsPool[currentQuestionIndex];
  if (!q) {
    // Sin más preguntas para este grupo => avanzar
    nextGroupOrResults();
    return;
  }

  // Sonido de pregunta
  try { sfxQuestion.currentTime = 0; sfxQuestion.play().catch(()=>{}); } catch (e) {}

  questionTextEl.textContent = q.pregunta;
  answerLabels.A.textContent = q.respuestas.A;
  answerLabels.B.textContent = q.respuestas.B;
  answerLabels.C.textContent = q.respuestas.C;
  answerLabels.D.textContent = q.respuestas.D;

  resetAnswers();
  resetLifelinesUI();
  startTimer();
}

// Responder
function onAnswerClick(key) {
  const q = questionsPool[currentQuestionIndex];
  if (!q) return;

  lockAnswers();
  clearInterval(timerInterval);

  const isCorrect = key === q.correcta;
  const clickedBtn = answerButtons.find(b => b.dataset.key === key);

  if (isCorrect) {
    clickedBtn.classList.add("correct");
    groups[currentGroupIndex].score += 1;
    try { sfxCorrect.currentTime = 0; sfxCorrect.play().catch(()=>{}); } catch (e) {}
  } else {
    clickedBtn.classList.add("incorrect");
    // Marcar la correcta en verde para feedback
    const correctBtn = answerButtons.find(b => b.dataset.key === q.correcta);
    if (correctBtn) correctBtn.classList.add("correct");
    try { sfxIncorrect.currentTime = 0; sfxIncorrect.play().catch(()=>{}); } catch (e) {}
  }

  groups[currentGroupIndex].answered += 1;

  proceedAfterQuestion();
}

// Mostrar correcta si fue por tiempo
function revealCorrect(playSound = false) {
  const q = questionsPool[currentQuestionIndex];
  if (!q) return;
  const correctBtn = answerButtons.find(b => b.dataset.key === q.correcta);
  if (correctBtn) correctBtn.classList.add("correct");
  if (playSound) {
    try { sfxQuestion.currentTime = 0; sfxQuestion.play().catch(()=>{}); } catch (e) {}
  }
}

// Después de responder/tiempo
function proceedAfterQuestion() {
  // Pequeña pausa para ver el color
  setTimeout(() => {
    currentQuestionIndex++;
    // Si quedan preguntas para este grupo, seguimos
    if (currentQuestionIndex < questionsPool.length) {
      loadQuestion();
    } else {
      // Terminó el set de preguntas para este grupo
      nextGroupOrResults();
    }
  }, 1200);
}

// Avanzar a siguiente grupo o resultados
function nextGroupOrResults() {
  clearInterval(timerInterval);

  currentGroupIndex++;
  if (currentGroupIndex < groups.length) {
    // Preparar siguiente grupo
    initQuestions();
    groupNameEl.textContent = `Grupo ${groups[currentGroupIndex].name}`;
    updateReadyText();
    showScreen("ready");
  } else {
    // Resultados finales
    renderResults();
    showScreen("results");
  }
}

// Renderizar resultados
function renderResults() {
  resultsList.innerHTML = "";
  groups.forEach(g => {
    const div = document.createElement("div");
    div.className = "result-item";
    const detailText = `Preguntas respondidas: ${g.answered}`;
    div.innerHTML = `
      <div class="group">Grupo ${g.name}</div>
      <div class="detail">${detailText}</div>
      <div class="score">${g.score} pts</div>
    `;
    resultsList.appendChild(div);
  });
}

// Comodín 50/50: oculta dos incorrectas
function useLifeline5050() {
  if (lifelinesUsed["50/50"]) return;
  const q = questionsPool[currentQuestionIndex];
  if (!q) return;

  const incorrectKeys = ["A", "B", "C", "D"].filter(k => k !== q.correcta);
  // elegir aleatoriamente 2 para ocultar
  shuffleArray(incorrectKeys);
  const toHide = incorrectKeys.slice(0, 2);

  toHide.forEach(k => {
    const btn = answerButtons.find(b => b.dataset.key === k);
    if (btn) {
      btn.style.visibility = "hidden";
      btn.style.opacity = "0";
      btn.disabled = true;
      btn.classList.add("disabled");
    }
  });

  lifelinesUsed["50/50"] = true;
  lifeline5050.classList.add("used");
}

// Comodín Público: pausa el tiempo
function useLifelineAudience() {
  if (liflinesLockedDuringAnswer()) return;
  if (lifelinesUsed["audience"]) return;
  pauseTimer();
  lifelinesUsed["audience"] = true;
  lifelineAudience.classList.add("used");
}

// Ayuda: evitar uso mientras está bloqueado
function liflinesLockedDuringAnswer() {
  // Si todas las respuestas están disabled, ya se respondió
  return answerButtons.every(b => b.disabled);
}

// Reset UI de comodines para nueva pregunta
function resetLifelinesUI() {
  lifelinesUsed["50/50"] = false;
  lifelinesUsed["audience"] = false;
  lifeline5050.classList.remove("used");
  lifelineAudience.classList.remove("used");
}

// Shuffle utilidad
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
  return arr;
}

// Eventos
btnStart.addEventListener("click", () => {
  const val = parseInt(groupCountSelect.value, 10);
  totalGroups = Math.min(4, Math.max(1, val));

  initGroups(totalGroups);
  initQuestions();

  groupNameEl.textContent = `Grupo ${groups[currentGroupIndex].name}`;
  updateReadyText();
  showScreen("ready");
});

btnReadyYes.addEventListener("click", () => {
  showScreen("game");
  loadQuestion();
});
btnReadyNo.addEventListener("click", () => {
  // Si no está listo, igual avanzamos a juego (o se podría esperar)
  showScreen("game");
  loadQuestion();
});

// Respuestas
answerButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.dataset.key;
    onAnswerClick(key);
  });
});

// Comodines
lifeline5050.addEventListener("click", () => {
  useLifeline5050();
});
lifelineAudience.addEventListener("click", () => {
  useLifelineAudience();
});

// Reiniciar
btnRestart.addEventListener("click", () => {
  // Volver a inicio
  showScreen("start");
});

// Evitar que el espacio/enter disparen scroll
window.addEventListener("keydown", (e) => {
  if (["Space", "Enter"].includes(e.code)) {
    e.preventDefault();
  }
});

// Asegurar que al cargar, la pantalla inicio esté visible
document.addEventListener("DOMContentLoaded", () => {
  showScreen("start");
});