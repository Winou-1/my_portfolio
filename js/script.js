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
let currentImageIndex = 0; // Index de l'image actuellement affichée dans la modale


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

// Fonction pour ouvrir la modale avec l'image cliquée
function openModal(imageSrc) {
    galleryModal.style.display = 'flex'; // Afficher la modale
    modalImage.src = imageSrc; // Définir la source de l'image modale
    body.style.overflow = 'hidden'; // Empêcher le défilement du corps

    // Appliquer la transition d'opacité
    modalImage.style.opacity = 0; // Mettre l'opacité à 0 avant d'afficher
    setTimeout(() => {
        modalImage.style.opacity = 1; // Animer l'opacité à 1
    }, 50); // Petit délai pour que le navigateur détecte le changement d'opacité initial
}

// Fonction pour fermer la modale
function closeModal() {
    modalImage.style.opacity = 0; // Déclencher la transition de sortie
    setTimeout(() => {
        galleryModal.style.display = 'none'; // Masquer la modale après la transition
        body.style.overflow = 'auto'; // Rétablir le défilement du corps
    }, 300); // Doit correspondre à la durée de la transition CSS
}

// Fonction pour afficher l'image précédente
function showPrevImage() {
    modalImage.style.opacity = 0; // Déclencher la transition de sortie de l'image actuelle
    setTimeout(() => {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        modalImage.src = galleryImages[currentImageIndex].src;
        modalImage.style.opacity = 1; // Déclencher la transition d'entrée de la nouvelle image
    }, 300); // Doit correspondre à la durée de la transition CSS
}

// Fonction pour afficher l'image suivante
function showNextImage() {
    modalImage.style.opacity = 0; // Déclencher la transition de sortie de l'image actuelle
    setTimeout(() => {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        modalImage.src = galleryImages[currentImageIndex].src;
        modalImage.style.opacity = 1; // Déclencher la transition d'entrée de la nouvelle image
    }, 300); // Doit correspondre à la durée de la transition CSS
}

// Écouteurs d'événements pour les images de la galerie
galleryImages.forEach((image, index) => {
    image.addEventListener('click', () => {
        currentImageIndex = index; // Mettre à jour l'index de l'image actuelle
        openModal(image.src); // Ouvrir la modale avec l'image cliquée
    });
});

// Écouteur d'événement pour le bouton de fermeture
closeButton.addEventListener('click', closeModal);

// Écouteurs d'événements pour les flèches de navigation
prevArrow.addEventListener('click', showPrevImage);
nextArrow.addEventListener('click', showNextImage);

// Fermer la modale en cliquant en dehors de l'image
galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) {
        closeModal();
    }
});

// Navigation au clavier (flèches gauche/droite)
document.addEventListener('keydown', (e) => {
    if (galleryModal.style.display === 'flex') { // Seulement si la modale est ouverte
        if (e.key === 'ArrowLeft') {
            showPrevImage();
        } else if (e.key === 'ArrowRight') {
            showNextImage();
        } else if (e.key === 'Escape') { // Fermer avec la touche Échap
            closeModal();
        }
    }
});
