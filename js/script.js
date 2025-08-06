/*--------------------
Vars
--------------------*/
let progress = 50
let startX = 0
let active = 0
let isDown = false

/*--------------------
Contants
--------------------*/
const speedWheel = 0.02
const speedDrag = -0.1

/*--------------------
Get Z
--------------------*/
const getZindex = (array, index) => (array.map((_, i) => (index === i) ? array.length : array.length - Math.abs(index - i)))

/*--------------------
Items
--------------------*/
const $items = document.querySelectorAll('.carousel-item')
const $cursors = document.querySelectorAll('.cursor')
// Référence au nouveau titre du carrousel
const mainCarouselTitle = document.getElementById('mainCarouselTitle');

// Éléments de la modale de la galerie
const galleryModal = document.getElementById('galleryModal');
const closeButton = document.querySelector('.close-button');
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');
// Ciblez les wrappers d'images pour la galerie
const galleryImageWrappers = document.querySelectorAll('.image-wrapper'); 
// galleryImages n'est plus utilisé directement pour les sources, on utilise data-src des wrappers
let currentImageIndex = -1;
const body = document.body;

// Éléments du canvas
const modalCanvas = document.getElementById('modalCanvas');
const ctx = modalCanvas.getContext('2d');

/*--------------------
Fonctions de la galerie
--------------------*/

// Fonction pour dessiner une image sur un canvas spécifique
function drawImageOnCanvas(canvasElement, imageSrc) {
    const img = new Image();
    img.onload = function() {
        const ctx = canvasElement.getContext('2d');
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        let width = img.naturalWidth;
        let height = img.naturalHeight;

        // Calculate aspect ratio to fit image within canvas boundaries
        // This logic applies to both modal and gallery canvases
        let targetWidth, targetHeight;

        if (canvasElement.id === 'modalCanvas') {
            // For the modal, fit to 90% of window size
            targetWidth = window.innerWidth * 0.9;
            targetHeight = window.innerHeight * 0.9;
        } else {
            // For gallery images, fit to parent wrapper's current dimensions
            const parent = canvasElement.parentElement;
            targetWidth = parent.offsetWidth;
            targetHeight = parent.offsetHeight;
        }

        // Adjust dimensions to fit within target boundaries while maintaining aspect ratio
        const aspectRatio = width / height;
        const targetAspectRatio = targetWidth / targetHeight;

        if (aspectRatio > targetAspectRatio) {
            // Image is wider than target area, fit to width
            width = targetWidth;
            height = width / aspectRatio;
        } else {
            // Image is taller than target area, fit to height
            height = targetHeight;
            width = height * aspectRatio;
        }

        // Set the canvas drawing buffer size to the calculated dimensions
        // This is crucial for "quality" as it determines the resolution of the pixels drawn
        canvasElement.width = width*5;
        canvasElement.height = height*5;
        
        // Draw the image on the canvas
        ctx.drawImage(img, 0, 0, width*5, height*5);
    };
    img.src = imageSrc;
}

// Fonction pour charger et dessiner toutes les images de la galerie au chargement
function loadAndDrawAllGalleryImages() {
    galleryImageWrappers.forEach(wrapper => {
        const imageSrc = wrapper.dataset.src; // Récupère la source de l'image depuis data-src
        const canvasElement = wrapper.querySelector('.gallery-image-canvas');
        if (imageSrc && canvasElement) {
            drawImageOnCanvas(canvasElement, imageSrc);
        }
    });
}

// Appeler cette fonction au chargement de la page
window.addEventListener('load', loadAndDrawAllGalleryImages);

// Écouteur pour redessiner les images de la galerie si la fenêtre est redimensionnée
window.addEventListener('resize', () => {
    loadAndDrawAllGalleryImages(); // Redessine toutes les images de la galerie
    // Si la modale est ouverte, redessiner aussi l'image de la modale
    if (galleryModal.style.display === 'flex') {
        const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
        drawImageOnCanvas(modalCanvas, imageSrc);
    }
});


function openModal(imageSrc) {
    galleryModal.style.display = 'flex';
    drawImageOnCanvas(modalCanvas, imageSrc); // Dessine sur le canvas de la modale
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
    modalCanvas.style.transform = 'translateX(100%)'; // Slide the current image out to the right
    modalCanvas.style.opacity = 0;
    
    setTimeout(() => {
        currentImageIndex = (currentImageIndex - 1 + galleryImageWrappers.length) % galleryImageWrappers.length;
        // Récupère la source de l'image du wrapper correspondant
        const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
        drawImageOnCanvas(modalCanvas, imageSrc); // Dessine sur le canvas de la modale
        
        modalCanvas.style.transition = 'none'; // Temporarily disable transition
        modalCanvas.style.transform = 'translateX(-100%)'; // Position new image off-screen left

        setTimeout(() => {
            modalCanvas.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'; // Re-enable transition
            modalCanvas.style.transform = 'translateX(0)'; // Slide new image into center
            modalCanvas.style.opacity = 1;
        }, 20); // Small delay to force re-render
        
    }, 500); // Duration matches CSS transition for slide-out
}

