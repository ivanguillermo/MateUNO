const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw7-YyOKPtnEpcKynE2L1aiQUPSZUTMltZl2CrqBIZQH_VuxL32NYpkwNmPEHeMyzMk/exec";
let currentUser = null;
let selectedAnswerCorrect = null;
let currentObjective = "1.1";
let allQuestions = [];

let sessionStartTime = null;
let timerInterval = null;

let studySeconds = parseInt(localStorage.getItem('mateuna_study_seconds')) || 0;
let currentWeekKey = getWeekKey(new Date());

// Verificar si cambió de semana para reiniciar el contador semanal si es necesario
let savedWeek = localStorage.getItem('mateuna_week_key');
if (savedWeek !== currentWeekKey) {
    studySeconds = 0;
    localStorage.setItem('mateuna_week_key', currentWeekKey);
    localStorage.setItem('mateuna_study_seconds', 0);
}

// Reloj incrementador de tiempo de estudio (corre cada segundo)
setInterval(() => {
    // Solo cuenta si la pestaña está activa y el usuario ha iniciado sesión
    if (!document.hidden && document.getElementById('app-container') && !document.getElementById('app-container').classList.contains('hidden')) {
        studySeconds++;
        localStorage.setItem('mateuna_study_seconds', studySeconds);
        updateStudyTimerDisplay();
    }
}, 1000);

