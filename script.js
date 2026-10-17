const USERS_KEY = "webBasicsQuizUsers";
  const SESSION_KEY = "webBasicsQuizSession";
  const HISTORY_KEY = "webBasicsQuizHistory";

  const questions = [
    { topic:"HTML", level:"Easy", q:"What does HTML stand for?", options:["HyperText Markup Language","HighText Machine Language","HyperTool Multi Language","Home Tool Markup Language"], answer:0, explain:"HTML stands for HyperText Markup Language." },
    { topic:"HTML", level:"Easy", q:"Which tag creates the largest standard heading?", options:["<h6>","<heading>","<h1>","<head>"], answer:2, explain:"<h1> is the highest-level heading; <h6> is the lowest." },
    { topic:"HTML", level:"Easy", q:"Which tag is used to add an image?", options:["<picture-src>","<img>","<image>","<src>"], answer:1, explain:"The <img> element embeds an image, usually using the src attribute." },
    { topic:"CSS", level:"Easy", q:"What is CSS mainly used for?", options:["Storing data","Styling web pages","Creating databases","Sending emails"], answer:1, explain:"CSS controls presentation, such as colors, spacing and layout." },
    { topic:"HTML", level:"Easy", q:"Which attribute gives a link its destination?", options:["src","href","alt","target-name"], answer:1, explain:"The href attribute specifies the URL a link points to." },
    { topic:"JavaScript", level:"Easy", q:"Which keyword declares a variable that can be reassigned?", options:["const","let","static","fixed"], answer:1, explain:"A variable declared with let can be reassigned." },
    { topic:"CSS", level:"Easy", q:"Which CSS property changes text color?", options:["font-style","background","color","text-size"], answer:2, explain:"The color property sets an element's text color." },
    { topic:"JavaScript", level:"Easy", q:"Which symbol starts a single-line comment in JavaScript?", options:["<!--","//","##","**"], answer:1, explain:"JavaScript single-line comments begin with two forward slashes." },
    { topic:"HTML", level:"Easy", q:"Which tag makes an unordered (bulleted) list?", options:["<ol>","<li>","<ul>","<list>"], answer:2, explain:"<ul> creates an unordered list; each item is usually inside an <li>." },
    { topic:"CSS", level:"Easy", q:"How do you select an element with class=\"card\" in CSS?", options:["#card",".card","card()","*card"], answer:1, explain:"A dot selects a class in CSS, so .card targets that class." },
    { topic:"JavaScript", level:"Medium", q:"What is the result of  '5' + 2  in JavaScript?", options:["7","52","NaN","An error every time"], answer:1, explain:"When a string is added to a number, the number is converted to a string, producing \"52\"." },
    { topic:"CSS", level:"Medium", q:"Which CSS property adds space inside an element's border?", options:["margin","padding","outline","gap only"], answer:1, explain:"Padding is the space between content and border; margin is outside the border." },
    { topic:"JavaScript", level:"Medium", q:"Which array method adds an item to the end of an array?", options:["push()","pop()","shift()","slice()"], answer:0, explain:"push() appends one or more items to the end of an array." },
    { topic:"HTML", level:"Medium", q:"What is the purpose of the alt attribute on an image?", options:["Set image width","Provide alternative text","Load CSS","Make the image a link"], answer:1, explain:"Alternative text helps when an image cannot be seen or loaded and supports accessibility." },
    { topic:"JavaScript", level:"Medium", q:"What does  3 === '3'  evaluate to?", options:["true","false","undefined","3"], answer:1, explain:"Strict equality compares both value and type; a number is not strictly equal to a string." },
    { topic:"CSS", level:"Medium", q:"Which declaration makes a flex container lay items in a row by default?", options:["display: block","display: flex","position: row","flex: display"], answer:1, explain:"display: flex creates a flex container; its default flex direction is row." },
    { topic:"JavaScript", level:"Medium", q:"What does an if statement do?", options:["Repeats code a fixed number of times","Runs code when a condition is true","Creates an HTML tag","Styles an element"], answer:1, explain:"An if statement conditionally runs a block when its condition evaluates to true." },
    { topic:"HTML", level:"Medium", q:"Which semantic element usually contains the main unique content of a page?", options:["<footer>","<main>","<meta>","<aside>"], answer:1, explain:"The <main> element identifies the page's dominant content." },
    { topic:"JavaScript", level:"Medium", q:"What is the value of  typeof []  in JavaScript?", options:["array","object","list","undefined"], answer:1, explain:"Arrays are objects in JavaScript, so typeof [] returns \"object\"." },
    { topic:"CSS", level:"Medium", q:"Which selector targets a link when the mouse pointer is over it?", options:["a:click","a:hover","a:focus-now","a::mouse"], answer:1, explain:"The :hover pseudo-class applies while the pointer is over an element." }
  ];

  const $ = id => document.getElementById(id);
  let authMode = "login";
  let currentUser = null;
  let currentIndex = 0;
  let selectedAnswer = null;
  let score = 0;
  let answers = [];
  const QUIZ_DURATION_SECONDS = 10 * 60;
  let timeRemaining = QUIZ_DURATION_SECONDS;
  let timerInterval = null;
  let quizFinished = false;

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
    catch { return []; }
  }
  function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "{}"); }
    catch { return {}; }
  }
  function showView(viewId) {
    ["authView","homeView","quizView","resultView"].forEach(id => $(id).classList.toggle("hidden", id !== viewId));
  }
  function setAuthMode(mode) {
    authMode = mode;
    const signup = mode === "signup";
    $("authTitle").textContent = signup ? "Create your account" : "Welcome back";
    $("authDescription").textContent = signup ? "Sign up to save your quiz progress in this browser." : "Log in to take the HTML, CSS and JavaScript quiz.";
    $("nameField").classList.toggle("hidden", !signup);
    $("name").required = signup;
    $("password").autocomplete = signup ? "new-password" : "current-password";
    $("authSubmit").textContent = signup ? "Create account" : "Log in";
    $("loginTab").className = signup ? "secondary" : "active";
    $("signupTab").className = signup ? "active" : "secondary";
    $("authMessage").textContent = "";
    $("authMessage").className = "";
  }
  function enterApp(user) {
    currentUser = user;
    localStorage.setItem(SESSION_KEY, user.email);
    $("userLabel").textContent = user.name;
    $("logoutBtn").classList.remove("hidden");
    renderHistory();
    showView("homeView");
  }
  function renderHistory() {
    const history = getHistory()[currentUser.email] || [];
    if (!history.length) { $("historyList").textContent = "No attempts yet."; return; }
    $("historyList").innerHTML = history.slice().reverse().slice(0,5).map(item =>
      `<div class="history-item"><strong>${item.score}/20 (${item.percent}%)</strong><br><span>${item.date}</span></div>`
    ).join("");
  }

  $("loginTab").addEventListener("click", () => setAuthMode("login"));
  $("signupTab").addEventListener("click", () => setAuthMode("signup"));
  $("authForm").addEventListener("submit", event => {
    event.preventDefault();
    const name = $("name").value.trim();
    const email = $("email").value.trim().toLowerCase();
    const password = $("password").value;
    const users = getUsers();
    $("authMessage").className = "error";

    if (authMode === "signup") {
      if (name.length < 2) { $("authMessage").textContent = "Please enter a name with at least 2 characters."; return; }
      if (users.some(user => user.email === email)) { $("authMessage").textContent = "An account with this email already exists. Please log in."; return; }
      users.push({ name, email, password });
      saveUsers(users);
      $("authMessage").className = "success";
      $("authMessage").textContent = "Account created. Logging you in…";
      enterApp({ name, email });
    } else {
      const user = users.find(item => item.email === email && item.password === password);
      if (!user) { $("authMessage").textContent = "Email or password is incorrect."; return; }
      enterApp({ name: user.name, email: user.email });
    }
    $("authForm").reset();
  });

  function startQuiz() {
    if (timerInterval) clearInterval(timerInterval);
    currentIndex = 0; score = 0; answers = []; selectedAnswer = null;
    timeRemaining = QUIZ_DURATION_SECONDS;
    quizFinished = false;
    showView("quizView");
    updateTimerDisplay();
    renderQuestion();
    timerInterval = setInterval(() => {
      if (quizFinished) return;
      timeRemaining--;
      updateTimerDisplay();
      if (timeRemaining <= 0) finishQuiz(true);
    }, 1000);
  }
  function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60).toString().padStart(2, "0");
    const seconds = (timeRemaining % 60).toString().padStart(2, "0");
    $("timer").textContent = `${minutes}:${seconds}`;
    $("timer").style.background = timeRemaining <= 60 ? "#48242b" : "#252d49";
    $("timer").style.color = timeRemaining <= 60 ? "#ff9aa4" : "#b9c8ff";
  }
  function renderQuestion() {
    const question = questions[currentIndex];
    selectedAnswer = null;
    $("questionCounter").textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    $("topicPill").textContent = `${question.topic} · ${question.level}`;
    $("progressBar").style.width = `${(currentIndex / questions.length) * 100}%`;
    $("questionText").textContent = question.q;
    $("answerFeedback").textContent = "";
    $("nextBtn").disabled = true;
    $("nextBtn").textContent = currentIndex === questions.length - 1 ? "See results" : "Next question";
    $("options").innerHTML = "";
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option";
      button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
      button.addEventListener("click", () => chooseAnswer(index));
      $("options").appendChild(button);
    });
  }
  function chooseAnswer(index) {
    if (selectedAnswer !== null) return;
    selectedAnswer = index;
    const question = questions[currentIndex];
    const buttons = [...$("options").children];
    buttons.forEach((button, i) => {
      button.disabled = true;
      if (i === question.answer) button.classList.add("correct");
      if (i === index && i !== question.answer) button.classList.add("wrong");
    });
    if (index === question.answer) {
      score++;
      $("answerFeedback").textContent = `Correct. ${question.explain}`;
    } else {
      $("answerFeedback").textContent = `Not quite. ${question.explain}`;
    }
    answers.push({ question: question.q, selected: index, correct: question.answer });
    $("nextBtn").disabled = false;
    $("progressBar").style.width = `${((currentIndex + 1) / questions.length) * 100}%`;
  }
  function finishQuiz(timeUp = false) {
    if (quizFinished) return;
    quizFinished = true;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    const percent = Math.round((score / questions.length) * 100);
    $("scoreText").textContent = `${score}/${questions.length}`;
    $("scorePercent").textContent = `${percent}%`;
    $("correctCount").textContent = score;
    $("wrongCount").textContent = questions.length - score;
    $("resultMessage").textContent = timeUp
      ? "Time is up. Your score is based on the questions you answered before the timer ended."
      : percent >= 80 ? "Great work — you know these basics well."
      : percent >= 50 ? "Good effort. Review the explanations and try again."
      : "Keep practising. Review the explanations and give it another try.";
    const history = getHistory();
    history[currentUser.email] ||= [];
    history[currentUser.email].push({ score, percent, date: new Date().toLocaleString() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistory();
    showView("resultView");
  }

  $("startBtn").addEventListener("click", startQuiz);
  $("nextBtn").addEventListener("click", () => {
    if (selectedAnswer === null) return;
    if (currentIndex < questions.length - 1) { currentIndex++; renderQuestion(); }
    else finishQuiz();
  });
  $("quitBtn").addEventListener("click", () => {
    if (confirm("Exit this quiz? Your current attempt will not be saved.")) {
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      quizFinished = true;
      renderHistory(); showView("homeView");
    }
  });
  $("retryBtn").addEventListener("click", startQuiz);
  $("homeBtn").addEventListener("click", () => { renderHistory(); showView("homeView"); });
  $("logoutBtn").addEventListener("click", () => {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    quizFinished = true;
    localStorage.removeItem(SESSION_KEY);
    currentUser = null;
    $("userLabel").textContent = "";
    $("logoutBtn").classList.add("hidden");
    setAuthMode("login"); showView("authView");
  });

  (function init() {
    setAuthMode("login");
    const email = localStorage.getItem(SESSION_KEY);
    const user = getUsers().find(item => item.email === email);
    if (user) enterApp({ name: user.name, email: user.email });
    else showView("authView");
  })();
