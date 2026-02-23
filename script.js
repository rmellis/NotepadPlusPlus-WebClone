const editor = document.getElementById('editor');
const highlighting = document.getElementById('highlighting-content');
const highlightingPre = document.getElementById('highlighting');
const lineNumbers = document.getElementById('line-numbers');
const tabbar = document.getElementById('tabbar');

// Status bar elements
const sbType = document.getElementById('sb-type');
const sbLength = document.getElementById('sb-length');
const sbPosition = document.getElementById('sb-position');
const sbEol = document.getElementById('sb-eol');
const sbEncoding = document.getElementById('sb-encoding');

// State Management
let tabs = [];
let activeTabId = null;
let fileCounter = 0;
let currentZoom = 14; 

// --- UNIVERSAL DIALOG ENGINE ---
let msgBoxCallback = null;

function closeMsgBox(result = null) {
    document.getElementById('msg-box-modal').style.display = 'none';
    if (msgBoxCallback) msgBoxCallback(result);
}

window.customAlert = function(msg) {
    return new Promise(resolve => {
        document.getElementById('msg-box-title').textContent = 'Notepad++ Web Clone';
        document.getElementById('msg-box-text').textContent = msg;
        document.getElementById('msg-box-input-container').style.display = 'none';
        document.getElementById('msg-box-actions').innerHTML = `<button onclick="closeMsgBox(true)" style="padding: 4px 20px;">OK</button>`;
        document.getElementById('msg-box-modal').style.display = 'block';
        centerModal(document.getElementById('msg-box-modal'));
        msgBoxCallback = resolve;
    });
};

window.customConfirm = function(msg) {
    return new Promise(resolve => {
        document.getElementById('msg-box-title').textContent = 'Confirm';
        document.getElementById('msg-box-text').textContent = msg;
        document.getElementById('msg-box-input-container').style.display = 'none';
        document.getElementById('msg-box-actions').innerHTML = `
            <button onclick="closeMsgBox(true)" style="padding: 4px 20px;">OK</button>
            <button onclick="closeMsgBox(false)" style="padding: 4px 20px;">Cancel</button>
        `;
        document.getElementById('msg-box-modal').style.display = 'block';
        centerModal(document.getElementById('msg-box-modal'));
        msgBoxCallback = resolve;
    });
};

window.customPrompt = function(msg, defaultText = '') {
    return new Promise(resolve => {
        document.getElementById('msg-box-title').textContent = 'Input';
        document.getElementById('msg-box-text').textContent = msg;
        document.getElementById('msg-box-input-container').style.display = 'block';
        let input = document.getElementById('msg-box-input');
        input.value = defaultText;
        document.getElementById('msg-box-actions').innerHTML = `
            <button onclick="closeMsgBox(document.getElementById('msg-box-input').value)" style="padding: 4px 20px;">OK</button>
            <button onclick="closeMsgBox(null)" style="padding: 4px 20px;">Cancel</button>
        `;
        document.getElementById('msg-box-modal').style.display = 'block';
        centerModal(document.getElementById('msg-box-modal'));
        input.focus();
        input.select();
        
        input.onkeydown = function(e) {
            if(e.key === 'Enter') {
                e.preventDefault();
                closeMsgBox(input.value);
            }
        };
        msgBoxCallback = resolve;
    });
};

// SYSTEM FEATURE EXPLANATION ENGINE
function requireDesktop(featureName) {
    let msg = "";
    switch (featureName) {
        case 'Windows Explorer':
        case 'Command Prompt':
            msg = `Opening native OS shell processes like ${featureName} is blocked by browser security sandboxes to prevent malicious execution.`;
            break;
        case 'Folder as Workspace':
        case 'Find in Files':
            msg = `The "${featureName}" feature requires recursively scanning and indexing local system directories, which web browsers restrict for privacy and security.`;
            break;
        case 'Begin/End Select':
        case 'Column Mode':
        case 'Column Editor':
            msg = `Advanced vertical column manipulation ("${featureName}") relies on native text rendering APIs that are not supported by standard web textareas.`;
            break;
        case 'Function Auto-Completion':
            msg = `Intelligent "${featureName}" requires parsing syntax trees across multiple files using background threading, which isn't implemented in this lightweight web version.`;
            break;
        case 'Clipboard HTML Parsing':
        case 'OS Clipboard History':
            msg = `Browsers limit access to the OS clipboard history and rich MIME-types to protect user privacy. Only basic text clipboard operations are permitted in the web clone.`;
            break;
        case 'OS File Execution':
        case 'Open in New Instance':
            msg = `Spawning new native application processes or executing local files is strictly prohibited within a browser sandbox environment.`;
            break;
        case 'Character Panel':
            msg = `Rendering the native OS-level "${featureName}" requires desktop UI toolkits outside the scope of standard DOM elements.`;
            break;
        case 'Reverse Search Engine':
        case 'Hex Range Search':
            msg = `Deep binary hex-level searching and complex reverse buffering requires raw memory access handled by the native desktop engine.`;
            break;
        case 'Bracket Matching Selection':
        case 'Lexer Token Styling':
            msg = `Deep lexical token modification and recursive matching for "${featureName}" relies on the native Scintilla C++ engine used by the desktop app.`;
            break;
        case 'Gutter Marking':
        case 'Gutter Bookmarks':
        case 'Change History':
        case 'Hide Lines':
            msg = `Injecting interactive visual markers, persistent bookmarks, or hiding specific line indices requires the native Scintilla rendering engine, rather than standard HTML wrapping.`;
            break;
        case 'Always on Top':
        case 'Window Manager':
        case 'Split Screen Views':
        case 'Close Multiple Tabs Panel':
            msg = `Manipulating window stacking order ("${featureName}") or spawning split-view frames is controlled by your desktop window manager, not the browser.`;
            break;
        case 'Render CR/LF Symbols':
            msg = `Rendering invisible carriage return and line feed bytes as physical visual glyphs is a custom drawing feature not supported by standard browser text rendering.`;
            break;
        case 'Code Folding':
            msg = `Collapsing and folding code blocks hierarchically requires a dedicated background lexical parser, which isn't present in this DOM-based clone.`;
            break;
        case 'Project Panels':
        case 'Document Map':
        case 'Document List':
        case 'Function List':
            msg = `Generating secondary UI panels for "${featureName}" (like minimaps or function trees) requires background file parsing and threading built into the native desktop app.`;
            break;
        case 'RTF Export Plugin':
        case 'Plugins Admin':
            msg = `Notepad++ plugins are compiled C++ DLL files. A web browser sandbox cannot load or execute native desktop binaries.`;
            break;
        case 'Network Proxy Settings':
            msg = `Browser-based applications inherently use the network proxy settings of the browser itself. You cannot set a custom proxy just for this specific tab.`;
            break;
        case 'Style Configurator':
        case 'Theme Import':
        case 'Dark Mode Engine':
            msg = `Modifying raw UI themes and injecting dynamic CSS overrides requires writing to the native OS user-profile configuration files.`;
            break;
        case 'Context Menu Customization':
            msg = `Modifying the application right-click context menus requires native desktop UI injection and configuration file parsing.`;
            break;
        case 'User Defined Languages':
            msg = `Building a custom lexical parser for a new language requires writing and compiling native XML rules into the C++ Scintilla engine.`;
            break;
        default:
            msg = `The "${featureName}" feature requires deep integration with the operating system which is not possible in a web browser sandbox.`;
    }
    customAlert(msg + `\n\nPlease download the official Notepad++ desktop application for Windows to use this feature.`);
}

