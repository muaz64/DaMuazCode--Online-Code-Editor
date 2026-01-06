const editor = document.getElementById('codeEditor');
const output = document.getElementById('output');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const languageSelect = document.getElementById('languageSelect');

// --- 1. INITIALIZATION ---
window.addEventListener('load', () => {
    // Restore theme from local storage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    runCode();
});

// --- 2. THEME TOGGLE LOGIC ---
themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    if (isLight) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// --- 3. CORE FUNCTIONS ---

function runCode() {
    const code = editor.value;
    const outputDoc = output.contentWindow.document;
    outputDoc.open();
    outputDoc.write(code);
    outputDoc.close();
}

function clearCode() {
    if(confirm("Are you sure you want to clear all code?")) {
        editor.value = '';
        runCode();
    }
}

function downloadCode() {
    const code = editor.value;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'da-muaz-code.html';
    a.click();
    URL.revokeObjectURL(url);
}

function openPreviewInNewWindow() {
    const win = window.open('', '_blank');
    if (win) {
        win.document.write(editor.value);
        win.document.close();
    } else {
        alert('Please allow popups to use the Preview feature.');
    }
}

// --- 4. EVENT LISTENERS ---

document.getElementById('runBtn').addEventListener('click', runCode);
document.getElementById('clearBtn').addEventListener('click', clearCode);
document.getElementById('downloadBtn').addEventListener('click', downloadCode);
document.getElementById('previewBtn').addEventListener('click', openPreviewInNewWindow);

// Update output automatically when language changes
languageSelect.addEventListener('change', () => {
    console.log(`Language changed to: ${languageSelect.value}`);
    runCode();
});

// --- 5. KEYBOARD SHORTCUTS ---

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault(); 
        runCode();
    }
});