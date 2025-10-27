// Deklarasi Variabel Global
const canvas = document.getElementById("series");
const ctx = canvas.getContext("2d");
const moduleToggleButton = document.getElementById('module-complete-toggle');

const fnInput = document.getElementById('fnInput');
const aInput = document.getElementById('a');
const bInput = document.getElementById('b');
const xInput = document.getElementById('x');
const termsInput = document.getElementById('terms');
const termsLabel = document.getElementById('termsLabel');
const approx = document.getElementById('approx');
const exact = document.getElementById('exact');
const err = document.getElementById('err');
const xLabel = document.getElementById('xLabel');

/*************************************
            Helper Functions
**************************************/
function factorial(n) {
    return n <= 1 ? 1 : n * factorial(n - 1);
}

function mapX(x, a, b) {
    return (x - a) / (b - a) * canvas.width;
}

function mapY(y, minY, maxY) {
    return canvas.height - (y - minY) / (maxY - minY) * canvas.height;
}

function drawAxes(a, b, minY, maxY) {
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;

    // y-axis
    const x0 = (0 - a) / (b - a) * canvas.width;
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0, canvas.height); 
    ctx.stroke();

    // x-axis
    const y0 = mapY(0, minY, maxY); 
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(canvas.width, y0); 
    ctx.stroke();
}

/*************************************
            Maclaurin Series Functions
**************************************/
function MLInv(x, terms) {
    let sum = 0;
    for (let n = 0; n < terms; n++) sum += Math.pow(x, n);
    return sum;
}

function MLLn(x, terms) {
    let sum = 0;
    for (let n = 1; n <= terms; n++)
        sum += Math.pow(-1, n + 1) * Math.pow(x, n) / n;
    return sum;
}

function MLExp(x, terms) {
    let sum = 0;
    for (let n = 0; n < terms; n++)
        sum += Math.pow(x, n) / factorial(n);
    return sum;
}

function MLSin(x, terms) {
    let sum = 0;
    for (let n = 0; n < terms; n++)
        sum += Math.pow(-1, n) * Math.pow(x, 2 * n + 1) / factorial(2 * n + 1);
    return sum;
}

function MLCos(x, terms) {
    let sum = 0;
    for (let n = 0; n < terms; n++)
        sum += Math.pow(-1, n) * Math.pow(x, 2 * n) / factorial(2 * n);
    return sum;
}

/*************************************
            Function References
**************************************/
const fnMaclaurin = {
    inv: MLInv,
    ln:  MLLn,
    exp: MLExp,
    sin: MLSin,
    cos: MLCos,
};

const fnReal = {
    inv: (x) => 1 / (1 - x),
    ln:  (x) => Math.log(1 + x), 
    exp: (x) => Math.exp(x),
    sin: (x) => Math.sin(x),
    cos: (x) => Math.cos(x),
};

/*************************************
            Drawing Functions
**************************************/
function drawSeries(fnM, fnR, a, b, terms) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute Y bounds
    let minY = Infinity, maxY = -Infinity;
    const threshold = 100;
    for (let i = 0; i <= 100; i++) {
        const xi = a + (b - a) * i / 100;
        
        const yM = fnM(xi, terms);
        if (yM > -threshold && yM < threshold) {
            if (yM < minY) minY = yM;
            if (yM > maxY) maxY = yM;
        }
        const yR = fnR(xi);
        if (yR > -threshold && yR < threshold) {
            if (yR < minY) minY = yR;
            if (yR > maxY) maxY = yR;
        }
    }
    
    // Default check if range is too narrow
    if (minY === Infinity || maxY === -Infinity || minY === maxY) {
        minY = -2;
        maxY = 2;
    }

    const margin = 0.1 * (maxY - minY);
    minY -= margin;
    maxY += margin;


    drawAxes(a, b, minY, maxY);

    // Draw real function (Blue)
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    let isPenDown = false;
    for (let px = a; px <= b; px += 0.01) {
        const y = fnR(px);
        const py = mapY(y, minY, maxY);

        if (isFinite(py) && py > -1000 && py < 1000) {
            if (isPenDown) {
                ctx.lineTo(mapX(px, a, b), py);
            } else {
                ctx.moveTo(mapX(px, a, b), py);
                isPenDown = true;
            }
        } else {
            isPenDown = false;
        }
    }
    ctx.stroke();

    // Draw Maclaurin approximation (Red)
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    isPenDown = false;
    for (let px = a; px <= b; px += 0.01) {
        const yApprox = fnM(px, terms);
        const pyApprox = mapY(yApprox, minY, maxY);
        
        if (isFinite(pyApprox) && pyApprox > -1000 && pyApprox < 1000) {
            if (isPenDown) {
                ctx.lineTo(mapX(px, a, b), pyApprox);
            } else {
                ctx.moveTo(mapX(px, a, b), pyApprox);
                isPenDown = true;
            }
        } else {
            isPenDown = false;
        }
    }
    ctx.stroke();

    // Draw cursor points
    const x = parseFloat(xInput.value);
    const yApprox = fnM(x, terms);
    const y = fnR(x);
    
    // Draw dot for Maclaurin approx
    ctx.fillStyle = "red"; 
    ctx.beginPath();
    ctx.arc(mapX(x, a, b), mapY(yApprox, minY, maxY), 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw dot for Real function
    ctx.fillStyle = "blue"; 
    ctx.beginPath();
    ctx.arc(mapX(x, a, b), mapY(y, minY, maxY), 4, 0, 2 * Math.PI);
    ctx.fill();
}


/*************************************
            Update Function
**************************************/
function update() {
    const fn = fnInput.value;
    const fnM = fnMaclaurin[fn];
    const fnR = fnReal[fn];
    const a = parseFloat(aInput.value);
    const b = parseFloat(bInput.value);
    const x = parseFloat(xInput.value);
    const terms = parseInt(termsInput.value);

    // Basic validation
    if (isNaN(a) || isNaN(b) || a >= b) return;


    termsLabel.textContent = terms;
    xLabel.textContent = x;

    const approxUp = fnM(x, terms);
    const exactUp = fnR(x);
    
    if (isFinite(approxUp)) {
        approx.textContent = approxUp.toExponential(3);
    } else {
        approx.textContent = "NaN";
    }
    
    if (isFinite(exactUp)) {
        exact.textContent = exactUp.toExponential(3);
        if(isFinite(approxUp)) {
            err.textContent = Math.abs(approxUp - exactUp).toExponential(3);
        } else {
            err.textContent = "NaN";
        }
    } else {
        exact.textContent = "NaN";
        err.textContent = "NaN";
    }
    
    xInput.min = a;
    xInput.max = b;
    xInput.step = (b - a) / 50; 
    drawSeries(fnM, fnR, a, b, terms);
}

/*************************************
  MODULE PROGRESS TRACKER (INTEGRASI BACKEND)
**************************************/

const MODULE_ID = 'series'; 
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
        console.warn(`[Series Module] Server check failed. Using local status.`, error);
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
        console.log(`[Series Module] Server Save Success: ${data.message}`);

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
    
    [fnInput, aInput, bInput, xInput, termsInput].forEach(el =>
        el.addEventListener('input', update)
    );
    
    if (moduleToggleButton) moduleToggleButton.addEventListener('click', window.toggleModuleStatus);
    
    update();
});
