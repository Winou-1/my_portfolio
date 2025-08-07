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

// Si vous avez des liens dans la page, vous pouvez ajouter ceci pour le fondu de sortie
// document.querySelectorAll('a').forEach(link => {
//     link.addEventListener('click', (event) => {
//         const href = link.getAttribute('href');
//         if (href && href !== '#' && !href.startsWith('tel:') && !href.startsWith('mailto:')) {
//             event.preventDefault();
//             gsap.to("#overlay", {
//                 opacity: 1,
//                 duration: 1.5,
//                 ease: "power2.inOut",
//                 onComplete: () => {
//                     window.location.href = href;
//                 }
//             });
//         }
//     });
// });

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