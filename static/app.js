// ============ DOM ELEMENTS ============
const fileInput = document.getElementById('fileInput');
const originalCanvas = document.getElementById('originalCanvas');
const resultCanvas = document.getElementById('resultCanvas');
const originalCtx = originalCanvas.getContext('2d', { willReadFrequently: true });
const resultCtx = resultCanvas.getContext('2d', { willReadFrequently: true });
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const processingTimeEl = document.getElementById('processingTime');

// New Dom Elements
const originalExpandBtn = document.getElementById('originalExpandBtn');
const enhancedExpandBtn = document.getElementById('enhancedExpandBtn');
const loadingOverlay = document.getElementById('loadingOverlay');
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');

let originalImage = null;
let enhancedImage = null;
let isProcessing = false;
let startTime = 0;

// ============ HIGH QUALITY CANVAS SETUP ============
function setupCanvasForImage(canvas, img) {
    const dpr = window.devicePixelRatio || 1;
    const displayWidth = Math.min(img.width, 800);
    const displayHeight = (displayWidth / img.width) * img.height;
    
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
    canvas.style.width = displayWidth + 'px';
    canvas.style.height = displayHeight + 'px';
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.scale(dpr, dpr);
    return ctx;
}

// ============ FILE UPLOAD ============
function triggerUpload() {
    fileInput.click();
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            const ctx = setupCanvasForImage(originalCanvas, img);
            ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, originalCanvas.width / (window.devicePixelRatio || 1), originalCanvas.height / (window.devicePixelRatio || 1));
            updateStatus('ready', 'Image Loaded');
            statusDot.classList.add('active');
            statusDot.classList.remove('processing');
            
            // Show Expand Button
            originalExpandBtn.style.display = 'flex';
            
            // Reset enhanced side if uploading new image
            enhancedExpandBtn.style.display = 'none';
            resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// ============ DRAW HIGH QUALITY IMAGE ============
function drawHighQualityImage(canvas, img) {
    const ctx = setupCanvasForImage(canvas, img);
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
}

// ============ STATUS UPDATE ============
function updateStatus(state, message) {
    statusText.textContent = message;
    statusText.style.color = getStatusColor(state);
    
    if (state === 'processing') {
        statusDot.classList.add('processing');
        statusDot.classList.remove('active');
    } else if (state === 'ready' || state === 'complete') {
        statusDot.classList.add('active');
        statusDot.classList.remove('processing');
    }
}

function getStatusColor(state) {
    const colors = {
        'ready': '#34C759',
        'processing': '#FF9500',
        'complete': '#34C759',
        'error': '#FF3B30'
    };
    return colors[state] || '#666666';
}

// ============ ENHANCEMENT ============
function startEnhancement() {
    if (!originalImage) return;

    isProcessing = true;
    startTime = Date.now();
    updateStatus('processing', 'Enhancing Image');

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('image', file);

    // Show Loading Animation
    loadingOverlay.classList.add('active');
    enhancedExpandBtn.style.display = 'none';

    // Update processing time
    const timeInterval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        processingTimeEl.textContent = elapsed + 's';
    }, 100);

    fetch('/enhance', {
        method: 'POST',
        body: formData
    })
        .then(res => res.json())
        .then(data => {
            clearInterval(timeInterval);
            isProcessing = false;
            loadingOverlay.classList.remove('active');

            const img = new Image();
            img.onload = () => {
                enhancedImage = img;
                drawHighQualityImage(resultCanvas, img);
                updateStatus('complete', 'Enhancement Complete');
                enhancedExpandBtn.style.display = 'flex';
            };
            img.src = 'data:image/jpeg;base64,' + data.image;
        })
        .catch(err => {
            console.error('Enhancement error:', err);
            clearInterval(timeInterval);
            isProcessing = false;
            loadingOverlay.classList.remove('active');
            updateStatus('error', 'Enhancement Failed');
        });
}

// ============ LIGHTBOX FUNCTIONALITY ============
function openLightbox(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    // Convert canvas data to Data URL to display in img tag
    const dataURL = canvas.toDataURL('image/png');
    lightboxImage.src = dataURL;
    
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeLightbox(event) {
    // Only close if clicking the background or the close button, not the image itself
    if (event.target === lightboxModal || event.target.closest('.lightbox-close')) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Clear src after animation completes to free memory
        setTimeout(() => {
            lightboxImage.src = '';
        }, 400);
    }
}
