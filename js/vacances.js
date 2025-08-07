// Enregistrer ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Animation du titre LANDSCAPE
gsap.to(".landscape-title", {
    opacity: 1,
    scale: 1,
    duration: 2,
    ease: "power3.out"
});

// Animation des points de navigation
gsap.to(".nav-dot", {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.2,
    ease: "back.out(1.7)",
    scrollTrigger: {
        trigger: ".nav-menu",
        start: "top 80%",
        end: "bottom 20%"
    }
});

// Animations des sections de voyage avec effet d'image inspiré du CodePen
document.querySelectorAll('.travel-section').forEach((section, index) => {
    const image = section.querySelector('.travel-image img');
    const title = section.querySelector('.travel-title');
    const button = section.querySelector('.travel-button');

    // Animation de l'image (effet de masque et zoom)
    gsap.fromTo(image, {
        scale: 1.3,
        clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)'
    }, {
        scale: 1,
        clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
        duration: 1.5,
        ease: "power3.out",
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%"
        }
    });

    // Animation du titre
    gsap.to(title, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%"
        }
    });

    // Animation du bouton
    gsap.to(button, {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 0.6,
        ease: "power3.out",
        scrollTrigger: {
            trigger: section,
            start: "top 70%",
            end: "bottom 30%"
        }
    });

    // Parallaxe sur l'image
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

// Smooth scroll et navigation
document.querySelectorAll('[data-target]').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Menu latéral actif
ScrollTrigger.batch('.travel-section', {
    onEnter: (elements) => {
        elements.forEach((el, index) => {
            const sectionIndex = Array.from(document.querySelectorAll('.travel-section')).indexOf(el);
            updateSideNav(sectionIndex);
        });
    },
    onLeaveBack: (elements) => {
        elements.forEach((el, index) => {
            const sectionIndex = Array.from(document.querySelectorAll('.travel-section')).indexOf(el) - 1;
            updateSideNav(Math.max(0, sectionIndex));
        });
    }
});

function updateSideNav(activeIndex) {
    document.querySelectorAll('.side-nav-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index === activeIndex);
    });
}

// Navigation menu latéral
document.querySelectorAll('[data-section]').forEach(dot => {
    dot.addEventListener('click', (e) => {
        const sectionIndex = parseInt(e.currentTarget.getAttribute('data-section'));
        const sections = document.querySelectorAll('.travel-section');
        if (sections[sectionIndex]) {
            sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Animation des boutons hover
document.querySelectorAll('.travel-button').forEach(button => {
    button.addEventListener('mouseenter', () => {
        gsap.to(button, { scale: 1.05, duration: 0.3 });
    });
    
    button.addEventListener('mouseleave', () => {
        gsap.to(button, { scale: 1, duration: 0.3 });
    });
});






gsap.registerPlugin(ScrollTrigger);

const COUNT = 75;
const REPEAT_COUNT = 3;

const capture = document.querySelector("#capture");

function createCanvases(captureEl) {
	html2canvas(captureEl).then((canvas) => {
		const width = canvas.width;
		const height = canvas.height;
		const ctx = canvas.getContext("2d");
		const imageData = ctx.getImageData(0, 0, width, height);
		let dataList = [];
		captureEl.style.display = "none";

		for (let i = 0; i < COUNT; i++) {
			dataList.push(ctx.createImageData(width, height));
		}

		for (let x = 0; x < width; x++) {
			for (let y = 0; y < height; y++) {
				for (let l = 0; l < REPEAT_COUNT; l++) {
					const index = (x + y * width) * 4;
					const dataIndex = Math.floor(
						(COUNT * (Math.random() + (2 * x) / width)) / 3
					);
					for (let p = 0; p < 4; p++) {
						dataList[dataIndex].data[index + p] = imageData.data[index + p];
					}
				}
			}
		}

		dataList.forEach((data, i) => {
			let clonedCanvas = canvas.cloneNode();
			clonedCanvas.getContext("2d").putImageData(data, 0, 0);
			clonedCanvas.className = "capture-canvas";
			document.body.appendChild(clonedCanvas);

			const randomAngle = (Math.random() - 0.5) * 2 * Math.PI;
			const randomRotationAngle = 30 * (Math.random() - 0.5);

			let tl = gsap.timeline({
				scrollTrigger: {
					scrub: 1,
					start: () => 0,
					end: () => window.innerHeight * 2
				}
			});

			tl.to(clonedCanvas, {
				duration: 1,
				rotate: randomRotationAngle,
				translateX: 40 * Math.sin(randomAngle),
				translateY: 40 * Math.cos(randomAngle),
				opacity: 0,
				delay: (i / dataList.length) * 2
			});
		});
	});
}

const images = gsap.utils.toArray("img");

imagesLoaded(images).on("always", () => {
	createCanvases(capture);
});
