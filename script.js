// 1. CLOCK
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-GB', { hour12: false }) + ":" + now.getMilliseconds().toString().padStart(3, '0');
    document.getElementById('clock').innerText = timeString;
}
setInterval(updateClock, 30);

// 2. LOADER - ANIMATION LOGIC
window.addEventListener('load', () => {
    setTimeout(() => {
        const loader = document.getElementById('loader');
        loader.style.opacity = '0'; // Fade out loader
        setTimeout(() => { loader.style.display = 'none'; }, 500); // Remove from DOM
    }, 2500); // Wait 2.5s for the car to cross screen
});

// 3. COMPLEX 3D CAR LOGIC
const initSuperLab = () => {
    const container = document.getElementById('canvas-container');
    const card = document.getElementById('data-card');
    const pName = document.getElementById('part-name');
    const pInfo = document.getElementById('part-info');

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.03); 

    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 100);
    camera.position.set(6, 3, 6);
    camera.lookAt(0, 0.5, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // GRID
    const gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x111111);
    scene.add(gridHelper);

    // --- LIGHTING (NOW INSIDE THE FUNCTION) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight);

    const spotLight = new THREE.SpotLight(0xffffff, 3); 
    spotLight.position.set(5, 10, 5); 
    scene.add(spotLight);

    const rimLight = new THREE.SpotLight(0x0088ff, 5); 
    rimLight.position.set(-5, 2, -5); 
    scene.add(rimLight);
    
    const underglow = new THREE.PointLight(0x39FF14, 2, 10); 
    underglow.position.set(0, 0.2, 0); 
    scene.add(underglow);

    // MATERIALS
    const mats = {
        navy: new THREE.MeshStandardMaterial({ color: 0x061922, roughness: 0.3, metalness: 0.6 }),
        yellow: new THREE.MeshStandardMaterial({ color: 0xFCD700, roughness: 0.2, metalness: 0.1, emissive: 0xFCD700, emissiveIntensity: 0.2 }),
        red: new THREE.MeshStandardMaterial({ color: 0xFF0044, roughness: 0.2, metalness: 0.1 }),
        carbon: new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7, metalness: 0.2 }),
        tire: new THREE.MeshStandardMaterial({ color: 0x080808, roughness: 0.9 })
    };

    const car = new THREE.Group();

    // 1. NOSE
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.45, 2.8, 16).rotateZ(-Math.PI/2), mats.navy);
    nose.position.set(2.0, 0.4, 0); nose.name = "Nose";
    const noseTip = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 16).rotateZ(-Math.PI/2), mats.yellow);
    noseTip.position.set(3.5, 0.4, 0); noseTip.name = "Nose";
    car.add(nose, noseTip);

    // 2. MAIN BODY
    const cockpit = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 1.1), mats.navy);
    cockpit.position.set(0, 0.5, 0); cockpit.name = "Chassis";
    car.add(cockpit);

    // 3. ENGINE COVER & STRIPE
    const engineCover = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3, 4).rotateZ(-Math.PI/2), mats.navy);
    engineCover.position.set(-1.0, 0.8, 0); engineCover.scale.set(1, 1, 0.4); engineCover.name = "Engine";
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 1.2), mats.red);
    stripe.position.set(-0.5, 0.85, 0); stripe.name = "Engine";
    car.add(engineCover, stripe);

    // 4. SIDEPODS
    const sideGeo = new THREE.CylinderGeometry(0.1, 0.6, 2.5, 4); sideGeo.rotateZ(Math.PI/2);
    const podL = new THREE.Mesh(sideGeo, mats.navy); podL.position.set(-0.2, 0.4, 0.8); podL.scale.set(1, 0.5, 1); podL.name = "Sidepods";
    const podR = podL.clone(); podR.position.z = -0.8; podR.name = "Sidepods";
    
    // Side Stripes (Red)
    const stL = new THREE.Mesh(new THREE.BoxGeometry(2, 0.05, 0.1), mats.red); stL.position.set(0, 0.5, 1.1); stL.name="Sidepods";
    const stR = stL.clone(); stR.position.z = -1.1; stR.name="Sidepods";
    
    car.add(podL, podR, stL, stR);

    // 5. WINGS
    const fWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 2.4), mats.carbon); fWing.position.set(3.6, 0.15, 0); fWing.name = "Front Wing";
    const fEnd = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.05), mats.red);
    const fEndL = fEnd.clone(); fEndL.position.set(3.6, 0.3, 1.2);
    const fEndR = fEnd.clone(); fEndR.position.set(3.6, 0.3, -1.2);
    car.add(fWing, fEndL, fEndR);

    const rWing = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 1.8), mats.navy); rWing.position.set(-2.2, 1.1, 0); rWing.name = "Rear Wing";
    const drs = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.02, 1.8), mats.yellow); drs.position.set(-2.2, 1.3, 0); drs.name = "Rear Wing";
    car.add(rWing, drs);

    // 6. WHEELS & SUSPENSION
    const wheelGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.5, 32).rotateX(Math.PI/2);
    const stripeMat = new THREE.MeshBasicMaterial({color: 0xFF0000}); 
    function makeWheel(x, z) {
        const grp = new THREE.Group();
        const tire = new THREE.Mesh(wheelGeo, mats.tire);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 16, 32), stripeMat);
        ring.rotation.y = Math.PI/2; ring.position.x = (z > 0) ? 0.26 : -0.26;
        // Suspension
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2).rotateX(z > 0 ? 0.5 : -0.5), mats.carbon);
        arm.position.set(-0.5, 0.0, z > 0 ? -0.5 : 0.5); arm.lookAt(0, 0.2, 0);
        grp.add(tire, ring, arm); grp.position.set(x, 0.45, z); grp.name = "Tyres"; tire.name = "Tyres";
        return grp;
    }
    car.add(makeWheel(2.2, 1.2), makeWheel(2.2, -1.2), makeWheel(-1.8, 1.3), makeWheel(-1.8, -1.3));

    // 7. HALO
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 12, Math.PI).rotateY(Math.PI/2).rotateX(Math.PI/2), mats.carbon);
    halo.position.set(0.2, 0.65, 0); halo.name = "Halo";
    car.add(halo);

    scene.add(car);

    // --- LOGIC ---
    const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
    let isHovering = false, spinSpeed = 0.005;

    const partDB = {
        'Nose': { t: "AERO NOSE CONE", d: "High-rake concept. Channels airflow to the floor. Carbon Fiber." },
        'Chassis': { t: "SURVIVAL CELL", d: "Monocoque structure. Houses driver & fuel cell. 50G impact rated." },
        'Engine': { t: "POWER UNIT COVER", d: "Honda RBPTH001 V6 Turbo Hybrid. Thermal efficiency: >50%." },
        'Sidepods': { t: "INTAKE SIDEPODS", d: "Aggressive undercut. Downwash effect maximizes rear downforce." },
        'Front Wing': { t: "FRONT WING ARRAY", d: "Adjustable flap angle. Generating 45% of total downforce." },
        'Rear Wing': { t: "DRS WING ASSEMBLY", d: "Drag Reduction System. Opens 85mm slot gap for +20kph." },
        'Tyres': { t: "PIRELLI SOFT (C4)", d: "High grip, high degradation. Operating Window: 90°C - 110°C." },
        'Halo': { t: "HALO SYSTEM", d: "Grade 5 Titanium. Withstands 120kN impact force." }
    };

    container.addEventListener('mousemove', (e) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        isHovering = true;
    });
    container.addEventListener('mouseleave', () => { isHovering = false; card.classList.remove('active'); });

    container.addEventListener('click', () => {
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(car.children, true);
        if (intersects.length > 0) {
            let target = intersects[0].object;
            while(!target.name && target.parent) target = target.parent;
            const key = target.name;
            if (partDB[key]) {
                pName.innerText = partDB[key].t; pInfo.innerText = partDB[key].d; card.classList.add('active');
                const originalMat = target.material; target.material = new THREE.MeshBasicMaterial({ color: 0x39FF14, wireframe: true });
                setTimeout(() => { target.material = originalMat; }, 150);
            }
        } else card.classList.remove('active');
    });

    const animate = () => {
        requestAnimationFrame(animate);
        if (!isHovering) car.rotation.y -= spinSpeed; else car.rotation.y -= 0.0005;
        renderer.render(scene, camera);
    };
    animate();

    document.getElementById('spin-btn').addEventListener('click', () => spinSpeed = (spinSpeed > 0 ? 0 : 0.005));
    window.addEventListener('resize', () => { camera.aspect = container.offsetWidth / container.offsetHeight; camera.updateProjectionMatrix(); renderer.setSize(container.offsetWidth, container.offsetHeight); });
};

initSuperLab();