gsap.registerPlugin(ScrollTrigger);

// Initialisation des animations de fondu (fade) au chargement et au départ de la page
window.addEventListener('load', () => {
    // Fondu d'entrée
    gsap.to("#overlay", {
        opacity: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => {
            document.getElementById('overlay').style.display = 'none';
        }
    });
});

// code pour l'effet de zoom
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

    // Code mis à jour pour le texte principal
    gsap.to(mainText, {
        y: -300,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
            trigger: pinContainer,
            start: 'top top+=100', // Commence à faire disparaître le texte après 100px de défilement
            end: 'bottom bottom',
            scrub: true,
        },
    });

    // CODE JAVASCRIPT POUR LES CARTES DÉPLAÇABLES
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
            card.style.transform = `rotate(${rotate}) scale(0.8)`; // Initial scale for animation
            card.style.opacity = 0; // Initial opacity for animation
        });
    }

    // Fonction pour l'animation d'apparition des cartes au scroll
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
    
    // Initialiser les cartes après un court délai pour laisser GSAP s'enregistrer
    setTimeout(() => {
        initializeCards();
        animateOnScroll();
    }, 100);

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
});

// NOUVEAU CODE JAVASCRIPT POUR LA GALERIE AVEC MODALE
const galleryModal = document.getElementById('galleryModal');
const closeButton = document.querySelector('.close-button');
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');

// Nouveau sélecteur pour inclure l'image centrale
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

// Animation d'apparition des images de la galerie en scrollant
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionne toutes les images de la galerie
    const allImageWrappers = document.querySelectorAll('.image-wrapper');
    const centralImageWrapper = document.querySelector('.image-centrale'); // Correction ici

    // Crée un tableau des images de la galerie sans l'image centrale pour l'animation
    const galleryImageWrappers = Array.from(allImageWrappers).filter(wrapper => wrapper.closest('.image-centrale') === null);

    // Animation d'apparition pour les images de la galerie
    galleryImageWrappers.forEach((wrapper) => {
        gsap.to(wrapper, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: wrapper,
                start: "top 80%", // Déclenche quand le haut de l'élément atteint 80% de la fenêtre d'affichage
                toggleActions: "play none none none"
            }
        });
    });

    // Nouvelle animation pour l'image centrale
    if (centralImageWrapper) {
        gsap.from(centralImageWrapper, {
            opacity: 0,
            scale: 0.8,
            y: 50, // Commence 50px plus bas
            duration: 1.5,
            ease: "power3.out",
            scrollTrigger: {
                trigger: centralImageWrapper,
                start: "top 85%", // Déclenche un peu plus tôt que les autres
                toggleActions: "play none none none"
            }
        });
    }
});

const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');

    navbarToggle.addEventListener('click', () => {
        navbarToggle.classList.toggle('active');
        navbarMenu.classList.toggle('active');
        body.classList.toggle('menu-active');
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')}
        else {
          entry.target.classList.remove('visible')}
        })}, {})
        const todoelements = document.querySelectorAll('.image-wrapper');
        todoelements.forEach((element) => {
          observer.observe(element);
        });
