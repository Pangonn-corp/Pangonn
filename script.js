const TRAIL_STORAGE_KEY = 'isTrailEnabled';
const COLOR_STORAGE_KEY = 'primaryThemeColor';
const DEFAULT_COLOR = '#3625cc';
const TRAIL_SIZE = 50;

let squares = [];
let container;
let toggleButton;
let colorPicker;
let colorDisplay;

// --- TAB CLOAKER UTILITY FUNCTIONS ---
const changeTabTitle = () => {
    const input = document.getElementById('userinput').value;
    if (input) {
        document.title = input;
        localStorage.setItem('tabTitle', input);
    }
};

const changeTabIcon = () => {
    const input = document.getElementById('userinput').value;
    if (input) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = input;
        localStorage.setItem('tabIcon', input);
    }
};

const resetTabSettings = () => {
    document.title = "Extras | palmtree games";
    let link = document.querySelector("link[rel~='icon']");
    if (link) {
        link.href = 'images/favicon.ico';
    }
    localStorage.removeItem('tabTitle');
    localStorage.removeItem('tabIcon');
};
// Expose functions globally since they are called via onclick
window.changeTabTitle = changeTabTitle;
window.changeTabIcon = changeTabIcon;
window.resetTabSettings = resetTabSettings;

// --- Color Theme Logic ---
const applyThemeColor = (color) => {
    // Apply the color to the body's CSS variable
    document.documentElement.style.setProperty('--primary-color', color);
    localStorage.setItem(COLOR_STORAGE_KEY, color);
    if (colorDisplay) {
        colorDisplay.textContent = color;
    }
};

const loadThemeColor = () => {
    const storedColor = localStorage.getItem(COLOR_STORAGE_KEY);
    const initialColor = storedColor || DEFAULT_COLOR;
    
    // Set the picker's initial value
    if (colorPicker) {
        colorPicker.value = initialColor;
    }
    // Apply the color immediately
    applyThemeColor(initialColor);
};

// --- Core Grid Creation/Update Logic ---
const createGrid = () => {
    if (!container) return;
    
    // Clear existing squares
    container.innerHTML = ''; 
    
    const cols = Math.ceil(window.innerWidth / TRAIL_SIZE);
    const rows = Math.ceil(window.innerHeight / TRAIL_SIZE);
    
    squares = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const square = document.createElement('div');
            square.classList.add('grid-square');
            square.dataset.col = c;
            square.dataset.row = r;
            container.appendChild(square);
            squares.push(square);
        }
    }
};

// --- Mouse Tracking Logic ---
const handleMouseMove = (e) => {
    if (container.classList.contains('disabled')) return;
    
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const currentSquareCol = Math.floor(mouseX / TRAIL_SIZE);
    const currentSquareRow = Math.floor(mouseY / TRAIL_SIZE);

    squares.forEach(square => {
        const squareCol = parseInt(square.dataset.col);
        const squareRow = parseInt(square.dataset.row);

        const distanceCol = Math.abs(squareCol - currentSquareCol);
        const distanceRow = Math.abs(squareRow - currentSquareRow);
        const maxDistance = 3; 

        if (distanceCol <= maxDistance && distanceRow <= maxDistance) {
            square.classList.add('active');
        } else {
            square.classList.remove('active');
        }
    });
};

// --- Site-Wide Trail Toggle Logic ---
const updateTrailState = (isEnabled) => {
    if (!container) return; // Safety check
    
    if (isEnabled) {
        container.classList.remove('disabled');
        // Only update button text if the button actually exists
        if(toggleButton) {
           toggleButton.textContent = 'Turn Trail Off';
        }
        localStorage.setItem(TRAIL_STORAGE_KEY, 'true');
    } else {
        container.classList.add('disabled');
        if(toggleButton) {
           toggleButton.textContent = 'Turn Trail On';
        }
        localStorage.setItem(TRAIL_STORAGE_KEY, 'false');
    }
};

const toggleTrail = () => {
    const isEnabled = localStorage.getItem(TRAIL_STORAGE_KEY) !== 'false';
    updateTrailState(!isEnabled);
};

// --- Caesar Cipher Logic ---
const caesarCipher = (text, shift, action = 'encode') => {
    // If decoding, we reverse the shift direction
    if (action === 'decode') {
        shift = (26 - shift) % 26;
    }
    
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        
        // Only process letters
        if (char.match(/[a-z]/i)) {
            const charCode = text.charCodeAt(i);
            let baseCharCode;

            // Determine if the letter is uppercase (65-90) or lowercase (97-122)
            if (charCode >= 65 && charCode <= 90) {
                baseCharCode = 65; // 'A'
            } else if (charCode >= 97 && charCode <= 122) {
                baseCharCode = 97; // 'a'
            } else {
                // Should not happen, but safety fallback
                result += char;
                continue;
            }

            // Perform the shift
            const originalAlphabetPosition = charCode - baseCharCode;
            const newAlphabetPosition = (originalAlphabetPosition + shift) % 26;
            
            // Convert back to character
            char = String.fromCharCode(baseCharCode + newAlphabetPosition);
        }
        
        result += char;
    }
    
    return result;
};