function setTextDirection(dir) {
    const container = document.getElementById('editor-container');
    const editor = document.getElementById('editor');
    if (dir === 'rtl') {
        container.classList.add('is-rtl');
        document.body.classList.add('is-rtl-measurer');
        editor.setAttribute('dir', 'rtl');
    } else {
        container.classList.remove('is-rtl');
        document.body.classList.remove('is-rtl-measurer');
        editor.setAttribute('dir', 'ltr');
    }
    updateLineNumbers(editor.value);
    syncScroll();
}

// --- Language to Extension Mapping Dictionary ---
function getExtensionForLang(lang) {
    const extMap = {
        'none': 'txt', 'actionscript': 'as', 'ada': 'ada', 'asn1': 'asn', 'aspnet': 'asp', 'nasm': 'asm', 'autoit': 'au3',
        'bash': 'sh', 'batch': 'bat', 'basic': 'bb',
        'c': 'c', 'cpp': 'cpp', 'csharp': 'cs', 'cmake': 'cmake', 'cobol': 'cbl', 'coffeescript': 'coffee', 'css': 'css',
        'd': 'd', 'dart': 'dart', 'diff': 'diff', 'docker': 'dockerfile',
        'elixir': 'ex', 'elm': 'elm', 'erlang': 'erl',
        'fsharp': 'fs', 'fortran': 'f90',
        'go': 'go', 'graphql': 'graphql', 'groovy': 'groovy',
        'haskell': 'hs', 'hollywood': 'hws', 'html': 'html',
        'ini': 'ini', 'icon': 'icn',
        'java': 'java', 'javascript': 'js', 'json': 'json', 'jsx': 'jsx', 'julia': 'jl',
        'kotlin': 'kt',
        'latex': 'tex', 'less': 'less', 'lisp': 'lisp', 'lua': 'lua',
        'makefile': 'mak', 'markdown': 'md', 'matlab': 'mat',
        'nim': 'nim', 'nix': 'nix',
        'objectivec': 'm', 'ocaml': 'ml',
        'pascal': 'pas', 'perl': 'pl', 'php': 'php', 'powershell': 'ps1', 'python': 'py',
        'r': 'r', 'ruby': 'rb', 'rust': 'rs',
        'sass': 'sass', 'scala': 'scala', 'scheme': 'scm', 'sql': 'sql', 'swift': 'swift',
        'tcl': 'tcl', 'tsx': 'tsx', 'typescript': 'ts',
        'visual-basic': 'vb', 'xml': 'xml', 'yaml': 'yaml'
    };
    return extMap[lang] || 'txt';
}

// --- Core Editor Logic ---

function handleInput() {
    const text = editor.value;
    const currentTab = getActiveTab();
    
    currentTab.content = text;
    
    let prismText = text;
    if (prismText.endsWith('\n')) {
        prismText += ' '; 
    }
    
    highlighting.textContent = prismText;
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(highlighting);
    }
    
    updateLineNumbers(text);
    updateStatusBarLength();
    updateStatusBarCursor();
    
    syncScroll();
    
    if (currentTab.isSaved) {
        currentTab.isSaved = false;
        renderTabs();
    }
}

function syncScroll() {
    highlightingPre.scrollTop = editor.scrollTop;
    highlightingPre.scrollLeft = editor.scrollLeft;
    lineNumbers.scrollTop = editor.scrollTop;
}

// CRITICAL FIX: The Exact-Height Block Mirror Engine
function updateLineNumbers(text) {
    const lines = text.split('\n');
    const wrapper = document.getElementById('code-wrapper');
    const isWrap = wrapper.classList.contains('word-wrap');
    
    // Ensure mathematically perfect line-height calculations from computed CSS
    const cs = window.getComputedStyle(editor);
    const fontSize = parseFloat(cs.fontSize) || currentZoom;
    const lh = fontSize * 1.5; 
    
    let numbersHtml = '';
    
    // Fast path for non-word-wrap mode
    if (!isWrap) {
        for (let i = 1; i <= lines.length; i++) { 
            numbersHtml += `<div style="height: ${lh}px; line-height: ${lh}px; display: flex; align-items: flex-start; justify-content: flex-end;">${i}</div>`; 
        }
        lineNumbers.innerHTML = numbersHtml;
        return;
    }

    // --- WORD WRAP MEASUREMENT ENGINE ---
    let measurer = document.getElementById('wrap-measurer');
    if (!measurer) {
        measurer = document.createElement('div');
        measurer.id = 'wrap-measurer';
        document.body.appendChild(measurer); 
    }
    
    // Exact copy of Textarea computation styles to prevent sub-pixel drift
    measurer.style.position = 'fixed';
    measurer.style.visibility = 'hidden';
    measurer.style.top = '-9999px';
    measurer.style.left = '-9999px';
    measurer.style.whiteSpace = 'pre-wrap';
    measurer.style.wordWrap = 'break-word';
    measurer.style.overflowWrap = 'anywhere';
    measurer.style.wordBreak = 'break-all';
    measurer.style.fontFamily = cs.fontFamily;
    measurer.style.fontSize = cs.fontSize;
    measurer.style.lineHeight = cs.lineHeight;
    measurer.style.boxSizing = cs.boxSizing;
    measurer.style.tabSize = cs.tabSize;
    measurer.style.letterSpacing = cs.letterSpacing;
    measurer.style.wordSpacing = cs.wordSpacing;
    
    // Width must match clientWidth exactly to account for scrollbars
    measurer.style.width = editor.clientWidth + 'px';
    measurer.style.paddingLeft = cs.paddingLeft;
    measurer.style.paddingRight = cs.paddingRight;
    measurer.style.paddingTop = '0px';
    measurer.style.paddingBottom = '0px';

    // Load lines into independent block-level dummy containers
    let dummyHtml = '';
    for (let i = 0; i < lines.length; i++) {
        let safeLine = lines[i].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (safeLine.length === 0) safeLine = ' '; // Empty lines still hold native height
        dummyHtml += `<div style="display:block; width:100%;">${safeLine}</div>`;
    }
    measurer.innerHTML = dummyHtml;

    // Measure the browser naturally assigned to each wrapped line
    const children = measurer.children;
    for (let i = 0; i < children.length; i++) {
        let h = children[i].offsetHeight;
        let linesWrapped = Math.round(h / lh);
        if (linesWrapped < 1) linesWrapped = 1; 
        let snappedHeight = linesWrapped * lh;
        
        numbersHtml += `<div style="height: ${snappedHeight}px; line-height: ${lh}px; display: flex; align-items: flex-start; justify-content: flex-end;">${i + 1}</div>`;
    }
    
    lineNumbers.innerHTML = numbersHtml;
}

