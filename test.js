// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Constants
const SECTION_HEIGHT = 1500;

// Utility functions
function mapRange(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Handle scroll for hero section
function handleHeroScroll() {
    const scrollY = window.scrollY;
    const centerImage = document.getElementById('centerImage');
    
    if (centerImage) {
        // Clip path animation
        const clip1 = mapRange(scrollY, 0, SECTION_HEIGHT, 25, 0);
        const clip2 = mapRange(scrollY, 0, SECTION_HEIGHT, 75, 100);
        const clipPath = `polygon(${clamp(clip1, 0, 100)}% ${clamp(clip1, 0, 100)}%, ${clamp(clip2, 0, 100)}% ${clamp(clip1, 0, 100)}%, ${clamp(clip2, 0, 100)}% ${clamp(clip2, 0, 100)}%, ${clamp(clip1, 0, 100)}% ${clamp(clip2, 0, 100)}%)`;
        
        // Background size and opacity animation
        // La taille du background a été restaurée à la valeur initiale
        const backgroundSize = `${mapRange(scrollY, 0, SECTION_HEIGHT + 500, 120, 100)}%`;
        const opacity = clamp(mapRange(scrollY, SECTION_HEIGHT, SECTION_HEIGHT + 500, 1, 0), 0, 1);
        
        centerImage.style.clipPath = clipPath;
        centerImage.style.backgroundSize = backgroundSize;
        centerImage.style.opacity = opacity;
    }
}

// Animate travel sections
document.querySelectorAll('.travel-section').forEach((section, index) => {
    const image = section.querySelector('.travel-image img');
    const title = section.querySelector('.travel-title');
    const button = section.querySelector('.travel-button');

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
            toggleActions: "play none none reverse",
        }
    });

    timeline
        .fromTo(image, {
            scale: 1.3,
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'
        }, {
            scale: 1,
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1.5,
            ease: "power3.out"
        }, 0)
        .to(title, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        }, 0.3)
        .to(button, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out"
        }, 0.6);

    // Parallax on image within the section
    gsap.to(image, {
        y: "-20%",
        ease: "none",
        scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });
});

// Update side navigation dots
ScrollTrigger.create({
    trigger: "body",
    start: "top top",
    end: "bottom bottom",
    onUpdate: self => {
        const sections = document.querySelectorAll('.travel-section');
        const scrollY = self.scroll();
        let activeIndex = -1;
        
        // Since the nav-menu is removed, we start checking from the first travel section
        const offset = document.querySelector('.travel-section').offsetTop;

        if (scrollY >= offset) {
            for (let i = 0; i < sections.length; i++) {
                const sectionTop = sections[i].offsetTop;
                const sectionHeight = sections[i].offsetHeight;
                if (scrollY >= sectionTop - window.innerHeight / 2 && scrollY < sectionTop + sectionHeight - window.innerHeight / 2) {
                    activeIndex = i;
                    break;
                }
            }
        } else {
            activeIndex = -1; // Not in a travel section
        }

        updateSideNav(activeIndex + 1); // +1 because hero section is index 0
    }
});

function updateSideNav(activeIndex) {
    document.querySelectorAll('.side-nav-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

// Smooth scroll functions
function scrollToSection(index) {
    const target = document.querySelectorAll('.travel-section')[index];
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }
}

// Navigation menu side dots
document.querySelectorAll('[data-section]').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const sectionIndex = parseInt(e.currentTarget.getAttribute('data-section'));
        const sections = document.querySelectorAll('.travel-section');
        if (sections[sectionIndex - 1]) {
            sections[sectionIndex - 1].scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Button hover animation
document.querySelectorAll('.travel-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        gsap.to(button, { scale: 1.05, duration: 0.3 });
    });
    button.addEventListener('mouseleave', () => {
        gsap.to(button, { scale: 1, duration: 0.3 });
    });
});

// Initial scroll handling
window.addEventListener('scroll', handleHeroScroll);
window.addEventListener('DOMContentLoaded', handleHeroScroll);

// On-load animation with GSAP
window.addEventListener('DOMContentLoaded', () => {
    const mainTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

    mainTimeline
        // Fade in the body to prevent FOUC (Flash of Unstyled Content)
        .fromTo("body", { opacity: 0 }, { opacity: 1, duration: 0.5 })
        
        // Staggered animation for the nav and hero image
        .fromTo(".nav .logo", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
        .fromTo(".nav .nav-button", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.6)
        .fromTo(".side-nav", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.8 }, 0.7)
        // Ajustement de la valeur initiale de scale pour l'animation au chargement
        .fromTo("#centerImage", { scale: 1.1, opacity: 0 }, { scale: 1.2, opacity: 1, duration: 1.5, ease: "power3.out" }, 0.8);
});

// Gérer l'ouverture et la fermeture du menu mobile
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

navbarToggle.addEventListener('click', () => {
    navbarToggle.classList.toggle('active');
    navbarMenu.classList.toggle('active');
});

// Fermer le menu lorsque l'on clique sur un lien (pour les appareils mobiles)
document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
    });
});