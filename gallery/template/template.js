gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// Initialisation du smooth scroll sur le wrapper
let smoother = ScrollSmoother.create({
    wrapper: "#wrapper",
    content: "#content",
    smooth: 2,
    effects: true
});

// Animations de fondu (fade) au chargement et au départ de la page
window.addEventListener('load', () => {
    // Fondu d'entrée
    gsap.to("#overlay", {
        opacity: 0,
        duration: 1.5,
        ease: "power2.inOut",
        onComplete: () => {
            document.getElementById('overlay').style.display = 'none';
        }
    });
});

// Votre code pour l'effet de zoom
document.addEventListener('DOMContentLoaded', () => {
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
        y: -500,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: pinContainer,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
        },
    });
});

// NOUVEAU CODE JAVASCRIPT POUR LA GALERIE AVEC MODALE
const galleryModal = document.getElementById('galleryModal');
const closeButton = document.querySelector('.close-button');
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');
const galleryImageWrappers = document.querySelectorAll('.image-wrapper');
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
canvasElement.width = width;
canvasElement.height = height;
ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageSrc;
}

function loadAndDrawAllGalleryImages() {
    galleryImageWrappers.forEach(wrapper => {
        const imageSrc = wrapper.dataset.src;
        const canvasElement = wrapper.querySelector('.gallery-image-canvas');
        if (imageSrc && canvasElement) {
            drawImageOnCanvas(canvasElement, imageSrc);
        }
    });
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

document.addEventListener('DOMContentLoaded', () => {
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
});

galleryModal.addEventListener('click', (e) => {
    // Fermer la modale si l'utilisateur clique directement sur l'arrière-plan
    if (e.target === galleryModal) {
        closeModal();
    }
});