const editors = {
    html: document.getElementById('htmlCode'),
    css: document.getElementById('cssCode'),
    js: document.getElementById('jsCode')
};

const consoleLogs = document.getElementById('console-logs');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const defaultTemplate = {
    html: `\n<h1>Hello World</h1>\n<button id="magicBtn">Click Me</button>`,
    css: `/* Global Styles */\nbody {\n  background: #121212;\n  color: white;\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n  font-family: sans-serif;\n}`,
    js: `// Logic here\ndocument.getElementById('magicBtn').onclick = () => {\n  console.log('Magic button clicked!');\n  alert('Success!');\n};`
};

// --- INITIALIZATION ---
window.addEventListener('load', () => {
    loadSavedProject();
    const savedTheme = localStorage.getItem('damuaz-theme') || 'dark';
    if (savedTheme === 'light') themeToggle.click();
    runCode();
});

// --- THEME & TABS ---
themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    document.body.classList.toggle('light', !isDark);
    themeIcon.className = isDark ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
    localStorage.setItem('damuaz-theme', isDark ? 'dark' : 'light');
});

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

// --- CORE LOGIC ---
function getFullCode() {
    const bridge = `<script>
        console.log = (...args) => window.parent.postMessage({type:'log', content:args.join(' ')}, '*');
        window.onerror = (m) => window.parent.postMessage({type:'error', content:m}, '*');
    <\/script>`;
    return `<html><head><style>${editors.css.value}</style>${bridge}</head><body>${editors.html.value}<script>${editors.js.value}<\/script></body></html>`;
}

function runCode() {
    const output = document.getElementById('output');
    const blob = new Blob([getFullCode()], { type: 'text/html' });
    output.src = URL.createObjectURL(blob);
}

function openNewWindow() {
    const win = window.open('', '_blank');
    if (win) { win.document.write(getFullCode()); win.document.close(); }
    else alert('Pop-up blocked!');
}

// --- PROJECT MGMT ---
function autoSave() {
    localStorage.setItem('damuaz-save', JSON.stringify({html: editors.html.value, css: editors.css.value, js: editors.js.value}));
}

function loadSavedProject() {
    const saved = localStorage.getItem('damuaz-save');
    const data = saved ? JSON.parse(saved) : defaultTemplate;
    editors.html.value = data.html; editors.css.value = data.css; editors.js.value = data.js;
}

function resetProject() {
    if (confirm("Reset everything?")) {
        editors.html.value = defaultTemplate.html;
        editors.css.value = defaultTemplate.css;
        editors.js.value = defaultTemplate.js;
        autoSave(); runCode(); clearConsole();
    }
}

async function saveProject() {
    const zip = new JSZip();
    zip.file("index.html", editors.html.value);
    zip.file("style.css", editors.css.value);
    zip.file("script.js", editors.js.value);
    const content = await zip.generateAsync({type:"blob"});
    saveAs(content, "DaMuazCode-Project.zip");
}

function clearConsole() { consoleLogs.innerHTML = ''; }

window.addEventListener('message', (e) => {
    if (e.data.type === 'log' || e.data.type === 'error') {
        const div = document.createElement('div');
        div.className = `log-item \${e.data.type === 'error' ? 'log-error' : ''}`;
        div.textContent = `> \${e.data.content}`;
        consoleLogs.appendChild(div);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    }
});

Object.values(editors).forEach(ed => ed.addEventListener('input', autoSave));