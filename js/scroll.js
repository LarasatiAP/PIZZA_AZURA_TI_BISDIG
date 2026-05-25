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

    // Load images
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        // Pad with zeros to match ezgif-frame-001.jpg format
        const paddedIndex = i.toString().padStart(3, '0');
        img.src = `pizza/ezgif-frame-${paddedIndex}.jpg`;
        
        img.onload = () => {
            loadedImages++;
            const percent = Math.floor((loadedImages / TOTAL_FRAMES) * 100);
            progressText.textContent = percent;
            
            if (loadedImages === TOTAL_FRAMES) {
                initCanvas();
            }
        };
        
        // Handle image load error gracefully
        img.onerror = () => {
            loadedImages++;
            if (loadedImages === TOTAL_FRAMES) {
                initCanvas();
            }
        };
        
        images.push(img);
    }

    function initCanvas() {
        // Hide preloader
        preloader.classList.add('hidden');
        
        // Set canvas internal resolution to match the first image
        if (images[0].naturalWidth) {
            canvas.width = images[0].naturalWidth;
            canvas.height = images[0].naturalHeight;
        } else {
            canvas.width = 1920;
            canvas.height = 1080;
        }

        // Initial draw
        updateCanvas(0);
        
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

        // Trigger once to set initial state
        handleScroll();
    }

    function handleScroll() {
        const bannerRect = banner.getBoundingClientRect();
        
        // Calculate how much we've scrolled inside the banner
        // when banner.top == 0, progress is 0.
        // when banner.bottom == window.innerHeight, progress is 1.
        
        const startScroll = 0;
        // The total scrollable distance is banner height minus window height
        const maxScroll = banner.scrollHeight - window.innerHeight;
        
        // banner.offsetTop is the distance from top of document
        const scrollY = window.scrollY;
        const bannerTop = banner.offsetTop;
        
        let progress = (scrollY - bannerTop) / maxScroll;
        
        // Clamp progress between 0 and 1
        progress = Math.max(0, Math.min(1, progress));
        
        // Map progress to frame index
        const frameIndex = Math.floor(progress * (TOTAL_FRAMES - 1));
        
        if (frameIndex !== currentFrame) {
            updateCanvas(frameIndex);
            currentFrame = frameIndex;
        }
        
        updateTextOverlays(progress);
    }

    function updateCanvas(index) {
        const img = images[index];
        if (img && img.complete && img.naturalWidth) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
    }

    function updateTextOverlays(progress) {
        // Text overlay timing
        const overlays = [
            { el: document.getElementById('textOverlay0'), start: 0.0, end: 0.15 },
            { el: document.getElementById('textOverlay1'), start: 0.25, end: 0.40 },
            { el: document.getElementById('textOverlay2'), start: 0.50, end: 0.65 },
            { el: document.getElementById('textOverlay3'), start: 0.80, end: 1.0 }
        ];

        overlays.forEach(overlay => {
            if (!overlay.el) return;
            
            // Fade in and out
            let opacity = 0;
            const fadeWindow = 0.05; // 5% scroll for fade transition
            
            if (progress >= overlay.start && progress <= overlay.end) {
                // Fully visible in the middle
                opacity = 1;
                
                // Fade in at the start
                if (progress < overlay.start + fadeWindow) {
                    opacity = (progress - overlay.start) / fadeWindow;
                }
                // Fade out at the end
                else if (progress > overlay.end - fadeWindow) {
                    opacity = (overlay.end - progress) / fadeWindow;
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
