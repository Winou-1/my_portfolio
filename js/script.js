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
const menuHamburger = document.querySelector(".menu-hamburger")
const navLinks = document.querySelector(".nav-links")
 
menuHamburger.addEventListener('click',()=>{
navLinks.classList.toggle('mobile-menu')
})