// Remove global event listeners for contextmenu and dragstart, they will be added after loading
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
        canvasElement.width = width*5;
        canvasElement.height = height*5;
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

// Fonction pour ouvrir la modale avec l'image sélectionnée
function openModal(imageSrc) {
    galleryModal.style.display = 'flex';
    drawImageOnCanvas(modalCanvas, imageSrc);
    body.style.overflow = 'hidden';

    setTimeout(() => {
        modalCanvas.style.opacity = 1;
        modalCanvas.style.transform = 'scale(1)';
    }, 50);
}

// Fonction pour fermer la modale
function closeModal() {
    modalCanvas.style.opacity = 0;
    modalCanvas.style.transform = 'scale(0.9)';
    setTimeout(() => {
        galleryModal.style.display = 'none';
        body.style.overflow = 'auto';
    }, 300);
}

// Fonction pour afficher l'image précédente
function showPrevImage() {
    modalCanvas.style.transform = 'translateX(100%)';
    modalCanvas.style.opacity = 0;
    setTimeout(() => {
        currentImageIndex = (currentImageIndex - 1 + galleryImageWrappers.length) % galleryImageWrappers.length;
        const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
        drawImageOnCanvas(modalCanvas, imageSrc); // Dessine sur le canvas du modale
        modalCanvas.style.transition = 'none'; // désactive temporairement la transition
        modalCanvas.style.transform = 'translateX(-100%)'; //positionne la nouvelle image hors écran à gauche
        setTimeout(() => {
            modalCanvas.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out'; // Re-enable transition
            modalCanvas.style.transform = 'translateX(0)';
            modalCanvas.style.opacity = 1;
        }, 20);
        
    }, 500);
}

// Fonction pour afficher l'image suivante
function showNextImage() {
    modalCanvas.style.transform = 'translateX(-100%)';
    modalCanvas.style.opacity = 0;

    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % galleryImageWrappers.length;
        const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
        drawImageOnCanvas(modalCanvas, imageSrc); // Dessine sur le canvas de la modale
        modalCanvas.style.transition = 'none'; // désactive temporairement la transition
        modalCanvas.style.transform = 'translateX(100%)'; //positionne la nouvelle image hors écran à gauche
        setTimeout(() => {
            modalCanvas.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
            modalCanvas.style.transform = 'translateX(0)';
            modalCanvas.style.opacity = 1;
        }, 20);
    }, 500);
}


/*--------------------
Ajout des écouteurs et du swipe pour la gallerie
--------------------*/
let gallerySwipeStartX = 0;
let gallerySwipeEndX = 0;
const swipeThreshold = 30; 

/*--------------------
Carrousel principal
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

// All event listeners and page initialization will be in this function
function initPage() {
    // Empêcher le clic droit et le glisser-déposer
    document.body.addEventListener('contextmenu', e => e.preventDefault());
    document.body.addEventListener('dragstart', e => e.preventDefault());

    // Initial animation for carousel
    animate();
    
    /*--------------------
    Event Listeners for gallery
    --------------------*/
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


    galleryModal.addEventListener('touchstart', (e) => {
        gallerySwipeStartX = e.touches[0].clientX;
    }, { passive: true });
    galleryModal.addEventListener('touchend', (e) => {
        gallerySwipeEndX = e.changedTouches[0].clientX;
        const diffX = gallerySwipeStartX - gallerySwipeEndX;
        if (Math.abs(diffX) > swipeThreshold) {
            e.preventDefault(); 
            if (diffX > 0) {
                showNextImage();
            } else {
                showPrevImage();
            }
        }
    }, { passive: false });

    // Clicks on carousel items
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
    const navbarLinks = document.querySelectorAll('.navbar-menu a');

    navbarToggle.addEventListener('click', () => {
        navbarToggle.classList.toggle('active');
        navbarMenu.classList.toggle('active');
        body.classList.toggle('menu-active');
    });

    navbarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navbarMenu.classList.contains('active')) {
                navbarToggle.classList.remove('active');
                navbarMenu.classList.remove('active');
                body.classList.remove('menu-active');
            }
        });
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
    
    // Load and draw gallery images after page is visible
    loadAndDrawAllGalleryImages();
    window.addEventListener('resize', () => {
        loadAndDrawAllGalleryImages(); 
        if (galleryModal.style.display === 'flex') {
            const imageSrc = galleryImageWrappers[currentImageIndex].dataset.src;
            drawImageOnCanvas(modalCanvas, imageSrc);
        }
    });

}

// New loading screen logic
document.addEventListener('DOMContentLoaded', () => {
    const loaderContainer = document.getElementById('loader-container');
    const mainContent = document.getElementById('main-content');

    // Wait for the animation to finish (4.5s)
    setTimeout(() => {
        loaderContainer.style.opacity = '0';
        setTimeout(() => {
            loaderContainer.style.display = 'none';
            mainContent.classList.add('visible');
            initPage(); // Call the function to initialize the rest of the page
        }, 1000); // Wait for the loader to fade out (1s)
    }, 4500); // Total animation time (max animation duration + fill duration)
});

const pageTransition = document.getElementById('page-transition');
const bodyy = document.body;

// Remove the transition on page load
window.addEventListener('pageshow', (event) => {
    pageTransition.classList.remove('is-active');
    bodyy.classList.remove('is-transitioning');
});

document.addEventListener('click', (e) => {
    // Check if the clicked element is an internal link.
    const link = e.target.closest('a');
    if (link && link.href) {
        // Check if it's an internal link and not a hash link
        if (link.hostname === window.location.hostname && !link.hash) {
            // Prevent default navigation
            e.preventDefault();

            // Add a class to the body and transition overlay to start the fade-out
            pageTransition.classList.add('is-active');
            bodyy.classList.add('is-transitioning');
            
            // Navigate to the new page after the transition
            setTimeout(() => {
                window.location.href = link.href;
            }, 500); // This duration should match the CSS transition duration
        } else if (link.hash) {
            // Handle internal anchor links without a transition
            const targetElement = document.querySelector(link.hash);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
        // For external links, do nothing and let the browser navigate normally
    }
});