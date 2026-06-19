// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Main Application Controller
document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initCustomCursor();
    runPreloader(() => {
        // Callback after preloader completes
        initSmoothScroll();
        initScrollAnimations();
        initInteractiveForm();
    });
});

/* --------------------------------------------------------
   DIGITAL CLOCK IN NAV
-------------------------------------------------------- */
function initClock() {
    const clockEl = document.getElementById("nav-clock");
    if (!clockEl) return;
    
    const updateTime = () => {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = String(hours).padStart(2, '0');
        
        clockEl.textContent = `${hoursStr}:${minutes}:${seconds} ${ampm}`;
    };
    
    updateTime();
    setInterval(updateTime, 1000);
}

/* --------------------------------------------------------
   PREMIUM PRELOADER
-------------------------------------------------------- */
function runPreloader(onCompleteCallback) {
    const counterEl = document.getElementById("preloader-counter");
    const barEl = document.getElementById("preloader-bar");
    const preloaderEl = document.getElementById("preloader");
    
    let progress = 0;
    const duration = 2000; // 2 seconds total loader time
    const intervalTime = 20; 
    const step = 100 / (duration / intervalTime);
    
    const loaderInterval = setInterval(() => {
        progress += step;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loaderInterval);
            
            // Animate preloader fade-out
            const tl = gsap.timeline({
                onComplete: () => {
                    preloaderEl.style.display = "none";
                    if (onCompleteCallback) onCompleteCallback();
                }
            });
            
            tl.to(barEl, { width: "100%", duration: 0.2 })
              .to(preloaderEl, {
                  opacity: 0,
                  y: -50,
                  duration: 0.8,
                  ease: "power4.inOut"
              });
        }
        
        const count = Math.floor(progress);
        counterEl.textContent = String(count).padStart(2, '0');
        barEl.style.width = `${count}%`;
    }, intervalTime);
}

/* --------------------------------------------------------
   CUSTOM MOUSE-REACTIVE CURSOR
-------------------------------------------------------- */
function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    if (!cursor) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    
    // Check if device is desktop / supports hovering
    const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
    if (!isDesktop) {
        cursor.style.display = "none";
        return;
    }
    
    cursor.classList.add("active");
    
    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Smooth lerp for cursor following
    gsap.ticker.add(() => {
        const dt = 1 - Math.pow(0.15, gsap.ticker.deltaRatio());
        cursorX += (mouseX - cursorX) * dt;
        cursorY += (mouseY - cursorY) * dt;
        
        gsap.set(cursor, { x: cursorX, y: cursorY });
    });
    
    // Hover interactions
    const interactiveElements = document.querySelectorAll("a, button, .portfolio-card, input, textarea");
    interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.add("hovered");
            if (el.tagName === "A" && el.id !== "logo-link") {
                cursor.querySelector(".cursor-text").textContent = "GO";
            } else if (el.classList.contains("portfolio-card")) {
                cursor.querySelector(".cursor-text").textContent = "SCROLL";
            } else if (el.id === "decline-submit") {
                cursor.querySelector(".cursor-text").textContent = "TRASH";
            } else {
                cursor.querySelector(".cursor-text").textContent = "OFF";
            }
        });
        
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("hovered");
        });
    });
}

/* --------------------------------------------------------
   LENIS SMOOTH SCROLL INTEGRATION
-------------------------------------------------------- */
let lenis;
function initSmoothScroll() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Custom premium easeOut
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Connect Lenis scroll events to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

