# <img width="32" alt="icon" src="https://github.com/user-attachments/assets/97be996c-9358-413e-9c94-7476f3555194" />  Notepad++ Web Clone

This is the guide for the Notepad++ Web Clone. This application is a fully client-side web application designed to meticulously replicate the look, feel, and functionality of the classic Notepad++ desktop software within a browser sandbox.

---

## 1. User Interface & Layout

The interface is divided into five primary horizontal zones, strictly matching the native Scintilla-based UI.

<img width="895" height="463" alt="image" src="https://github.com/user-attachments/assets/bf84f816-3cbf-4d86-9406-ad75e8becacc" />

### The Menu Bar
The top-level navigation bar has been stripped of standard web CSS `:hover` states. Instead, it utilizes a "Click-to-Open" state tracker. You must click a root menu (e.g., **File**) to open it. Once open, you can glide your mouse across the other root menus (Edit, View, Settings, etc.) to fluidly switch between them, mimicking a native OS application window.
<img width="895" height="23" alt="image" src="https://github.com/user-attachments/assets/42951c25-6884-4878-b9bb-a3b942e870d0" />


### The Toolbar
The toolbar contains 32 quick-action buttons utilizing official proxy-routed resource icons. The buttons feature a custom `pointer-events: none` image lock, ensuring that clicking the icon perfectly triggers the underlying button mechanics.
* **Active States:** Features like Word Wrap and Macro Recording will change the background color of their respective toolbar buttons when active.
<img width="895" height="29" alt="image" src="https://github.com/user-attachments/assets/4db23a05-2fe5-40d7-82f9-c266747d7158" />


### The Status Bar
Located at the absolute bottom of the screen, the Status Bar updates in real-time as you type, click, or change settings. It displays:
* **Document Type:** (e.g., "Normal text file", "JAVASCRIPT source file")
* **Document Metrics:** Total length (character count) and total line count.
* **Cursor Position:** Current Line (`Ln`), Column (`Col`), and absolute character Position (`Pos`).
* **Encoding & EOL:** Displays the active Line Ending format (CR LF) and character encoding (UTF-8).
<img width="895" height="20" alt="image" src="https://github.com/user-attachments/assets/b9b1e9f2-31c1-405a-869e-f4573bde75c7" />

---

## 2. Core Editor Mechanics

### The Grid-Snapping Word Wrap Engine
Word wrapping in a web browser is notoriously difficult to align with line numbers because standard HTML and `<textarea>` elements calculate word breaks differently. This clone solves this using a **Shadow DOM Engine**.
<img width="895" height="463" alt="image" src="https://github.com/user-attachments/assets/d8689a1c-8b93-416f-b992-97c9a6d0f700" />

* **How it works:** When Word Wrap is enabled, the app generates an invisible, mathematically identical `<div>` behind the text area. Aggressive CSS forces the browser to wrap text at the exact same physical pixel in both layers.
* **Anti-Drift Technology:** The engine measures the browser's native wrap height and aggressively rounds it to the nearest exact multiple of the font's line-height (`Math.round(h / lh) * lh`), making vertical sub-pixel drifting mathematically impossible.

### Vibrant Syntax Highlighting
The editor intercepts your keystrokes and feeds them through a customized PrismJS lexer. We have overridden the default web-safe colors to perfectly match the harsh, vibrant C++ Scintilla highlighter used in the native desktop app (Pure Blue for tags, Pure Red for attributes, Green for comments).

<img width="895" height="463" alt="image" src="https://github.com/user-attachments/assets/9d114251-79f6-4d1e-8ea4-155f56bbf591" />

### RTL / LTR Text Direction
For users working with Right-to-Left languages, the editor supports dynamic direction flipping (`Ctrl+Alt+R` / `Ctrl+Alt+L`). This injects a native CSS state that instantly flips the text area, the highlight layer, and the invisible word-wrap shadow to align perfectly to the right side of the screen.

---

## 3. File & Tab Management

### Dynamic Tab States & Renaming
The Tab Bar allows infinite multi-tasking. 
* **Save States:** Tabs feature dynamic floppy disk icons. A saved/unmodified tab displays a Blue disk. Once you type a character, it instantly swaps to a Red disk.
* **Renaming:** Right-clicking any tab intercepts the browser's native context menu and spawns a custom prompt allowing you to rename the file instantly.
<img width="400" height="31" alt="image" src="https://github.com/user-attachments/assets/de59c963-def8-4f0b-a6f0-60add6ab60e4" />

### Smart Saving & Extensions
When you select **File > Save As**, the application prompts you for a name. If you do not provide a file extension (like `.txt`), the editor checks your currently selected language from the **Language** menu (e.g., Python, Batch, Hollywood) and automatically appends the correct extension (`.py`, `.bat`, `.hws`) before pushing the download to your local machine.

<img width="320" height="156" alt="image" src="https://github.com/user-attachments/assets/e1000c41-b86c-4dbf-b70c-d075b1d93554" />

### Hexadecimal BOM Injection
If you alter the file encoding via the **Encoding** menu (e.g., to `UTF-8 BOM` or `UTF-16 LE BOM`), the saving engine intercepts the download Blob and physically injects the raw Hexadecimal Byte Order Mark (`0xEF, 0xBB, 0xBF` etc.) into the first bytes of the file.

### Session Management
* **Save Session:** Compiles all open tabs, their contents, active states, and titles into a structured `.json` workspace file and downloads it.
* **Load Session:** Uploading a previously saved `.json` session file will instantly reconstruct your entire workspace, restoring all tabs and text.

---

## 4. Search & Navigation