// Recalculate word wrap heights dynamically if the user resizes the window
window.addEventListener('resize', () => {
    const wrapper = document.getElementById('code-wrapper');
    if (wrapper.classList.contains('word-wrap')) {
        updateLineNumbers(editor.value);
    }
});

function zoomEditor(direction) {
    if (direction !== 0) {
        currentZoom += (direction * 2);
    }
    if(currentZoom < 8) currentZoom = 8;
    if(currentZoom > 48) currentZoom = 48;
    
    document.documentElement.style.setProperty('--editor-font-size', currentZoom + 'px');
    document.documentElement.style.setProperty('--editor-line-height', (currentZoom * 1.5) + 'px');
    
    const prefFontSize = document.getElementById('pref-font-size');
    if(prefFontSize) prefFontSize.value = currentZoom;
    
    updateLineNumbers(editor.value); 
    syncScroll(); 
}

// --- Language / Syntax Management ---

function setLanguage(lang) {
    const currentTab = getActiveTab();
    if(!currentTab) return;
    
    currentTab.lang = lang;
    highlighting.className = `language-${lang}`;
    
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(highlighting);
    }
    
    updateMenuCheckmarks('lang-check', lang);
    
    let langDisplay = lang === 'none' ? 'Normal text file' : lang.toUpperCase() + ' source file';
    sbType.textContent = langDisplay;
    
    document.title = `${currentTab.title} - Notepad++ Clone`;
}

// --- Encoding Management ---

function setEncoding(enc) {
    const currentTab = getActiveTab();
    if(!currentTab) return;
    
    currentTab.encoding = enc;
    
    updateMenuCheckmarks('enc-check', enc);
    sbEncoding.textContent = enc;
    document.title = `${currentTab.title} - Notepad++ Clone`;
}

function convertEncoding(enc) {
    setEncoding(enc); 
}

function setEOL(eol) {
    const currentTab = getActiveTab();
    if(!currentTab) return;
    currentTab.eol = eol;
    sbEol.textContent = eol;
}

function updateMenuCheckmarks(prefix, activeValue) {
    const allChecks = document.querySelectorAll(`span[id^="${prefix}"]`);
    allChecks.forEach(span => {
        span.textContent = '';
    });
    
    const activeCheck = document.getElementById(`${prefix}-${activeValue}`);
    if(activeCheck) {
        activeCheck.textContent = '✓ ';
    }
}

// --- Status Bar Logic ---

function updateStatusBarLength() {
    const text = editor.value;
    const len = text.length;
    const lines = text.split('\n').length;
    sbLength.textContent = `length : ${len}  lines : ${lines}`;
}

function updateStatusBarCursor() {
    const text = editor.value;
    const pos = editor.selectionStart;
    
    const textBeforeCursor = text.substring(0, pos);
    const linesBeforeCursor = textBeforeCursor.split('\n');
    
    const currentLine = linesBeforeCursor.length;
    const currentCol = linesBeforeCursor[linesBeforeCursor.length - 1].length + 1;
    
    sbPosition.textContent = `Ln : ${currentLine}  Col : ${currentCol}  Pos : ${pos}`;
}

// --- Tab Management Logic ---

function newTab(title = null, content = '', lang = 'none', encoding = 'UTF-8') {
    fileCounter++;
    const newId = `tab-${Date.now()}`;
    const tabTitle = title || `new ${fileCounter}`;
    
    tabs.push({ 
        id: newId, 
        title: tabTitle, 
        content: content, 
        isSaved: true, 
        lang: lang, 
        encoding: encoding,
        eol: 'Windows (CR LF)'
    });
    
    switchTab(newId);
}

function switchTab(id) {
    const currentTab = getActiveTab();
    if (currentTab) {
        currentTab.scrollTop = editor.scrollTop;
        currentTab.scrollLeft = editor.scrollLeft;
    }

    activeTabId = id;
    const tab = getActiveTab();
    
    editor.value = tab.content;
    
    let prismText = tab.content;
    if (prismText.endsWith('\n')) {
        prismText += ' ';
    }
    
    highlighting.textContent = prismText;
    highlighting.className = `language-${tab.lang}`;
    
    if (typeof Prism !== 'undefined') {
        Prism.highlightElement(highlighting);
    }
    
    updateLineNumbers(tab.content);
    
    updateMenuCheckmarks('enc-check', tab.encoding);
    updateMenuCheckmarks('lang-check', tab.lang);
    sbEncoding.textContent = tab.encoding;
    sbEol.textContent = tab.eol;
    let langDisplay = tab.lang === 'none' ? 'Normal text file' : tab.lang.toUpperCase() + ' source file';
    sbType.textContent = langDisplay;
    
    updateStatusBarLength();
    updateStatusBarCursor();
    
    setTimeout(() => {
        editor.scrollTop = tab.scrollTop || 0;
        editor.scrollLeft = tab.scrollLeft || 0;
        syncScroll();
    }, 0);

    renderTabs();
}

function closeActiveTab() {
    if(activeTabId) closeTab(new Event('dummy'), activeTabId);
}

async function closeTab(event, id) {
    event.stopPropagation();
    const tabToClose = tabs.find(t => t.id === id);
    
    if (!tabToClose.isSaved) {
        if (!(await customConfirm(`Are you sure you want to close tab "${tabToClose.title}"? all unsaved data will be lost.`))) return;
    }
    
    tabs = tabs.filter(t => t.id !== id);
    
    if (tabs.length === 0) newTab();
    else if (activeTabId === id) switchTab(tabs[tabs.length - 1].id);
    else renderTabs();
}

async function closeAllTabs() {
    if(await customConfirm("Close all tabs? Unsaved changes will be lost.")) {
        tabs = [];
        fileCounter = 0;
        newTab();
    }
}

async function closeAllButThis() {
    if(tabs.length <= 1) return;
    if(await customConfirm("Close all other tabs? Unsaved changes will be lost.")) {
        tabs = tabs.filter(t => t.id === activeTabId);
        renderTabs();
    }
}

