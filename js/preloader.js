// Preloader Animation using Paper.js (Spinning Leaf Ring Loading System)
document.addEventListener("DOMContentLoaded", () => {
    // Setup Paper.js
    const canvas = document.getElementById("preloader-canvas");
    paper.setup(canvas);
    
    const view = paper.view;
    const project = paper.project;
    
    // Create a group for the circular leaves
    const loaderGroup = new paper.Group();
    
    const leafCount = 8;
    const radius = 55; // Radius of the ring
    const loaderLeaves = [];
    
    // Create the leaves arranged in a circle
    for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Draw a simple leaf shape
        const leafPath = new paper.Path();
        // Create an organic leaf geometry
        const w = 8;
        const h = w * 2.2;
        leafPath.moveTo(new paper.Point(0, 0));
        leafPath.quadraticCurveTo(new paper.Point(w, h / 2), new paper.Point(0, h));
        leafPath.quadraticCurveTo(new paper.Point(-w, h / 2), new paper.Point(0, 0));
        leafPath.closed = true;
        
        // Color transition around the ring (Gold to Paddy Green)
        const ratio = i / leafCount;
        leafPath.fillColor = new paper.Color(
            0.85 + (0.09 - 0.85) * ratio, // Transition Red component
            0.76 + (0.28 - 0.76) * ratio, // Transition Green component
            0.65 + (0.22 - 0.65) * ratio, // Transition Blue component
            0.3 + 0.7 * ratio            // Fades out to create a trailing sequence
        );
        
        // Position and orient leaf facing outward from the center
        leafPath.position = new paper.Point(x, y);
        leafPath.rotate((angle * 180 / Math.PI) + 90);
        
        loaderGroup.addChild(leafPath);
        loaderLeaves.push(leafPath);
    }
    
    // Center the group in the viewport
    loaderGroup.position = view.center;
    
    // Paper.js Frame loop to spin the circle (only during first 0.3s and last 0.3s)
    let rotation = 0;
    const startTime = Date.now();
    
    view.onFrame = (event) => {
        const elapsed = (Date.now() - startTime) / 1000; // in seconds
        
        // Spin only in first 0.3s and last 0.3s (total duration 1s)
        if (elapsed < 0.3 || elapsed > 0.7) {
            rotation += 2.8;
            loaderGroup.rotation = rotation;
        }
        
        // Pulsate throughout
        loaderLeaves.forEach((leaf, idx) => {
            const time = event.time * 5 + idx;
            const scaleVal = 1 + Math.sin(time) * 0.12;
            leaf.scaling = new paper.Point(scaleVal, scaleVal);
        });
    };
    
    // Handle Window Resize
    view.onResize = () => {
        loaderGroup.position = view.center;
    };
    
    // Draw animations timeline
    const tl = gsap.timeline({
        onUpdate: () => {
            // Update loading bar progress
            const progressPercent = Math.round(tl.progress() * 100);
            const progressBar = document.getElementById("preloader-progress");
            if (progressBar) {
                progressBar.style.width = `${progressPercent}%`;
            }
        },
        onComplete: () => {
            // Let the main script know we're ready to hide the preloader
            document.dispatchEvent(new CustomEvent("preloaderComplete"));
        }
    });
    
    // Run preloader simulation timeline (takes exactly 1.0 second to fill progress)
    tl.to({}, { duration: 1.0 });
});
