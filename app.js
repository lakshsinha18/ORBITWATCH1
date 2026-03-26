/* ============================================
   OrbitWatch — app.js
   3D Earth, Satellite Simulation, Live Alerts
   ============================================ */

// ── Configuration ──
const SATELLITE_COUNT = 8;
const UPDATE_INTERVAL = 2000; // ms
const COLLISION_THRESHOLD = 0.6;
const EARTH_RADIUS = 2.2;

const SAT_NAMES = [
    'NOAA-19', 'ISS-ZARYA', 'STARLINK-1547', 'COSMOS-2251',
    'SENTINEL-6A', 'GPS-IIF-12', 'ASTRA-1N', 'DEBRIS-4721'
];

const INSIGHTS = [
    'High risk detected — decreasing distance between COSMOS-2251 and DEBRIS-4721. Closest approach in ~8 minutes.',
    'Trajectory convergence identified between STARLINK-1547 and NOAA-19 on next orbital pass.',
    'Proximity analysis shows safe separation maintained for ISS-ZARYA. No action required.',
    'Orbit decay model predicts DEBRIS-4721 altitude decrease of 2.1 km over next 24 hours.',
    'Multiple conjunction events detected — monitoring 3 satellite pairs in LEO corridor.',
    'Automated avoidance maneuver recommended for SENTINEL-6A within next 45 minutes.',
    'Solar activity may affect GPS-IIF-12 orbital parameters. Enhanced monitoring active.',
    'All tracked objects within safe separation thresholds. Risk level: NOMINAL.'
];

// ── State ──
let satellites = [];
let alerts = [];
let cycleCount = 0;
let scene, camera, renderer, earth, starField;
let satMeshes = [];
let orbitLines = [];
let trailLines = [];

// ── Initialize ──
window.addEventListener('DOMContentLoaded', () => {
    initSatellites();
    initThreeJS();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(simulationTick, UPDATE_INTERVAL);
    simulationTick();
    animate();
});

// ── Satellite Data Generation ──
function initSatellites() {
    satellites = SAT_NAMES.map((name, i) => ({
        id: i,
        name,
        orbitRadius: 3.2 + Math.random() * 1.8,
        speed: 0.002 + Math.random() * 0.006,
        inclination: (Math.random() - 0.5) * Math.PI * 0.6,
        phase: Math.random() * Math.PI * 2,
        axisOffset: Math.random() * Math.PI * 0.3,
        position: { x: 0, y: 0, z: 0 },
        velocity: (5.5 + Math.random() * 2.5).toFixed(2),
        risk: false
    }));
}

function updateSatellitePositions(time) {
    satellites.forEach(sat => {
        const angle = sat.phase + time * sat.speed;
        const r = sat.orbitRadius;
        const inc = sat.inclination;

        sat.position.x = r * Math.cos(angle);
        sat.position.y = r * Math.sin(angle) * Math.sin(inc);
        sat.position.z = r * Math.sin(angle) * Math.cos(inc);
    });
}

function detectCollisions() {
    const newAlerts = [];
    satellites.forEach(s => s.risk = false);

    for (let i = 0; i < satellites.length; i++) {
        for (let j = i + 1; j < satellites.length; j++) {
            const a = satellites[i];
            const b = satellites[j];
            const dx = a.position.x - b.position.x;
            const dy = a.position.y - b.position.y;
            const dz = a.position.z - b.position.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (dist < COLLISION_THRESHOLD * 3) {
                let risk, riskLabel, steps;
                if (dist < COLLISION_THRESHOLD) {
                    risk = 'high';
                    riskLabel = 'HIGH';
                    steps = Math.floor(Math.random() * 5) + 1;
                    a.risk = true;
                    b.risk = true;
                } else if (dist < COLLISION_THRESHOLD * 2) {
                    risk = 'medium';
                    riskLabel = 'MEDIUM';
                    steps = Math.floor(Math.random() * 15) + 5;
                } else {
                    risk = 'low';
                    riskLabel = 'LOW';
                    steps = Math.floor(Math.random() * 30) + 15;
                }

                newAlerts.push({
                    satA: a.name,
                    satB: b.name,
                    risk,
                    riskLabel,
                    distance: dist.toFixed(3),
                    steps
                });
            }
        }
    }

    // Sort by risk level
    const riskOrder = { high: 0, medium: 1, low: 2 };
    newAlerts.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

    alerts = newAlerts.slice(0, 8);
}