async function closeAllToLeft() {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    if(idx <= 0) return;
    if(await customConfirm("Close all tabs to the left? Unsaved changes will be lost.")) {
        tabs = tabs.slice(idx);
        renderTabs();
    }
}

async function closeAllToRight() {
    const idx = tabs.findIndex(t => t.id === activeTabId);
    if(idx === -1 || idx === tabs.length - 1) return;
    if(await customConfirm("Close all tabs to the right? Unsaved changes will be lost.")) {
        tabs = tabs.slice(0, idx + 1);
        renderTabs();
    }
}

function sortTabsAlphabetically() {
    tabs.sort((a, b) => a.title.localeCompare(b.title));
    renderTabs();
}

function getActiveTab() { 
    return tabs.find(t => t.id === activeTabId); 
}

function renderTabs() {
    tabbar.innerHTML = '';
    tabs.forEach(tab => {
        const isActive = tab.id === activeTabId ? 'active' : '';
        const iconClass = tab.isSaved ? 'saved' : 'unsaved';
        const iconSrc = tab.isSaved 
            ? "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/YnSqZRe.png" 
            : "https://proxy.duckduckgo.com/iu/?u=https://i.imgur.com/fE2wgSM.png";
        
        const tabEl = document.createElement('div');
        tabEl.className = `tab ${isActive}`;
        tabEl.onclick = () => switchTab(tab.id);
        
        // Native Right-Click Rename Hook
        tabEl.oncontextmenu = async (e) => {
            e.preventDefault();
            let newName = await customPrompt("Rename tab:", tab.title);
            if(newName !== null && newName.trim() !== "") {
                tab.title = newName;
                renderTabs();
            }
        };
        
        // --- Drag and Drop for Tabs ---
        tabEl.draggable = true;
        
        tabEl.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', tab.id);
            setTimeout(() => tabEl.classList.add('dragging'), 0);
        });
        
        tabEl.addEventListener('dragover', (e) => {
            e.preventDefault();
            tabEl.classList.add('drag-over');
        });
        
        tabEl.addEventListener('dragleave', (e) => {
            tabEl.classList.remove('drag-over');
        });
        
        tabEl.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            tabEl.classList.remove('drag-over');
            const draggedId = e.dataTransfer.getData('text/plain');
            if (draggedId && draggedId !== tab.id) {
                const draggedIndex = tabs.findIndex(t => t.id === draggedId);
                const targetIndex = tabs.findIndex(t => t.id === tab.id);
                if (draggedIndex !== -1 && targetIndex !== -1) {
                    const [draggedTab] = tabs.splice(draggedIndex, 1);
                    tabs.splice(targetIndex, 0, draggedTab);
                    renderTabs();
                }
            }
        });
        
        tabEl.addEventListener('dragend', (e) => {
            tabEl.classList.remove('dragging');
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('drag-over'));
        });
        // ------------------------------
        
        tabEl.innerHTML = `
            <img src="${iconSrc}" class="floppy-icon ${iconClass}" alt="save state">
            <span class="tab-title">${tab.title}</span>
            <span class="tab-close" onclick="closeTab(event, '${tab.id}')"></span>
        `;
        tabbar.appendChild(tabEl);
    });
    
    const activeTab = getActiveTab();
    if(activeTab) {
        document.title = `${activeTab.isSaved ? '' : '*'}${activeTab.title} - Notepad++ Clone`;
    }
}

// --- File Operations ---

function triggerFileOpen() { 
    document.getElementById('fileInput').click(); 
}