/* --------------------------------------------------------
   GSAP SCROLL-DRIVEN ANIMATIONS
-------------------------------------------------------- */
function initScrollAnimations() {
    // 1. Reveal Hero typography
    const heroTl = gsap.timeline();
    heroTl.to(".hero-section .reveal-text", {
        y: "0%",
        duration: 1.2,
        stagger: 0.15,
        ease: "power4.out"
    })
    .to(".hero-strike-through", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.6")
    .to(".hero-main-message", {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power4.out"
    }, "-=0.6")
    // Fade in primary sculpture image once loader completes
    .fromTo("#sculpture-wrapper", {
        scale: 0,
        opacity: 0,
    }, {
        scale: 1,
        opacity: 1,
        duration: 1.5,
        ease: "elastic.out(1, 0.75)"
    }, "-=1.2");

    // 2. Micro-floating animation loop for the middle finger image itself
    gsap.to("#sculpture-img", {
        y: "15px",
        rotationZ: "3deg",
        duration: 3,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    });

    // 3. 3D Mouse Parallax on the sculpture
    const isDesktop = window.matchMedia("(min-width: 1025px)").matches;
    if (isDesktop) {
        const tiltContainer = document.getElementById("sculpture-tilt");
        window.addEventListener("mousemove", (e) => {
            const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
            const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
            
            // Rotate the sculpture based on mouse position
            gsap.to(tiltContainer, {
                rotateY: x * 35, // 35 degrees max rotation on Y
                rotateX: -y * 35, // 35 degrees max rotation on X
                duration: 0.8,
                ease: "power2.out",
                overwrite: "auto"
            });
        });
    }

    // 4. SCROLL PATH TRIGGER FOR THE SCULPTURE
    // Section by section translation, scaling, and base rotation
    
    // Position/Scale settings:
    // HERO: Center-right (default CSS)
    // MANIFESTO: Move to the Left, rotate facing text
    // SERVICES (Pin): Move center-right, spin on vertical scroll
    // PORTFOLIO: Move top-right, rotate pointing out
    // FOOTER: Move Center, scale large, point straight forward
    
    const sculptureTl = gsap.timeline({
        scrollTrigger: {
            trigger: "main",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2, // Smooth interpolation
        }
    });

    // --- State 1: Hero to Manifesto ---
    sculptureTl.to("#sculpture-wrapper", {
        x: "-25vw", // Move to the left half
        y: "5vh",
        scale: 0.85,
        duration: 2,
    })
    .to("#sculpture-tilt", {
        // Neutralize parallax briefly to force design pose
        rotateZ: "-15deg",
        rotateY: "-40deg",
        rotateX: "10deg",
        duration: 2,
    }, 0);

    // --- State 2: Manifesto to Services (Pinning Section) ---
    // The services section scroll trigger pins the slide, making vertical scroll translate horizontally.
    sculptureTl.to("#sculpture-wrapper", {
        x: "28vw", // Move to the right side
        y: "-5vh",
        scale: 1.1,
        duration: 2,
    })
    .to("#sculpture-tilt", {
        rotateZ: "25deg",
        rotateY: "50deg",
        rotateX: "-5deg",
        duration: 2,
    }, "-=2");

    // --- State 3: Services to Portfolio ---
    sculptureTl.to("#sculpture-wrapper", {
        x: "-30vw", // Move to top left / center left
        y: "-10vh",
        scale: 0.9,
        duration: 2,
    })
    .to("#sculpture-tilt", {
        rotateZ: "-30deg",
        rotateY: "-30deg",
        rotateX: "15deg",
        duration: 2,
    }, "-=2");

    // --- State 4: Portfolio to Footer ---
    sculptureTl.to("#sculpture-wrapper", {
        x: "0vw",  // Absolute center
        y: "8vh",  // Center vertically
        scale: 1.55, // Enlarge dramatically
        duration: 2,
    })
    .to("#sculpture-tilt", {
        rotateZ: "0deg",
        rotateY: "0deg",
        rotateX: "0deg", // Face forward proudly
        duration: 2,
    }, "-=2");


    // 5. HORIZONTAL SCROLL IN SERVICES SECTION
    const servicesSlider = document.getElementById("services-slider");
    const pinContainer = document.querySelector(".services-pin-container");
    
    if (servicesSlider) {
        // Calculate scroll width dynamically
        const getScrollAmount = () => -(servicesSlider.scrollWidth - window.innerWidth);
        
        gsap.to(servicesSlider, {
            x: getScrollAmount,
            ease: "none",
            scrollTrigger: {
                trigger: ".services-section",
                start: "top top",
                end: () => `+=${servicesSlider.scrollWidth - window.innerWidth}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true, // Recalculate on window resize
            }
        });
    }

    // 6. TEXT REVEALS ON GENERAL SECTIONS
    const revealTitles = document.querySelectorAll(".reveal-title");
    revealTitles.forEach((title) => {
        gsap.from(title, {
            opacity: 0,
            y: 40,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: title,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    });

    const revealParagraphs = document.querySelectorAll(".reveal-paragraph");
    revealParagraphs.forEach((para) => {
        gsap.from(para.children, {
            opacity: 0,
            y: 30,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: para,
                start: "top 80%",
                toggleActions: "play none none none"
            }
        });
    });

    // 7. CARD REVEALS (PORTFOLIO SECTION)
    const revealCards = document.querySelectorAll(".reveal-card");
    revealCards.forEach((card, index) => {
        gsap.from(card, {
            opacity: 0,
            y: 60,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // 8. GIANT OUTRO TEXT REVEAL IN FOOTER
    const footerText = document.getElementById("footer-huge-text");
    if (footerText) {
        ScrollTrigger.create({
            trigger: ".footer-section",
            start: "top 60%",
            onEnter: () => footerText.classList.add("revealed"),
            onLeaveBack: () => footerText.classList.remove("revealed")
        });
    }
}

/* --------------------------------------------------------
   INTERACTIVE DECLINE FORM (Trash Submission)
-------------------------------------------------------- */
function initInteractiveForm() {
    const form = document.getElementById("decline-form");
    const inputWrap = document.getElementById("form-input-wrap");
    const feedback = document.getElementById("form-feedback");
    const emailInput = document.getElementById("decline-email");
    const submitBtn = document.getElementById("decline-submit");
    
    if (!form) return;
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        if (!emailInput.value) return;
        
        // Custom interactive visual effect: collapse input field
        const tl = gsap.timeline({
            onComplete: () => {
                inputWrap.classList.add("hidden");
                feedback.classList.remove("hidden");
                
                // Scale up the sculpture reactive bounce
                gsap.fromTo("#sculpture-wrapper", {
                    scale: 1.55,
                }, {
                    scale: 1.8,
                    duration: 0.5,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.out"
                });
            }
        });
        
        // Visual compression of input bar
        tl.to(emailInput, {
            opacity: 0,
            x: -20,
            duration: 0.3,
            ease: "power2.in"
        })
        .to(submitBtn, {
            opacity: 0,
            scale: 0.8,
            duration: 0.3,
            ease: "power2.in"
        }, "-=0.2")
        .to(inputWrap, {
            height: 0,
            paddingBottom: 0,
            borderColor: "rgba(0,0,0,0)",
            duration: 0.4,
            ease: "power3.inOut"
        });
    });
}