const siteContent = {
    fundamentacion: {
        title: "Fundamentación del Curso",
        html: `
            <p class="mb-4 text-slate-600">El curso de <strong>Matemática I</strong> (Código: 175-176-177) forma parte del ciclo de Estudios Generales de la Universidad Nacional Abierta (UNA). Es un curso básico y obligatorio orientando sus estrategias hacia la resolución de ejercicios y problemas para promover la integración entre la teoría y la práctica[cite: 1].</p>
            <h3 class="font-bold text-blue-900 mt-4 mb-2">Objetivo Global de la Asignatura</h3>
            <p class="text-slate-600 bg-blue-50 p-4 rounded-xl border border-blue-100">Aplicar de manera coherente y sistemática los conceptos y técnicas relacionados con conjuntos numéricos, funciones, límites y la continuidad de funciones para la resolución de problemas tanto en ramas de la matemática como en otras disciplinas[cite: 1].</p>
            <h3 class="font-bold text-blue-900 mt-4 mb-2">Material Instruccional Obligatorio</h3>
            <p class="text-slate-600">Texto UNA: Escobar B., Lameda A., Orellana C., (2000 / 2017) "Matemática I", el cual consta de tres Títulos de Instrucción: Conjuntos Numéricos, Funciones y Representaciones Gráficas, y Sucesiones, Nociones Elementales de Límite y Continuidad[cite: 1].</p>
        `
    },
    plan: {
        title: "Plan de Curso y Ruta de Estudio",
        html: `
            <div class="space-y-4">
                <div class="border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-blue-900">Unidad I: Conjuntos Numéricos</h4>
                    <p class="text-xs text-slate-500 mb-2">Objetivo: Emplear de manera lógica los conceptos y técnicas de números naturales, enteros, racionales y reales[cite: 1].</p>
                    <ul class="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li><strong>Obj. 1.1:</strong> Naturales, enteros, racionales y uso de calculadora[cite: 1].</li>
                        <li><strong>Obj. 1.2:</strong> Números reales y aproximaciones decimales[cite: 1].</li>
                        <li><strong>Obj. 1.3:</strong> Relación de orden en R, desigualdades y valor absoluto[cite: 1].</li>
                    </ul>
                </div>
                <div class="border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-blue-900">Unidad II: Funciones y Representaciones Gráficas</h4>
                    <p class="text-xs text-slate-500 mb-2">Objetivo: Demostrar de manera analítica problemas aplicando relaciones, funciones y gráficas[cite: 1].</p>
                    <ul class="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li><strong>Obj. II.1:</strong> Sistemas de coordenadas y distancia entre puntos[cite: 1].</li>
                        <li><strong>Obj. II.2:</strong> Funciones elementales y composición de funciones[cite: 1].</li>
                        <li><strong>Obj. II.3:</strong> Representaciones gráficas y variables estadísticas[cite: 1].</li>
                    </ul>
                </div>
                <div class="border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-blue-900">Unidad III: Sucesiones, Límite y Continuidad</h4>
                    <p class="text-xs text-slate-500 mb-2">Objetivo: Aplicar límites y continuidad a sucesiones y funciones[cite: 1].</p>
                    <ul class="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li><strong>Obj. III.1:</strong> Sucesiones y límites de sucesiones[cite: 1].</li>
                        <li><strong>Obj. III.2:</strong> Límites de funciones y técnicas de cálculo[cite: 1].</li>
                        <li><strong>Obj. III.3:</strong> Funciones continuas, Teorema de Bolzano y Valor Intermedio[cite: 1].</li>
                    </ul>
                </div>
            </div>
        `
    },
    ruta: {
        title: "Ruta de Estudio Recomendada",
        html: `
            <p class="text-slate-600 mb-4">Para garantizar el éxito académico en la modalidad a distancia de la UNA, te recomendamos seguir esta rutina:</p>
            <ol class="list-decimal list-inside space-y-2 text-slate-600 text-sm">
                <li><strong>Organiza tu tiempo:</strong> Emplea al menos 3 horas diarias, 5 días a la semana por cada objetivo (mínimo 26 horas de estudio por objetivo)[cite: 1].</li>
                <li><strong>Lectura previa:</strong> Lee detalladamente la introducción y el cuadro resumen de repaso antes de abordar cada unidad[cite: 1].</li>
                <li><strong>Práctica constante:</strong> Resuelve los ejercicios propuestos en el Módulo y apóyate en los quizzes interactivos de esta plataforma.</li>
                <li><strong>Aprendizaje colaborativo:</strong> Organiza grupos de estudio de 3 o 4 personas para debatir dudas[cite: 1].</li>
            </ol>
        `
    }
};
function getWeekKey(d) {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    return date.getFullYear() + '-W' + Math.ceil((((date - week1) / 86400000) + 1) / 7);
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function renderAppUI(userData) {
    document.getElementById('login-prompt')?.classList.add('hidden');
    document.getElementById('auth-section')?.classList.add('hidden');
    document.getElementById('user-info')?.classList.remove('hidden');
    document.getElementById('app-container')?.classList.remove('hidden');
    
    const userNameElem = document.getElementById('user-name');
    if (userNameElem) {
        userNameElem.innerText = `Hola, ${userData.name}`;
        userNameElem.dataset.email = userData.email;
    }
}

function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    currentUser = {
        name: responsePayload.name,
        email: responsePayload.email
    };
    
   const userData = {
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    };
    localStorage.setItem('mateuna_user', JSON.stringify(userData));

    // Mostrar la interfaz de usuario autenticado
    renderAppUI(userData);

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

function populateObjectiveButtons() {
    const objectives = [...new Set(allQuestions.map(q => String(q.Objetivo || '').replace(',', '.').trim()))]
                        .filter(o => o.length > 0)
                        .sort();

    const selectorContainer = document.querySelector('#view-quiz .flex.gap-2');
    if (!selectorContainer || objectives.length === 0) return;

    selectorContainer.innerHTML = '';
    objectives.forEach(obj => {
        const btn = document.createElement('button');
        btn.id = `btn-obj-${obj}`;
        btn.innerText = `Obj. ${obj}`;
        btn.className = (obj === currentObjective) 
            ? "px-4 py-2 bg-blue-900 text-white rounded-xl font-medium text-sm transition"
            : "px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition";
        btn.onclick = () => switchObjective(obj);
        selectorContainer.appendChild(btn);
    });

    if (!objectives.includes(currentObjective) && objectives.length > 0) {
        currentObjective = objectives[0];
    }
}

function fetchQuestions() {
    document.getElementById('question-text').innerText = "Cargando preguntas desde la nube...";
    fetch(`${WEB_APP_URL}?sheet=Preguntas`)
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data)) {
                allQuestions = data;
                populateObjectiveButtons();
                loadQuestionsForCurrentObjective();
            } else {
                document.getElementById('question-text').innerText = "Error en la estructura de datos.";
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('question-text').innerText = "Error de conexión con el servidor.";
        });
}

function switchObjective(objNum) {
    currentObjective = objNum;
    document.querySelectorAll('[id^="btn-obj-"]').forEach(btn => {
        if(btn.id === `btn-obj-${objNum}`) {
            btn.className = "px-4 py-2 bg-blue-900 text-white rounded-xl font-medium text-sm transition";
        } else {
            btn.className = "px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-medium text-sm transition";
        }
    });
    loadQuestionsForCurrentObjective();
}

