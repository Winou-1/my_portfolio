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
const modalImage = document.getElementById('modalImage');
const closeButton = document.querySelector('.close-button');
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');
const galleryImages = document.querySelectorAll('.image-container img'); // Toutes les images de la galerie


const displayItems = (item, index, active) => {
  const zIndex = getZindex([...$items], active)[index]
  item.style.setProperty('--zIndex', zIndex)
  // Ajustement des valeurs pour un affichage plus horizontal et plusieurs éléments visibles
  // --x: Déplace les éléments horizontalement. Réduit pour afficher plus d'éléments.
  // --y: Déplace les éléments verticalement. Réduit encore pour moins de diagonale.
  // --rot: Rotation des éléments. Réduit encore pour un alignement plus horizontal.
  item.style.setProperty('--x', `calc(${(index - active) * 80}%)`) // Ajusté à 80% comme demandé par l'utilisateur
  item.style.setProperty('--y', `calc(${(index - active) * 10}%)`)   // Réduit de 50% à 10%
  item.style.setProperty('--rot', `calc(${(index - active) * 5}deg)`) // Réduit de 20deg à 5deg
  item.style.setProperty('--opacity', `calc(${zIndex} / var(--items) * 3 - 2)`) // Garde l'opacité
}

/*--------------------
Animate
--------------------*/
const animate = () => {
  progress = Math.max(0, Math.min(progress, 100))
  active = Math.floor(progress/100*($items.length-1))
  
  $items.forEach((item, index) => displayItems(item, index, active))

  // Logique pour afficher/masquer le titre principal
  if (mainCarouselTitle) {
    if (active === 4) { // Si la première slide est active
      mainCarouselTitle.classList.add('visible');
    } else {
      mainCarouselTitle.classList.remove('visible');
    }
  }
}
animate()

/*--------------------
Click on Items
--------------------*/
$items.forEach((item, i) => {
  item.addEventListener('click', () => {
    // Vérifie si l'élément cliqué est l'élément actif (au centre)
    if (i === active) {
      // Redirection vers une autre page quand l'élément actif est cliqué
      // Vous pouvez personnaliser ces URLs pour chaque élément du carrousel
      const targetPages = [
        "page1.html", // URL pour le premier élément (Paris)
        "page2.html", // URL pour le deuxième élément (Warsaw)
        "page3.html", // URL pour le troisième élément (Madrid)
        "page4.html", // URL pour le quatrième élément (Sydney)
        "page5.html", // URL pour le cinquième élément (Istanbul)
        "page6.html", // URL pour le sixième élément (Prague)
        "page7.html", // URL pour le septième élément (Munich)
        "page8.html", // URL pour le huitième élément (Venice)
        "page9.html", // URL pour le neuvième élément (Oslo)
        "page10.html" // URL pour le dixième élément (London)
        // Ajoutez plus d'URLs si vous avez plus d'éléments dans votre carrousel
      ];

      if (targetPages[i]) {
        window.location.href = targetPages[i];
      }
    } else {
      // Si l'élément cliqué n'est pas l'élément actif, déplace le carrousel vers cet élément
      progress = (i / ($items.length - 1)) * 100; // Calcule la progression pour centrer l'élément
      animate();
    }
  })
})

/*--------------------
Handlers
--------------------*/
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

/*--------------------
Listeners
--------------------*/
document.addEventListener('mousewheel', handleWheel)
document.addEventListener('mousedown', handleMouseDown)
document.addEventListener('mousemove', handleMouseMove)
document.addEventListener('mouseup', handleMouseUp)
document.addEventListener('touchstart', handleMouseDown)
document.addEventListener('touchmove', handleMouseMove)
document.addEventListener('touchend', handleMouseUp)


/*--------------------
navbar
--------------------*/
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');
const body = document.body; // Select the body element

navbarToggle.addEventListener('click', () => {
    navbarToggle.classList.toggle('active');
    navbarMenu.classList.toggle('active');
    body.classList.toggle('menu-active'); // Toggle the body class
});




/*--------------------
scroll
--------------------*/
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

/*--------------------
Gallery Modal Functionality
--------------------*/

// Set the current image index to -1 on load to prevent any image from being loaded
let currentImageIndex = -1;

// Function to open the modal with the clicked image
function openModal(imageSrc) {
    galleryModal.style.display = 'flex'; // Display the modal
    modalImage.src = imageSrc; // Set the source of the modal image
    body.style.overflow = 'hidden'; // Prevent body scrolling

    // Fade in the image
    setTimeout(() => {
        modalImage.style.opacity = 1;
        modalImage.style.transform = 'scale(1)';
    }, 50);
}

// Function to close the modal
function closeModal() {
    modalImage.style.opacity = 0; // Trigger the fade-out transition
    modalImage.style.transform = 'scale(0.9)'; // Trigger the scale-down transition
    setTimeout(() => {
        galleryModal.style.display = 'none'; // Hide the modal after the transition
        body.style.overflow = 'auto'; // Re-enable body scrolling
    }, 300); // This duration must match the CSS transition duration
}

// Function to show the previous image with a sliding animation
function showPrevImage() {
    modalImage.style.transform = 'translateX(100%)';
    modalImage.style.opacity = 0;
    
    setTimeout(() => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        modalImage.src = galleryImages[currentImageIndex].src;
        
        modalImage.style.transition = 'none';
        modalImage.style.transform = 'translateX(-100%)';

        setTimeout(() => {
            modalImage.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
            modalImage.style.transform = 'translateX(0)';
            modalImage.style.opacity = 1;
        }, 20);
        
    }, 500);
}

// Function to show the next image with a sliding animation
function showNextImage() {
    // 1. First, slide the current image out to the left and fade it out
    modalImage.style.transform = 'translateX(-100%)';
    modalImage.style.opacity = 0;

    // 2. After the current image has slid out, update the source and prepare the new image
    setTimeout(() => {
        // Update to the next image source
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        modalImage.src = galleryImages[currentImageIndex].src;
        modalImage.style.transition = 'none';
        modalImage.style.transform = 'translateX(100%)';// Position the new image off-screen to the right
        setTimeout(() => {
            // Re-enable the transition
            modalImage.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
            // Slide the new image into the center
            modalImage.style.transform = 'translateX(0)';
            modalImage.style.opacity = 1;
        }, 20); // A very small delay is sufficient
    }, 500); // This duration should be equal to or greater than the slide-out transition
}

// Event listeners for gallery images
galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => {
        currentImageIndex = index; // Update the current image index
        openModal(image.src); // Open the modal with the clicked image
    });
});

// Event listener for the close button
closeButton.addEventListener('click', closeModal);

// Event listeners for navigation arrows
prevArrow.addEventListener('click', showPrevImage);
nextArrow.addEventListener('click', showNextImage);

// Close the modal when clicking outside the image
galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
        closeModal();
    }
});

// Keyboard navigation (left/right arrows) and close (Escape)
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


//empecher le téléchargement des photos
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
// Empêcher le glisser-déposer des images
document.addEventListener('dragover', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
document.addEventListener('drop', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});