document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('heroCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const banner = document.getElementById('scrollyBanner');
    const preloader = document.getElementById('scrollyPreloader');
    const progressText = document.getElementById('scrollyProgress');
    
    const TOTAL_FRAMES = 240;
    const images = [];
    let loadedImages = 0;
    let currentFrame = -1;
    let initialFrameLoaded = false;
    let minLoadedIndex = -1;
    let maxLoadedIndex = -1;

    // Immediately hide the preloader
    if (preloader) {
        preloader.classList.add('hidden');
    }

    // Load images in forward order (adapting to manually deleted frames)
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `pizza2/ezgif-frame-${paddedIndex}.webp`;
        
        img.onload = () => {
            loadedImages++;
            images[i - 1] = img;
            
            // Update loaded boundaries dynamically
            if (minLoadedIndex === -1 || (i - 1) < minLoadedIndex) {
                minLoadedIndex = i - 1;
            }
            if (maxLoadedIndex === -1 || (i - 1) > maxLoadedIndex) {
                maxLoadedIndex = i - 1;
            }
            
            if (!initialFrameLoaded) {
                initialFrameLoaded = true;
                initCanvas();
            } else {
                // Reactive update: if we're at the top and still loading,
                // re-evaluate scroll to display the absolute best/closest available frame.
                if (window.scrollY === 0 || currentFrame === -1) {
                    handleScroll();
                }
            }

            if (progressText) {
                const percent = Math.floor((loadedImages / TOTAL_FRAMES) * 100);
                progressText.textContent = percent;
            }
        };
        
        img.onerror = () => {
            loadedImages++;
            // In case some images are missing/deleted, still ensure initialization occurs
            if (loadedImages === TOTAL_FRAMES && !initialFrameLoaded) {
                initialFrameLoaded = true;
                initCanvas();
            }
        };
    }

    function initCanvas() {
        // High-DPI Resolution Setup
        resizeCanvas();

        // Setup scroll listener with requestAnimationFrame for performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });

        window.addEventListener('resize', resizeCanvas);

        // Trigger once to set initial state
        handleScroll();
    }

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;

        // Apply high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Redraw current frame
        if (currentFrame !== -1) {
            updateCanvas(currentFrame);
        } else {
            // Draw initial frame (which fallback will map to the first loaded frame)
            updateCanvas(minLoadedIndex !== -1 ? minLoadedIndex : 0);
        }
    }

    function handleScroll() {
        const bannerRect = banner.getBoundingClientRect();
        
        const startScroll = 0;
        const maxScroll = banner.scrollHeight - window.innerHeight;
        
        const scrollY = window.scrollY;
        const bannerTop = banner.offsetTop;
        
        let progress = (scrollY - bannerTop) / maxScroll;
        progress = Math.max(0, Math.min(1, progress));
        
        // Map progress dynamically to the exact range of files that successfully loaded!
        let frameIndex;
        if (minLoadedIndex !== -1 && maxLoadedIndex !== -1 && maxLoadedIndex > minLoadedIndex) {
            frameIndex = minLoadedIndex + Math.floor(progress * (maxLoadedIndex - minLoadedIndex));
        } else {
            frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
        }
        
        if (frameIndex !== currentFrame) {
            updateCanvas(frameIndex);
            currentFrame = frameIndex;
        }
        
        updateTextOverlays(progress);
    }

    function updateCanvas(index) {
        let img = images[index];
        
        // If image is not loaded/exists, find the closest loaded one
        if (!img || !img.complete || !img.naturalWidth) {
            let closestImg = null;
            let minDiff = Infinity;
            for (let i = 0; i < TOTAL_FRAMES; i++) {
                if (images[i] && images[i].complete && images[i].naturalWidth) {
                    const diff = Math.abs(i - index);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestImg = images[i];
                    }
                }
            }
            img = closestImg;
        }

        if (img && img.complete && img.naturalWidth) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw using object-fit: cover logic
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            const canvasRatio = canvasWidth / canvasHeight;
            const imgRatio = imgWidth / imgHeight;

            let sx, sy, sWidth, sHeight;

            if (imgRatio > canvasRatio) {
                // Image is wider than canvas
                sHeight = imgHeight;
                sWidth = imgHeight * canvasRatio;
                sx = (imgWidth - sWidth) / 2;
                sy = 0;
            } else {
                // Image is taller than canvas
                sWidth = imgWidth;
                sHeight = imgWidth / canvasRatio;
                sx = 0;
                sy = (imgHeight - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
        }
    }

    function updateTextOverlays(progress) {
        // Text overlay timing (start overlay0 at -0.05 for public version)
        const overlays = [
            { el: document.getElementById('textOverlay0'), start: -0.05, end: 0.15 },
            { el: document.getElementById('textOverlay1'), start: 0.25, end: 0.40 },
            { el: document.getElementById('textOverlay2'), start: 0.50, end: 0.65 },
            { el: document.getElementById('textOverlay3'), start: 0.80, end: 1.0 }
        ];

        overlays.forEach(overlay => {
            if (!overlay.el) return;
            
            let opacity = 0;
            const fadeWindow = 0.05;
            
            if (progress >= overlay.start && progress <= overlay.end) {
                opacity = 1;
                
                if (progress < overlay.start + fadeWindow) {
                    opacity = (progress - overlay.start) / fadeWindow;
                }
                else if (progress > overlay.end - fadeWindow) {
                    // Do not fade out the last overlay (textOverlay3)
                    if (overlay.el.id !== 'textOverlay3') {
                        opacity = (overlay.end - progress) / fadeWindow;
                    }
                }
            }
            
            overlay.el.style.opacity = opacity;
            
            if (opacity > 0) {
                overlay.el.classList.add('active');
            } else {
                overlay.el.classList.remove('active');
            }
        });
    }
});