// ── DOM Updates ──
function renderAlerts() {
    const container = document.getElementById('alert-list');
    const badge = document.getElementById('alert-count');

    if (alerts.length === 0) {
        container.innerHTML = `
            <div style="padding: 24px; text-align: center; color: var(--text-dim); font-size: 0.8rem;">
                <div style="font-size: 2rem; margin-bottom: 8px;">✓</div>
                No collision alerts detected
            </div>
        `;
        badge.textContent = '0';
        badge.style.background = 'var(--neon-green)';
        return;
    }

    const highCount = alerts.filter(a => a.risk === 'high').length;
    badge.textContent = alerts.length;
    badge.style.background = highCount > 0 ? 'var(--neon-red)' : 'var(--neon-yellow)';

    container.innerHTML = alerts.map(alert => `
        <div class="alert-card risk-${alert.risk}">
            <div class="alert-title">● ${alert.riskLabel} RISK</div>
            <div class="alert-desc">${alert.satA} & ${alert.satB} — proximity warning in ${alert.steps} steps</div>
            <div class="alert-meta">
                <span>DIST: ${alert.distance} u</span>
                <span>TCA: ${alert.steps} STEPS</span>
            </div>
        </div>
    `).join('');
}

function renderSatellites() {
    const container = document.getElementById('satellite-list');

    container.innerHTML = satellites.map(sat => `
        <div class="sat-card ${sat.risk ? 'risk' : ''}">
            <div class="sat-card-header">
                <span class="sat-name">${sat.name}</span>
                <span class="sat-status ${sat.risk ? 'risk' : 'safe'}">${sat.risk ? '⚠ RISK' : '✓ SAFE'}</span>
            </div>
            <div class="sat-data-grid">
                <div class="sat-data-item">
                    <span class="sat-data-label">POS X</span>
                    <span class="sat-data-value">${sat.position.x.toFixed(2)}</span>
                </div>
                <div class="sat-data-item">
                    <span class="sat-data-label">POS Y</span>
                    <span class="sat-data-value">${sat.position.y.toFixed(2)}</span>
                </div>
                <div class="sat-data-item">
                    <span class="sat-data-label">POS Z</span>
                    <span class="sat-data-value">${sat.position.z.toFixed(2)}</span>
                </div>
                <div class="sat-data-item">
                    <span class="sat-data-label">VEL</span>
                    <span class="sat-data-value">${sat.velocity} km/s</span>
                </div>
            </div>
        </div>
    `).join('');
}

function renderInsight() {
    const el = document.getElementById('insight-text');
    const hasHighRisk = alerts.some(a => a.risk === 'high');
    if (hasHighRisk) {
        const highAlert = alerts.find(a => a.risk === 'high');
        el.textContent = `⚠ High risk detected — decreasing distance between ${highAlert.satA} and ${highAlert.satB}. Closest approach in ~${highAlert.steps} orbital steps. Recommend avoidance maneuver.`;
    } else {
        el.textContent = INSIGHTS[cycleCount % INSIGHTS.length];
    }
}

function updateClock() {
    const now = new Date();
    const utc = now.toISOString().substring(11, 19);
    document.getElementById('live-clock').textContent = utc + ' UTC';
}

// ── Simulation Tick ──
function simulationTick() {
    cycleCount++;
    const time = Date.now() * 0.001;
    updateSatellitePositions(time);
    detectCollisions();
    renderAlerts();
    renderSatellites();
    renderInsight();
    document.getElementById('cycle-count').textContent = cycleCount;
}

// ── Three.js Setup ──
function initThreeJS() {
    const container = document.getElementById('three-container');
    const w = container.clientWidth;
    const h = container.clientHeight;

    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    // Stars background
    createStarField();

    // Earth
    createEarth();

    // Atmosphere glow
    createAtmosphere();

    // Satellites & orbits
    createSatelliteMeshes();

    // Resize handler
    window.addEventListener('resize', () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    });
}