function loadQuestionsForCurrentObjective() {
    const filtered = allQuestions.filter(q => {
        const objStr = String(q.Objetivo || '').replace(',', '.').trim();
        return objStr === String(currentObjective).trim();
    });

    document.getElementById('obj-title').innerText = `Objetivo ${currentObjective}`;
    
    const container = document.getElementById('options-container');
    container.innerHTML = "";
    document.getElementById('result-container').classList.add('hidden');

    if (filtered.length === 0) {
        document.getElementById('question-text').innerText = "No hay preguntas cargadas para este objetivo.";
        document.getElementById('submit-btn').style.display = 'none';
        return;
    }

    document.getElementById('submit-btn').style.display = 'block';

    const qData = filtered[Math.floor(Math.random() * filtered.length)];
    document.getElementById('question-text').innerText = qData.Pregunta;

    // Extraer opciones (La primera del Sheet siempre es la correcta)
    let optionsArray = [
        { text: qData.Opcion1_Correcta, correct: true },
        { text: qData.Opcion2_Incorrecta1, correct: false },
        { text: qData.Opcion3_Incorrecta2, correct: false }
    ].filter(opt => opt.text !== undefined && opt.text !== "");

    // Algoritmo Fisher-Yates para mezclar respuestas al azar
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

function submitQuiz() {
    if (selectedAnswerCorrect === null) return;

    const payload = {
        email: currentUser.email,
        name: currentUser.name,
        objective: currentObjective,
        isCorrect: selectedAnswerCorrect
    };

    const btn = document.getElementById('submit-btn');
    btn.innerText = "Enviando...";
    btn.disabled = true;

    fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // text/plain evita bloqueos CORS preflight en Apps Script
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(resData => {
        document.getElementById('result-container').classList.remove('hidden');
        btn.innerText = "Enviar Respuesta";

        // Actualizar estadísticas en pantalla con los datos retornados por Google Apps Script
        if (resData.status === "success") {
            const dynamicView = document.getElementById('view-dynamic');
            if (dynamicView) {
                loadStudentGrades(dynamicView, resData.successRate, resData.totalAttempts);
            }
        }
    })
    .catch(err => {
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
    const quizView = document.getElementById('view-quiz');
    const dynamicView = document.getElementById('view-dynamic');
    
    // Ocultar menú en móvil tras seleccionar una opción
    if (window.innerWidth < 768) {
        document.getElementById('sidebar-menu')?.classList.add('hidden');
    }

    document.querySelectorAll('aside button').forEach(btn => {
        btn.classList.remove('bg-blue-50', 'text-blue-900');
        btn.classList.add('text-slate-600', 'hover:bg-slate-50');
    });
    
    const activeBtn = document.getElementById(`nav-${sectionKey}`);
    if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-50');
        activeBtn.classList.add('bg-blue-50', 'text-blue-900');
    }

    if (sectionKey === 'quiz') {
        quizView.classList.remove('hidden');
        dynamicView.classList.add('hidden');
        return;
    }

    quizView.classList.add('hidden');
    dynamicView.classList.remove('hidden');

    // Mapeo completo de todas las secciones
    if (siteContent[sectionKey]) {
        dynamicView.innerHTML = `
            <h2 class="text-xl font-bold text-blue-900 mb-4">${siteContent[sectionKey].title}</h2>
            ${siteContent[sectionKey].html}
        `;
    } else if (sectionKey === 'links') {
        loadSheetDataAsTable('Links', dynamicView, 'Links Importantes de la Universidad');
    } else if (sectionKey === 'estadisticas') {
        loadStudentGrades(dynamicView);
    } else if (sectionKey === 'contacto') {
        loadSheetDataAsTable('Contacto', dynamicView, 'Contacto con Profesores y Asesores');
    } else if (sectionKey === 'examenes') {
        loadSheetDataAsTable('Examenes', dynamicView, 'Fechas de Exámenes y Calendario Oficial');
    } else if (sectionKey === 'clases') {
        loadSheetDataAsTable('Clases', dynamicView, 'Fechas y Horarios de Clases');
    } else if (sectionKey === 'viejos') {
        loadSheetDataAsTable('Viejos', dynamicView, 'Archivo de Exámenes Anteriores');
    } else if (sectionKey === 'notas') {
        loadStudentGrades(dynamicView);
    }
}
    
 async function loadSheetDataAsTable(sheetName, container, title) {
    container.innerHTML = `<h2 class="text-xl font-bold text-blue-900 mb-4">${title}</h2><p class="text-slate-400 text-sm">Cargando datos desde Google Sheets...</p>`;
    try {
        // Reemplaza esta URL con la Web App desplegada de tu Google Apps Script que lee las pestañas
        const response = await fetch(`https://script.google.com/macros/s/AKfycbxOri0ezwTylp72XjXnVpGapuSw-2E8e-rKbi8IcttwxlwbPAP4SQSxJMPv8so8S4kK/exec?sheet=${sheetName}`);
        const data = await response.json();
        
        if (!data || data.length === 0) {
            container.innerHTML = `<h2 class="text-xl font-bold text-blue-900 mb-4">${title}</h2><p class="text-slate-500 text-sm">No hay registros cargados en esta sección todavía.</p>`;
            return;
        }

        let html = `<h2 class="text-xl font-bold text-blue-900 mb-4">${title}</h2><div class="overflow-x-auto"><table class="w-full text-left text-sm text-slate-600"><thead class="bg-slate-50 text-slate-700 uppercase text-xs"><tr>`;
        
        const headers = Object.keys(data[0]);
        headers.forEach(h => html += `<th class="p-3">${h}</th>`);
        html += `</tr></thead><tbody>`;

        data.forEach(row => {
            html += `<tr class="border-b border-slate-100">`;
            headers.forEach(h => {
                let val = row[h] || '';
                if(val.startsWith('http')) val = `<a href="${val}" target="_blank" class="text-blue-600 underline">Ver Enlace / PDF</a>`;
                html += `<td class="p-3">${val}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<h2 class="text-xl font-bold text-blue-900 mb-4">${title}</h2><p class="text-red-500 text-sm">Error al conectar con la base de datos de Google Sheets.</p>`;
    }
}

// Función para cargar las notas y el progreso del alumno logueado
// Función para cargar las notas y el progreso del alumno logueado
async function loadStudentGrades(container, successRate = 0, totalAttempts = 0) {
    const userEmail = document.getElementById('user-name')?.dataset.email || '';
    
    container.innerHTML = `
        <h2 class="text-xl font-bold text-blue-900 mb-4">Mis Notas y Progreso</h2>
        <p class="text-slate-400 text-sm mb-4">Estudiante: ${userEmail}</p>
        <div>
            <div class="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center mb-3">
                <span class="block text-2xl font-bold text-emerald-800">${successRate}%</span>
                <span class="text-xs text-emerald-600 font-medium uppercase">% de Aciertos en Quizzes</span>
            </div>
            <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center mb-4">
                <span class="block text-2xl font-bold text-slate-700">${totalAttempts}</span>
                <span class="text-xs text-slate-500 font-medium uppercase">Quizzes Respondidos</span>
            </div>
        </div>
        <p class="text-slate-500 text-sm">Estas métricas se almacenan localmente en tu navegador para ayudarte a cumplir con la recomendación de la UNA de dedicar al menos 3 horas diarias por objetivo.</p>
    `;
}
window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('mateuna_user');
    
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        // Ocultar el botón de login y mostrar el panel del estudiante directamente
        renderAppUI(userData);
    } else {
        // Mostrar el botón de Google si no hay sesión guardada
        initializeGoogleButton();
    }
});
function logoutUser() {
    localStorage.removeItem('mateuna_user');
    location.reload(); // Recarga la página y vuelve al estado de login
}

function initializeGoogleButton() {
    google.accounts.id.initialize({
        client_id: "205229444634-85v2gua4tv360jnn02bj5d68uhrb2e85.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });

    google.accounts.id.renderButton(
        document.getElementById("auth-section"),
        { theme: "outline", size: "large", text: "signin_with" }
    );
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
}

// Asegurar que el botón de hamburguesa se muestre al iniciar sesión
const originalRenderAppUI = typeof renderAppUI === 'function' ? renderAppUI : null;
renderAppUI = function(userData) {
    if (originalRenderAppUI) originalRenderAppUI(userData);
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) menuBtn.classList.remove('hidden');
};
