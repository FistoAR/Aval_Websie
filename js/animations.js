// GSAP & ScrollTrigger Page Animations
document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
    
    // Initialize Lenis for global momentum
    if (typeof Lenis !== 'undefined') {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smooth: true,
            smoothTouch: false,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    }
    
    // Wipe GSAP scroll memory caching on load
    if (typeof ScrollTrigger.clearScrollMemory === 'function') {
        ScrollTrigger.clearScrollMemory();
    }
    
    // Force native window to top
    window.scrollTo(0, 0);

    // 1. Magnetic Custom Cursor
    const cursor = document.getElementById("custom-cursor");
    const ring = document.getElementById("custom-cursor-ring");

    if (cursor && ring) {
        // Optimize mouse updates using gsap.quickSetter
        const setCursorX = gsap.quickSetter(cursor, "x", "px");
        const setCursorY = gsap.quickSetter(cursor, "y", "px");
        const setRingX = gsap.quickSetter(ring, "x", "px");
        const setRingY = gsap.quickSetter(ring, "y", "px");

        let mouseX = -100;
        let mouseY = -100;

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Instantly update dot
            setCursorX(mouseX);
            setCursorY(mouseY);
        });

        // Smoothly follow ring
        gsap.ticker.add(() => {
            const dt = 1.0 - Math.pow(1.0 - 0.15, gsap.ticker.deltaRatio());
            const rx = gsap.getProperty(ring, "x") || 0;
            const ry = gsap.getProperty(ring, "y") || 0;

            setRingX(rx + (mouseX - rx) * dt);
            setRingY(ry + (mouseY - ry) * dt);
        });

        // Hover effect links and buttons
        const hovers = document.querySelectorAll("a, button, .cursor-hover");
        hovers.forEach(el => {
            el.addEventListener("mouseenter", () => {
                document.body.classList.add("cursor-hover-active");
            });
            el.addEventListener("mouseleave", () => {
                document.body.classList.remove("cursor-hover-active");
            });
        });
    }

    // 1b. Smooth Anchor Scroll (GSAP-powered)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();

            // Close mobile menu if open
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('translate-x-full')) {
                mobileMenu.classList.add('translate-x-full');
            }

            let offset = 0;
            // The contact section has a 2000px pinned animation. We want to land at the end of it so it's fully visible.
            if (target.id === 'contact') {
                offset = -2000;
            }

            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: target, offsetY: offset },
                ease: "power3.inOut"
            });
        });
    });

    // 2. Magnetic Buttons Effect
    const magneticElements = document.querySelectorAll(".magnetic");
    magneticElements.forEach(el => {
        el.addEventListener("mousemove", (e) => {
            const rect = el.getBoundingClientRect();
            // Calculate cursor offset from center of button
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            // Pull the button towards the cursor
            gsap.to(el, {
                x: x * 0.35,
                y: y * 0.35,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        el.addEventListener("mouseleave", () => {
            // Snap back
            gsap.to(el, {
                x: 0,
                y: 0,
                duration: 0.6,
                ease: "elastic.out(1, 0.4)"
            });
        });
    });

    // 3. Mobile Navigation Menu Toggle
    const menuBtn = document.getElementById("mobile-menu-btn");
    const menuClose = document.getElementById("mobile-menu-close");
    const mobileMenu = document.getElementById("mobile-menu");
    const menuLinks = document.querySelectorAll(".mobile-nav-link");

    if (menuBtn && mobileMenu) {
        const openMenu = () => {
            mobileMenu.classList.add("active");
            document.body.classList.add("overflow-hidden");
            // Stagger nav links reveal
            gsap.fromTo(menuLinks,
                { x: 50, opacity: 0 },
                { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, delay: 0.2, ease: "power2.out" }
            );
        };

        const closeMenu = () => {
            mobileMenu.classList.remove("active");
            document.body.classList.remove("overflow-hidden");
        };

        menuBtn.addEventListener("click", openMenu);
        if (menuClose) menuClose.addEventListener("click", closeMenu);
        menuLinks.forEach(link => link.addEventListener("click", closeMenu));
    }

    // 4. Reveal Animations on scroll for general sections
    // Reveal text elements
    gsap.utils.toArray("h2:not(.benefits-fade, #recipes h2), .section-subtitle:not(#recipes p)").forEach(heading => {
        gsap.from(heading, {
            scrollTrigger: {
                trigger: heading,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    });

    // Ethos section parallax images
    const ethosSection = document.getElementById("ethos");
    if (ethosSection) {
        const ethosImg1 = ethosSection.querySelector('[data-speed="0.9"]');
        const ethosImg2 = ethosSection.querySelector('[data-speed="1.1"]');

        if (ethosImg1) {
            gsap.to(ethosImg1, {
                scrollTrigger: {
                    trigger: ethosSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: -60,
                ease: "none"
            });
        }

        if (ethosImg2) {
            gsap.to(ethosImg2, {
                scrollTrigger: {
                    trigger: ethosSection,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                },
                y: -120,
                ease: "none"
            });
        }
    }

    // 5. Pinned Horizontal Collection Section
    const container = document.querySelector(".horizontal-scroll-container");
    if (container) {
        const panels = gsap.utils.toArray(".panel", container);

        // Pin horizontal section and scroll panels
        gsap.to(panels, {
            xPercent: -100 * (panels.length - 1),
            ease: "none",
            scrollTrigger: {
                trigger: "#collection",
                pin: true,
                scrub: 1,
                // End after scrolling the equal height of horizontally translated components
                end: () => `+=${container.offsetWidth}`,
                invalidateOnRefresh: true
            }
        });

        // Animate images zoom in/out as panels enter screen
        panels.forEach((panel, i) => {
            if (i === 0) return; // Skip title slide

            const img = panel.querySelector(".bg-cover");
            const details = panel.querySelector(".space-y-6");

            if (img && details) {
                // Image zoom/shift effect
                gsap.fromTo(img,
                    { scale: 1.15, y: 15 },
                    {
                        scale: 1,
                        y: 0,
                        ease: "none",
                        scrollTrigger: {
                            trigger: panel,
                            containerAnimation: gsap.globalTimeline.getChildren().find(c => c.vars.trigger === "#collection"), // Match parent animation trigger
                            start: "left right",
                            end: "right left",
                            scrub: true
                        }
                    }
                );

                // Reveal details
                gsap.from(details.children, {
                    y: 30,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: gsap.globalTimeline.getChildren().find(c => c.vars.trigger === "#collection"),
                        start: "left 60%",
                        toggleActions: "play none none none"
                    }
                });
            }
        });
    }

    // 6. Editorial Masonry Grid zoom and parallax triggers
    const gridItems = gsap.utils.toArray(".grid-cols-12 > div");
    gridItems.forEach(item => {
        const img = item.querySelector(".bg-cover");
        if (img) {
            gsap.fromTo(img,
                { scale: 1.1 },
                {
                    scale: 1,
                    ease: "none",
                    scrollTrigger: {
                        trigger: item,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );
        }
    });

    // 7. Sticky Slide Reveal for Aval Types Showcase (3D Stack Perspective Reveal)
    const showcaseContainer = document.querySelector(".sticky-showcase-container");
    if (showcaseContainer) {
        const slides = gsap.utils.toArray(".showcase-slide");
        const progress = document.getElementById("showcase-progress-bar");
        const counter = document.getElementById("showcase-counter-current");

        // Force proper 3D perspective rendering on the parent wrapper
        const stackWrapper = slides[0].parentElement;
        if (stackWrapper) {
            gsap.set(stackWrapper, { perspective: 1200 });
        }

        // Initialize starting styles for all slides
        slides.forEach((slide, i) => {
            if (i > 0) {
                // Stack subsequent slides below off-screen with rotation & scaling
                gsap.set(slide, {
                    yPercent: 100,
                    rotationX: 12,
                    rotationY: -5,
                    scale: 0.85,
                    opacity: 0,
                    zIndex: 10 + i
                });
            } else {
                gsap.set(slide, { zIndex: 10 });
            }
        });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: showcaseContainer,
                start: "top top",
                end: "+=4500",
                scrub: 0.5,
                pin: true,
            }
        });

        // Set up slides animation
        slides.forEach((slide, index) => {
            if (index === 0) return;

            const prevSlide = slides[index - 1];

            // Step 1: Transition the previous slide away (pivots back, scales down, moves completely left off-screen)
            tl.to(prevSlide, {
                xPercent: -110,
                rotationY: -25,
                scale: 0.7,
                opacity: 0,
                duration: 1.2,
                ease: "power2.inOut"
            }, `slide-${index}`);

            // Step 2: Transition the current slide in (slides up, rotates flat, scales to full focus)
            tl.to(slide, {
                yPercent: 0,
                rotationX: 0,
                rotationY: 0,
                scale: 1,
                opacity: 1,
                duration: 1.2,
                ease: "power2.inOut"
            }, `slide-${index}`);

            // Step 3: Update indicators inside timeline
            tl.call(() => {
                if (counter && progress) {
                    const currentSlideNum = `0${index + 1}`;
                    counter.innerText = currentSlideNum;
                    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
                }
            }, null, `slide-${index}`);

            // Quick rest frame between transitions
            if (index < slides.length - 1) {
                tl.to({}, { duration: 0.4 });
            }
        });

        // --- Paper.js Floating Outline Leaves Animation ---
        const canvas = document.getElementById("showcase-leaves-canvas");
        if (canvas) {
            // Setup a new paper project scope on this canvas
            const leavesScope = new paper.PaperScope();
            leavesScope.setup(canvas);

            const view = leavesScope.view;
            const count = 28;
            const leaves = [];

            // Helper to draw a single paddy leaf/husk outline path
            const createLeafSymbol = () => {
                const path = new leavesScope.Path();
                path.strokeColor = new leavesScope.Color(1, 1, 1, 0.55); // clear white border outline
                path.strokeWidth = 1.0;
                path.fillColor = 'transparent';

                // Draw leaf path
                path.moveTo(0, 0);
                path.cubicCurveTo(12, -8, 28, -4, 40, 0);
                path.cubicCurveTo(28, 4, 12, 8, 0, 0);
                path.closePath();

                // Add minor inner grain line
                const line = new leavesScope.Path();
                line.strokeColor = new leavesScope.Color(1, 1, 1, 0.28); // white inner line
                line.strokeWidth = 0.6;
                line.moveTo(0, 0);
                line.lineTo(32, 0);

                const group = new leavesScope.Group([path, line]);
                return new leavesScope.SymbolDefinition(group);
            };

            const leafSymbol = createLeafSymbol();

            // Spawn floating leaves
            for (let i = 0; i < count; i++) {
                const center = leavesScope.Point.random().multiply(view.size);
                const placed = leafSymbol.place(center);

                const scale = 0.4 + Math.random() * 0.8;
                placed.scale(scale);
                placed.rotate(Math.random() * 360);

                leaves.push({
                    item: placed,
                    vector: new leavesScope.Point(
                        -0.4 - Math.random() * 0.8, // drift leftwards
                        0.5 + Math.random() * 1.2   // drift downwards
                    ),
                    speed: 0.8 + Math.random() * 1.5,
                    rotSpeed: (Math.random() - 0.5) * 0.8,
                    swayAngle: Math.random() * Math.PI * 2,
                    swaySpeed: 0.01 + Math.random() * 0.02
                });
            }

            // Track scroll interaction for wind speed increases
            let lastScrollY = window.scrollY;
            let windMultiplier = 1.0;

            window.addEventListener("scroll", () => {
                const currentScrollY = window.scrollY;
                const delta = Math.abs(currentScrollY - lastScrollY);
                lastScrollY = currentScrollY;

                // Increase wind based on active scroll
                windMultiplier = 1.0 + Math.min(delta * 0.12, 4.0);
            }, { passive: true });

            // Animate frame updates
            view.onFrame = (event) => {
                // Decay scroll wind multiplier back to 1.0
                windMultiplier += (1.0 - windMultiplier) * 0.05;

                leaves.forEach(leaf => {
                    // Update swaying angle
                    leaf.swayAngle += leaf.swaySpeed;
                    const sway = Math.sin(leaf.swayAngle) * 0.45;

                    // Apply vectors with wind multiplier
                    const moveX = (leaf.vector.x + sway) * leaf.speed * windMultiplier;
                    const moveY = leaf.vector.y * leaf.speed * windMultiplier;
                    leaf.item.position.x += moveX;
                    leaf.item.position.y += moveY;

                    // Rotate leaf
                    leaf.item.rotate(leaf.rotSpeed * windMultiplier);

                    // Bound checks: recycle leaves if they go off canvas
                    if (leaf.item.position.y > view.size.height + 40) {
                        leaf.item.position.y = -40;
                        leaf.item.position.x = Math.random() * view.size.width;
                    }
                    if (leaf.item.position.x < -40) {
                        leaf.item.position.x = view.size.width + 40;
                    }
                    if (leaf.item.position.x > view.size.width + 40) {
                        leaf.item.position.x = -40;
                    }
                });
            };

            // Resize handler
            view.onResize = () => {
                leaves.forEach(leaf => {
                    if (leaf.item.position.x > view.size.width) {
                        leaf.item.position.x = Math.random() * view.size.width;
                    }
                    if (leaf.item.position.y > view.size.height) {
                        leaf.item.position.y = Math.random() * view.size.height;
                    }
                });
            };
        }
    }

    // 9. Scroll Sequence Animation
    const sequenceContainer = document.querySelector(".sequence-container");
    const canvas = document.getElementById("sequence-canvas");
    
    // Setup Audio
    const frameAudio = new Audio('assets/frame audio.mp3');
    frameAudio.loop = true;
    frameAudio.volume = 0.04; // mild volume (0.3 is 30%)
    
    const playFrameAudio = () => {
        frameAudio.play().catch(e => console.log("Audio play blocked:", e));
    };
    const pauseFrameAudio = () => {
        frameAudio.pause();
        frameAudio.currentTime = 0;
    };

    if (sequenceContainer && canvas) {
        const ctx = canvas.getContext("2d");

        // Define canvas dimensions dynamically with High DPI support
        let canvasWidth = window.innerWidth;
        let canvasHeight = window.innerHeight;
        
        const setCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvasWidth = window.innerWidth;
            canvasHeight = window.innerHeight;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            canvas.style.width = `${canvasWidth}px`;
            canvas.style.height = `${canvasHeight}px`;
            ctx.scale(dpr, dpr);
            render(true); // force render on resize
        };

        const frameCount = 240;
        const currentFrameUrl = index => `assets/frames/${String(index + 1).padStart(5, '0')}.webp`;

        // Preload images
        const images = [];
        const playhead = { frame: 0 };

        let loadedCount = 0;
        const loadImages = () => {
            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrameUrl(i);
                img.onload = () => {
                    loadedCount++;
                    if (loadedCount === frameCount) {
                        setCanvasSize();
                        window.addEventListener("resize", setCanvasSize);
                        initScrollTrigger();
                    }
                };
                images.push(img);
            }
        };

        let lastFrame = -1;
        const render = (force = false) => {
            const currentFrameNum = Math.round(playhead.frame);
            if (!force && currentFrameNum === lastFrame) return; // Prevent excessive redraws
            lastFrame = currentFrameNum;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            const img = images[currentFrameNum];
            if (img && img.complete) {
                // Object-cover aspect ratio fit
                const canvasAspect = canvasWidth / canvasHeight;
                const imgAspect = img.width / img.height;
                let drawWidth, drawHeight, drawX, drawY;

                if (canvasAspect > imgAspect) {
                    drawWidth = canvasWidth;
                    drawHeight = canvasWidth / imgAspect;
                    drawX = 0;
                    drawY = (canvasHeight - drawHeight) / 2;
                } else {
                    drawWidth = canvasHeight * imgAspect;
                    drawHeight = canvasHeight;
                    drawX = (canvasWidth - drawWidth) / 2;
                    drawY = 0;
                }

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            }
        };

        const initScrollTrigger = () => {
            gsap.to(playhead, {
                frame: frameCount - 1,
                ease: "none",
                scrollTrigger: {
                    trigger: sequenceContainer,
                    start: "top top",
                    end: "+=3500",
                    scrub: true, // Let Lenis handle the smoothing natively without GSAP delay
                    pin: true,
                    onUpdate: render,
                    onEnter: playFrameAudio,
                    onLeave: pauseFrameAudio,
                    onEnterBack: playFrameAudio,
                    onLeaveBack: pauseFrameAudio
                }
            });
            ScrollTrigger.sort();
        };

        loadImages();
    }

    // 9.5 Gallery Section Reveal & Zoom Hover
    const gallerySection = document.getElementById("gallery");
    if (gallerySection) {
        const galleryItems = document.querySelectorAll("#gallery .gallery-item");
        
        galleryItems.forEach((item) => {
            // 1. Scroll Reveal Animation
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%",
                    end: "bottom 10%",
                    toggleActions: "play reverse play reverse"
                },
                y: 50,
                opacity: 0,
                scale: 0.95,
                duration: 0.6,
                ease: "power2.out"
            });

            // 2. Magnifying Zoom Hover Effect (Flipkart/Amazon style)
            const img = item.querySelector("img");
            if (img) {
                // Override default tailwind transition to avoid lagging transform-origin
                img.style.transition = "transform 0.3s ease-out, filter 0.3s ease-out";
                
                item.addEventListener("mousemove", (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const xPercent = (x / rect.width) * 100;
                    const yPercent = (y / rect.height) * 100;

                    img.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                    img.style.transform = "scale(1.8)";
                });

                item.addEventListener("mouseleave", () => {
                    img.style.transformOrigin = "center center";
                    img.style.transform = "scale(1)";
                });
            }
        });
    }

    // 10. Recipes Grid Scroll Reveal & Floating Animation
    const recipesSection = document.getElementById("recipes");
    if (recipesSection) {
        const recipeCards = document.querySelectorAll("#recipes .group");
        const revealElements = document.querySelectorAll("#recipes .mb-16, #recipes .group");
        
        // 1. Scroll Reveal (fades in and out when entering/leaving view)
        gsap.from(revealElements, {
            scrollTrigger: {
                trigger: recipesSection,
                start: "top 85%",
                end: "bottom 15%",
                toggleActions: "play reverse play reverse"
            },
            scale: 0.9,
            opacity: 0,
            duration: 0.6,
            stagger: 0.15,
            ease: "power2.out"
        });

        // 2. Zig-Zag Floating Animation
        recipeCards.forEach((card, i) => {
            // Odd cards float down, even cards float up
            const yOffset = i % 2 === 0 ? 12 : -12; 
            
            const floatAnim = gsap.to(card, {
                y: yOffset,
                duration: 2.5,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
            });

            // Pause float when hovered
            card.addEventListener("mouseenter", () => floatAnim.pause());
            card.addEventListener("mouseleave", () => floatAnim.play());
        });
    }

    // 12. Contact Section — Bidirectional Scroll Entrance/Exit
    const contactSection = document.getElementById("contact");

    if (contactSection) {
        const contactImg    = contactSection.querySelector("img");
        const contactSvg    = contactSection.querySelector("svg");
        const contactInfo   = contactSection.querySelector(".contact-info");
        const contactLabel  = contactInfo  ? contactInfo.querySelector("span") : null;
        const contactHdg    = contactInfo  ? contactInfo.querySelectorAll("h2") : [];
        const contactInputs = contactInfo  ? contactInfo.querySelectorAll("div[class*='border'], button[type='submit']") : [];

        // Start everything invisible
        gsap.set(contactImg,    { opacity: 0, scale: 1.08 });
        gsap.set(contactSvg,    { opacity: 0, x: -60 });
        gsap.set(contactInfo,   { opacity: 0 });
        if (contactLabel)         gsap.set(contactLabel,  { opacity: 0, y: 20 });
        if (contactHdg.length)    gsap.set(contactHdg,   { opacity: 0, y: 30 });
        if (contactInputs.length) gsap.set(contactInputs, { opacity: 0, y: 18 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: contactSection,
                start: "top top",      // pin when contact section hits top of screen
                end: "+=2000",         // pin for 2 screen scrolls
                pin: true,             // pin the section
                scrub: 1,              // scrub animations smoothly as user scrolls
                invalidateOnRefresh: true
            }
        });

        // 1. BG image fades in + zoom-out
        tl.to(contactImg, {
            opacity: 1,
            scale: 1,
            duration: 1.0,
            ease: "power2.out"
        })

        // 2. SVG curve slides in from left
        .to(contactSvg, {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out"
        }, "-=0.6")

        // 3. Outer info wrapper visible
        .to(contactInfo, {
            opacity: 1,
            duration: 0.01
        }, "-=0.3")

        // 4. Label fades up
        .to(contactLabel, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power2.out"
        }, "-=0.15")

        // 5. Headings stagger up
        .to(contactHdg, {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.14,
            ease: "power3.out"
        }, "-=0.25")

        // 6. Form fields stagger up
        .to(contactInputs, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            stagger: 0.09,
            ease: "power2.out"
        }, "-=0.25");
    }

    // 12b. Contact Details Row in footer — bidirectional
    const contactDetails = document.querySelector(".contact-details-row");
    if (contactDetails) {
        gsap.from(contactDetails, {
            scrollTrigger: {
                trigger: contactDetails,
                start: "top 85%",
                end: "top 20%",
                toggleActions: "play reverse play reverse"
            },
            opacity: 0,
            y: 24,
            duration: 0.8,
            ease: "power2.out"
        });
    }

    // 13. Nav Pill Flower Icons (Paper.js)
    function initNavFlower(canvasId) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const scope = new paper.PaperScope();
        scope.setup(canvas);
        
        // Draw the minimalist 3-leaf flower using SVG path data
        const pathData = "M12 22 C12 22 7 14 12 4 C17 14 12 22 12 22 Z M12 20 C12 20 2 16 3 9 C7 7 12 15 12 15 Z M12 20 C12 20 22 16 21 9 C17 7 12 15 12 15 Z M12 12 L12 22 M7 15 L5 13 M17 15 L19 13";
        const flower = new scope.CompoundPath(pathData);
        
        flower.strokeColor = '#a3c945'; // Light green to match active text
        flower.strokeWidth = 1.2;
        flower.fillColor = 'transparent';
        flower.strokeCap = 'round';
        flower.strokeJoin = 'round';
        
        // Center and scale to fit the 24x24 canvas
        flower.scale(0.75);
        flower.position = scope.view.center;
        
        // Add a gentle idle breathing animation
        scope.view.onFrame = (event) => {
            const scale = 1 + Math.sin(event.time * 2.5) * 0.005;
            flower.scale(scale);
        };
    }
    
    initNavFlower("nav-flower-left");
    initNavFlower("nav-flower-right");

    // 14. Back to Top Button Logic
    const backToTopBtn = document.getElementById("back-to-top");
    if (backToTopBtn) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > window.innerHeight) {
                backToTopBtn.classList.remove("opacity-0", "pointer-events-none");
                backToTopBtn.classList.add("opacity-100", "pointer-events-auto");
            } else {
                backToTopBtn.classList.remove("opacity-100", "pointer-events-auto");
                backToTopBtn.classList.add("opacity-0", "pointer-events-none");
            }
        });

        backToTopBtn.addEventListener("click", () => {
            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: 0 },
                ease: "power3.inOut"
            });
        });
    }
});
