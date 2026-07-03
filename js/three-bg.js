// Three.js Interactive 3D Fabric Simulation
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("three-canvas-container");
    if (!container) return;

    // Dimensions
    let width = container.clientWidth;
    let height = container.clientHeight;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    
    // Orthographic/Perspective Camera depending on display
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Geometry - High density plane for smooth folding
    const cols = 55;
    const rows = 55;
    const geometry = new THREE.PlaneGeometry(12, 10, cols, rows);

    // Uniforms
    const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uMouseTarget: { value: new THREE.Vector2(0, 0) },
        uScroll: { value: 0 },
        uScrollTarget: { value: 0 },
        uColorSage: { value: new THREE.Color("#55744e") }, // Paddy Green
        uColorSand: { value: new THREE.Color("#c4a67a") }, // Golden Grain
        uColorDark: { value: new THREE.Color("#2f3e2c") }, // Deep Earth Green
        uSheenColor: { value: new THREE.Color("#ffe8b3") }  // Sunset Yellow highlights
    };

    // Custom Vertex & Fragment Shaders for the luxury silk fabric look
    const material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        side: THREE.DoubleSide,
        transparent: true,
        vertexShader: `
            uniform float uTime;
            uniform vec2 uMouse;
            uniform float uScroll;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying float vHeight;

            // Simplex-like Noise function for organic folds
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                   -0.577350269189626,  // -1.0 + 2.0 * C.x
                                    0.024390243902439); // 1.0 / 41.0
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v -   i + dot(i, C.xx) ;
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) )
                                + i.x + vec3(0.0, i1.x, 1.0) );
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0 ;
                vec3 h = abs(x) - 0.5 ;
                vec3 a0 = x - floor(x + 0.5) ;
                vec3 g = a0 * a0 + h * h ;
                vec3 m1 = 1.0 - 1.5 * g ;
                vec3 vec_n = 12.0 * m * ( m1 * x + vec3(
                    dot(x0,x0) * (3.0 * x - 2.0 * a0),
                    dot(x12.xy,x12.xy) * (3.0 * x - 2.0 * a0),
                    dot(x12.zw,x12.zw) * (3.0 * x - 2.0 * a0)
                ) );
                return dot(p, vec3(0.35)); // Simple height scalar
            }

            void main() {
                vUv = uv;
                
                // Calculate wave height using multiple layered noises
                float speed = 0.5 + uScroll * 1.5;
                
                // Base long waves
                float wave1 = snoise(uv * 1.8 - vec2(uTime * 0.15, uTime * 0.1));
                // Smaller ripple details
                float wave2 = snoise(uv * 4.5 + vec2(uTime * 0.35, -uTime * 0.25)) * 0.25;
                
                // Interactive mouse deformation (ripples radiating from mouse)
                vec2 meshSpaceMouse = (uMouse * 2.0 - 1.0) * vec2(6.0, 5.0);
                float distToMouse = distance(position.xy, meshSpaceMouse);
                float mouseRipple = 0.0;
                if (distToMouse < 4.0) {
                    float force = (4.0 - distToMouse) / 4.0;
                    mouseRipple = sin(distToMouse * 5.0 - uTime * 6.0) * force * 0.35;
                }
                
                // Composite final height
                float zDisplacement = (wave1 + wave2 + mouseRipple) * (0.8 + uScroll * 0.4);
                
                vec3 displacedPosition = position;
                displacedPosition.z += zDisplacement;
                vHeight = zDisplacement;
                
                // Calculate Normal
                vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
                vViewPosition = -mvPosition.xyz;
                
                // Approximate normals using derivative checks
                vNormal = normalMatrix * normal;
                
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColorSage;
            uniform vec3 uColorSand;
            uniform vec3 uColorDark;
            uniform vec3 uSheenColor;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying float vHeight;

            void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                
                // Base shading (Diffuse reflection)
                float dotNL = max(dot(normal, vec3(0.5, 0.5, 1.0)), 0.0);
                
                // Blend colors based on height and light reflection
                vec3 baseColor = mix(uColorSage, uColorSand, clamp((vHeight + 0.6) * 0.8, 0.0, 1.0));
                
                // Shadows in folds
                float shadow = smoothstep(-1.2, 0.6, vHeight);
                baseColor = mix(uColorDark, baseColor, shadow * 0.8 + 0.2);
                
                // Fresnel Highlight (Sheen on fabric edge to represent silk/velvet)
                float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
                vec3 sheen = uSheenColor * fresnel * 0.65;
                
                // Diffuse lighting mix
                vec3 finalColor = baseColor * (dotNL * 0.65 + 0.35) + sheen;
                
                // Soft fade at boundaries
                float borderFade = smoothstep(0.0, 0.08, vUv.x) * smoothstep(1.0, 0.92, vUv.x) *
                                  smoothstep(0.0, 0.08, vUv.y) * smoothstep(1.0, 0.92, vUv.y);
                
                gl_FragColor = vec4(finalColor, borderFade * 0.92);
            }
        `
    });

    // Mesh
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation variables
    let clock = new THREE.Clock();

    // Mouse coordinates tracker
    window.addEventListener("mousemove", (e) => {
        // Normalize mouse to -1 to 1 range
        uniforms.uMouseTarget.value.x = e.clientX / window.innerWidth;
        uniforms.uMouseTarget.value.y = 1.0 - (e.clientY / window.innerHeight);
    });

    // Scroll speed calculator
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;
    
    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;
        const diff = Math.abs(currentScrollY - lastScrollY);
        scrollVelocity += diff * 0.003;
        lastScrollY = currentScrollY;
    });

    // Render loop
    function animate() {
        requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();
        uniforms.uTime.value = time;

        // Smooth mouse movement interpolation
        uniforms.uMouse.value.lerp(uniforms.uMouseTarget.value, 0.05);

        // Smooth scroll velocity damping
        uniforms.uScrollTarget.value = scrollVelocity;
        uniforms.uScroll.value = THREE.MathUtils.lerp(uniforms.uScroll.value, uniforms.uScrollTarget.value, 0.08);
        
        // Dampen velocity
        scrollVelocity *= 0.92;

        renderer.render(scene, camera);
    }

    animate();

    // Handle Resize
    window.addEventListener("resize", () => {
        width = container.clientWidth;
        height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    });
});
