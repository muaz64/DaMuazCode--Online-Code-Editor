const editors = {
    html: document.getElementById('htmlCode'),
    css: document.getElementById('cssCode'),
    js: document.getElementById('jsCode')
};

const consoleLogs = document.getElementById('console-logs');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// --- 1. AUTO-SAVE & LOAD LOGIC ---

// Save to localStorage
function autoSave() {
    const projectData = {
        html: editors.html.value,
        css: editors.css.value,
        js: editors.js.value
    };
    localStorage.setItem('damuazcode-autosave', JSON.stringify(projectData));
}

// Load from localStorage
function loadSavedProject() {
    const savedData = localStorage.getItem('damuazcode-autosave');
    if (savedData) {
        const data = JSON.parse(savedData);
        editors.html.value = data.html;
        editors.css.value = data.css;
        editors.js.value = data.js;
    }
}

// Add input listeners for auto-save
Object.values(editors).forEach(editor => {
    editor.addEventListener('input', autoSave);
});

// --- 2. THEME LOGIC ---

themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    document.body.classList.toggle('light', !isDark);
    
    themeIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('damuaz-theme', isDark ? 'dark' : 'light');
});

// --- 3. TAB LOGIC ---

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        Object.values(editors).forEach(ed => ed.style.display = 'none');
        
        tab.classList.add('active');
        const lang = tab.dataset.lang;
        editors[lang].style.display = 'block';
        document.getElementById('langDisplay').textContent = lang.toUpperCase();
    });
});

// --- 4. CONSOLE LOGIC ---

function clearConsole() {
    consoleLogs.innerHTML = '';
}

window.addEventListener('message', (event) => {
    if (event.data.type === 'log' || event.data.type === 'error') {
        const div = document.createElement('div');
        div.className = `log-item ${event.data.type === 'error' ? 'log-error' : ''}`;
        div.textContent = `> ${event.data.content}`;
        consoleLogs.appendChild(div);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }
});

// --- 5. RUN & PREVIEW LOGIC ---

function getFullCode() {
    const consoleBridge = `
        <script>
            console.log = (...args) => window.parent.postMessage({type: 'log', content: args.join(' ')}, '*');
            window.onerror = (m) => window.parent.postMessage({type: 'error', content: m}, '*');
        <\/script>
    `;

    return `
        <html>
            <head>
                <style>${editors.css.value}</style>
                ${consoleBridge}
            </head>
            <body>
                ${editors.html.value}
                <script>${editors.js.value}<\/script>
            </body>
        </html>
    `;
}

function runCode() {
    const output = document.getElementById('output');
    const blob = new Blob([getFullCode()], { type: 'text/html' });
    output.src = URL.createObjectURL(blob);
}

function openNewWindow() {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(getFullCode());
        newWindow.document.close();
    } else {
        alert('Pop-up blocked! Please allow pop-ups to see the full preview.');
    }
}

// --- 6. ZIP LOGIC ---

async function saveProject() {
    const zip = new JSZip();
    zip.file("index.html", editors.html.value);
    zip.file("style.css", editors.css.value);
    zip.file("script.js", editors.js.value);

    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, "DaMuazCode-Project.zip");
}

// --- 7. INITIALIZATION ---

window.addEventListener('load', () => {
    // 1. Load Code
    loadSavedProject();
    
    // 2. Load Theme
    const savedTheme = localStorage.getItem('damuaz-theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.replace('dark', 'light');
        themeIcon.className = 'fa-solid fa-sun';
    }
    
    // 3. Initial Run
    runCode();
});