function handleFileOpen(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const ext = file.name.split('.').pop().toLowerCase();
        let lang = 'none';
        if (['html', 'htm'].includes(ext)) lang = 'html';
        else if (['js'].includes(ext)) lang = 'javascript';
        else if (['css'].includes(ext)) lang = 'css';
        else if (['json'].includes(ext)) lang = 'json';
        else if (['py'].includes(ext)) lang = 'python';
        else if (['php'].includes(ext)) lang = 'php';
        else if (['c'].includes(ext)) lang = 'c';
        else if (['cpp', 'cc', 'h', 'hpp'].includes(ext)) lang = 'cpp';
        else if (['cs'].includes(ext)) lang = 'csharp';
        else if (['java'].includes(ext)) lang = 'java';
        else if (['xml'].includes(ext)) lang = 'xml';
        else if (['yml', 'yaml'].includes(ext)) lang = 'yaml';
        else if (['bat', 'cmd'].includes(ext)) lang = 'batch';
        else if (['sh', 'bash'].includes(ext)) lang = 'bash';
        else if (['hws'].includes(ext)) lang = 'hollywood';

        newTab(file.name, content, lang);
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

function executeDownload(tab, fileName) {
    let fileContent = tab.content;
    let blobParts = [];
    
    if (tab.encoding === 'UTF-8 BOM') {
        blobParts.push(new Uint8Array([0xEF, 0xBB, 0xBF])); 
    } else if (tab.encoding === 'UTF-16 LE BOM') {
        blobParts.push(new Uint8Array([0xFF, 0xFE])); 
    } else if (tab.encoding === 'UTF-16 BE BOM') {
        blobParts.push(new Uint8Array([0xFE, 0xFF])); 
    }
    
    blobParts.push(fileContent);
    
    const blob = new Blob(blobParts, { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);

    tab.isSaved = true;
    renderTabs();
}

function saveCurrentFile() {
    const tab = getActiveTab();
    if(!tab) return;
    
    let fileName = tab.title;
    if (!fileName.includes('.')) {
        fileName = `${fileName}.${getExtensionForLang(tab.lang)}`;
    }
    
    executeDownload(tab, fileName);
}

async function saveCopyAs() {
    const tab = getActiveTab();
    if(!tab) return;
    
    let defaultExt = getExtensionForLang(tab.lang);
    let suggestedName = tab.title;
    if (!suggestedName.includes('.')) {
        suggestedName = `${suggestedName}.${defaultExt}`;
    }
    let newFileName = await customPrompt("Save Copy As... \n\nEnter file name with extension:", suggestedName);
    if (newFileName === null || newFileName.trim() === "") return; 
    
    executeDownload(tab, newFileName);
}

async function renameActiveTab() {
    const tab = getActiveTab();
    if(!tab) return;
    let newName = await customPrompt("Rename tab:", tab.title);
    if(newName !== null && newName.trim() !== "") {
        tab.title = newName;
        renderTabs();
    }
}

async function saveAsFile() {
    const tab = getActiveTab();
    if(!tab) return;
    
    let defaultExt = getExtensionForLang(tab.lang);
    let suggestedName = tab.title;
    if (!suggestedName.includes('.')) {
        suggestedName = `${suggestedName}.${defaultExt}`;
    }

    let newFileName = await customPrompt("Save As... \n\nEnter file name with extension:", suggestedName);
    
    if (newFileName === null || newFileName.trim() === "") {
        return; 
    }

    tab.title = newFileName;
    
    const ext = newFileName.split('.').pop().toLowerCase();
    let newLang = tab.lang;
    if (['html', 'htm'].includes(ext)) newLang = 'html';
    else if (['js'].includes(ext)) newLang = 'javascript';
    else if (['css'].includes(ext)) newLang = 'css';
    else if (['json'].includes(ext)) newLang = 'json';
    else if (['py'].includes(ext)) newLang = 'python';
    else if (['php'].includes(ext)) newLang = 'php';
    else if (['cpp', 'c', 'h'].includes(ext)) newLang = 'cpp';
    else if (['hws'].includes(ext)) newLang = 'hollywood';
    
    if (newLang !== tab.lang) {
        setLanguage(newLang);
    }

    executeDownload(tab, newFileName);
}

function saveAllFiles() {
    tabs.forEach(tab => {
        if(!tab.isSaved) {
            let fileName = tab.title;
            if (!fileName.includes('.')) {
                fileName = `${fileName}.${getExtensionForLang(tab.lang)}`;
            }
            
            let blobParts = [];
            if (tab.encoding === 'UTF-8 BOM') blobParts.push(new Uint8Array([0xEF, 0xBB, 0xBF])); 
            else if (tab.encoding === 'UTF-16 LE BOM') blobParts.push(new Uint8Array([0xFF, 0xFE])); 
            else if (tab.encoding === 'UTF-16 BE BOM') blobParts.push(new Uint8Array([0xFE, 0xFF])); 
            
            blobParts.push(tab.content);
            const blob = new Blob(blobParts, { type: "text/plain;charset=utf-8" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            tab.isSaved = true;
        }
    });
    renderTabs();
}

async function moveToRecycleBin() {
    if(await customConfirm("Move current file to Recycle Bin? (Simulated)")) {
        closeActiveTab();
    }
}

// ==========================================
// SESSION LOAD & SAVE
// ==========================================

function saveSession() {
    const sessionData = JSON.stringify({
        tabs: tabs,
        activeTabId: activeTabId,
        fileCounter: fileCounter
    }, null, 2);
    
    const blob = new Blob([sessionData], { type: "application/json" });
    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "session.json";
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}

function triggerSessionLoad() {
    document.getElementById('sessionInput').click();
}

function handleSessionLoad(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            if (data && Array.isArray(data.tabs)) {
                tabs = data.tabs;
                activeTabId = data.activeTabId;
                fileCounter = data.fileCounter || tabs.length;
                
                if (tabs.length > 0) {
                    let tabToSwitch = tabs.find(t => t.id === activeTabId);
                    if (!tabToSwitch) activeTabId = tabs[0].id;
                    switchTab(activeTabId);
                } else {
                    newTab();
                }
                customAlert("Session loaded successfully!");
            } else {
                customAlert("Invalid session file format.");
            }
        } catch (err) {
            customAlert("Failed to parse session file. Make sure it is a valid .json session.");
        }
    };
    reader.readAsText(file);
    event.target.value = ''; 
}

// ==========================================
// FIND AND REPLACE ENGINE
// ==========================================

function showFindModal(isReplace) {
    const modal = document.getElementById('find-modal');
    modal.style.display = 'block';
    centerModal(modal);
    
    document.getElementById('find-modal-title').textContent = isReplace ? 'Replace' : 'Find';
    document.getElementById('replace-row').style.display = isReplace ? 'flex' : 'none';
    document.getElementById('btn-replace').style.display = isReplace ? 'inline-block' : 'none';
    document.getElementById('btn-replace-all').style.display = isReplace ? 'inline-block' : 'none';
    
    let selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    if (selectedText && !selectedText.includes('\n')) {
        document.getElementById('find-input').value = selectedText;
    }
    
    document.getElementById('find-input').focus();
}

function closeFindModal() {
    document.getElementById('find-modal').style.display = 'none';
    editor.focus();
}

function doFindNext() {
    let query = document.getElementById('find-input').value;
    if (!query) return;
    
    let matchCase = document.getElementById('find-match-case').checked;
    let wrap = document.getElementById('find-wrap').checked;
    
    let text = editor.value;
    let pos = editor.selectionEnd; 
    
    let targetText = matchCase ? text : text.toLowerCase();
    let targetQuery = matchCase ? query : query.toLowerCase();
    
    let index = targetText.indexOf(targetQuery, pos);
    
    if (index === -1 && wrap) {
        index = targetText.indexOf(targetQuery, 0); 
    }
    
    if (index !== -1) {
        editor.focus();
        editor.setSelectionRange(index, index + query.length);
        editor.blur(); 
        editor.focus(); 
    } else {
        customAlert(`Cannot find "${query}"`);
    }
}

function doReplace() {
    let query = document.getElementById('find-input').value;
    let replacement = document.getElementById('replace-input').value;
    if (!query) return;
    
    let matchCase = document.getElementById('find-match-case').checked;
    let selectedText = editor.value.substring(editor.selectionStart, editor.selectionEnd);
    
    let isMatch = matchCase ? (selectedText === query) : (selectedText.toLowerCase() === query.toLowerCase());
    
    if (isMatch) {
        let success = false;
        try { success = document.execCommand('insertText', false, replacement); } catch(e){}
        if(!success) {
            editor.setRangeText(replacement, editor.selectionStart, editor.selectionEnd, 'end');
        }
        handleInput();
    }
    doFindNext();
}

function doReplaceAll() {
    let query = document.getElementById('find-input').value;
    let replacement = document.getElementById('replace-input').value;
    if (!query) return;
    
    let matchCase = document.getElementById('find-match-case').checked;
    
    let flags = matchCase ? 'g' : 'gi';
    let escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
    let regex = new RegExp(escapedQuery, flags);
    
    let text = editor.value;
    let newText = text.replace(regex, replacement);
    
    if(text !== newText) {
        editor.value = newText;
        handleInput();
        customAlert("Replace All completed.");
    } else {
        customAlert(`Cannot find "${query}"`);
    }
}

// ==========================================
// ABOUT, PREFERENCES & COMMAND LINE MODALS
// ==========================================

function showAboutModal() {
    const modal = document.getElementById('about-modal');
    modal.style.display = 'block';
    centerModal(modal);
}

function closeAboutModal() {
    document.getElementById('about-modal').style.display = 'none';
    editor.focus();
}

function showPrefModal() {
    const modal = document.getElementById('pref-modal');
    modal.style.display = 'block';
    centerModal(modal);
}

function closePrefModal() {
    document.getElementById('pref-modal').style.display = 'none';
    editor.focus();
}

function showCmdModal() {
    const modal = document.getElementById('cmd-modal');
    modal.style.display = 'block';
    centerModal(modal);
}

function closeCmdModal() {
    document.getElementById('cmd-modal').style.display = 'none';
    editor.focus();
}

function showShortcutModal() {
    const modal = document.getElementById('shortcut-modal');
    modal.style.display = 'block';
    centerModal(modal);
}

function closeShortcutModal() {
    document.getElementById('shortcut-modal').style.display = 'none';
    editor.focus();
}

function showPluginsInfo() {
    customAlert("Notepad++ plugins are compiled C++ DLL files that extend the functionality of the native desktop editor.\n\nBecause this is a web-based clone running in a Javascript browser environment, it cannot load or execute native desktop plugins.\n\nTo use plugins, please download the official Notepad++ desktop application for Windows.");
}

function showDebugInfo() {
    customAlert("Notepad++ Web Clone Debug Info:\n\nUser Agent: " + navigator.userAgent + "\nPlatform: " + navigator.platform);
}

function showSummary() {
    let text = editor.value;
    let chars = text.length;
    let words = text.split(/\s+/).filter(w => w.length > 0).length;
    let lines = text.split('\n').length;
    customAlert(`Summary:\n\nCharacters: ${chars}\nWords: ${words}\nLines: ${lines}`);
}

// ==========================================
// PREFERENCES LOGIC (TYPOGRAPHY)
// ==========================================

function changeFontSizePref() {
    let val = parseInt(document.getElementById('pref-font-size').value, 10);
    if(!isNaN(val) && val >= 8 && val <= 48) {
        currentZoom = val;
        zoomEditor(0);
    }
}

function changeFontFamilyPref() {
    let family = document.getElementById('pref-font-family').value;
    document.documentElement.style.setProperty('--editor-font-family', family);
    updateLineNumbers(editor.value);
    syncScroll();
}

function changeTabSizePref() {
    let size = parseInt(document.getElementById('pref-tab-size').value, 10);
    if(!isNaN(size) && size > 0 && size <= 16) {
        document.documentElement.style.setProperty('--editor-tab-size', size);
        updateLineNumbers(editor.value);
        syncScroll();
    }
}

// ==========================================
// UTILITY OPERATIONS & PLUGINS
// ==========================================

function toggleLineNumbers() {
    const wrapper = document.getElementById('editor-container');
    const btn = document.getElementById('btn-line-num');
    const prefCheck = document.getElementById('pref-line-numbers');
    const lnLayer = document.getElementById('line-numbers');
    
    if (lnLayer.style.display !== 'none') {
        lnLayer.style.display = 'none';
        btn.style.backgroundColor = 'transparent';
        btn.style.border = '1px solid transparent';
        if(prefCheck) prefCheck.checked = false;
    } else {
        lnLayer.style.display = 'block';
        btn.style.backgroundColor = '#d0e8ff';
        btn.style.border = '1px solid #a0a0a0';
        if(prefCheck) prefCheck.checked = true;
    }
    setTimeout(syncScroll, 10);
}

function toggleWordWrap() {
    const wrapper = document.getElementById('code-wrapper');
    const isWrap = wrapper.classList.toggle('word-wrap');
    const btnWrap = document.getElementById('btn-word-wrap');
    const viewCheck = document.getElementById('view-check-wordwrap');
    const prefCheck = document.getElementById('pref-word-wrap');
    
    if (isWrap) {
        editor.setAttribute('wrap', 'soft');
        btnWrap.style.backgroundColor = '#d0e8ff';
        btnWrap.style.border = '1px solid #a0a0a0';
        viewCheck.textContent = '✓ ';
        if(prefCheck) prefCheck.checked = true;
    } else {
        editor.setAttribute('wrap', 'off');
        btnWrap.style.backgroundColor = 'transparent';
        btnWrap.style.border = '1px solid transparent';
        viewCheck.textContent = '';
        if(prefCheck) prefCheck.checked = false;
    }
    
    updateLineNumbers(editor.value); 
    setTimeout(syncScroll, 10);
}

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {});
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

// Fullscreen event listener to sync Preferences checkbox
document.addEventListener('fullscreenchange', (event) => {
    const prefCheck = document.getElementById('pref-fullscreen');
    if (prefCheck) {
        prefCheck.checked = !!document.fullscreenElement;
    }
});

function toggleSpellCheck() {
    const prefCheck = document.getElementById('pref-spellcheck');
    editor.setAttribute('spellcheck', prefCheck.checked ? "true" : "false");
}

function toggleStatusBar() {
    const prefCheck = document.getElementById('pref-statusbar');
    const sb = document.getElementById('statusbar');
    sb.style.display = prefCheck.checked ? "flex" : "none";
    setTimeout(syncScroll, 10);
}

function toggleDistractionFree() {
    let isDF = document.body.classList.toggle('distraction-free');
    if (isDF) {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(err => {});
    } else {
        if (document.fullscreenElement) document.exitFullscreen().catch(err => {});
    }
    setTimeout(syncScroll, 100);
}

function exitDistractionFree() {
    document.body.classList.remove('distraction-free');
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {});
    }
    setTimeout(syncScroll, 100);
}

