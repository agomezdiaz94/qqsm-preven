document.addEventListener("DOMContentLoaded", () => {
  const screenStart = document.getElementById("screen-start");
  const screenReady = document.getElementById("screen-ready");
  const screenGame = document.getElementById("screen-game");
  const screenResults = document.getElementById("screen-results");

  const btnStart = document.getElementById("btn-start");
  const groupSelect = document.getElementById("group-count");
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

  let groups = [];
  let currentGroupIndex = 0;
  let questionsPool = [];
  let currentQuestionIndex = 0;
  let timerValue = 20;
  let timerInterval = null;
  let lifelinesUsed = { "5050": false, "audience": false };

  function setActiveScreen(targetEl) {
    [screenStart, screenReady, screenGame, screenResults].forEach(s => s.classList.remove("active"));
    targetEl.classList.add("active");
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function initGroups(n) {
    const names = ["A", "B", "C", "D"];
    groups = [];
    for (let i = 0; i < n; i++) {
      groups.push({ name: names[i], score: 0, answered: 0 });
    }
    currentGroupIndex = 0;
  }

  function initQuestions() {
    if (!Array.isArray(window.preguntas) || window.preguntas.length === 0) {
      console.error("No se encontraron preguntas.");
      questionsPool = [];
      return;
    }
    const shuffled = shuffle([...window.preguntas]);
    questionsPool = shuffled.slice(0, 5);
    currentQuestionIndex = 0;
  }

  function updateReadyText() {
    const g = groups[currentGroupIndex];
    if (!g) return;
    readyText.textContent = `¿Está listo el Grupo ${g.name}?`;
    groupNameEl.textContent = `Grupo ${g.name}`;
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerValue = 20;
    timerEl.textContent = String(timerValue);
    timerInterval = setInterval(() => {
      timerValue--;
      timerEl.textContent = String(timerValue);
      if (timerValue <= 0) {
        clearInterval(timerInterval);
        revealCorrect();
        proceedAfterQuestion();
      }
    }, 1000);
  }

  function pauseTimer() {
    clearInterval(timerInterval);
  }

  function useLifeline5050() {
    if (lifelinesUsed["5050"]) return;
    const q = questionsPool[currentQuestionIndex];
    if (!q) return;
    const incorrectKeys = ["A", "B", "C", "D"].filter(k => k !== q.correcta);
    shuffle(incorrectKeys);
    incorrectKeys.slice(0, 2).forEach(k => {
      const btn = answerButtons.find(b => b.dataset.key === k);
      if (btn) { btn.style.visibility = "hidden"; btn.disabled = true; }
    });
    lifelinesUsed["5050"] = true;
    lifeline5050.classList.add("used");
  }

  function useLifelineAudience() {
    if (lifelinesUsed["audience"]) return;
    pauseTimer(); // ✅ detiene el tiempo
    lifelinesUsed["audience"] = true;
    lifelineAudience.classList.add("used");
    // No se reanuda automáticamente
  }

  function resetAnswers() {
    answerButtons.forEach(btn => {
      btn.classList.remove("correct", "incorrect");
      btn.disabled = false;
      btn.style.visibility = "visible";
    });
  }

  function loadQuestion() {
    const q = questionsPool[currentQuestionIndex];
    if (!q) { nextGroupOrResults(); return; }

    questionTextEl.textContent = q.pregunta;
    answerLabels.A.textContent = q.respuestas.A;
    answerLabels.B.textContent = q.respuestas.B;
    answerLabels.C.textContent = q.respuestas.C;
    answerLabels.D.textContent = q.respuestas.D;

    resetAnswers();
    startTimer();
  }

  function onAnswerClick(key) {
    const q = questionsPool[currentQuestionIndex];
    if (!q) return;
    pauseTimer();

    const isCorrect = key === q.correcta;
    const clickedBtn = answerButtons.find(b => b.dataset.key === key);
    if (clickedBtn) clickedBtn.classList.add(isCorrect ? "correct" : "incorrect");
    const correctBtn = answerButtons.find(b => b.dataset.key === q.correcta);
    if (!isCorrect && correctBtn) correctBtn.classList.add("correct");

    if (isCorrect) {
      groups[currentGroupIndex].score++;
    }
    groups[currentGroupIndex].answered++;
    proceedAfterQuestion();
  }

  function revealCorrect() {
    const q = questionsPool[currentQuestionIndex];
    if (!q) return;
    const correctBtn = answerButtons.find(b => b.dataset.key === q.correcta);
    if (correctBtn) correctBtn.classList.add("correct");
  }

  function proceedAfterQuestion() {
    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < questionsPool.length) {
        loadQuestion();
      } else {
        nextGroupOrResults();
      }
    }, 1000);
  }

  function nextGroupOrResults() {
    pauseTimer();
    currentGroupIndex++;
    if (currentGroupIndex < groups.length) {
      initQuestions();
      updateReadyText();
      // ✅ Reinicia comodines solo al cambiar de grupo
      lifelinesUsed["5050"] = false;
      lifelinesUsed["audience"] = false;
      lifeline5050.classList.remove("used");
      lifelineAudience.classList.remove("used");
      setActiveScreen(screenReady);
    } else {
      renderResults();
      setActiveScreen(screenResults);
    }
  }

  function renderResults() {
    resultsList.innerHTML = "";
    groups.forEach(g => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.innerHTML = `
        <div class="group">Grupo ${g.name}</div>
        <div class="detail">Preguntas respondidas: ${g.answered}</div>
        <div class="score">${g.score} pts</div>
      `;
      resultsList.appendChild(div);
    });
  }

  btnStart.addEventListener("click", () => {
    const selected = groupSelect.value || "1 grupo";
    const match = selected.match(/\d+/);
    const n = match ? parseInt(match[0], 10) : 1;

    initGroups(n);
    initQuestions();
    updateReadyText();
    setActiveScreen(screenReady);
  });

  btnReadyYes.addEventListener("click", () => {
    setActiveScreen(screenGame);
    loadQuestion();
  });

  btnReadyNo.addEventListener("click", () => {
    updateReadyText();
  });

  answerButtons.forEach(btn => {
    btn.addEventListener("click", () => onAnswerClick(btn.dataset.key));
  });

  lifeline5050.addEventListener("click", useLifeline5050);
  lifelineAudience.addEventListener("click", useLifelineAudience);

  btnRestart.addEventListener("click", () => {
    currentGroupIndex = 0;
    groups = [];
    questionsPool = [];
    currentQuestionIndex = 0;
    setActiveScreen(screenStart);
  });

  setActiveScreen(screenStart);
});