const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw7-YyOKPtnEpcKynE2L1aiQUPSZUTMltZl2CrqBIZQH_VuxL32NYpkwNmPEHeMyzMk/exec";
let currentUser = null;
let selectedAnswerCorrect = null;
let currentObjective = "1.1";
let allQuestions = [];

let sessionStartTime = null;
let timerInterval = null;

let studySeconds = parseInt(localStorage.getItem('mateuna_study_seconds')) || 0;
let currentWeekKey = getWeekKey(new Date());

// Verificar si cambió de semana para reiniciar el contador semanal
let savedWeek = localStorage.getItem('mateuna_week_key');
if (savedWeek !== currentWeekKey) {
    studySeconds = 0;
    localStorage.setItem('mateuna_week_key', currentWeekKey);
    localStorage.setItem('mateuna_study_seconds', 0);
}

// Reloj incrementador de tiempo de estudio
setInterval(() => {
    studySeconds++;
    if (typeof updateStudyTimerDisplay === 'function') {
        updateStudyTimerDisplay(studySeconds);
    }
}, 1000);

const siteContent = {
    fundamentacion: {
        title: "Fundamentación del Curso",
        html: `
            <p class="mb-4 text-slate-600">El curso de <strong>Matemática I</strong> (Código: 175-176-177) forma parte del ciclo de Estudios Generales de la Universidad Nacional Abierta (UNA). Es un curso básico y obligatorio orientando sus estrategias hacia la resolución de ejercicios y problemas para promover la integración entre la teoría y la práctica.</p>
            <h3 class="font-bold text-blue-900 mt-4 mb-2">Objetivo Global de la Asignatura</h3>
            <p class="text-slate-600 bg-blue-50 p-4 rounded-xl border border-blue-100">Aplicar de manera coherente y sistemática los conceptos y técnicas relacionados con conjuntos numéricos, funciones, límites y la continuidad de funciones para la resolución de problemas tanto en ramas de la matemática como en otras disciplinas.</p>
            <h3 class="font-bold text-blue-900 mt-4 mb-2">Material Instruccional Obligatorio</h3>
            <p class="text-slate-600">Texto UNA: Escobar B., Lameda A., Orellana C., (2000 / 2017) "Matemática I", el cual consta de tres Títulos de Instrucción:
                <ul>
                    <li>Conjuntos Numéricos, </li>
                    <li>Funciones y Representaciones Gráficas, y </li>
                    <li>Sucesiones, Nociones Elementales de Límite y Continuidad.</li>
                </ul>
            </p>
        `
    },
    plan: {
        title: "Plan de Curso y Ruta de Estudio",
        html: `
            <div class="space-y-4">
                <div class="border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-blue-900">Unidad I: Conjuntos Numéricos</h4>
                    <p class="text-xs text-slate-500 mb-2">Objetivo: Emplear de manera lógica los conceptos y técnicas de números naturales, enteros, racionales y reales.</p>
                    <ul class="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li><strong>Obj. 1.1:</strong> Naturales, enteros, racionales y uso de calculadora.</li>
                        <li><strong>Obj. 1.2:</strong> Números reales y aproximaciones decimales.</li>
                        <li><strong>Obj. 1.3:</strong> Relación de orden en R, desigualdades y valor absoluto.</li>
                    </ul>
                </div>
                <div class="border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-blue-900">Unidad II: Funciones y Representaciones Gráficas</h4>
                    <p class="text-xs text-slate-500 mb-2">Objetivo: Demostrar de manera analítica problemas aplicando relaciones, funciones y gráficas.</p>
                    <ul class="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li><strong>Obj. 2.1:</strong> Sistemas de coordenadas y distancia entre puntos.</li>
                        <li><strong>Obj. 2.2:</strong> Funciones elementales y composición de funciones.</li>
                        <li><strong>Obj. 2.3:</strong> Representaciones gráficas y variables estadísticas.</li>
                    </ul>
                </div>
                <div class="border border-slate-200 p-4 rounded-xl">
                    <h4 class="font-bold text-blue-900">Unidad III: Sucesiones, Límite y Continuidad</h4>
                    <p class="text-xs text-slate-500 mb-2">Objetivo: Aplicar límites y continuidad a sucesiones y funciones.</p>
                    <ul class="text-sm text-slate-600 list-disc list-inside space-y-1">
                        <li><strong>Obj. 3.1:</strong> Sucesiones y límites de sucesiones.</li>
                        <li><strong>Obj. 3.2:</strong> Límites de funciones y técnicas de cálculo.</li>
                        <li><strong>Obj. 3.3:</strong> Funciones continuas, Teorema de Bolzano y Valor Intermedio.</li>
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
                <li><strong>Organiza tu tiempo:</strong> Emplea al menos 3 horas diarias, 5 días a la semana por cada objetivo (mínimo 26 horas de estudio por objetivo).</li>
                <li><strong>Lectura previa:</strong> Lee detalladamente la introducción y el cuadro resumen de repaso antes de abordar cada unidad.</li>
                <li><strong>Práctica constante:</strong> Resuelve los ejercicios propuestos en el Módulo y apóyate en los quizzes interactivos de esta plataforma.</li>
                <li><strong>Aprendizaje colaborativo:</strong> Organiza grupos de estudio de 3 o 4 personas para debatir dudas.</li>
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
    const menuBtn = document.getElementById('mobile-menu-btn');
    if (menuBtn) menuBtn.classList.remove('hidden');
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

    renderAppUI(userData);
    startSessionTimer();    
    fetchQuestions();
}

function startSessionTimer() {
    sessionStartTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
        const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
        const timerElem = document.getElementById('session-timer');
        if (timerElem) timerElem.innerText = `⏱️ ${minutes}:${seconds}`;
    }, 1000);
}

function updateStudyTimerDisplay(seconds) {
    const timerElement = document.querySelector('.bg-slate-100 .text-xs') || document.getElementById('study-timer');
    if (!timerElement) return;
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    timerElement.innerText = `${formattedMinutes}:${formattedSeconds}`;
}

function populateObjectiveButtons() {
    const objectives = ["1.1", "1.2", "1.3", "2.1", "2.2", "2.3", "3.1", "3.2", "3.3"];
    const selectorContainer = document.querySelector('#view-quiz .flex.gap-2');
    if (!selectorContainer) return;

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
}

function fetchQuestions() {
    const questionTextEl = document.getElementById('question-text');
    if (questionTextEl) questionTextEl.innerText = "Cargando preguntas desde la nube...";
    
    fetch(`${WEB_APP_URL}?sheet=Preguntas`)
        .then(res => res.json())
        .then(data => {
            if(Array.isArray(data) && data.length > 0) {
                allQuestions = data;
                populateObjectiveButtons();
                loadQuestionsForCurrentObjective();
            } else {
                if (questionTextEl) questionTextEl.innerText = "No se encontraron preguntas o la estructura de datos es incorrecta.";
            }
        })
        .catch(err => {
            console.error(err);
            if (questionTextEl) questionTextEl.innerText = "Error de conexión al cargar las preguntas.";
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
    const currentObjNormalized = String(currentObjective).replace(',', '.').trim();

    const filtered = allQuestions.filter(q => {
        const rawObj = q.Objetivo !== undefined ? q.Objetivo : q.objective;
        if (rawObj === undefined || rawObj === null) return false;
        
        const objStr = String(rawObj).replace(',', '.').trim().replace(/^obj\.?\s*/i, '');
        return objStr === currentObjNormalized;
    });

    const titleEl = document.getElementById('obj-title');
    if (titleEl) titleEl.innerText = `OBJETIVO ${currentObjective}`;
    
    const container = document.getElementById('options-container');
    if (container) container.innerHTML = "";
    
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) resultContainer.classList.add('hidden');

    const questionTextEl = document.getElementById('question-text');

    if (filtered.length === 0) {
        if (questionTextEl) questionTextEl.innerText = "No hay preguntas cargadas para este objetivo en la hoja de cálculo.";
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) submitBtn.style.display = 'none';
        return;
    }

    const qData = filtered[Math.floor(Math.random() * filtered.length)];
    if (questionTextEl) questionTextEl.innerText = qData.Pregunta || qData.question;

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.className = "w-full bg-slate-300 text-white font-medium py-3 rounded-xl transition cursor-not-allowed mt-4";
    }

    let optionsArray = [
        { text: qData.Opcion1_Correcta || qData.correct, correct: true },
        { text: qData.Opcion2_Incorrecta1 || qData.incorrect1, correct: false },
        { text: qData.Opcion3_Incorrecta2 || qData.incorrect2, correct: false }
    ].filter(opt => opt.text !== undefined && opt.text !== "");

    for (let i = optionsArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
    }

    if (container) {
        optionsArray.forEach((opt) => {
            const btn = document.createElement('button');
            btn.className = "w-full text-left p-4 rounded-xl border border-slate-200 hover:border-blue-500 transition option-btn my-2";
            btn.innerText = opt.text;
            btn.onclick = () => selectOption(btn, opt.correct);
            container.appendChild(btn);
        });
    }

    selectedAnswerCorrect = null;
}

function selectOption(selectedBtn, isCorrect) {
    selectedAnswerCorrect = isCorrect;

    document.querySelectorAll('#options-container button').forEach(btn => {
        btn.classList.remove('border-blue-900', 'bg-blue-50', 'ring-2', 'ring-blue-500');
        btn.classList.add('border-slate-200');
    });

    selectedBtn.classList.remove('border-slate-200');
    selectedBtn.classList.add('border-blue-900', 'bg-blue-50', 'ring-2', 'ring-blue-500');

    const submitBtn = document.getElementById('submit-btn');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.className = "w-full bg-blue-900 hover:bg-blue-800 text-white font-medium py-3 rounded-xl transition cursor-pointer mt-4";
    }
}

function submitQuiz() {
    if (selectedAnswerCorrect === null) return;

    const payload = {
        email: currentUser ? currentUser.email : "",
        name: currentUser ? currentUser.name : "Estudiante",
        objective: currentObjective,
        isCorrect: selectedAnswerCorrect
    };

    const btn = document.getElementById('submit-btn');
    if (btn) {
        btn.innerText = "Enviando...";
        btn.disabled = true;
    }

    fetch(WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(resData => {
        const resultContainer = document.getElementById('result-container');
        if (resultContainer) resultContainer.classList.remove('hidden');
        if (btn) btn.innerText = "Enviar Respuesta";

        if (resData.status === "success") {
            const dynamicView = document.getElementById('view-dynamic');
            if (dynamicView && !dynamicView.classList.contains('hidden')) {
                loadStudentStats(dynamicView, resData.successRate, resData.totalAttempts);
            }
        }
    })
    .catch(err => {
        console.error(err);
        const resultContainer = document.getElementById('result-container');
        if (resultContainer) resultContainer.classList.remove('hidden');
        if (btn) btn.innerText = "Enviar Respuesta";
    });
}

function logout() {
    if(timerInterval) clearInterval(timerInterval);
    localStorage.removeItem('mateuna_user');
    location.reload();
}

function showSection(sectionKey) {
    const quizView = document.getElementById('view-quiz');
    const dynamicView = document.getElementById('view-dynamic');
    
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

    if (siteContent[sectionKey]) {
        dynamicView.innerHTML = `
            <h2 class="text-xl font-bold text-blue-900 mb-4">${siteContent[sectionKey].title}</h2>
            ${siteContent[sectionKey].html}
        `;
    } else if (sectionKey === 'links') {
        loadSheetDataAsTable('Links', dynamicView, 'Links Importantes de la Universidad');
    } else if (sectionKey === 'estadisticas') {
        loadStudentStats(dynamicView);
    } else if (sectionKey === 'notas') {
        loadStudentGradesSheet(dynamicView);
    } else if (sectionKey === 'contacto') {
        loadSheetDataAsTable('Contacto', dynamicView, 'Contacto con Profesores y Asesores');
    } else if (sectionKey === 'examenes') {
        loadSheetDataAsTable('Examenes', dynamicView, 'Fechas de Exámenes y Calendario Oficial');
    } else if (sectionKey === 'clases') {
        loadSheetDataAsTable('Clases', dynamicView, 'Fechas y Horarios de Clases');
    } else if (sectionKey === 'viejos') {
        loadSheetDataAsTable('Viejos', dynamicView, 'Archivo de Exámenes Anteriores');
    }
}

async function loadSheetDataAsTable(sheetName, container, title) {
    container.innerHTML = `<h2 class="text-xl font-bold text-blue-900 mb-4">${title}</h2><p class="text-slate-400 text-sm">Cargando datos desde Google Sheets...</p>`;
    try {
        const response = await fetch(`${WEB_APP_URL}?sheet=${sheetName}`);
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
                if(typeof val === 'string' && val.startsWith('http')) {
                    val = `<a href="${val}" target="_blank" class="text-blue-600 underline">Ver Enlace / PDF</a>`;
                }
                html += `<td class="p-3">${val}</td>`;
            });
            html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        container.innerHTML = html;
    } catch (e) {
        console.error(e);
        container.innerHTML = `<h2 class="text-xl font-bold text-blue-900 mb-4">${title}</h2><p class="text-red-500 text-sm">Error al conectar con la base de datos de Google Sheets.</p>`;
    }
}

async function loadStudentStats(container, successRate = 0, totalAttempts = 0) {
    const userEmail = document.getElementById('user-name')?.dataset.email || (currentUser ? currentUser.email : '');
    
    container.innerHTML = `
        <h2 class="text-xl font-bold text-blue-900 mb-4">Estadísticas de Práctica</h2>
        <p class="text-slate-400 text-sm mb-4">Estudiante: ${userEmail || 'No autenticado'}</p>
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
        <p class="text-slate-500 text-sm">Estas métricas reflejan la efectividad en tus cuestionarios de práctica para la asignatura.</p>
    `;
}

async function loadStudentGradesSheet(container) {
    const userEmail = (document.getElementById('user-name')?.dataset.email || (currentUser ? currentUser.email : '')).trim().toLowerCase();
    
    container.innerHTML = `
        <h2 class="text-xl font-bold text-blue-900 mb-4">Mis Notas Oficiales</h2>
        <p class="text-slate-400 text-sm mb-4">Cargando tus calificaciones...</p>
    `;

    if (!userEmail) {
        container.innerHTML = `
            <h2 class="text-xl font-bold text-blue-900 mb-4">Mis Notas Oficiales</h2>
            <p class="text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200 text-sm">
                Debes iniciar sesión con tu cuenta de Google para ver tu registro de notas.
            </p>
        `;
        return;
    }

    try {
        const response = await fetch(`${WEB_APP_URL}?sheet=Notas`);
        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            container.innerHTML = `
                <h2 class="text-xl font-bold text-blue-900 mb-4">Mis Notas Oficiales</h2>
                <p class="text-slate-500 text-sm">No hay registros cargados en la planilla de notas aún.</p>
            `;
            return;
        }

        const studentRow = data.find(row => {
            const rowEmail = (row.Correo || row.correo || row.Email || row.email || '').toString().trim().toLowerCase();
            return rowEmail === userEmail;
        });

        if (!studentRow) {
            container.innerHTML = `
                <h2 class="text-xl font-bold text-blue-900 mb-4">Mis Notas Oficiales</h2>
                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <p class="text-slate-700 font-medium mb-1">Estudiante: ${userEmail}</p>
                    <p class="text-slate-500 text-sm">No se encontraron registros de calificaciones asociados a tu correo institucional.</p>
                </div>
            `;
            return;
        }

        const objectivesKeys = ["Obj1.1", "Obj1.2", "Obj1.3", "Obj2.1", "Obj2.2", "Obj2.3", "Obj3.1", "Obj3.2", "Obj3.3"];

        let html = `
            <h2 class="text-xl font-bold text-blue-900 mb-2">Mis Notas Oficiales</h2>
            <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6 flex flex-wrap justify-between items-center gap-2">
                <div>
                    <h3 class="font-bold text-blue-900">${studentRow.nombre || studentRow.Nombre || 'Estudiante'}</h3>
                    <p class="text-xs text-blue-700">${userEmail}</p>
                </div>
                <div class="text-right">
                    <span class="text-xs text-slate-500 uppercase font-semibold block">Nota Final</span>
                    <span class="text-2xl font-black text-blue-900">${studentRow.Nota || studentRow.nota || '-'}</span>
                </div>
            </div>

            <div class="overflow-x-auto">
                <table class="w-full text-left text-sm text-slate-600 border-collapse">
                    <thead class="bg-slate-100 text-slate-700 uppercase text-xs">
                        <tr>
                            <th class="p-3 border-b">Objetivo</th>
                            <th class="p-3 border-b text-center">Estatus / Calificación</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        objectivesKeys.forEach(objKey => {
            const gradeVal = studentRow[objKey] !== undefined ? studentRow[objKey] : '-';
            html += `
                <tr class="border-b border-slate-100 hover:bg-slate-50">
                    <td class="p-3 font-medium text-slate-800">${objKey}</td>
                    <td class="p-3 text-center font-bold text-blue-900">${gradeVal}</td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;

    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <h2 class="text-xl font-bold text-blue-900 mb-4">Mis Notas Oficiales</h2>
            <p class="text-red-500 text-sm">Ocurrió un error al cargar tus notas desde Google Sheets.</p>
        `;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const savedUser = localStorage.getItem('mateuna_user');
    
    if (savedUser) {
        const userData = JSON.parse(savedUser);
        currentUser = userData;
        renderAppUI(userData);
        startSessionTimer();
        fetchQuestions();
    } else {
        initializeGoogleButton();
    }
});

function initializeGoogleButton() {
    if (typeof google !== 'undefined' && google.accounts) {
        google.accounts.id.initialize({
            client_id: "205229444634-85v2gua4tv360jnn02bj5d68uhrb2e85.apps.googleusercontent.com",
            callback: handleCredentialResponse
        });

        const authSection = document.getElementById("auth-section");
        if (authSection) {
            google.accounts.id.renderButton(
                authSection,
                { theme: "outline", size: "large", text: "signin_with" }
            );
        }
    }
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar-menu');
    if (sidebar) {
        sidebar.classList.toggle('hidden');
    }
}