function togglePostIt() {
    document.body.classList.toggle('distraction-free');
    setTimeout(syncScroll, 100);
}

function toggleReadOnly() {
    editor.readOnly = !editor.readOnly;
    customAlert(editor.readOnly ? "Document locked (Read-Only)." : "Document unlocked.");
}

function viewInChrome() {
    const blob = new Blob([editor.value], {type: "text/plain"});
    window.open(URL.createObjectURL(blob), '_blank');
}

function emptyRecentFiles() {
    customAlert('Recent files list has been emptied.');
}

function insertDateTime() {
    const str = new Date().toLocaleString();
    let success = false;
    try { success = document.execCommand('insertText', false, str); } catch(e){}
    if(!success) {
        editor.setRangeText(str, editor.selectionStart, editor.selectionEnd, 'end');
    }
    handleInput();
}

function copyFullPath() {
    const tab = getActiveTab();
    if(tab) {
        const path = "C:\\Notepad++_Workspace\\" + tab.title;
        navigator.clipboard.writeText(path).then(() => {
            customAlert("File path copied to clipboard:\n" + path);
        }).catch(e => {
            customAlert("Failed to copy to clipboard.");
        });
    }
}

function increaseIndent() {
    let success = false;
    try { success = document.execCommand('insertText', false, '    '); } catch(e){}
    if(!success) {
        editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end');
    }
    handleInput();
}

function trimTrailingSpace() {
    editor.value = editor.value.replace(/[ \t]+$/gm, '');
    handleInput();
}

async function goToLine() {
    let ln = await customPrompt("Go to line:");
    if(ln !== null && !isNaN(ln) && ln > 0) {
        let lines = editor.value.split('\n');
        let pos = 0;
        for(let i=0; i<ln-1 && i<lines.length; i++) {
            pos += lines[i].length + 1;
        }
        editor.focus();
        editor.setSelectionRange(pos, pos);
    }
}

