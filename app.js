/* ============================================================
   ENVY LUXURY — app.js
   Cinematic intro · 3D scene · Parallax · Scroll reveals
   ============================================================ */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     INTRO CINEMATIC SEQUENCE
  ══════════════════════════════════════════════════════ */
  const introScreen = document.getElementById('intro-screen');
  const introCanvas = document.getElementById('intro-canvas');
  const introCtx    = introCanvas.getContext('2d');

  // Size intro canvas
  function sizeIntroCanvas() {
    introCanvas.width  = window.innerWidth;
    introCanvas.height = window.innerHeight;
  }
  sizeIntroCanvas();
  window.addEventListener('resize', sizeIntroCanvas);

  // Particle system for intro
  const introParticles = [];
  const INTRO_PARTICLE_COUNT = 120;

  function createIntroParticle() {
    return {
      x: Math.random() * introCanvas.width,
      y: Math.random() * introCanvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 1.2 - 0.3,
      life: Math.random(),
      maxLife: 0.5 + Math.random() * 0.5,
      size: Math.random() * 2,
      hue: Math.random() > 0.5 ? 270 : 45, // purple or gold
    };
  }
  for (let i = 0; i < INTRO_PARTICLE_COUNT; i++) introParticles.push(createIntroParticle());

  let introT = 0;
  let introActive = true;

  function drawIntro() {
    if (!introActive) return;
    introCtx.fillStyle = 'rgba(0, 0, 8, 0.25)';
    introCtx.fillRect(0, 0, introCanvas.width, introCanvas.height);

    // Draw circular rings that expand outward
    const cx = introCanvas.width / 2;
    const cy = introCanvas.height / 2;
    const ringCount = 6;
    for (let i = 0; i < ringCount; i++) {
      const phase = (introT * 0.3 + i / ringCount) % 1;
      const r = phase * Math.max(introCanvas.width, introCanvas.height) * 0.85;
      const alpha = (1 - phase) * 0.12;
      introCtx.beginPath();
      introCtx.arc(cx, cy, r, 0, Math.PI * 2);
      introCtx.strokeStyle = i % 2 === 0
        ? `rgba(160,128,255,${alpha})`
        : `rgba(212,168,32,${alpha * 0.7})`;
      introCtx.lineWidth = 1;
      introCtx.stroke();
    }

    // Draw particles
    introParticles.forEach(p => {
      p.x  += p.vx;
      p.y  += p.vy;
      p.life -= 0.004;
      const alpha = Math.sin(p.life * Math.PI / p.maxLife) * 0.7;
      introCtx.beginPath();
      introCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      introCtx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${alpha})`;
      introCtx.fill();
      if (p.life <= 0 || p.y < -10) Object.assign(p, createIntroParticle(), { y: introCanvas.height + 5 });
    });

    // Grid lines
    introCtx.lineWidth = 0.5;
    const gridA = Math.sin(introT * 0.5) * 0.04 + 0.04;
    introCtx.strokeStyle = `rgba(160,128,255,${gridA})`;
    const cols = 14, rows = 10;
    const colW = introCanvas.width / cols, rowH = introCanvas.height / rows;
    for (let c = 0; c <= cols; c++) {
      introCtx.beginPath();
      introCtx.moveTo(c * colW, 0);
      introCtx.lineTo(c * colW, introCanvas.height);
      introCtx.stroke();
    }
    for (let r = 0; r <= rows; r++) {
      introCtx.beginPath();
      introCtx.moveTo(0, r * rowH);
      introCtx.lineTo(introCanvas.width, r * rowH);
      introCtx.stroke();
    }

    introT += 0.016;
    requestAnimationFrame(drawIntro);
  }
  drawIntro();

  // Auto-dismiss after 3.8s, or on skip
  function dismissIntro() {
    introActive = false;
    introScreen.classList.add('fade-out');
    setTimeout(() => {
      introScreen.style.display = 'none';
      // Trigger main page entry
      document.querySelectorAll('.section-hero > *').forEach((el, i) => {
        el.style.animationDelay = (0.05 + i * 0.12) + 's';
      });
    }, 1200);
  }

  setTimeout(dismissIntro, 3800);
  document.getElementById('intro-skip').addEventListener('click', dismissIntro);

  /* ══════════════════════════════════════════════════════
     POINTER / CURSOR
  ══════════════════════════════════════════════════════ */
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;
  let nmx = 0.5, nmy = 0.5;

  function updatePointer(x, y) {
    mx = x; my = y;
    nmx = x / window.innerWidth;
    nmy = y / window.innerHeight;
  }
  window.addEventListener('mousemove', e => updatePointer(e.clientX, e.clientY));

  const cursorEl = document.getElementById('cursor');
  window.addEventListener('mousedown', () => cursorEl.classList.add('clicking'));
  window.addEventListener('mouseup',   () => cursorEl.classList.remove('clicking'));

  document.querySelectorAll('button, input, .tile, .logo-wrap, .product-card, a').forEach(el => {
    el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
    el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
  });

  let magnetTarget = null;
  document.querySelectorAll('button, .e-badge').forEach(el => {
    el.addEventListener('mouseenter', () => { magnetTarget = el; });
    el.addEventListener('mouseleave', () => { magnetTarget = null; });
  });

  function animateCursor() {
    const ease = 0.11;
    if (magnetTarget) {
      const rect = magnetTarget.getBoundingClientRect();
      const tx = rect.left + rect.width  / 2;
      const ty = rect.top  + rect.height / 2;
      const dx = mx - tx, dy = my - ty;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 90) {
        cx += (tx + dx * 0.35 - cx) * 0.18;
        cy += (ty + dy * 0.35 - cy) * 0.18;
      } else {
        cx += (mx - cx) * ease; cy += (my - cy) * ease;
      }
    } else {
      cx += (mx - cx) * ease; cy += (my - cy) * ease;
    }
    cursorEl.style.transform = `translate(calc(-50% + ${cx}px), calc(-50% + ${cy}px))`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  /* ── Click ripple ── */
  window.addEventListener('click', e => spawnRipple(e.clientX, e.clientY));
  window.addEventListener('touchstart', e => {
    const t = e.touches[0];
    spawnRipple(t.clientX, t.clientY);
    updatePointer(t.clientX, t.clientY);
  }, { passive: true });

  function spawnRipple(x, y) {
    ['ripple', 'ripple-inner'].forEach((cls, i) => {
      const r = document.createElement('div');
      r.className = cls;
      r.style.cssText = `left:${x}px;top:${y}px;width:${60+i*20}px;height:${60+i*20}px;`;
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 950);
    });
  }

  /* ══════════════════════════════════════════════════════
     THREE.JS — LUXURY 3D SCENE
  ══════════════════════════════════════════════════════ */
  const threeCanvas = document.getElementById('three-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas: threeCanvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 400);
  camera.position.z = 22;

  scene.fog = new THREE.FogExp2(0x03030a, 0.016);

  // Lighting
  scene.add(new THREE.AmbientLight(0x9988cc, 0.45));
  const keyLight  = new THREE.PointLight(0xb090ff, 4.0, 80);
  keyLight.position.set(12, 18, 12);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x40c8ff, 2.2, 60);
  fillLight.position.set(-14, -10, 8);
  scene.add(fillLight);
  const goldLight = new THREE.PointLight(0xd4a820, 2.5, 55);
  goldLight.position.set(0, 5, 10);
  scene.add(goldLight);

  // Env map
  const cubeRT  = new THREE.WebGLCubeRenderTarget(64, { format: THREE.RGBAFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
  const cubeCam = new THREE.CubeCamera(0.1, 100, cubeRT);
  scene.add(cubeCam);

  // Materials
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd0c8f0, metalness: 0.98, roughness: 0.03, envMap: cubeRT.texture, envMapIntensity: 2.5 });
  const goldMat   = new THREE.MeshStandardMaterial({ color: 0xd4a820, metalness: 0.95, roughness: 0.08, envMap: cubeRT.texture, envMapIntensity: 2.0, emissive: 0x4a2a00, emissiveIntensity: 0.15 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xa080ff, metalness: 0.9, roughness: 0.06, envMap: cubeRT.texture, envMapIntensity: 2.0, emissive: 0x2010a0, emissiveIntensity: 0.25 });
  const wireMat   = new THREE.MeshBasicMaterial({ color: 0x8060d0, wireframe: true, transparent: true, opacity: 0.1 });

  // Torus rings
  const rings = [];
  [
    { r:7.0,  tube:.06,  rx: Math.PI/2.2, ry: 0.3,  mat: chromeMat },
    { r:8.8,  tube:.04,  rx: Math.PI/3.1, ry:-0.6,  mat: goldMat   },
    { r:5.2,  tube:.075, rx: Math.PI/5,   ry: 0.9,  mat: chromeMat },
    { r:10.2, tube:.03,  rx: Math.PI/4,   ry:-0.2,  mat: wireMat   },
    { r:4.2,  tube:.035, rx: Math.PI/6,   ry: 1.3,  mat: accentMat },
    { r:6.0,  tube:.025, rx: Math.PI/1.8, ry:-1.1,  mat: goldMat   },
  ].forEach(d => {
    const geo  = new THREE.TorusGeometry(d.r, d.tube, 20, 220);
    const mesh = new THREE.Mesh(geo, d.mat === wireMat ? d.mat : d.mat.clone());
    mesh.rotation.x = d.rx;
    mesh.rotation.y = d.ry;
    scene.add(mesh);
    rings.push({ mesh, speed: 0.00022 + Math.random() * 0.00028, phase: Math.random() * Math.PI * 2 });
  });

  // Morphing icosahedron
  const morphGeo  = new THREE.IcosahedronGeometry(1.9, 4);
  const morphMesh = new THREE.Mesh(morphGeo, new THREE.MeshStandardMaterial({
    color: 0xc8b8f8, metalness: 0.96, roughness: 0.02,
    envMap: cubeRT.texture, envMapIntensity: 2.8,
    transparent: true, opacity: 0.55
  }));
  scene.add(morphMesh);
  const morphOrig  = morphGeo.attributes.position.array.slice();
  const morphCount = morphGeo.attributes.position.count;

  // Floating shards
  const shards = [];
  const baseGeos = [
    new THREE.TetrahedronGeometry(1, 0),
    new THREE.OctahedronGeometry(1, 0),
    new THREE.IcosahedronGeometry(1, 0),
    new THREE.DodecahedronGeometry(1, 0),
  ];
  for (let i = 0; i < 48; i++) {
    const size  = 0.05 + Math.random() * 0.3;
    const geo   = baseGeos[Math.floor(Math.random() * baseGeos.length)].clone();
    geo.applyMatrix4(new THREE.Matrix4().makeScale(size, size, size));
    const matChoice = [chromeMat, goldMat, accentMat][Math.floor(Math.random() * 3)].clone();
    matChoice.transparent = true;
    matChoice.opacity = 0.45 + Math.random() * 0.55;
    const mesh = new THREE.Mesh(geo, matChoice);
    mesh.position.set(
      (Math.random() - 0.5) * 30,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 9 - 2
    );
    mesh.rotation.set(Math.random()*Math.PI*2, Math.random()*Math.PI*2, Math.random()*Math.PI*2);
    scene.add(mesh);
    shards.push({
      mesh,
      vr: new THREE.Vector3((Math.random()-.5)*.008, (Math.random()-.5)*.007, (Math.random()-.5)*.006),
      baseY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
      floatSpeed: 0.35 + Math.random() * 0.65,
      floatAmp:   0.25 + Math.random() * 0.6,
    });
  }

  // Diamond-shaped accent objects — inspired by luxury jewelry
  const diamondGeo = new THREE.OctahedronGeometry(0.6, 0);
  const diamondMesh1 = new THREE.Mesh(diamondGeo, goldMat.clone());
  diamondMesh1.position.set(6, 3, 2);
  scene.add(diamondMesh1);
  const diamondMesh2 = new THREE.Mesh(diamondGeo, chromeMat.clone());
  diamondMesh2.position.set(-5, -4, 3);
  scene.add(diamondMesh2);

  // Volumetric light cones
  const shafts = [];
  [{ x:-8, y:20, z:-5, c:0x6040c0, o:.05 }, { x:10, y:16, z:-8, c:0x805000, o:.04 }, { x:0, y:24, z:-14, c:0x9060ff, o:.045 }]
  .forEach(s => {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(4.5, 18, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: s.c, transparent: true, opacity: s.o, side: THREE.BackSide, depthWrite: false })
    );
    mesh.position.set(s.x, s.y - 9, s.z);
    mesh.rotation.x = Math.PI;
    scene.add(mesh);
    shafts.push({ mesh, base: s.o });
  });

  // Stars
  const starCount = 700;
  const starPos   = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i*3]   = (Math.random() - 0.5) * 90;
    starPos[i*3+1] = (Math.random() - 0.5) * 60;
    starPos[i*3+2] = (Math.random() - 0.5) * 45 - 15;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xf0e8ff, size: 0.055, transparent: true, opacity: 0.7, sizeAttenuation: true })));

  // Grid
  const gridHelper = new THREE.GridHelper(70, 44, 0x3020a0, 0x180c2a);
  gridHelper.position.y = -15;
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.3;
  scene.add(gridHelper);

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animate
  let t3 = 0, camTX = 0, camTY = 0;
  function threeLoop() {
    t3 += 0.01;

    // Camera parallax
    const tcx = (nmx - 0.5) * 4.5, tcy = (nmy - 0.5) * -2.5;
    camTX += (tcx - camTX) * 0.028;
    camTY += (tcy - camTY) * 0.028;
    camera.position.x = camTX;
    camera.position.y = camTY;
    camera.lookAt(0, 0, 0);

    // Morph
    const pos = morphGeo.attributes.position.array;
    for (let i = 0; i < morphCount; i++) {
      const ox = morphOrig[i*3], oy = morphOrig[i*3+1], oz = morphOrig[i*3+2];
      const n = Math.sin(ox*2+t3) * Math.cos(oy*2+t3*.7) * Math.sin(oz*1.5+t3*.9);
      const s = 1 + n * 0.2;
      pos[i*3] = ox*s; pos[i*3+1] = oy*s; pos[i*3+2] = oz*s;
    }
    morphGeo.attributes.position.needsUpdate = true;
    morphGeo.computeVertexNormals();
    morphMesh.rotation.y += 0.003;
    morphMesh.rotation.x += 0.0012;

    // Diamonds
    diamondMesh1.rotation.y += 0.008; diamondMesh1.rotation.x += 0.005;
    diamondMesh1.position.y = 3 + Math.sin(t3 * 0.6) * 0.8;
    diamondMesh2.rotation.y -= 0.007; diamondMesh2.rotation.z += 0.004;
    diamondMesh2.position.y = -4 + Math.cos(t3 * 0.55) * 0.7;

    // Rings
    rings.forEach((r, i) => {
      r.mesh.rotation.z += r.speed * (i % 2 === 0 ? 1 : -0.72);
      r.mesh.rotation.x += r.speed * 0.22;
      r.mesh.rotation.y = Math.sin(t3*.28+r.phase)*.18 + (nmx-.5)*.32;
    });

    // Shards
    shards.forEach(s => {
      s.mesh.rotation.x += s.vr.x; s.mesh.rotation.y += s.vr.y; s.mesh.rotation.z += s.vr.z;
      s.mesh.position.y = s.baseY + Math.sin(t3*s.floatSpeed+s.phase)*s.floatAmp;
      const dx = s.mesh.position.x - (nmx-.5)*22;
      const dy = s.mesh.position.y - (nmy-.5)*-14;
      const d  = Math.sqrt(dx*dx+dy*dy);
      if (d < 6) { s.mesh.position.x += dx/d*0.025; }
    });

    // Lights
    keyLight.position.x  = Math.sin(t3*.4)*17;
    keyLight.position.y  = Math.cos(t3*.3)*13+8;
    keyLight.position.z  = Math.cos(t3*.25)*11+6;
    fillLight.position.x = Math.cos(t3*.33)*-15;
    fillLight.position.y = Math.sin(t3*.26)*9-5;
    goldLight.position.x = Math.sin(t3*.22)*10;
    goldLight.position.z = Math.cos(t3*.2)*8;

    // Shafts pulse
    shafts.forEach((s, i) => {
      s.mesh.material.opacity = s.base*(0.65+0.35*Math.sin(t3*.55+i*1.4));
    });

    // Grid drift
    gridHelper.position.z = ((t3*.55) % 1.5);

    // Env map update
    if (Math.round(t3*10)%18===0) {
      morphMesh.visible = false;
      cubeCam.update(renderer, scene);
      morphMesh.visible = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(threeLoop);
  }
  threeLoop();

  /* ══════════════════════════════════════════════════════
     FILM GRAIN
  ══════════════════════════════════════════════════════ */
  const noiseCanvas = document.getElementById('noise-canvas');
  const noiseCtx    = noiseCanvas.getContext('2d');
  noiseCanvas.width = noiseCanvas.height = 256;
  function drawNoise() {
    const id = noiseCtx.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255 | 0;
      id.data[i] = id.data[i+1] = id.data[i+2] = v;
      id.data[i+3] = 255;
    }
    noiseCtx.putImageData(id, 0, 0);
    requestAnimationFrame(drawNoise);
  }
  drawNoise();

  /* ══════════════════════════════════════════════════════
     LOGO 3D TILT
  ══════════════════════════════════════════════════════ */
  const logoWrap = document.getElementById('logo-wrap');
  window.addEventListener('mousemove', e => {
    const cx2 = window.innerWidth/2, cy2 = window.innerHeight/2;
    const rx = ((e.clientY - cy2)/cy2) * -11;
    const ry = ((e.clientX - cx2)/cx2) *  11;
    const d  = Math.sqrt(((e.clientX-cx2)/cx2)**2+((e.clientY-cy2)/cy2)**2);
    logoWrap.style.transform = `perspective(1100px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${1+d*.018},${1+d*.018},1)`;
    logoWrap.style.transition = 'filter .4s';
  });
  window.addEventListener('mouseleave', () => {
    logoWrap.style.transform = 'perspective(1100px) rotateX(0) rotateY(0) scale3d(1,1,1)';
    logoWrap.style.transition = 'transform .7s cubic-bezier(.23,1,.32,1), filter .4s';
  });
  window.addEventListener('touchmove', e => {
    const t = e.touches[0];
    const cx2 = window.innerWidth/2, cy2 = window.innerHeight/2;
    logoWrap.style.transform = `perspective(1100px) rotateX(${((t.clientY-cy2)/cy2)*-8}deg) rotateY(${((t.clientX-cx2)/cx2)*8}deg)`;
    updatePointer(t.clientX, t.clientY);
  }, { passive: true });

  /* ══════════════════════════════════════════════════════
     MOSAIC PARALLAX
  ══════════════════════════════════════════════════════ */
  const tiles = document.querySelectorAll('.tile');
  window.addEventListener('mousemove', e => {
    const cxW = window.innerWidth/2, cyW = window.innerHeight/2;
    tiles.forEach(tile => {
      const depth = parseFloat(tile.dataset.depth || .3);
      const dx = (e.clientX - cxW) * depth * 0.02;
      const dy = (e.clientY - cyW) * depth * 0.02;
      const rx = (e.clientY - cyW)/cyW * depth * -5;
      const ry = (e.clientX - cxW)/cxW * depth *  5;
      tile.style.transform = `translate(${dx}px,${dy}px) perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
  });
  document.addEventListener('mouseleave', () => {
    tiles.forEach(t => { t.style.transform = ''; });
  });

  // Gyroscope
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', e => {
      const beta  = Math.max(-30, Math.min(30, e.beta  || 0));
      const gamma = Math.max(-30, Math.min(30, e.gamma || 0));
      logoWrap.style.transform = `perspective(1100px) rotateX(${(beta/30)*-8}deg) rotateY(${(gamma/30)*8}deg)`;
      tiles.forEach(tile => {
        const depth = parseFloat(tile.dataset.depth || .3);
        tile.style.transform = `translate(${gamma*depth*.32}px,${beta*depth*.32}px)`;
      });
      updatePointer(window.innerWidth/2+gamma*(window.innerWidth/60), window.innerHeight/2+beta*(window.innerHeight/60));
    }, { passive: true });
  }

  /* ══════════════════════════════════════════════════════
     PRODUCT CARD 3D TILT
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.product-card').forEach((card, i) => {
    card.style.setProperty('--card-i', i % 3);
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${y*-8}deg) rotateY(${x*8}deg)`;
      card.style.transition = 'border-color .3s, box-shadow .3s';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'border-color .3s, box-shadow .3s, transform .5s cubic-bezier(.23,1,.32,1)';
    });
  });

  document.querySelectorAll('.reveal-pillar').forEach((p, i) => {
    p.style.setProperty('--pil-i', i);
  });

  /* ══════════════════════════════════════════════════════
     SCROLL REVEAL (IntersectionObserver)
  ══════════════════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-section, .reveal-card, .reveal-pillar').forEach(el => {
    revealObserver.observe(el);
  });

  /* ══════════════════════════════════════════════════════
     COUNTDOWN
  ══════════════════════════════════════════════════════ */
  // Drop closes in 5 days from now — simulates "pre-open with urgency"
  const dropClose = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    const diff = Math.max(0, dropClose - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  /   60000);
    const s = Math.floor((diff % 60000)    /    1000);
    [['cd-days',d],['cd-hours',h],['cd-mins',m],['cd-secs',s]].forEach(([id,val]) => {
      const el = document.getElementById(id);
      const str = pad(val);
      if (el.textContent !== str) {
        el.textContent = str;
        el.classList.add('tick');
        setTimeout(() => el.classList.remove('tick'), 200);
      }
    });
  }
  tick();
  setInterval(tick, 1000);

  /* ══════════════════════════════════════════════════════
     EMAIL NOTIFY
  ══════════════════════════════════════════════════════ */
  window.handleNotify = function () {
    const input   = document.getElementById('email-input');
    const confirm = document.getElementById('notify-confirm');
    const val = input.value.trim();
    if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      confirm.textContent = '— ENTER A VALID EMAIL ADDRESS.';
      confirm.style.color = '#c04040';
      input.style.outline = '1px solid rgba(200,60,60,.4)';
      return;
    }
    confirm.textContent = '✦  YOU\'LL BE FIRST. WATCH YOUR INBOX.';
    confirm.style.color = '';
    input.value = '';
    input.style.outline = '';
    const btn = document.getElementById('notify-btn');
    const rect = btn.getBoundingClientRect();
    spawnRipple(rect.left + rect.width/2, rect.top + rect.height/2);
  };
  document.getElementById('email-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') window.handleNotify();
    document.getElementById('email-input').style.outline = '';
  });

  /* ══════════════════════════════════════════════════════
     PC-CTA reserve buttons
  ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.pc-cta').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const orig = btn.textContent;
      btn.textContent = '✦  RESERVED';
      setTimeout(() => { btn.textContent = orig; }, 2200);
      spawnRipple(e.clientX, e.clientY);
    });
  });

})();