function createStarField() {
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        sizes[i] = Math.random() * 1.5;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starMat = new THREE.PointsMaterial({
        color: 0xaaccff,
        size: 0.15,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });

    starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);
}

function createEarth() {
    // Earth sphere with procedural look
    const earthGeo = new THREE.SphereGeometry(EARTH_RADIUS, 64, 64);

    // Create a canvas texture for Earth
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Ocean base
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#0a1628');
    gradient.addColorStop(0.3, '#0d2847');
    gradient.addColorStop(0.5, '#0f3060');
    gradient.addColorStop(0.7, '#0d2847');
    gradient.addColorStop(1, '#0a1628');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 512);

    // Add landmass shapes (simplified continents)
    ctx.fillStyle = '#0a3a1a';
    ctx.strokeStyle = '#14cc50';
    ctx.lineWidth = 0.5;

    // North America
    drawContinent(ctx, [
        [220, 80], [280, 70], [310, 90], [300, 130], [320, 160],
        [290, 180], [260, 200], [230, 190], [200, 170], [180, 140],
        [190, 110], [210, 90]
    ]);

    // South America
    drawContinent(ctx, [
        [280, 220], [310, 210], [330, 230], [340, 270], [330, 320],
        [310, 360], [290, 380], [270, 350], [260, 300], [265, 250]
    ]);

    // Europe
    drawContinent(ctx, [
        [480, 80], [520, 70], [550, 80], [540, 110], [560, 130],
        [530, 140], [500, 130], [490, 150], [470, 140], [465, 110]
    ]);

    // Africa
    drawContinent(ctx, [
        [480, 160], [530, 150], [560, 170], [580, 210], [570, 270],
        [550, 320], [520, 350], [490, 340], [470, 300], [460, 250],
        [465, 200]
    ]);

    // Asia
    drawContinent(ctx, [
        [560, 60], [620, 50], [700, 60], [780, 80], [800, 120],
        [790, 150], [750, 160], [700, 170], [660, 160], [620, 150],
        [580, 140], [560, 110]
    ]);

    // Australia
    drawContinent(ctx, [
        [760, 280], [810, 270], [840, 290], [850, 320], [830, 340],
        [800, 350], [770, 330], [755, 310]
    ]);

    // Grid lines (lat/long)
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.08)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.moveTo((1024 / 18) * i, 0);
        ctx.lineTo((1024 / 18) * i, 512);
        ctx.stroke();
    }
    for (let i = 0; i < 9; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (512 / 9) * i);
        ctx.lineTo(1024, (512 / 9) * i);
        ctx.stroke();
    }

    // City lights
    const cities = [
        [250, 130], [270, 170], [490, 110], [510, 160], [530, 200],
        [620, 100], [700, 120], [780, 130], [810, 300], [290, 350],
        [550, 310], [650, 150], [500, 90], [740, 100], [300, 140]
    ];
    cities.forEach(([cx, cy]) => {
        const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 12);
        glow.addColorStop(0, 'rgba(255, 220, 100, 0.9)');
        glow.addColorStop(0.3, 'rgba(255, 180, 50, 0.4)');
        glow.addColorStop(1, 'rgba(255, 180, 50, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(cx - 12, cy - 12, 24, 24);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;

    const earthMat = new THREE.MeshPhongMaterial({
        map: texture,
        specular: new THREE.Color(0x111133),
        shininess: 25,
        emissive: new THREE.Color(0x010810),
        emissiveIntensity: 0.5
    });

    earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);
}

function drawContinent(ctx, points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function createAtmosphere() {
    const atmosGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.015, 64, 64);
    const atmosMat = new THREE.MeshPhongMaterial({
        color: 0x0066ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.FrontSide,
        depthWrite: false
    });
    const atmos = new THREE.Mesh(atmosGeo, atmosMat);
    scene.add(atmos);

    // Outer glow ring
    const glowGeo = new THREE.SphereGeometry(EARTH_RADIUS * 1.06, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.04,
        side: THREE.BackSide,
        depthWrite: false
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);
}

