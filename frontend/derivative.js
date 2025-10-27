// Deklarasi Variabel Global
const canvas = document.getElementById("deriv");
const ctx = canvas.getContext("2d");
const timeLabel = document.getElementById('timeLabel');
const xLabel = document.getElementById('xLabel');
const yLabel = document.getElementById('yLabel');
const yhLabel = document.getElementById('yhLabel');
const a = 0, b = 6;

const xInput = document.getElementById('x');
const timeInput = document.getElementById('time');
const moduleToggleButton = document.getElementById('module-complete-toggle');


/*************************************
            Helper Functions
**************************************/
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
    // Find position of y=0 on the canvas
    const y0 = mapY(0, minY, maxY);
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.lineTo(canvas.width, y0);
    ctx.stroke();
}


/*************************************
            Drawing Functions
**************************************/
function drawTangent(x, time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compute Y bounds
    let minY = Infinity, maxY = -Infinity;
    const fn = (x) => 5 + 5 * Math.sin(x); 
    
    for (let i = 0; i <= 100; i++) {
        const xi = 0 + (6) * i / 100;
        const y = fn(xi);
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
    }
    const margin = 0.1 * (maxY - minY);
    minY -= margin;
    maxY += margin;

    
    drawAxes(0, 6, minY, maxY);

    // Draw function (Blue - Position)
    ctx.beginPath();
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 3;
    for (let px = 0; px <= 6; px += 0.01) {
        const y = fn(px);
        ctx.lineTo(mapX(px, 0, 6), mapY(y, minY, maxY));
    }
    ctx.stroke();

    // Draw tangent (Red - Secant line approaching tangent)
    ctx.beginPath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    
    const y_x = fn(x);
    const y_x_plus_dt = fn(x + time);
    
    // Slope of the secant line
    const slope = (y_x_plus_dt - y_x) / time;
  
    const lineStart = x - 1;
    const lineEnd = x + 1 + time; 

    for (let px = lineStart; px <= lineEnd; px += 0.01) {
        // y = f(x) + m * (px - x)
        const ynew = y_x + slope * (px - x);
        
        const px_mapped = mapX(px, 0, 6);
        const py_mapped = mapY(ynew, minY, maxY);
        
        if (px_mapped >= 0 && px_mapped <= canvas.width && py_mapped >= -100 && py_mapped <= canvas.height + 100) {
            ctx.lineTo(px_mapped, py_mapped);
        } else {
            ctx.moveTo(px_mapped, py_mapped);
        }
    }
    ctx.stroke();
    
    // Draw point f(x)
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(mapX(x, a, b), mapY(y_x, minY, maxY), 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw point f(x + dt)
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(mapX(x + time, a, b), mapY(y_x_plus_dt, minY, maxY), 5, 0, 2 * Math.PI);
    ctx.fill();
}

/*************************************
            Update Function
**************************************/
function update() {
    const timeUp = parseFloat(timeInput.value);
    const xUp = parseFloat(xInput.value);
    const fn = (x) => 5 + 5 * Math.sin(x); // Fungsi yang diuji

    timeLabel.textContent = timeUp.toFixed(2);
    xLabel.textContent = xUp.toFixed(2);

    const yUp = fn(xUp);
    const yhUp = fn(xUp + timeUp);
    yLabel.textContent = yUp.toFixed(6);
    yhLabel.textContent = yhUp.toFixed(6);

    drawTangent(xUp, timeUp);
}


/*************************************
   LOCAL STORAGE MODULE PROGRESS TRACKER
**************************************/

const MODULE_ID = 'derivative'
const STORAGE_KEY_MODULE = `calviz_module_${MODULE_ID}_complete`;
 
function loadModuleStatus() {
    if (!moduleToggleButton) return;
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

window.toggleModuleStatus = function() {
    const isCurrentlyComplete = localStorage.getItem(STORAGE_KEY_MODULE) === 'true';
    const newStatus = !isCurrentlyComplete;

    localStorage.setItem(STORAGE_KEY_MODULE, newStatus ? 'true' : 'false');
    updateModuleButton(newStatus);
    
    // TODO: TAMBAHKAN FUNGSI SERVER-SIDE
    // saveModuleProgress(MODULE_ID, newStatus); 
}

/*************************************
            Event Listeners
**************************************/

document.addEventListener('DOMContentLoaded', () => {
    loadModuleStatus(); 
    
    if (xInput && timeInput) {
        [xInput, timeInput].forEach(el =>
            el.addEventListener('input', update)
        );
    }
    
    if (moduleToggleButton) {
        moduleToggleButton.addEventListener('click', window.toggleModuleStatus);
    }
    
    // Initial draw
    update();
});