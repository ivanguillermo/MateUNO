const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbydZ8qCZI_2oiBU1cyWAPpMoOTUzW4yQm3qkCFicYa-wWXhC90F-_C_esuhusVczlaG/exec";
let currentUser = null;
let selectedAnswerCorrect = null;
let currentObjective = "1.1";
let allQuestions = [];

let sessionStartTime = null;
let timerInterval = null;

const siteContent = {
    fundamentacion: {
        title: "Fundamentación de la Materia",
        html: `<p>Aquí va todo el texto correspondiente a la fundamentación institucional de la UNA...</p>`
    },
    plan: {
        title: "Plan de Curso",
        html: `<p>Detalle de los objetivos, unidades y estrategias de evaluación...</p>`
    },
    // Y así sucesivamente para cada sección...
};

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    currentUser = {
        name: responsePayload.name,
        email: responsePayload.email
    };

    document.getElementById('login-prompt').classList.add('hidden');
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-name').innerText = `Hola, ${responsePayload.name}`;
    document.getElementById('app-container').classList.remove('hidden');
    
    // Iniciar cronómetro de sesión
    startSessionTimer();
    
    fetchQuestions();
}

function startSessionTimer() {
    sessionStartTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
        const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
        document.getElementById('session-timer').innerText = `⏱️ ${minutes}:${seconds}`;
    }, 1000);
}

function fetchQuestions() {
    document.getElementById('question-text').innerText = "Cargando preguntas desde la nube...";
    fetch(WEB_APP_URL)
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) {
                allQuestions = data;
                loadQuestionsForCurrentObjective();
            } else {
                document.getElementById('question-text').innerText = "Error al cargar las preguntas. Verifica la pestaña 'Preguntas'.";
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('question-text').innerText = "Error de conexión con el servidor.";
        });
}

function switchObjective(objNum) {
    currentObjective = objNum;
    ["1.1", "1.2", "1.3"].forEach(id => {
        const btn = document.getElementById(`btn-obj-${id}`);
        if(id === objNum) {
            btn.className = "px-4 py-2 bg-blue-900 text-white rounded-lg font-medium text-sm transition";
        } else {
            btn.className = "px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition";
        }
    });
    loadQuestionsForCurrentObjective();
}

function loadQuestionsForCurrentObjective() {
    const filtered = allQuestions.filter(q => String(q.objective).trim() === String(currentObjective).trim());
    document.getElementById('obj-title').innerText = `Objetivo ${currentObjective}`;
    
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    document.getElementById('result-container').classList.add('hidden');

    if (filtered.length === 0) {
        document.getElementById('question-text').innerText = "No hay preguntas cargadas para este objetivo en la hoja de cálculo.";
        document.getElementById('submit-btn').style.display = 'none';
        return;
    }

    document.getElementById('submit-btn').style.display = 'block';

    const qData = filtered[Math.floor(Math.random() * filtered.length)];
    document.getElementById('question-text').innerText = qData.question;

    let optionsArray = [
        { text: qData.correct, correct: true },
        { text: qData.incorrect1, correct: false },
        { text: qData.incorrect2, correct: false }
    ];

    // Mezcla aleatoria de opciones
    for (let i = optionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    optionsArray.forEach((opt) => {
        const btn = document.createElement('button');
        btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 transition option-btn";
        btn.innerText = opt.text;
        btn.onclick = () => selectOption(btn, opt.correct);
        container.appendChild(btn);
    });

    selectedAnswerCorrect = null;
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    submitBtn.className = "w-full bg-slate-300 text-white font-medium py-3 rounded-xl transition cursor-not-allowed";
}

function selectOption(button, isCorrect) {
    document.querySelectorAll('.option-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50', 'font-medium');
    });
    button.classList.add('border-blue-500', 'bg-blue-50', 'font-medium');
    selectedAnswerCorrect = isCorrect;

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = false;
    submitBtn.className = "w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 rounded-xl transition shadow-sm cursor-pointer";
}

function submitQuiz() {
    const score = selectedAnswerCorrect ? 100 : 50;
    const status = selectedAnswerCorrect ? "Aprobado" : "En proceso";
    
    const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const timeSpentFormatted = `${minutes} min ${seconds} seg`;

    const payload = {
        email: currentUser.email,
        name: currentUser.name,
        unit: `Unidad I - Objetivo ${currentObjective}`,
        score: score,
        status: status,
        timeSpent: timeSpentFormatted
    };

    const btn = document.getElementById('submit-btn');
    btn.innerText = "Enviando...";
    btn.disabled = true;

    fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    }).then(() => {
        document.getElementById('result-container').classList.remove('hidden');
        btn.innerText = "Enviar Respuesta";
    }).catch(err => {
        console.error(err);
        document.getElementById('result-container').classList.remove('hidden');
        btn.innerText = "Enviar Respuesta";
    });
}

function logout() {
    if(timerInterval) clearInterval(timerInterval);
    location.reload();
}


function showSection(sectionKey) {
    const container = document.getElementById('dynamic-view');
    if (sectionKey === 'inicio') {
        // Vuelve a cargar la vista normal del Quiz y el cronómetro
        loadQuizView(); 
        return;
    }
    
    const content = siteContent[sectionKey];
    if (content) {
        container.innerHTML = `
            <div class="content-card animate-fade">
                <h2>${content.title}</h2>
                ${content.html}
            </div>
        `;
    }
}
