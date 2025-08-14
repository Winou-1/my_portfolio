// Loading Screen Logic
class LoadingManager {
    constructor() {
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingPercentage = document.getElementById('loadingPercentage');
        this.loadingScreen = document.getElementById('loadingScreen');
        this.progress = 0;
        this.targetProgress = 0;
        this.animationId = null;
        this.imagesToLoad = [];
        this.imagesLoaded = 0;
        this.totalImages = 0;
        this.isComplete = false;
        this.loadedImageCache = new Map();
        
        this.init();
    }
    
    init() {
        // Bloquer le scroll immédiatement
        this.disableScroll();
        
        // Collect all images to preload
        this.collectImages();
        
        // Start animation loop
        this.animateProgress();
        
        // Start preloading images immediately
        this.preloadImages();
        
        // Listen for other resources
        this.listenForResources();
    }
    
    disableScroll() {
        // Sauvegarder la position actuelle du scroll
        this.scrollY = window.scrollY;
        
        // Appliquer les styles pour bloquer le scroll
        document.body.style.position = 'fixed';
        document.body.style.top = `-${this.scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.height = '100vh';
        document.body.style.overflow = 'hidden';
        
        // Également sur html pour plus de sécurité
        document.documentElement.style.overflow = 'hidden';
        
        console.log('Scroll disabled during loading');
    }
    
    enableScroll() {
        // Restaurer les styles normaux
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        document.documentElement.style.overflow = '';
        
        // Restaurer la position du scroll
        window.scrollTo(0, this.scrollY);
        
        console.log('Scroll enabled after loading');
    }
    
    collectImages() {
        // Collect main images with src attribute
        const mainImages = document.querySelectorAll('img[src]');
        mainImages.forEach(img => {
            if (img.src && !img.src.includes('data:') && !img.src.includes('blob:')) {
                this.imagesToLoad.push({
                    src: img.src,
                    element: img,
                    type: 'main'
                });
            }
        });
        
        // Collect gallery images from data-src attributes
        const galleryWrappers = document.querySelectorAll('[data-src]');
        galleryWrappers.forEach(wrapper => {
            if (wrapper.dataset.src) {
                this.imagesToLoad.push({
                    src: wrapper.dataset.src,
                    element: wrapper,
                    type: 'gallery'
                });
            }
        });
        
        // Remove duplicates by src
        const uniqueImages = new Map();
        this.imagesToLoad.forEach(img => {
            if (!uniqueImages.has(img.src)) {
                uniqueImages.set(img.src, img);
            }
        });
        this.imagesToLoad = Array.from(uniqueImages.values());
        this.totalImages = this.imagesToLoad.length;
        
        console.log(`Found ${this.totalImages} images to load`);
        
        // If no images, complete immediately
        if (this.totalImages === 0) {
            setTimeout(() => this.completeLoading(), 1000);
        }
    }
    
    preloadImages() {
        if (this.totalImages === 0) return;
        
        let loadedCount = 0;
        
        this.imagesToLoad.forEach((imageInfo, index) => {
            const img = new Image();
            
            const onImageLoad = () => {
                loadedCount++;
                this.imagesLoaded = loadedCount;
                
                // Store the loaded image for later use
                this.loadedImageCache.set(imageInfo.src, img);
                
                // Calculate progress: 10% for initial setup, 90% for images
                const imageProgress = (loadedCount / this.totalImages) * 90;
                this.targetProgress = 10 + imageProgress;
                
                console.log(`Loaded ${loadedCount}/${this.totalImages} images (${Math.floor(this.targetProgress)}%)`);
                
                // Only complete when ALL images are loaded
                if (loadedCount === this.totalImages) {
                    console.log('All images preloaded, applying to DOM...');
                    this.applyImagesToDOM();
                }
            };
            
            const onImageError = (e) => {
                console.warn(`Failed to load image: ${imageInfo.src}`);
                onImageLoad(); // Continue even if image fails to load
            };
            
            img.onload = onImageLoad;
            img.onerror = onImageError;
            
            // Start loading immediately, but with small delays for visual effect
            setTimeout(() => {
                img.src = imageInfo.src;
            }, index * 20);
        });
        
        // Set initial progress
        this.targetProgress = 10;
    }
    
    applyImagesToDOM() {
        // Apply preloaded images to their DOM elements
        let appliedCount = 0;
        const totalToApply = this.imagesToLoad.length;
        
        this.imagesToLoad.forEach((imageInfo, index) => {
            setTimeout(() => {
                const cachedImg = this.loadedImageCache.get(imageInfo.src);
                
                if (imageInfo.type === 'main' && cachedImg) {
                    // For main images, just ensure they're loaded
                    if (imageInfo.element.src !== imageInfo.src) {
                        imageInfo.element.src = imageInfo.src;
                    }
                } else if (imageInfo.type === 'gallery' && cachedImg) {
                    // For gallery images, draw them on canvas
                    const canvasElement = imageInfo.element.querySelector('.gallery-image-canvas');
                    if (canvasElement) {
                        this.drawImageOnCanvas(canvasElement, cachedImg);
                    }
                }
                
                appliedCount++;
                
                // Update progress to show DOM application
                const applyProgress = (appliedCount / totalToApply) * 5; // 5% for DOM application
                this.targetProgress = 95 + applyProgress;
                
                // Complete when all images are applied to DOM
                if (appliedCount === totalToApply) {
                    console.log('All images applied to DOM, completing...');
                    setTimeout(() => this.completeLoading(), 300);
                }
            }, index * 10); // Small delay to show progress
        });
    }
    
    drawImageOnCanvas(canvasElement, img) {
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        
        let width = img.naturalWidth;
        let height = img.naturalHeight;
        let targetWidth, targetHeight;
        
        const parent = canvasElement.parentElement;
        targetWidth = parent.offsetWidth;
        targetHeight = parent.offsetHeight;
        
        const aspectRatio = width / height;
        const targetAspectRatio = targetWidth / targetHeight;
        
        if (aspectRatio > targetAspectRatio) {
            width = targetWidth;
            height = width / aspectRatio;
        } else {
            height = targetHeight;
            width = height * aspectRatio;
        }
        
        canvasElement.width = width * 5;
        canvasElement.height = height * 5;
        ctx.drawImage(img, 0, 0, width * 5, height * 5);
    }
    
    listenForResources() {
        // Small initial progress for DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            if (this.targetProgress < 5) {
                this.targetProgress = 5;
            }
        });
    }
    
    animateProgress() {
        const animate = () => {
            // Smooth progress animation with easing
            const diff = this.targetProgress - this.progress;
            this.progress += diff * 0.08; // Slower animation for smoother feel
            
            if (Math.abs(diff) < 0.1) {
                this.progress = this.targetProgress;
            }
            
            this.updateProgressBar();
            
            // Continue animation until complete
            if (!this.isComplete || this.progress < 100) {
                this.animationId = requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    updateProgressBar() {
        const roundedProgress = Math.floor(this.progress);
        this.loadingBar.style.width = `${roundedProgress}%`;
        this.loadingPercentage.textContent = `${roundedProgress}%`;
        
        // Update loading text based on progress
        const loadingText = document.querySelector('.loading-text');
        if (roundedProgress < 10) {
            loadingText.textContent = 'Initialisation...';
        } else if (roundedProgress < 95) {
            loadingText.textContent = `Chargement des images... ${this.imagesLoaded}/${this.totalImages}`;
        } else if (roundedProgress < 100) {
            loadingText.textContent = 'Application des images...';
        } else {
            loadingText.textContent = 'Chargement terminé !';
        }
    }
    
    completeLoading() {
        if (this.isComplete) return; // Prevent multiple calls
        
        this.isComplete = true;
        this.targetProgress = 100;
        
        // Wait for progress bar to reach 100% before hiding
        const waitForComplete = () => {
            if (this.progress >= 99.5) {
                setTimeout(() => {
                    this.hideLoadingScreen();
                }, 500); // Small delay to show 100%
            } else {
                requestAnimationFrame(waitForComplete);
            }
        };
        
        waitForComplete();
    }
    
    hideLoadingScreen() {
        // Réactiver le scroll AVANT de masquer l'écran de chargement
        this.enableScroll();
        
        this.loadingScreen.classList.add('hidden');
        
        // Remove loading screen from DOM after transition
        setTimeout(() => {
            if (this.loadingScreen.parentNode) {
                this.loadingScreen.parentNode.removeChild(this.loadingScreen);
            }
        }, 800);
        
        // Initialize main page animations
        this.initMainPage();
    }
    
    initMainPage() {
        // Initialize your existing JavaScript here
        // This replaces the DOMContentLoaded event
        initMountainPage();
    }
}

// Initialize loading manager
const loadingManager = new LoadingManager();

// Main page initialization function
function initMountainPage() {
    gsap.registerPlugin(ScrollTrigger);

    // Your existing JavaScript code goes here
    // Zoom effect
    let pinContainer = document.getElementById('pin-container');
    let image = document.getElementById('background-image');
    let mainText = document.getElementById('main-text');

    gsap.to(image, {
        scale: 5,
        ease: 'none',
        scrollTrigger: {
            trigger: pinContainer,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            pin: true,
        },
    });

    gsap.to(mainText, {
        y: -300,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: pinContainer,
            start: 'top top+=100',
            end: 'bottom bottom',
            scrub: true,
        },
    });

    // Drag cards initialization
    const container = document.querySelector(".drag-cards-container");
    const cards = document.querySelectorAll(".drag-card");
    let maxZIndex = 1;

    function initializeCards() {
        cards.forEach((card) => {
            const top = card.getAttribute("data-top");
            const left = card.getAttribute("data-left");
            const rotate = card.getAttribute("data-rotate");

            card.style.top = top;
            card.style.left = left;
            card.style.transform = `rotate(${rotate}) scale(0.8)`;
            card.style.opacity = 0;
        });
    }

    function animateOnScroll() {
        cards.forEach((card) => {
            gsap.to(card, {
                opacity: 1,
                scale: 1,
                duration: 1,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                    toggleActions: "play none none none"
                }
            });
        });
    }
    
    setTimeout(() => {
        initializeCards();
        animateOnScroll();
    }, 100);

    // Drag functionality for cards
    cards.forEach((card) => {
        let isDragging = false;
        let startX, startY;
        let initialLeft, initialTop;

        function bringToFront() {
            maxZIndex++;
            card.style.zIndex = maxZIndex;
        }

        card.addEventListener("mousedown", (e) => {
            isDragging = true;
            bringToFront();
            card.style.cursor = "grabbing";

            startX = e.clientX;
            startY = e.clientY;
            initialLeft = card.offsetLeft;
            initialTop = card.offsetTop;
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            let newLeft = initialLeft + deltaX;
            let newTop = initialTop + deltaY;
            const containerRect = container.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            newLeft = Math.max(0, newLeft);
            newLeft = Math.min(containerRect.width - cardRect.width, newLeft);
            newTop = Math.max(0, newTop);
            newTop = Math.min(containerRect.height - cardRect.height, newTop);
            card.style.left = `${newLeft}px`;
            card.style.top = `${newTop}px`;
        });

        document.addEventListener("mouseup", () => {
            isDragging = false;
            card.style.cursor = "grab";
        });
    });

    // Gallery functionality
    const galleryModal = document.getElementById('galleryModal');
    const closeButton = document.querySelector('.close-button');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const galleryImageWrappers = document.querySelectorAll('.image-wrapper, .image-centrale .image-wrapper');
    let currentImageIndex = -1;
    const body = document.body;
    const modalCanvas = document.getElementById('modalCanvas');

    function drawImageOnCanvas(canvasElement, imageSrc) {
        const img = new Image();
        img.onload = function() {
            const ctx = canvasElement.getContext('2d');
            ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            let width = img.naturalWidth;
            let height = img.naturalHeight;
            let targetWidth, targetHeight;
            if (canvasElement.id === 'modalCanvas') {
                targetWidth = window.innerWidth * 0.9;
                targetHeight = window.innerHeight * 0.9;
            } else {
                const parent = canvasElement.parentElement;
                targetWidth = parent.offsetWidth;
                targetHeight = parent.offsetHeight;
            }
            const aspectRatio = width / height;
            const targetAspectRatio = targetWidth / targetHeight;
            if (aspectRatio > targetAspectRatio) {
                width = targetWidth;
                height = width / aspectRatio;
            } else {
                height = targetHeight;
                width = height * aspectRatio;
            }
            canvasElement.width = width * 5;
            canvasElement.height = height * 5;
            ctx.drawImage(img, 0, 0, width * 5, height * 5);
        };
        img.src = imageSrc;
    }

    function loadAndDrawAllGalleryImages() {
        // Skip loading since images are already preloaded and applied
        // This function is now just for consistency, actual loading is done in LoadingManager
        console.log('Gallery images already loaded and applied');
    }

    function openModal(imageSrc) {
        galleryModal.style.display = 'flex';
        drawImageOnCanvas(modalCanvas, imageSrc);
        body.style.overflow = 'hidden';

        setTimeout(() => {
            modalCanvas.style.opacity = 1;
            modalCanvas.style.transform = 'scale(1)';
        }, 50);
    }

    function closeModal() {
        modalCanvas.style.opacity = 0;
        modalCanvas.style.transform = 'scale(0.9)';
        setTimeout(() => {
            galleryModal.style.display = 'none';
            body.style.overflow = 'auto';
        }, 300);
    }

    function showPrevImage() {
        modalCanvas.style.transform = 'translateX(100%)';
        modalCanvas.style.opacity = 0;
        setTimeout(() => {
            currentImageIndex = (currentImageIndex - 1 + galleryImageWrappers.length) % galleryImageWrappers.length;
            const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
            drawImageOnCanvas(modalCanvas, imageSrc);
            modalCanvas.style.transition = 'none';
            modalCanvas.style.transform = 'translateX(-100%)';
            setTimeout(() => {
                modalCanvas.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
                modalCanvas.style.transform = 'translateX(0)';
                modalCanvas.style.opacity = 1;
            }, 20);
        }, 500);
    }

    function showNextImage() {
        modalCanvas.style.transform = 'translateX(-100%)';
        modalCanvas.style.opacity = 0;
        setTimeout(() => {
            currentImageIndex = (currentImageIndex + 1) % galleryImageWrappers.length;
            const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
            drawImageOnCanvas(modalCanvas, imageSrc);
            modalCanvas.style.transition = 'none';
            modalCanvas.style.transform = 'translateX(100%)';
            setTimeout(() => {
                modalCanvas.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
                modalCanvas.style.transform = 'translateX(0)';
                modalCanvas.style.opacity = 1;
            }, 20);
        }, 500);
    }

    // Initialize gallery
    loadAndDrawAllGalleryImages();
    galleryImageWrappers.forEach((wrapper, index) => {
        wrapper.addEventListener('click', () => {
            currentImageIndex = index;
            const imageSrc = wrapper.dataset.src;
            openModal(imageSrc);
        });
    });

    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });

    prevArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevImage();
    });

    nextArrow.addEventListener('click', (e) => {
        e.stopPropagation();
        showNextImage();
    });

    galleryModal.addEventListener('click', (e) => {
        if (e.target === galleryModal) {
            closeModal();
        }
    });

    // Gallery image animations
    const allImageWrappers = document.querySelectorAll('.image-wrapper');
    const centralImageWrapper = document.querySelector('.image-centrale');
    const galleryImageWrappersForAnimation = Array.from(allImageWrappers).filter(wrapper => wrapper.closest('.image-centrale') === null);

    galleryImageWrappersForAnimation.forEach((wrapper) => {
        gsap.to(wrapper, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: wrapper,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    });

    if (centralImageWrapper) {
        gsap.from(centralImageWrapper, {
            opacity: 0,
            scale: 0.8,
            y: 50,
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: centralImageWrapper,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    }

    // Navbar functionality
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    navbarToggle.addEventListener('click', () => {
        navbarToggle.classList.toggle('active');
        navbarMenu.classList.toggle('active');
        body.classList.toggle('menu-active');
    });

    // Intersection observer for image wrappers
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {});
    
    const todoelements = document.querySelectorAll('.image-wrapper');
    todoelements.forEach((element) => {
        observer.observe(element);
    });
}