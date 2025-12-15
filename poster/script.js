document.addEventListener('DOMContentLoaded', () => {
    // Enregistrement du plugin ScrollTrigger de GSAP
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Animation Initiale de la Section HERO (Fade-in) ---
    
    // Animation de l'arrière-plan (Parallaxe)
    gsap.to(".parallax-element", {
        opacity: 1, // Apparition de l'image
        duration: 1.5,
        ease: "power2.out",
        // Effet de Parallaxe : l'arrière-plan se déplace plus lentement
        y: "20%", 
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: 1.5 // Vitesse du scrub (1.5 = léger décalage après le défilement)
        }
    });

    // Animation du contenu (Titre, Slogan, Bouton)
    gsap.from(".hero-title, .hero-subtitle, .btn", {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.2, // Décalage entre chaque élément
        delay: 0.5,
        ease: "power3.out"
    });

    // --- 2. Animations d'Apparition des Posters (ScrollTrigger Reveal) ---

    // La fonction qui gère l'animation de révélation pour chaque élément
    function setupReveal(element, direction) {
        let xValue = 0;
        let yValue = 0;

        // Définir les valeurs de transformation basées sur l'attribut data
        if (direction === 'left') {
            xValue = -100;
        } else if (direction === 'right') {
            xValue = 100;
        } else if (direction === 'bottom') {
            yValue = 80;
        }

        gsap.from(element, {
            opacity: 0,
            x: xValue,
            y: yValue,
            rotation: 0, // Optionnel, pour ajouter un peu de rotation à l'apparition
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: element,
                start: "top 85%", // Déclenchement quand le haut de l'élément atteint 85% de la fenêtre
                end: "bottom 50%",
                toggleActions: "play none none none", // Jouer l'animation une seule fois
                // markers: true, // Décommenter pour visualiser les déclencheurs
            }
        });
    }

    // Cibler tous les posters et appliquer la fonction
    const posterItems = document.querySelectorAll('.poster-item');
    posterItems.forEach(item => {
        const direction = item.getAttribute('data-gsap-reveal');
        setupReveal(item, direction);
    });

    // --- 3. Animation du Titre de la Section ---
    gsap.from(".section-title", {
        opacity: 0,
        scale: 0.8,
        duration: 0.8,
        scrollTrigger: {
            trigger: ".section-title",
            start: "top 90%",
            toggleActions: "play none none none"
        }
    });

    // Note sur le Responsive : 
    // GSAP gère bien le responsive. Les animations basées sur ScrollTrigger 
    // s'adapteront automatiquement aux positions des éléments.
});