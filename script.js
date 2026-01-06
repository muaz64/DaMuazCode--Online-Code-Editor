const editor = document.getElementById('codeEditor');
const output = document.getElementById('output');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

// Run code on load
window.addEventListener('load', runCode);

// Theme Toggle Logic
themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    
    // Change Icon
    if (isLight) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Run Code Function
function runCode() {
    const code = editor.value;
    const outputDoc = output.contentWindow.document;
    outputDoc.open();
    outputDoc.write(code);
    outputDoc.close();
}

// Clear Code Function
function clearCode() {
    if(confirm("Are you sure you want to clear all code?")) {
        editor.value = '';
        runCode();
    }
}

// Download Code Function
function downloadCode() {
    const code = editor.value;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-code.html';
    a.click();
    URL.revokeObjectURL(url);
}

// Preview in New Window
function openPreviewInNewWindow() {
    const win = window.open();
    win.document.write(editor.value);
    win.document.close();
}

// Button Click Listeners
document.getElementById('runBtn').addEventListener('click', runCode);
document.getElementById('clearBtn').addEventListener('click', clearCode);
document.getElementById('downloadBtn').addEventListener('click', downloadCode);
document.getElementById('previewBtn').addEventListener('click', openPreviewInNewWindow);

// Keyboard Shortcut (Ctrl + Enter to run)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        runCode();
    }
});