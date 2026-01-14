const editors = {
  html: document.getElementById("htmlCode"),
  css: document.getElementById("cssCode"),
  js: document.getElementById("jsCode"),
};
const consoleLogs = document.getElementById("console-logs");
const themeCheckbox = document.getElementById("checkbox");
const langDisplay = document.getElementById("langDisplay");

const defaultTemplate = {
  html: `<h1>DaMuazCode</h1>\n<p>Start building something epic.</p>\n<button id="mainBtn">Pulse Effect</button>`,
  css: `body { background: #0f172a; color: white; display: grid; place-items: center; height: 80vh; font-family: sans-serif; }\n#mainBtn { padding: 12px 24px; background: #6366f1; border: none; color: white; border-radius: 8px; cursor: pointer; transition: 0.3s; }\n#mainBtn:hover { transform: scale(1.1); box-shadow: 0 0 20px #6366f1; }`,
  js: `document.getElementById('mainBtn').onclick = () => {\n  console.log('Button Clicked!');\n};`,
};

// --- 1. TABS & UI NAVIGATION ---
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    // Remove active class from all tabs and wrappers
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".editor-wrapper")
      .forEach((w) => w.classList.remove("active"));

    // Add active class to clicked tab and corresponding wrapper
    tab.classList.add("active");
    const lang = tab.dataset.lang;
    document.getElementById(`wrap-${lang}`).classList.add("active");

    // Update footer display and line numbers
    langDisplay.textContent = lang.toUpperCase();
    updateLineNumbers(editors[lang]);
  });
});

// --- 2. LINE NUMBERS & SYNC SCROLLING ---
function updateLineNumbers(ed) {
  const lines = ed.value.split("\n").length;
  const gutter = ed.previousElementSibling; // The .gutter div
  let nums = "";
  for (let i = 1; i <= lines; i++) nums += `<div>${i}</div>`;
  gutter.innerHTML = nums;
}

// --- 3. AUTO-CLOSE BRACKETS & TAGS ---
function setupAutoClosing(ed, lang) {
  ed.addEventListener("keydown", (e) => {
    const start = ed.selectionStart,
      end = ed.selectionEnd,
      val = ed.value;
    const pairs = { "{": "}", "(": ")", "[": "]", '"': '"', "'": "'" };

    if (pairs[e.key]) {
      e.preventDefault();
      ed.value =
        val.substring(0, start) + e.key + pairs[e.key] + val.substring(end);
      ed.selectionStart = ed.selectionEnd = start + 1;
    }

    if (lang === "html" && e.key === ">") {
      const lastOpen = val.substring(0, start).lastIndexOf("<");
      if (lastOpen !== -1) {
        const tag = val.substring(lastOpen + 1, start);
        if (tag && !tag.startsWith("/") && !tag.includes(" ")) {
          setTimeout(() => {
            const p = ed.selectionStart;
            ed.value = val.substring(0, p) + `</${tag}>` + val.substring(p);
            ed.selectionStart = ed.selectionEnd = p;
          }, 10);
        }
      }
    }
  });
}

// --- 4. CORE EXECUTION ENGINE ---
let runTimeout;
function handleUpdate() {
  // Save to Local Storage
  localStorage.setItem(
    "dm-save",
    JSON.stringify({
      html: editors.html.value,
      css: editors.css.value,
      js: editors.js.value,
    })
  );

  // Debounce: Wait 800ms after typing stops before running
  clearTimeout(runTimeout);
  runTimeout = setTimeout(runCode, 800);
}

function runCode() {
  const bridge = `<script>
        console.log = (...args) => {
            window.parent.postMessage({type:'log', content:args.join(' ')}, '*');
        };
        window.onerror = (m) => window.parent.postMessage({type:'log', content: 'Error: ' + m}, '*');
    <\/script>`;

  const code = `<html><head><style>html{scroll-behavior:smooth;}${editors.css.value}</style>${bridge}</head><body>${editors.html.value}<script>${editors.js.value}<\/script></body></html>`;

  const blob = new Blob([code], { type: "text/html" });
  const oldUrl = document.getElementById("output").src;
  document.getElementById("output").src = URL.createObjectURL(blob);

  // Memory Cleanup
  if (oldUrl.startsWith("blob:")) URL.revokeObjectURL(oldUrl);
}

// --- 5. INITIALIZATION & THEME ---
window.onload = () => {
  // Load saved data
  const saved = JSON.parse(localStorage.getItem("dm-save")) || defaultTemplate;
  editors.html.value = saved.html;
  editors.css.value = saved.css;
  editors.js.value = saved.js;

  // Set up editors
  Object.values(editors).forEach((ed) => {
    updateLineNumbers(ed);
    setupAutoClosing(ed, ed.id === "htmlCode" ? "html" : "other");

    ed.oninput = () => {
      updateLineNumbers(ed);
      handleUpdate();
    };
    ed.onscroll = () => (ed.previousElementSibling.scrollTop = ed.scrollTop);
  });

  // Load Theme
  const savedTheme = localStorage.getItem("dm-theme") || "dark";
  if (savedTheme === "light") {
    document.body.classList.replace("dark", "light");
    themeCheckbox.checked = true;
  }

  runCode();
};

themeCheckbox.addEventListener("change", () => {
  if (themeCheckbox.checked) {
    document.body.classList.replace("dark", "light");
    localStorage.setItem("dm-theme", "light");
  } else {
    document.body.classList.replace("light", "dark");
    localStorage.setItem("dm-theme", "dark");
  }
});

// --- 6. ACTION FUNCTIONS ---
function clearConsole() {
  consoleLogs.innerHTML = "";
}

function resetProject() {
  if (confirm("Erase all progress and return to default?")) {
    localStorage.removeItem("dm-save");
    location.reload();
  }
}

function copyCurrentCode() {
  const activeLang = document.querySelector(".tab.active").dataset.lang;
  const btn = document.getElementById("copyBtn");
  navigator.clipboard.writeText(editors[activeLang].value);

  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Copied!</span>';
  setTimeout(() => (btn.innerHTML = originalText), 2000);
}

function openNewWindow() {
  const win = window.open("", "_blank");
  win.document.write(
    `<html><head><title>Preview</title><style>${editors.css.value}</style></head><body>${editors.html.value}<script>${editors.js.value}<\/script></body></html>`
  );
  win.document.close();
}

async function saveProject() {
  const zip = new JSZip();
  zip.file("index.html", editors.html.value);
  zip.file("style.css", editors.css.value);
  zip.file("script.js", editors.js.value);

  const content = await zip.generateAsync({ type: "blob" });
  const projTitle =
    document.querySelector(".project-title").textContent.trim() ||
    "DaMuaz_Project";
  saveAs(content, `${projTitle}.zip`);
}

// --- 7. MESSAGE LISTENER ---
window.addEventListener("message", (e) => {
  if (e.data.type === "log") {
    const div = document.createElement("div");
    div.className = "log-item";
    div.textContent = `> ${e.data.content}`;
    consoleLogs.appendChild(div);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
  }
});
