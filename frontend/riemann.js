// Deklarasi Variabel Global
const canvas = document.getElementById('c');
const ctx = canvas ? canvas.getContext('2d') : null;
const moduleToggleButton = document.getElementById('module-complete-toggle');

// Function maps (for presets)
const fnMap = {
    'sin(x)+1': x => Math.sin(x) + 1,
    '-0.5*x+3': x => -0.5 * x + 3,
    '-x^2+4': x => -x * x + 4,
    '-x^3+8': x => -x * x * x + 8,
    'e^x': x => Math.exp(x)
};
const fnInteg = {
    'sin(x)+1': x => -Math.cos(x) + x,
    '-0.5*x+3': x => -0.25 * x * x + 3 * x,
    '-x^2+4': x => -1/3 * x * x * x + 4 * x,
    '-x^3+8': x => -1/4 * x * x * x * x + 8 * x,
    'e^x': x => Math.exp(x)
};

// Get HTML elements
const fnSelect = document.getElementById('fnSelect');
const fnCustomInput = document.getElementById('fnCustomInput');
const methodInput = document.getElementById('method');
const aInput = document.getElementById('a');
const bInput = document.getElementById('b');
const nInput = document.getElementById('n');
const nLabel = document.getElementById('nLabel');
const rsumEl = document.getElementById('rsum');
const integEl = document.getElementById('integ');
const errEl = document.getElementById('err');
const customNote = document.getElementById('customNote');

let currentFunctionEvaluator;
let isCustomMode = false;

// Function to compile and evaluate the new function using Math.js (only for custom input)
function compileCustomFunction(fnString) {
    try {
        const compiled = math.compile(fnString);
        currentFunctionEvaluator = (x) => compiled.evaluate({ x: x });
        return true;
    } catch (e) {
        console.error("Syntax error in custom function:", e.message);
        rsumEl.textContent = "Syntax Error";
        return false;
    }
}

// Helper to evaluate the currently set function
function evaluateFn(x) {
    if (currentFunctionEvaluator) {
        try {
            return currentFunctionEvaluator(x);
        } catch (e) {
            return NaN;
        }
    }
    return 0;
}

// Draw axes
function drawAxes(a, b, minY, maxY) {
    if (!ctx) return;
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    const x0 = (0 - a) / (b - a) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, canvas.height);
    ctx.stroke();

    const y0 = canvas.height - (0 - minY) / (maxY - minY) * canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(canvas.width, y0);
    ctx.stroke();
}