const setupCipherTool = () => {
    const inputArea = document.getElementById('cipher-input');
    const shiftInput = document.getElementById('cipher-shift');
    const outputDiv = document.getElementById('cipher-output');
    const encodeBtn = document.getElementById('encode-btn');
    const decodeBtn = document.getElementById('decode-btn');

    if (!inputArea || !shiftInput || !outputDiv || !encodeBtn || !decodeBtn) {
        // Exit if elements for cipher tool are not on the page (like index.html)
        return;
    }

    const handleCipher = (action) => {
        const text = inputArea.value;
        const shift = parseInt(shiftInput.value) || 0;

        if (!text) {
            outputDiv.innerHTML = 'Please enter a message to process.';
            return;
        }
        
        // Ensure shift is valid (1-25)
        const safeShift = Math.max(1, Math.min(25, shift));
        if (shiftInput.value !== safeShift.toString()) {
            shiftInput.value = safeShift;
        }

        const result = caesarCipher(text, safeShift, action);
        outputDiv.innerHTML = result;
    };

    encodeBtn.addEventListener('click', () => handleCipher('encode'));
    decodeBtn.addEventListener('click', () => handleCipher('decode'));
    
    // Set initial output placeholder
    outputDiv.innerHTML = 'Encrypted or decrypted text will appear here.';
};

// --- Accordion Logic ---
const setupAccordion = () => {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.closest('.accordion-item');
            const content = header.nextElementSibling;
            const isActive = item.classList.contains('active');

            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = 0;
            } else {
                document.querySelectorAll('.accordion-item.active').forEach(activeItem => {
                    activeItem.classList.remove('active');
                    activeItem.querySelector('.accordion-content').style.maxHeight = 0;
                });
                
                item.classList.add('active');
                // Use scrollHeight for dynamically calculated content height
                content.style.maxHeight = content.scrollHeight + "px"; 
            }
        });
    });
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    container = document.getElementById('cursor-grid-container');
    toggleButton = document.getElementById('toggle-trail');
    colorPicker = document.getElementById('theme-color-picker');
    colorDisplay = document.getElementById('current-color-display');

    // 1. Load Tab Cloaker settings (Elements only exist on extras.html, but loading is harmless)
    const storedTitle = localStorage.getItem('tabTitle');
    const storedIcon = localStorage.getItem('tabIcon');
    if (storedTitle) document.title = storedTitle;
    if (storedIcon) changeTabIcon(storedIcon);

    // 2. Setup About:Blank Creator Listener (Elements only exist on extras.html)
    const createButton = document.getElementById('create');
    const urlTarget = document.getElementById('url-target');
    if (createButton && urlTarget) {
        createButton.addEventListener('click', () => {
            const url = urlTarget.value.trim();
            if (url) {
                const blankWindow = window.open('about:blank', '_blank');
                if (blankWindow) {
                    blankWindow.document.write('<iframe src="' + url + '" style="position:fixed; top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0; overflow:hidden; z-index:999999;"></iframe>');
                    blankWindow.document.close();
                }
            }
        });
    }

    // 3. Load and apply the theme color immediately
    loadThemeColor();
    
    // 4. Setup Accordion (Elements only exist on extras.html)
    setupAccordion();

    // 5. Setup Theme Picker Listener (Elements only exist on extras.html)
    if (colorPicker) {
        colorPicker.addEventListener('input', (e) => {
            applyThemeColor(e.target.value);
        });
    }

    // 6. Setup Trail Control (CLEANER FIX)
    // Check for the container first. This is all that is needed to start the trail.
    if (container) {
        let isTrailOn;
        const storedState = localStorage.getItem(TRAIL_STORAGE_KEY);

        // Determine initial state
        if (storedState === null) {
            isTrailOn = true;
            localStorage.setItem(TRAIL_STORAGE_KEY, 'true');
        } else {
            isTrailOn = storedState === 'true';
        }

        // Apply state and create grid if trail is enabled
        updateTrailState(isTrailOn);
        createGrid(); 
        
        // Setup event listeners for mouse and resize
        window.addEventListener('resize', createGrid);
        document.addEventListener('mousemove', handleMouseMove);
        
        // ONLY setup the toggle button listener if the button exists on the page (extras.html)
        if (toggleButton) {
             toggleButton.addEventListener('click', toggleTrail);
             // Ensure initial button text is correct
             updateTrailState(isTrailOn);
        }
    }

    // 7. Setup Cipher Tool (Now checks if elements exist inside the function)
    setupCipherTool();
});

// The loadThemeColor function must be callable independently to apply the theme
// on other pages that don't have the color picker, so we make it global.
window.loadThemeColor = loadThemeColor;