function duplicateCurrentLine() {
    let start = editor.selectionStart;
    let end = editor.selectionEnd;
    let text = editor.value;
    
    let lineStart = text.lastIndexOf('\n', start - 1) + 1;
    let lineEnd = text.indexOf('\n', end);
    if(lineEnd === -1) lineEnd = text.length;
    
    let lineText = text.substring(lineStart, lineEnd);
    let insertStr = '\n' + lineText;
    
    editor.setSelectionRange(lineEnd, lineEnd);
    let success = false;
    try { success = document.execCommand('insertText', false, insertStr); } catch(e){}
    if(!success) {
        editor.setRangeText(insertStr, lineEnd, lineEnd, 'end');
    }
    handleInput();
    
    editor.setSelectionRange(start + insertStr.length, end + insertStr.length);
}

function convertCase(type) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) return;
    
    const selected = editor.value.substring(start, end);
    const replaced = type === 'upper' ? selected.toUpperCase() : selected.toLowerCase();
    
    let success = false;
    try { success = document.execCommand('insertText', false, replaced); } catch(e){}
    if(!success) editor.setRangeText(replaced, start, end, 'end');
    
    editor.setSelectionRange(start, start + replaced.length);
    handleInput();
}

function triggerRun() {
    customAlert("To run this script, please save the file to your device and execute it locally.");
}

function getPhpHelp() {
    let start = editor.selectionStart;
    let end = editor.selectionEnd;
    let sel = editor.value.substring(start, end);
    if(!sel) sel = 'manual/en/index.php';
    window.open('https://www.php.net/' + encodeURIComponent(sel), '_blank');
}

function wikipediaSearch() {
    let start = editor.selectionStart;
    let end = editor.selectionEnd;
    let sel = editor.value.substring(start, end);
    if(!sel) return customAlert("Select a word to search Wikipedia.");
    window.open('https://en.wikipedia.org/wiki/Special:Search?search=' + encodeURIComponent(sel), '_blank');
}

// Web Crypto API implementations for Tools Generators
async function generateHash(type) {
    let start = editor.selectionStart;
    let end = editor.selectionEnd;
    let text = editor.value.substring(start, end);
    
    if (!text) {
        text = await customPrompt(`Enter text to generate ${type} hash:`);
        if (!text) return;
    }
    
    let hash = '';
    if (typeof CryptoJS !== 'undefined') {
        if (type === 'MD5') hash = CryptoJS.MD5(text).toString();
        else if (type === 'SHA-1') hash = CryptoJS.SHA1(text).toString();
        else if (type === 'SHA-256') hash = CryptoJS.SHA256(text).toString();
        else if (type === 'SHA-512') hash = CryptoJS.SHA512(text).toString();
    } else {
        customAlert("CryptoJS library failed to load.");
        return;
    }
    
    await customPrompt(`${type} Hash Result:`, hash);
}

function performBase64Encode() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) {
        customAlert("Please select text to encode first.");
        return;
    }
    const selected = editor.value.substring(start, end);
    try {
        const encoded = btoa(unescape(encodeURIComponent(selected)));
        let success = false;
        try { success = document.execCommand('insertText', false, encoded); } catch(e){}
        if(!success) editor.setRangeText(encoded, start, end, 'end');
        handleInput();
    } catch (e) {
        customAlert("Failed to encode text.");
    }
}

function performBase64Decode() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) {
        customAlert("Please select Base64 text to decode first.");
        return;
    }
    const selected = editor.value.substring(start, end);
    try {
        const decoded = decodeURIComponent(escape(atob(selected)));
        let success = false;
        try { success = document.execCommand('insertText', false, decoded); } catch(e){}
        if(!success) editor.setRangeText(decoded, start, end, 'end');
        handleInput();
    } catch (e) {
        customAlert("Failed to decode. Make sure the selection is valid Base64.");
    }
}

function convertToHex() {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    if (start === end) return customAlert("Select text to convert to HEX.");
    const selected = editor.value.substring(start, end);
    const hex = Array.from(selected).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
    let success = false;
    try { success = document.execCommand('insertText', false, hex); } catch(e){}
    if(!success) editor.setRangeText(hex, start, end, 'end');
    handleInput();
}

// ==========================================
// MULTIPLE MACRO ENGINE
// ==========================================

let isRecordingMacro = false;
let tempMacro = [];
let recordedMacro = [];

editor.addEventListener('input', function(e) {
    if (!isRecordingMacro) return;
    
    if (e.inputType === 'insertText' && e.data !== null) {
        tempMacro.push({ cmd: 'insertText', val: e.data });
    } else if (e.inputType === 'insertLineBreak') {
        tempMacro.push({ cmd: 'insertText', val: '\n' });
    } else if (e.inputType === 'deleteContentBackward') {
        tempMacro.push({ cmd: 'delete' }); 
    } else if (e.inputType === 'deleteContentForward') {
        tempMacro.push({ cmd: 'forwardDelete' });
    }
});

editor.addEventListener('paste', function(e) {
    if (!isRecordingMacro) return;
    let paste = (e.clipboardData || window.clipboardData).getData('text');
    tempMacro.push({ cmd: 'insertText', val: paste });
});

function startMacroRecording() {
    isRecordingMacro = true;
    tempMacro = [];
    
    const startBtn = document.querySelector('.tool-btn[title="Start Recording"]');
    if(startBtn) startBtn.style.backgroundColor = '#ffcccc'; 
    
    let currentTitle = document.title;
    document.title = currentTitle + " [RECORDING MACRO...]";
}

function stopMacroRecording() {
    if (!isRecordingMacro) return;
    isRecordingMacro = false;
    recordedMacro = [...tempMacro]; 
    
    const startBtn = document.querySelector('.tool-btn[title="Start Recording"]');
    if(startBtn) startBtn.style.backgroundColor = 'transparent';
    
    document.title = document.title.replace(" [RECORDING MACRO...]", "");
    customAlert("Macro recorded successfully! (" + recordedMacro.length + " actions saved)");
}

