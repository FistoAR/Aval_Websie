// Main Site Coordination Script

// Force scroll to top on page refresh/unload
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
};

if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

document.addEventListener("DOMContentLoaded", () => {
    window.scrollTo(0, 0);
    // Prevent scrolling while preloading is active
    const preloader = document.getElementById("preloader");
    if (preloader && !preloader.classList.contains("hidden")) {
        document.body.classList.add("overflow-hidden");
        document.documentElement.classList.add("overflow-hidden");
    }

    // Function to run stagger animations for the Hero content
    const triggerHeroAnims = () => {
        const tl = gsap.timeline({ delay: 0.5 });

        // 1. Reveal the gold divider line curve
        tl.fromTo(".hero-divider-anim", 
            { opacity: 0, scaleX: 0.95 },
            { opacity: 1, scaleX: 1, duration: 1.4, ease: "power3.out" }
        );

        // 2. Fade/slide in Top Badge & Tagline
        tl.fromTo(".hero-badge-tag", 
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0, ease: "power3.out" },
            "-=0.9"
        );

        // 3. Reveal Title Lines one by one
        tl.fromTo(".hero-title-line", 
            { y: 35, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.1, stagger: 0.2, ease: "power4.out" },
            "-=0.7"
        );

        // 4a. Draw top border line of stats block (before stats appear)
        tl.to(".hero-border-top", {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.inOut"
        }, "-=0.4");

        // 4b. Stagger reveal Stats Cards
        tl.fromTo(".hero-stat-card", 
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" },
            "-=0.5"
        );

        // 4c. Draw bottom border line of stats block (after stats appear)
        tl.to(".hero-border-bottom", {
            scaleX: 1,
            duration: 0.8,
            ease: "power2.inOut"
        }, "-=0.2");

        // 5. Slide in the Explore button
        tl.fromTo(".hero-cta-btn", 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.9, ease: "power2.out" },
            "-=0.5"
        );

        // 6. Fade and slide up the waving crops stalks in background
        tl.fromTo(".hero-crop-anim", 
            { y: 40, opacity: 0 },
            { y: 0, opacity: 0.25, duration: 1.5, ease: "power3.out" },
            "-=1.2"
        );

        // Subtly scale down the video for entry
        gsap.fromTo("#hero-video", {
            scale: 1.08
        }, {
            scale: 1.05,
            duration: 2.5,
            ease: "power2.out"
        });
    };

    // Listen for Paper.js preloader completion or bypass if hidden
    if (!preloader || preloader.classList.contains("hidden")) {
        // Direct entry
        document.body.classList.remove("overflow-hidden");
        document.documentElement.classList.remove("overflow-hidden");
        const vid = document.getElementById("hero-video");
        if (vid) vid.play().catch(e => console.log("Auto-play blocked:", e));
        setTimeout(triggerHeroAnims, 100);
    } else {
        document.addEventListener("preloaderComplete", () => {
            // Slide up the loading screen
            gsap.to("#preloader", {
                yPercent: -100,
                duration: 0.8, // Speed up exit slide (1.2 to 0.8)
                onComplete: () => {
                    preloader.style.display = "none";
                    document.body.classList.remove("overflow-hidden");
                    document.documentElement.classList.remove("overflow-hidden");
                    ScrollTrigger.refresh();
                }
            });
            // Start video playback immediately after preloader finishes
            const vid = document.getElementById("hero-video");
            if (vid) vid.play().catch(e => console.log("Video play blocked:", e));
            
            triggerHeroAnims();
        });
    }

    // Scroll Spy for Navigation Links
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    if (sections.length > 0 && navLinks.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.getAttribute("id");
                    navLinks.forEach((link) => {
                        // Reset all links to default
                        link.classList.remove("text-[#a3c945]");
                        link.classList.add("text-white/75");
                        
                        // Highlight active link
                        if (link.getAttribute("href") === `#${currentId}`) {
                            link.classList.add("text-[#a3c945]");
                            link.classList.remove("text-white/75", "hover:text-white");
                        } else {
                            link.classList.add("hover:text-white");
                        }
                    });
                }
            });
        }, {
            rootMargin: "-40% 0px -60% 0px" // Trigger when section passes the upper middle of the screen
        });

        sections.forEach((section) => observer.observe(section));
    }
});
