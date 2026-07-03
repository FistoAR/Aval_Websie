// GSAP & ScrollTrigger Page Animations
document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

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

            gsap.to(window, {
                duration: 1.2,
                scrollTo: { y: target, offsetY: 0 },
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
    gsap.utils.toArray("h2, .section-subtitle").forEach(heading => {
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
    if (sequenceContainer && canvas) {
        const ctx = canvas.getContext("2d");

        // Define canvas dimensions dynamically
        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        const frameCount = 240;
        const currentFrame = index => `assets/frames/${String(index + 1).padStart(5, '0')}.webp`;

        // Preload images
        const images = [];
        const playhead = { frame: 0 };

        let loadedCount = 0;
        const loadImages = () => {
            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame(i);
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

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const img = images[Math.floor(playhead.frame)];
            if (img && img.complete) {
                // Object-cover aspect ratio fit
                const canvasAspect = canvas.width / canvas.height;
                const imgAspect = img.width / img.height;
                let drawWidth, drawHeight, drawX, drawY;

                if (canvasAspect > imgAspect) {
                    drawWidth = canvas.width;
                    drawHeight = canvas.width / imgAspect;
                    drawX = 0;
                    drawY = (canvas.height - drawHeight) / 2;
                } else {
                    drawWidth = canvas.height * imgAspect;
                    drawHeight = canvas.height;
                    drawX = (canvas.width - drawWidth) / 2;
                    drawY = 0;
                }

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            }
        };

        const initScrollTrigger = () => {
            gsap.to(playhead, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: sequenceContainer,
                    start: "top top",
                    end: "+=3500",
                    scrub: 1.2,
                    pin: true,
                    onUpdate: render
                }
            });
            ScrollTrigger.sort();
        };

        loadImages();
    }

    // 10. 3D Arch Carousel Pinned on Scroll (Stag 2 Scrolls with Scroll-driven animation)
    const archCards = document.querySelectorAll(".recipe-arch-card");
    const recipesSection = document.getElementById("recipes");
    
    if (archCards.length > 0 && recipesSection) {
        let activeIndex = 0;
        const total = archCards.length;
        let autoPlayTimer = null;
        
        const updateArch = () => {
            const width = window.innerWidth;
            // Smoothly scale spacing based on screen width to fit all desktop resolutions perfectly
            const xOffsetMultiplier = Math.min(Math.max(width * 0.22, 140), 420);
            const yOffsetMultiplier = Math.min(Math.max(width * 0.02, 15), 35);
            
            archCards.forEach((card, i) => {
                let offset = i - activeIndex;
                
                // Wrap around loop path
                if (offset < -total / 2) offset += total;
                if (offset > total / 2) offset -= total;
                
                const absOffset = Math.abs(offset);
                
                // Arch transforms (bending down at sides)
                const tx = offset * xOffsetMultiplier;
                const ty = absOffset * yOffsetMultiplier; // Bend down on sides to form arch
                const tz = -absOffset * 180; // Push back in Z space
                const ry = -offset * 25; // Rotate facing inward
                const rz = offset * 4;   // Slight roll/fan rotation
                const scale = 0.90 - absOffset * 0.12; // Center is 0.90 (little small), side 1 is 0.78, side 2 is 0.66
                
                // Show 5 cards: center (1.0), side 1 (0.85), side 2 (0.55 - little bit only hide), rest (0.0)
                const opacity = absOffset === 0 ? 1.0 : (absOffset === 1 ? 0.85 : (absOffset === 2 ? 0.55 : 0.0));
                const pointerEvents = absOffset <= 2 ? "auto" : "none";
                const zIndex = 100 - absOffset;
                
                gsap.to(card, {
                    x: tx,
                    y: ty,
                    z: tz,
                    rotationY: ry,
                    rotationZ: rz,
                    scale: scale,
                    opacity: opacity,
                    zIndex: zIndex,
                    pointerEvents: pointerEvents,
                    duration: 1.2,
                    ease: "power2.inOut",
                    transformPerspective: 1200,
                    transformOrigin: "bottom center"
                });
            });
        };
        
        const prevSlide = () => {
            activeIndex = (activeIndex - 1 + total) % total;
            updateArch();
        };
        
        const nextSlide = () => {
            activeIndex = (activeIndex + 1) % total;
            updateArch();
        };
        
        const startAutoPlay = () => {
            clearInterval(autoPlayTimer);
            autoPlayTimer = setInterval(nextSlide, 5000); // Auto change every 5 seconds
        };
        
        let lastChangeTime = 0;

        // Pinned ScrollTrigger (Stag 2 scrolls with scroll progress animation)
        gsap.to({}, {
            scrollTrigger: {
                trigger: recipesSection,
                start: "top top",
                end: "+=2000",
                pin: true,
                scrub: 0.5, // Scroll-driven transition
                onUpdate: (self) => {
                    const now = Date.now();
                    const progressIndex = Math.min(
                        Math.floor(self.progress * total),
                        total - 1
                    );
                    if (progressIndex !== activeIndex) {
                        // Throttle rapid scroll triggers to once every 600ms
                        if (now - lastChangeTime < 600) return;
                        
                        activeIndex = progressIndex;
                        updateArch();
                        lastChangeTime = now;
                        startAutoPlay(); // Reset autoplay timer on scroll transition
                    }
                }
            }
        });
        
        // Force sort ScrollTrigger to ensure pinning spacer matches actual order of elements
        ScrollTrigger.sort();
        
        // Hook up left/right navigation buttons
        const btnPrev = document.getElementById("recipe-prev");
        const btnNext = document.getElementById("recipe-next");
        if (btnPrev) {
            btnPrev.addEventListener("click", () => {
                prevSlide();
                startAutoPlay();
            });
        }
        if (btnNext) {
            btnNext.addEventListener("click", () => {
                nextSlide();
                startAutoPlay();
            });
        }
        
        // Allow clicking on side cards to select/jump directly
        archCards.forEach((card, i) => {
            card.addEventListener("click", () => {
                activeIndex = i;
                updateArch();
                startAutoPlay();
            });
        });
        
        // Resize listener
        window.addEventListener("resize", updateArch);
        
        // Initial setup
        updateArch();
        startAutoPlay();
    }

    // 11. Paper.js Recipes Floating Leaves Canvas Animation
    const recipesCanvas = document.getElementById("recipes-leaves-canvas");
    if (recipesCanvas) {
        const recipesScope = new paper.PaperScope();
        recipesScope.setup(recipesCanvas);

        const rView = recipesScope.view;
        const rCount = 24;
        const rLeaves = [];

        const createRecipeLeafSymbol = () => {
            const path = new recipesScope.Path();
            path.strokeColor = new recipesScope.Color(1, 1, 1, 0.45);
            path.strokeWidth = 1.0;
            path.fillColor = 'transparent';
            
            path.moveTo(0, 0);
            path.cubicCurveTo(12, -8, 28, -4, 40, 0);
            path.cubicCurveTo(28, 4, 12, 8, 0, 0);
            path.closePath();
            
            const line = new recipesScope.Path();
            line.strokeColor = new recipesScope.Color(1, 1, 1, 0.22);
            line.strokeWidth = 0.6;
            line.moveTo(0, 0);
            line.lineTo(32, 0);
            
            const group = new recipesScope.Group([path, line]);
            return new recipesScope.SymbolDefinition(group);
        };

        const rLeafSymbol = createRecipeLeafSymbol();

        for (let i = 0; i < rCount; i++) {
            const center = recipesScope.Point.random().multiply(rView.size);
            const placed = rLeafSymbol.place(center);
            
            const scale = 0.4 + Math.random() * 0.8;
            placed.scale(scale);
            placed.rotate(Math.random() * 360);

            rLeaves.push({
                item: placed,
                vector: new recipesScope.Point(
                    -0.3 - Math.random() * 0.6,
                    0.4 + Math.random() * 1.0
                ),
                speed: 0.7 + Math.random() * 1.3,
                rotSpeed: (Math.random() - 0.5) * 0.6,
                swayAngle: Math.random() * Math.PI * 2,
                swaySpeed: 0.01 + Math.random() * 0.015
            });
        }

        rView.onFrame = (event) => {
            rLeaves.forEach(leaf => {
                leaf.swayAngle += leaf.swaySpeed;
                const sway = Math.sin(leaf.swayAngle) * 0.35;

                leaf.item.position.x += (leaf.vector.x + sway) * leaf.speed;
                leaf.item.position.y += leaf.vector.y * leaf.speed;
                leaf.item.rotate(leaf.rotSpeed);

                if (leaf.item.position.y > rView.size.height + 40) {
                    leaf.item.position.y = -40;
                    leaf.item.position.x = Math.random() * rView.size.width;
                }
                if (leaf.item.position.x < -40) {
                    leaf.item.position.x = rView.size.width + 40;
                }
                if (leaf.item.position.x > rView.size.width + 40) {
                    leaf.item.position.x = -40;
                }
            });
        };

        rView.onResize = () => {
            rLeaves.forEach(leaf => {
                if (leaf.item.position.x > rView.size.width) {
                    leaf.item.position.x = Math.random() * rView.size.width;
                }
                if (leaf.item.position.y > rView.size.height) {
                    leaf.item.position.y = Math.random() * rView.size.height;
                }
            });
        };
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
});