function playbackMacro(isMulti = false) {
    if (isRecordingMacro) {
        if(!isMulti) customAlert("Cannot playback while actively recording. Stop recording first.");
        return;
    }
    if (recordedMacro.length === 0) {
        if(!isMulti) customAlert("No macro recorded yet.");
        return;
    }
    
    editor.focus();
    
    recordedMacro.forEach(action => {
        if (action.cmd === 'insertText') {
            let success = false;
            try { success = document.execCommand('insertText', false, action.val); } catch(e){}
            if(!success) {
                editor.setRangeText(action.val, editor.selectionStart, editor.selectionEnd, 'end');
            }
        } else if (action.cmd === 'delete') {
            let success = false;
            try { success = document.execCommand('delete'); } catch(e){}
            if(!success && editor.selectionStart > 0) {
                editor.setRangeText('', editor.selectionStart === editor.selectionEnd ? editor.selectionStart - 1 : editor.selectionStart, editor.selectionEnd, 'end');
            }
        } else if (action.cmd === 'forwardDelete') {
            let success = false;
            try { success = document.execCommand('forwardDelete'); } catch(e){}
            if(!success && editor.selectionEnd < editor.value.length) {
                editor.setRangeText('', editor.selectionStart, editor.selectionStart === editor.selectionEnd ? editor.selectionEnd + 1 : editor.selectionEnd, 'end');
            }
        }
    });
    handleInput();
}

async function runMacroMultiple() {
    if (recordedMacro.length === 0) {
        customAlert("No macro recorded yet.");
        return;
    }
    let times = await customPrompt("How many times do you want to sequentially run this macro?", "5");
    if (times !== null) {
        let count = parseInt(times, 10);
        if (!isNaN(count) && count > 0) {
            editor.focus();
            for (let i = 0; i < count; i++) {
                playbackMacro(true);
            }
        }
    }
}

// ==========================================
// INITIALIZATION, MENUS, DRAG & SHORTCUTS
// ==========================================

function centerModal(modal) {
    modal.style.left = '50%';
    modal.style.top = '40%';
    modal.style.transform = 'translate(-50%, -50%)';
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Tabbar Drop Logic (Snap to the end)
    tabbar.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    tabbar.addEventListener('drop', (e) => {
        e.preventDefault();
        const draggedId = e.dataTransfer.getData('text/plain');
        if (draggedId) {
            const draggedIndex = tabs.findIndex(t => t.id === draggedId);
            if (draggedIndex !== -1) {
                const [draggedTab] = tabs.splice(draggedIndex, 1);
                tabs.push(draggedTab);
                renderTabs();
            }
        }
    });

    // Modal Drag Logic
    document.querySelectorAll('.modal').forEach(modal => {
        const header = modal.querySelector('.modal-header');
        if (!header) return;
        header.style.cursor = 'move';
        
        let isDragging = false;
        let startX, startY, initialX, initialY;

        header.addEventListener('mousedown', function(e) {
            if (e.target.tagName === 'BUTTON') return;
            isDragging = true;
            
            const rect = modal.getBoundingClientRect();
            if (window.getComputedStyle(modal).transform !== 'none') {
                modal.style.left = rect.left + 'px';
                modal.style.top = rect.top + 'px';
                modal.style.transform = 'none';
            }
            
            startX = e.clientX;
            startY = e.clientY;
            initialX = modal.offsetLeft;
            initialY = modal.offsetTop;
            
            e.preventDefault(); 
        });

        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            modal.style.left = (initialX + dx) + 'px';
            modal.style.top = (initialY + dy) + 'px';
        });

        document.addEventListener('mouseup', function() {
            isDragging = false;
        });
    });
    
    // CLICK-TO-OPEN MENU SYSTEM
    document.querySelectorAll('.menu-root').forEach(root => {
        root.addEventListener('mousedown', function(e) {
            if(e.target.tagName === 'INPUT' || e.target.tagName === 'LABEL') return;
            e.preventDefault(); 
            
            if (!e.target.closest('.dropdown')) {
                const isOpen = root.classList.contains('open');
                document.querySelectorAll('.menu-root').forEach(r => r.classList.remove('open'));
                if (!isOpen) {
                    root.classList.add('open');
                }
            }
        });
        
        root.addEventListener('mouseenter', function(e) {
            let anyOpen = Array.from(document.querySelectorAll('.menu-root')).some(r => r.classList.contains('open'));
            if (anyOpen && !root.classList.contains('open')) {
                document.querySelectorAll('.menu-root').forEach(r => r.classList.remove('open'));
                root.classList.add('open');
            }
        });
    });

    document.addEventListener('mousedown', function(e) {
        if (!e.target.closest('.menubar') && !e.target.closest('.menu-root')) {
            document.querySelectorAll('.menu-root').forEach(r => r.classList.remove('open'));
        }
    });

    document.querySelectorAll('.menu-item:not(.has-submenu)').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.menu-root').forEach(r => r.classList.remove('open'));
        });
    });

    document.querySelectorAll('.tool-btn').forEach(el => {
        el.addEventListener('mousedown', function(e) {
            e.preventDefault();
        });
    });
    
    newTab();
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if(document.body.classList.contains('distraction-free')) {
            exitDistractionFree();
        }
    }
    
    if (e.key === 'Tab') { 
        e.preventDefault(); 
        if (isRecordingMacro) tempMacro.push({ cmd: 'insertText', val: '    ' });
        let success = false;
        try { success = document.execCommand('insertText', false, '    '); } catch(e){}
        if(!success) {
            editor.setRangeText('    ', editor.selectionStart, editor.selectionEnd, 'end');
            handleInput();
        }
    }
    
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        showFindModal(false);
    }
    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        showFindModal(true);
    }
    if (e.key === 'F3') {
        e.preventDefault();
        if (document.getElementById('find-modal').style.display === 'block') {
            doFindNext();
        }
    }
    
    if (e.key === 'F5') {
        e.preventDefault();
        triggerRun();
    }

    if (e.key === 'F11') {
        e.preventDefault();
        toggleFullScreen();
    }
    
    if (e.key === 'F12') {
        e.preventDefault();
        togglePostIt();
    }

    if (e.altKey && e.key === 'F1') {
        e.preventDefault();
        getPhpHelp();
    }

    if (e.altKey && e.key === 'F3') {
        e.preventDefault();
        wikipediaSearch();
    }

    if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        goToLine();
    }
    
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setTextDirection('rtl');
    }

    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        setTextDirection('ltr');
    }

    if (e.key === 'F1') {
        e.preventDefault();
        showAboutModal();
    }

    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        playbackMacro();
    }
    
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveAsFile();
    }
    if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 's') { 
        e.preventDefault(); 
        saveCurrentFile(); 
    }
    if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'n') { 
        e.preventDefault(); 
        newTab(); 
    }
    if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'o') { 
        e.preventDefault(); 
        triggerFileOpen(); 
    }
    if (e.ctrlKey && !e.altKey && !e.shiftKey && e.key.toLowerCase() === 'w') { 
        e.preventDefault(); 
        closeActiveTab(); 
    }
});

// --- ZOOM WITH CTRL + SCROLL ---
document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault(); // Stop the whole page from zooming
        if (e.deltaY < 0) {
            zoomEditor(1);  // Scroll up = Zoom in
        } else if (e.deltaY > 0) {
            zoomEditor(-1); // Scroll down = Zoom out
        }
    }
}, { passive: false });