function createSatelliteMeshes() {
    satellites.forEach((sat, i) => {
        // Satellite body
        const satGeo = new THREE.OctahedronGeometry(0.06, 0);
        const satMat = new THREE.MeshPhongMaterial({
            color: 0x00e5ff,
            emissive: 0x00e5ff,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(satGeo, satMat);
        scene.add(mesh);
        satMeshes.push(mesh);

        // Orbit ring
        const orbitPoints = [];
        const segments = 128;
        for (let j = 0; j <= segments; j++) {
            const angle = (j / segments) * Math.PI * 2;
            const x = sat.orbitRadius * Math.cos(angle);
            const y = sat.orbitRadius * Math.sin(angle) * Math.sin(sat.inclination);
            const z = sat.orbitRadius * Math.sin(angle) * Math.cos(sat.inclination);
            orbitPoints.push(new THREE.Vector3(x, y, z));
        }

        const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMat = new THREE.LineBasicMaterial({
            color: 0x00e5ff,
            transparent: true,
            opacity: 0.08
        });
        const orbitLine = new THREE.Line(orbitGeo, orbitMat);
        scene.add(orbitLine);
        orbitLines.push(orbitLine);

        // Trail (future path)
        const trailPoints = [];
        for (let j = 0; j < 30; j++) {
            trailPoints.push(new THREE.Vector3(0, 0, 0));
        }
        const trailGeo = new THREE.BufferGeometry().setFromPoints(trailPoints);
        const trailMat = new THREE.LineBasicMaterial({
            color: 0xb44dff,
            transparent: true,
            opacity: 0.15
        });
        const trail = new THREE.Line(trailGeo, trailMat);
        scene.add(trail);
        trailLines.push(trail);
    });
}

// ── Animation Loop ──
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // Rotate Earth
    if (earth) {
        earth.rotation.y += 0.001;
    }

    // Rotate stars slowly
    if (starField) {
        starField.rotation.y += 0.0001;
    }

    // Update satellite positions in 3D
    satellites.forEach((sat, i) => {
        const angle = sat.phase + time * sat.speed;
        const r = sat.orbitRadius;
        const inc = sat.inclination;

        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle) * Math.sin(inc);
        const z = r * Math.sin(angle) * Math.cos(inc);

        // Update mesh position
        if (satMeshes[i]) {
            satMeshes[i].position.set(x, y, z);
            satMeshes[i].rotation.x += 0.02;
            satMeshes[i].rotation.z += 0.01;

            // Color based on risk
            const color = sat.risk ? 0xff3d3d : 0x00e5ff;
            satMeshes[i].material.color.setHex(color);
            satMeshes[i].material.emissive.setHex(color);
            satMeshes[i].material.emissiveIntensity = sat.risk ? 1.2 : 0.8;
        }

        // Update orbit line color
        if (orbitLines[i]) {
            orbitLines[i].material.color.setHex(sat.risk ? 0xff3d3d : 0x00e5ff);
            orbitLines[i].material.opacity = sat.risk ? 0.25 : 0.08;
        }

        // Update trail
        if (trailLines[i]) {
            const trailPositions = trailLines[i].geometry.attributes.position.array;
            for (let j = 0; j < 30; j++) {
                const futureAngle = angle + j * 0.04;
                trailPositions[j * 3] = r * Math.cos(futureAngle);
                trailPositions[j * 3 + 1] = r * Math.sin(futureAngle) * Math.sin(inc);
                trailPositions[j * 3 + 2] = r * Math.sin(futureAngle) * Math.cos(inc);
            }
            trailLines[i].geometry.attributes.position.needsUpdate = true;
            trailLines[i].material.color.setHex(sat.risk ? 0xff3d3d : 0xb44dff);
            trailLines[i].material.opacity = sat.risk ? 0.3 : 0.15;
        }
    });

    // Gentle camera sway
    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.position.y = 2 + Math.cos(time * 0.08) * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}