function showNextImage() {
    modalCanvas.style.transform = 'translateX(-100%)'; // Slide the current image out to the left
    modalCanvas.style.opacity = 0;

    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % galleryImageWrappers.length;
        // Récupère la source de l'image du wrapper correspondant
        const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
        drawImageOnCanvas(modalCanvas, imageSrc); // Dessine sur le canvas de la modale

        modalCanvas.style.transition = 'none'; // Temporarily disable transition
        modalCanvas.style.transform = 'translateX(100%)'; // Position new image off-screen right

        setTimeout(() => {
            modalCanvas.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'; // Re-enable transition
            modalCanvas.style.transform = 'translateX(0)'; // Slide new image into center
            modalCanvas.style.opacity = 1;
        }, 20); // Small delay to force re-render
    }, 500); // Duration matches CSS transition for slide-out
}


/*--------------------
Event Listeners
--------------------*/
// Attachez l'écouteur de clic aux wrappers d'images
galleryImageWrappers.forEach((wrapper, index) => {
    wrapper.addEventListener('click', () => {
        currentImageIndex = index;
        // Récupère la source de l'image depuis data-src
        const imageSrc = wrapper.dataset.src; 
        openModal(imageSrc);
    });
});

// Ajout de e.stopPropagation() pour empêcher la propagation de l'événement de clic
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
    // Ferme la modale si le clic est sur l'arrière-plan de la modale (pas sur l'image ou les flèches)
    if (e.target === galleryModal) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (galleryModal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }
});

// Empêcher le clic droit et le glisser-déposer sur les canvas de la galerie
document.body.addEventListener('contextmenu', e => e.preventDefault());
document.body.addEventListener('dragstart', e => e.preventDefault());

/*--------------------
Ajout des écouteurs d'événements de glissement (swipe) pour la galerie
--------------------*/
let gallerySwipeStartX = 0;
let gallerySwipeEndX = 0;
const swipeThreshold = 30; // Définissez un seuil en pixels pour déclencher le swipe

galleryModal.addEventListener('touchstart', (e) => {
    gallerySwipeStartX = e.touches[0].clientX;
    // Supprimez e.preventDefault() ici pour permettre aux clics de fonctionner.
    // La propriété CSS touch-action: manipulation devrait gérer les comportements par défaut.
}, { passive: true }); // Changez à { passive: true } car nous ne prévenons plus le défilement ici.

galleryModal.addEventListener('touchend', (e) => {
    gallerySwipeEndX = e.changedTouches[0].clientX;
    const diffX = gallerySwipeStartX - gallerySwipeEndX;

    if (Math.abs(diffX) > swipeThreshold) {
        // Prévenir le comportement par défaut UNIQUEMENT si un swipe est détecté
        e.preventDefault(); 
        if (diffX > 0) {
            // Swipe vers la gauche
            showNextImage();
        } else {
            // Swipe vers la droite
            showPrevImage();
        }
    }
}, { passive: false }); // Gardez { passive: false } ici pour permettre preventDefault() si un swipe a lieu.

/*--------------------
Carrousel principal (inchangé)
--------------------*/
const displayItems = (item, index, active) => {
  const zIndex = getZindex([...$items], active)[index]
  item.style.setProperty('--zIndex', zIndex)
  item.style.setProperty('--x', `calc(${(index - active) * 80}%)`)
  item.style.setProperty('--y', `calc(${(index - active) * 10}%)`)
  item.style.setProperty('--rot', `calc(${(index - active) * 5}deg)`)
  item.style.setProperty('--opacity', `calc(${zIndex} / var(--items) * 3 - 2)`)
}

const animate = () => {
  progress = Math.max(0, Math.min(progress, 100))
  active = Math.floor(progress/100*($items.length-1))
  
  $items.forEach((item, index) => displayItems(item, index, active))

  if (mainCarouselTitle) {
    if (active === 4) { 
      mainCarouselTitle.classList.add('visible');
    } else {
      mainCarouselTitle.classList.remove('visible');
    }
  }
}
animate()

$items.forEach((item, i) => {
  item.addEventListener('click', () => {
    if (i === active) {
      const targetPages = [
        "page1.html", 
        "page2.html", 
        "page3.html", 
        "page4.html", 
        "page5.html", 
        "page6.html", 
        "page7.html", 
        "page8.html", 
        "page9.html", 
        "page10.html"
      ];

      if (targetPages[i]) {
        window.location.href = targetPages[i];
      }
    } else {
      progress = (i / ($items.length - 1)) * 100;
      animate();
    }
  })
})

const handleWheel = e => {
  const wheelProgress = e.deltaY * speedWheel
  progress = progress + wheelProgress
  animate()
}

const handleMouseMove = (e) => {
  if (e.type === 'mousemove') {
    $cursors.forEach(($cursor) => {
      $cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    })
  }
  if (!isDown) return
  const x = e.clientX || (e.touches && e.touches[0].clientX) || 0
  const mouseProgress = (x - startX) * speedDrag
  progress = progress + mouseProgress
  startX = x
  animate()
}

const handleMouseDown = e => {
  isDown = true
  startX = e.clientX || (e.touches && e.touches[0].clientX) || 0
}

const handleMouseUp = () => {
  isDown = false
}

document.addEventListener('mousewheel', handleWheel)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)
document.addEventListener('touchstart', handleMouseDown)
document.addEventListener('touchmove', handleMouseMove)
document.addEventListener('touchend', handleMouseUp)

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