### Universal Find & Replace
Accessed via `Ctrl+F` or `Ctrl+H`, the custom Search Modal is fully draggable and supports complex matching.
* **Regex Generation:** Toggling "Match case" or "Wrap around" dynamically alters the JavaScript regular expression flags (`g` vs `gi`) on the fly to execute mathematically perfect search-and-replace operations.
<img width="895" height="463" alt="image" src="https://github.com/user-attachments/assets/3415ef90-d206-4741-8ca8-09a4a98e93d8" />

### Jump Navigation
* **Go To Line (`Ctrl+G`):** Prompts for a line number, loops through the text array to calculate the exact string index character position, and forces the blinking cursor to teleport to that exact line.

---

## 5. Tools, Macros, & Cryptography

### Live Macro Recorder
The editor features a sequential memory engine capable of recording your keystrokes.
* **Recording:** Click **Start Recording** (the toolbar button will turn red, and the window title will change to `[RECORDING MACRO...]`). It tracks typing, backspaces, deletes, line breaks, and even clipboard pasting.
* **Playback:** Press `Ctrl+Shift+P` to execute your recorded macro instantly, or use **Run a Macro Multiple Times...** to loop the recorded keystrokes `X` amount of times.
<img width="895" height="463" alt="image" src="https://github.com/user-attachments/assets/d466d3c3-d07f-4ae8-a728-d53cf4f25436" />

### Cryptographic Hash Generators
Located under **Tools**, the editor utilizes the CryptoJS library to generate enterprise-grade hashes.
* Highlight a string of text and select MD5, SHA-1, SHA-256, or SHA-512 to instantly generate the hash. 
* If no text is highlighted, the engine will spawn a custom prompt asking for the string you wish to encrypt.
<img width="320" height="163" alt="image" src="https://github.com/user-attachments/assets/acf5e909-32f4-405d-a8af-7f83e506db31" />


### Base64 & Hex Converters
Found under **Plugins > MIME Tools / Converter**, you can instantly encode or decode highlighted text into Base64 blocks, or convert standard ASCII characters into spaced Hexadecimal strings.
<img width="895" height="171" alt="image" src="https://github.com/user-attachments/assets/bcff35af-364d-4371-ab42-efe882fbc648" />

---

## 6. Settings & View Modes

### The Preferences Modal
Accessed via **Settings > Preferences**, this draggable modal features a classic sidebar layout allowing you to customize the editor engine.
* **Typography:** Dynamically change the Font Size, Font Family (Courier New, Consolas, Lucida Console), and Tab Spacing size. Changes cascade instantly through the DOM without breaking word-wrap alignments.
* **Editor Settings:** Toggle Word Wrap, Line Numbers, Native Browser Spellchecker (red squiggly lines), and Status Bar visibility.
<img width="500" height="431" alt="image" src="https://github.com/user-attachments/assets/4700df16-78b5-4436-9f12-78b0d75f637f" />


### Shortcut Mapper
Found under **Settings > Shortcut Mapper**, this spawns a modal containing a cleanly formatted, scrollable CSS grid documenting all 28 active keyboard shortcuts actively mapped to the application's event listeners.

<img width="500" height="481" alt="image" src="https://github.com/user-attachments/assets/314c36f2-6ba2-4b76-9e6f-1c7b037cffbb" />


### Distraction Free & Post-It Modes
For ultimate focus, these view modes strip away the Menu Bar, Toolbar, Tab Bar, and Status Bar.
* **Distraction Free:** Enters native OS Fullscreen and hides all UI.
* **Post-It Mode (`F12`):** Hides all UI but keeps the window in its standard browser state.
* **Exit Hint:** When active, a sleek, semi-transparent button floats in the top right corner reading "Press ESC or Click to Exit", ensuring users never get trapped in the UI-less state.
<img width="895" height="458" alt="image" src="https://github.com/user-attachments/assets/1e40d9f4-3503-4c17-b4c2-2162c53ddfac" />

---

## 7. The Educational "Mock" Engine

Because this is a web-browser-based clone, certain native C++ desktop features are physically impossible to execute (e.g., reading local system directories, parsing C++ DLL plugins, or utilizing OS-level threading).

Rather than clicking a button and having nothing happen, the application features an **Explanation Routing Engine**. When you click an impossible feature (like *Plugins Admin*, *Folder as Workspace*, or *Code Folding*), the engine analyzes the request and spawns a window explaining the exact technical reason why a browser sandbox prevents that specific feature, advising the user to download the native Windows application.

<img width="448" height="240" alt="image" src="https://github.com/user-attachments/assets/08e486a2-29ff-4e26-b243-c498b76b175f" />

## 📂 File Structure

The project has been cleanly separated into three core files for easy reading and maintenance:

* `index.html`: Contains the structural DOM, UI elements, modals, SVG proxy icons, and external library CDN links.
* `style.css`: Houses the native desktop UI resets, draggable window styling, CSS-grid math variables, and the custom Scintilla-style syntax highlighting overrides.
* `script.js`: The central brain. Handles array-based state management, DOM manipulation, asynchronous dialog routing, macro recording arrays, and the word-wrap mathematical engine.

## 🚀 How to Run

Because this application relies entirely on client-side Vanilla JavaScript, no build steps, Node packages, or servers are required.

1. Clone or download the repository.
2. Ensure `index.html`, `style.css`, and `script.js` are in the same folder.
3. Simply double-click `index.html` to open it in your default web browser.

## 🧰 Built With
* **HTML5 / CSS3 / Vanilla JavaScript (ES6)**
* **[PrismJS](https://prismjs.com/):** For base syntax tokenization.
* **[CryptoJS](https://cryptojs.gitbook.io/docs/):** For the native Hash Generator tools.