// Draw Riemann sum and return total sum
function drawRiemann(a, b, n, method) {
    if (!ctx) return 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let minY = Infinity, maxY = -Infinity;
    const pointsToSample = 200;
    for (let i = 0; i <= pointsToSample; i++) {
        const x = a + (b - a) * i / pointsToSample;
        const y = evaluateFn(x);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    
    minY = Math.min(minY, 0);
    maxY = Math.max(maxY, 0);
    
    const yRange = maxY - minY;
    minY -= yRange * 0.1;
    maxY += yRange * 0.1;

    drawAxes(a, b, minY, maxY);

    let riesum = 0;
    const dx = (b - a) / n;

    for (let i = 0; i < n; i++) {
        let x = a + i * dx;
        let height;

        if (method === 'left') height = evaluateFn(x);
        else if (method === 'right') height = evaluateFn(x + dx);
        else if (method === 'mid') height = evaluateFn(x + dx/2);
        
        riesum += dx * height;

        const scaledX = (x - a) / (b - a) * canvas.width;
        const scaledDX = dx / (b - a) * canvas.width;
        
        const scaledY0 = canvas.height - (0 - minY) / (maxY - minY) * canvas.height;
        const scaledY = canvas.height - (height - minY) / (maxY - minY) * canvas.height;
        
        const rectHeight = Math.abs(scaledY - scaledY0);
        const rectY = Math.min(scaledY, scaledY0); 

        ctx.fillStyle = (height >= 0) ? '#00cfa2' : '#ff6347'; 
        ctx.fillRect(scaledX, rectY, scaledDX, rectHeight);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#08101a';
    ctx.lineWidth = 3;
    for (let i = 0; i <= 500; i++) {
        const x = a + (b - a) * i / 500;
        const y = evaluateFn(x);
        const px = (x - a) / (b - a) * canvas.width;
        const py = canvas.height - (y - minY) / (maxY - minY) * canvas.height;
        
        if (isFinite(py)) {
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        } else {
            ctx.moveTo(px, py); 
        }
    }
    ctx.stroke();

    return riesum;
}

// Handles showing/hiding the custom input box
function toggleCustomInput() {
    isCustomMode = fnSelect.value === 'custom';

    if (isCustomMode) {
        fnCustomInput.classList.remove('hidden');
        integEl.style.display = 'none';
        errEl.style.display = 'none';
        customNote.style.display = 'inline';
    } else {
        fnCustomInput.classList.add('hidden');
        integEl.style.display = 'inline';
        errEl.style.display = 'inline';
        customNote.style.display = 'none';
    }
    update();
}

// Update everything
function update() {
    const method = methodInput.value;
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    const n = parseInt(nInput.value);

    if (isNaN(a) || isNaN(b) || a >= b) {
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        rsumEl.textContent = "Invalid bounds [a, b]!";
        integEl.textContent = "-";
        errEl.textContent = "-";
        return;
    }

    nLabel.textContent = n;

    let riesum;
    let exact = NaN;

    if (isCustomMode) {
        const fnString = fnCustomInput.value;
        if (compileCustomFunction(fnString)) {
            riesum = drawRiemann(a, b, n, method);
        } else {
            return; 
        }
        integEl.textContent = "-";
        errEl.textContent = "-";
    } else {
        const fnKey = fnSelect.value;
        currentFunctionEvaluator = fnMap[fnKey];
        riesum = drawRiemann(a, b, n, method);

        const integFn = fnInteg[fnKey];
        exact = integFn(b) - integFn(a);
        
        integEl.textContent = exact.toFixed(6);
        errEl.textContent = Math.abs(riesum - exact).toFixed(6);
    }

    if (!isNaN(riesum)) {
        rsumEl.textContent = riesum.toFixed(6);
    } else {
        rsumEl.textContent = "-";
    }
}


/*************************************
  MODULE PROGRESS TRACKER (INTEGRASI BACKEND)
**************************************/

const MODULE_ID = 'riemann'; 
const STORAGE_KEY_MODULE = `calviz_module_${MODULE_ID}_complete`;
const API_URL = "https://calviz-server-production.up.railway.app/api/progress";

async function fetchModuleStatus() {
    try {
        const res = await fetch(`${API_URL}/get`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (res.status === 401) {
            localStorage.removeItem(STORAGE_KEY_MODULE);
            return false;
        }

        if (!res.ok) throw new Error('Failed to fetch progress from server');
        
        const data = await res.json();
        const isCompleted = data.progress[MODULE_ID] || false;
        
        if (isCompleted) {
            localStorage.setItem(STORAGE_KEY_MODULE, 'true');
        } else {
            localStorage.removeItem(STORAGE_KEY_MODULE);
        }
        updateModuleButton(isCompleted);
        return true;
        
    } catch (error) {
        console.warn(`[Riemann Module] Server check failed. Using local status.`, error);
        loadLocalModuleStatus();
        return false;
    }
}

function loadLocalModuleStatus() {
    const isComplete = localStorage.getItem(STORAGE_KEY_MODULE) === 'true';
    updateModuleButton(isComplete);
}

function updateModuleButton(isComplete) {
    if (!moduleToggleButton) return;
    if (isComplete) {
        moduleToggleButton.textContent = 'Module Complete ✓';
        moduleToggleButton.style.backgroundColor = '#00a6cf';
        document.querySelectorAll('.card').forEach(card => card.classList.add('read'));
    } else {
        moduleToggleButton.textContent = 'Mark Module as Complete';
        moduleToggleButton.style.backgroundColor = '#6200ff';
        document.querySelectorAll('.card').forEach(card => card.classList.remove('read'));
    }
}

window.toggleModuleStatus = async function() {
    const isCurrentlyComplete = localStorage.getItem(STORAGE_KEY_MODULE) === 'true';
    const newStatus = !isCurrentlyComplete;
    
    try {
        const res = await fetch(`${API_URL}/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleId: MODULE_ID, status: newStatus }),
            credentials: 'include'
        });

        if (res.status === 401) {
             alert("Anda harus login untuk menyimpan progres module!");
             return; 
        }
        
        if (!res.ok) throw new Error('Server returned error on save.');

        if (newStatus) {
            localStorage.setItem(STORAGE_KEY_MODULE, 'true');
        } else {
            localStorage.removeItem(STORAGE_KEY_MODULE);
        }
        updateModuleButton(newStatus);
        
        const data = await res.json();
        console.log(`[Riemann Module] Server Save Success: ${data.message}`);

    } catch(err) {
        alert(`Gagal menyimpan progres ke server: ${err.message}. Progres hanya disimpan di browser.`);
        console.error("❌ PROGRESS SAVE FAILED:", err);
        if (newStatus) {
            localStorage.setItem(STORAGE_KEY_MODULE, 'true');
        } else {
            localStorage.removeItem(STORAGE_KEY_MODULE);
        }
        updateModuleButton(newStatus);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    
    const moduleCard = document.querySelector('.module-status-card');
    
    if (moduleCard && !moduleCard.classList.contains('logged-out-hide')) {
        await fetchModuleStatus(); 
    } else {
        loadLocalModuleStatus();
    }
    
    if (fnSelect) fnSelect.addEventListener('change', toggleCustomInput); 
    if (fnCustomInput) fnCustomInput.addEventListener('input', update);
    if (methodInput) methodInput.addEventListener('change', update);
    if (aInput) aInput.addEventListener('input', update);
    if (bInput) bInput.addEventListener('input', update);
    if (nInput) nInput.addEventListener('input', update);
    
    if (moduleToggleButton) moduleToggleButton.addEventListener('click', window.toggleModuleStatus);
    
    if (fnSelect) toggleCustomInput();
});
