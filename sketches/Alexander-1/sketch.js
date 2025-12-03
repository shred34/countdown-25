import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";

const { renderer, input, run, finish } = createEngine();
const { ctx, canvas } = renderer;
const TWO_PI = Math.PI * 2;

// État global
let time = 0,
  fadeIn = 0,
  videoStarted = false,
  allClearedTime = -1,
  fadeOutStart = -1;
let finishCalled = false,
  wasDown = false,
  lastMx = 0,
  lastMy = 0;
let isScratching = false,
  handIntroProgress = 0,
  handOutroProgress = 0,
  handInitialized = false;
let crouteSoundPlaying = false,
  crouteSoundStartTime = 0;

// Springs pour la main
const handXSpring = new Spring({ position: 0, frequency: 12, halfLife: 0.02 });
const handYSpring = new Spring({ position: 0, frequency: 12, halfLife: 0.02 });

canvas.style.cursor = "none";

// Médias
const bloodVideo = document.createElement("video");
Object.assign(bloodVideo, {
  src: "../sample-audio/assets/1sang.webm",
  loop: true,
  muted: true,
  preload: "auto",
});
bloodVideo.addEventListener("loadeddata", () => {
  bloodVideo.currentTime = 0;
  bloodVideo.pause();
});
bloodVideo.load();

const scratchSound = new Audio("../sample-audio/assets/gratte.mp3");
Object.assign(scratchSound, { volume: 1, loop: true });

const crouteSound = new Audio("../sample-audio/assets/croute.mp3");
crouteSound.volume = 0.8;

// Main SVG
const handSVG = `<svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.25 3457.42"><path d="M381.86,3453l-14.83-2838.94c2.89-14.9,5.19-36.77.1-61.95-5.01-24.77-12.7-30.62-11.85-48.97,1.01-21.88,12.65-28.46,27.68-59.08,11.1-22.62,7.03-23.65,22.45-70.69,11.35-34.58,13.48-33.82,30.84-82.84,20.99-59.28,23.61-76.63,14.62-89.33-6.93-9.78-14.22-7.57-24.47-22.47-8.01-11.64-8.94-20.8-20.84-32.41-7.88-7.69-12.22-8.31-13.82-8.43-10.15-.81-19,9.44-22.91,16.42-9.66,17.28-2.03,37.84.74,44.23,6.18,14.23,12.23,13.17,14.86,24.46,3.62,15.56-4.49,32.03-14.74,41.52-3.72,3.44-13.88,12.84-23.39,10.05-8.5-2.5-12.13-13.47-14.93-23.26-12.39-43.29-12.86-70.3-12.86-70.3-.95-55.37-1.42-83.05-5.8-101.3-3.97-16.56-7.28-61.63-43.75-69.94-2.2-.5-15.96-4.83-25.71,2.4-9.44,6.99-9.82,20.74-10.01,27.39-.39,13.8,4.38,19.17,7.24,33.09,1.87,9.11,3.01,22.28-.74,39.35h0c3.3,36.1.62,52.51.62,52.51-1.64,10.03-3.92,23-11.92,25.52-4.79,1.5-9.71-1.34-10.94-2.05-8.08-4.67-10.25-14.12-12.32-21.39-2.09-7.32-6.75-17.77-16.07-38.67-11.67-26.18-21.19-36.44-16.29-44.27,3.07-4.92,8.42-3.44,11.45-9.13,5.23-9.82-5.3-24.42-6.21-25.65-8.17-11.06-24.7-20.65-40.87-16.3-15.34,4.13-22.43,18.68-25.99,25.96-5.93,12.16-10.42,30.21-3.39,64.36,11.21,54.42,38.87,87.48,32.47,92.4-2.44,1.88-8.02-1.75-16.77-7.43-6.4-4.16-21.69-14.37-31.24-34.47-2.68-5.65-13.32-29.79-5.35-55.54,5.27-17.03,14.61-21.61,12.33-32.84-2.22-10.93-14.01-21.09-25.06-21.17-21.9-.17-36.15,39.24-40.45,51.14-4.05,11.21-12.66,36-5.44,64.6,5.43,21.51,18.64,40.56,20.4,43.06,10.22,14.52,21.51,24.5,18.7,28.9-1.54,2.41-7.97-.08-12.37-1.64-10.43-3.7-1.92-17.64-18.56-46.37-6.39-11.03-6.74-23.79-8.16-23.94-9.24-1.02-37.51,51.04-20.41,84.6,8.25,16.19,19.75,15.08,30.65,38.28,6.67,14.2,5.58,21.48,14.27,33.02,9.11,12.1,17.8,14.04,26.8,20.77,28.25,21.13,14.12,55.45,38.54,96.77,15.17,25.68,26.72,22.73,43.09,44.29,17.04,22.43,31.83,61.57,17.45,134.44l-7.85,2823.17,211.03-1.9Z" style="fill:#b59e78; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M224.09,496.21s-26.23-64.27-50.52-90.48" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M19.96,260.3s7.12-8.15,14.95-6.95" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M10.02,256.65s3.47-10.46,22.17-14.99" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M40.28,106.79s11.46-9.28,30.71-3.34" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M33.73,114.96s14.56-7.73,29.83-2.86" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M93.2,322.57s-21.63,4.33-13.54,27.1" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M112.04,291.45s16.65-21.27,33.07-19.53" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M42.42,194.24s28.22-7.08,39.03-13.97" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M52.87,183.14s10.56-7.51,18.83-8.75" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M35.06,178.41s9.2-11.56,28.81-10.78" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M117.38,105.03s27.87-15.03,44.06-12.67" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M140.45,81.57s6.8-3.97,15.95.73" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M131.63,130.95s4.09-7.61,24.75-11.5" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M171.66,256.28s25.56-20.02,45.64-13.74" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M260.27,238.7s25.12,14.86,43.38,3.78" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M279.52,229.75s5.51,14.09,29.38,6.12" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M382.12,216.86s4.36-6.63,25.29-7.51" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M384.04,240.53s29.9-16,39.24-10.46" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M362.7,270.27s21.62,8.09,32.73,25.29" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M346.29,274.57s12.47,33.88,28.46,50.38" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M285.45,266.02s-10.67,55.43-7.6,81.06" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M277.95,373.05s-11.56,93.82-5.22,108.57" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M256.11,376.43s-12.83,81.01-2.27,105.96" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M230.25,431.63s-55.6-166.68-50.8-164.74" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M221.36,440.5s-41.17-111-61.7-123.83" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M330.24,504.61s23.22-67.68,47.1-83.08" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M173.78,96.8c-6.66-11.95-13.34-23.93-9.35-29.04" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M242.84,93.71s5.74-15.87,11.29-22.22" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M270.29,80.96s27.08-12.93,39.91-11.15" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M262.84,96.34s7.75-7.72,23.88-4.61" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M272.8,105.55s12.35-5.87,27.98-1.58" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M52.67,76.8c31.02,15.22,32.52-10.51,32.52-10.51,0,0-.57-8.86-7.74-9.89-7.17-1.03-24.78,20.39-24.78,20.39Z" style="fill:#efdb88; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M242.6,5c-13.28,5.98-5.58,20.28-2.86,21.10,9.51,2.89,39.91-7.62,33.44-15.16-11.98-7.73-18.98-11.16-30.57-5.94Z" style="fill:#efdb88; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/></svg>`;
const handImg = new Image();
handImg.src = URL.createObjectURL(
  new Blob([handSVG], { type: "image/svg+xml" })
);

// Points de grattage (positions sur la main)
const scratchPoints = [
  { x: 40, y: 140 },
  { x: 45, y: 120 },
  { x: 60, y: 70 },
  { x: 65, y: 75 },
  { x: 145, y: 85 },
  { x: 160, y: 75 },
  { x: 242, y: 10 },
  { x: 245, y: 15 },
  { x: 380, y: 160 },
  { x: 390, y: 150 },
];

// Constantes de référence
const refWidth = canvas.width,
  refHeight = canvas.height;
const refCenterX = refWidth / 2 + 40,
  refCenterY = refHeight / 2;
const handWidth = 458.25,
  handHeight = 3457.42,
  cursorOffsetY = handHeight * 0.05;
const numPieces = 3000,
  numClusters = 60;

// Classe croûte optimisée
class ScabPiece {
  constructor(x, y, rx, ry, color, clusterId) {
    Object.assign(this, {
      originalX: x,
      originalY: y,
      x,
      y,
      rx,
      ry,
      color,
      clusterId,
    });
    this.rotation = this.rotSpeed = this.vy = 0;
    this.falling = false;
    this.offsetX = new Spring({ position: 0, frequency: 2, halfLife: 0.05 });
    this.offsetY = new Spring({ position: 0, frequency: 2, halfLife: 0.05 });
    const numPts = 6 + Math.floor(Math.random() * 3);
    this.shape = Array.from({ length: numPts }, (_, i) => ({
      angle: (i / numPts) * TWO_PI,
      rv: 0.7 + Math.random() * 0.5,
    }));
  }

  update(
    dt,
    mx,
    my,
    down,
    vX,
    vY,
    handIntroOff,
    handOutroOff,
    scale,
    fallenClusters
  ) {
    const screenX =
      canvas.width / 2 +
      (this.originalX + this.offsetX.position - refWidth / 2) * scale;
    const screenY =
      canvas.height / 2 +
      (this.originalY + this.offsetY.position - refHeight / 2) * scale;

    if (this.falling) {
      this.y += this.vy * dt;
      this.vy += 600 * dt;
      this.rotation += this.rotSpeed * dt;
      const fallY =
        canvas.height / 2 +
        (this.offsetY.position + this.y - refHeight / 2) * scale;
      return { alive: fallY < canvas.height + 100, justFell: false };
    }

    const handX = mx - handWidth * 0.5,
      handY = my - cursorOffsetY + handIntroOff + handOutroOff;
    const efficiency = vY > 2 ? 1 : Math.abs(vX) > 2 && vY >= -1 ? 0.5 : 0;

    let closestDist = Infinity,
      closestPx = 0,
      closestPy = 0,
      shouldFall = false;
    for (const pt of scratchPoints) {
      const px = handX + pt.x,
        py = handY + pt.y;
      const dist = Math.hypot(px - screenX, py - screenY);
      if (dist < closestDist) {
        closestDist = dist;
        closestPx = px;
        closestPy = py;
      }
      if (
        down &&
        efficiency > 0 &&
        dist < 35 * scale &&
        Math.random() < efficiency
      )
        shouldFall = true;
    }

    if (closestDist < 60 * scale) {
      const force = (60 * scale - closestDist) * 0.001;
      this.offsetX.target = ((closestPx - screenX) * force) / scale;
      this.offsetY.target = ((closestPy - screenY) * force) / scale;
    } else {
      this.offsetX.target = this.offsetY.target = 0;
    }

    let justFell = false;
    if ((shouldFall || fallenClusters.has(this.clusterId)) && !this.falling) {
      this.falling = true;
      this.vy = 80 + Math.random() * 80;
      this.rotSpeed = (Math.random() - 0.5) * 8;
      justFell = true;
      if (shouldFall) fallenClusters.add(this.clusterId);
    }

    this.offsetX.step(dt);
    this.offsetY.step(dt);
    this.x = this.originalX + this.offsetX.position;
    this.y = this.originalY + this.offsetY.position;
    return { alive: true, justFell };
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    this.shape.forEach((p, i) => {
      const px = Math.cos(p.angle) * this.rx * p.rv,
        py = Math.sin(p.angle) * this.ry * p.rv;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Générer forme du "1"
const oneShape = Array.from({ length: 30 }, (_, i) => {
  const angle = (i / 30) * TWO_PI;
  let rx, ry;
  if (angle > Math.PI * 0.7 && angle < Math.PI * 1.3) {
    rx = 180 + Math.random() * 100;
    ry = 220 + Math.random() * 60;
  } else if (angle < Math.PI * 0.3 || angle > Math.PI * 1.7) {
    rx = 130 + Math.random() * 70;
    ry = 220 + Math.random() * 60;
  } else if (angle > Math.PI * 0.3 && angle < Math.PI * 0.7) {
    rx = 60 + Math.random() * 40;
    ry = 280 + Math.random() * 80;
  } else {
    rx = 90 + Math.random() * 50;
    ry = 280 + Math.random() * 80;
  }
  const variation = Math.sin(angle * 3) * 40 + (Math.random() - 0.5) * 50;
  return {
    x: refCenterX + Math.cos(angle) * (rx * 1.5 + variation),
    y: refCenterY + Math.sin(angle) * (ry * 1.3 + variation),
  };
});

const isInside = (px, py) => {
  let inside = false;
  for (let i = 0, j = 29; i < 30; j = i++) {
    const { x: xi, y: yi } = oneShape[i],
      { x: xj, y: yj } = oneShape[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)
      inside = !inside;
  }
  return inside;
};

// Créer clusters et croûtes
const clusters = Array.from({ length: numClusters }, () => ({
  x: refCenterX + (Math.random() - 0.5) * 600,
  y: refCenterY + (Math.random() - 0.5) * 800,
}));

const scabPieces = [];
for (
  let attempts = 0;
  scabPieces.length < numPieces && attempts < numPieces * 5;
  attempts++
) {
  const x = refCenterX + (Math.random() - 0.5) * 700,
    y = refCenterY + (Math.random() - 0.5) * 900;
  if (isInside(x, y)) {
    const rx = 12 + Math.random() * 18,
      ry = 10 + Math.random() * 14;
    const hue = Math.random() * 15,
      sat = 35 + Math.random() * 20,
      light = 20 + Math.random() * 15;
    const clusterId = clusters.reduce(
      (best, c, i, arr) =>
        Math.hypot(x - c.x, y - c.y) <
        Math.hypot(x - arr[best].x, y - arr[best].y)
          ? i
          : best,
      0
    );
    scabPieces.push(
      new ScabPiece(x, y, rx, ry, `hsl(${hue}, ${sat}%, ${light}%)`, clusterId)
    );
  }
}

const fallenClusters = new Set();
const smoothstep = (t) => t * t * (3 - 2 * t);

function update(dt) {
  time += dt;
  const mx = input.getX(),
    my = input.getY(),
    down = input.isPressed();
  const cursorActive = input.hasStarted();

  if (!handInitialized && cursorActive) {
    handXSpring.position = mx;
    handYSpring.position = my;
    handXSpring.velocity = handYSpring.velocity = 0;
    handInitialized = true;
  }
  if (handInitialized) {
    handXSpring.target = mx;
    handYSpring.target = my;
    handXSpring.step(dt);
    handYSpring.step(dt);
  }

  const handMx = handInitialized ? handXSpring.position : 0;
  const handMy = handInitialized ? handYSpring.position : 0;
  const vX = handMx - lastMx,
    vY = handMy - lastMy,
    speed = Math.hypot(vX, vY);

  const validDir = vY > 2 || (Math.abs(vX) > 2 && vY >= -1);
  const scratching = down && validDir && speed > 3;
  if (scratching && !isScratching) {
    isScratching = true;
    scratchSound.currentTime = 0;
    scratchSound.play().catch(() => {});
  } else if (!scratching && isScratching) {
    isScratching = false;
    scratchSound.pause();
  }
  if (isScratching) scratchSound.volume = 0.6 + Math.min(speed / 20, 1) * 0.4;

  lastMx = handMx;
  lastMy = handMy;
  wasDown = down;
  if (fadeIn < 1) fadeIn = Math.min(fadeIn + dt * 0.5, 1);
  if (cursorActive && handIntroProgress < 1)
    handIntroProgress = Math.min(handIntroProgress + dt * 0.5, 1);

  const introOff = canvas.height * 1.5 * (1 - smoothstep(handIntroProgress));
  const outroOff = canvas.height * 1.5 * smoothstep(handOutroProgress);
  const scale = canvas.height / refHeight;

  let fellCount = 0;
  for (let i = scabPieces.length - 1; i >= 0; i--) {
    const r = scabPieces[i].update(
      dt,
      handMx,
      handMy,
      down,
      vX,
      vY,
      introOff,
      outroOff,
      scale,
      fallenClusters
    );
    if (r.justFell) fellCount++;
    if (!r.alive) scabPieces.splice(i, 1);
  }

  if (fellCount > 0) {
    if (!crouteSoundPlaying) {
      crouteSound.currentTime = 0;
      crouteSound.play().catch(() => {});
      crouteSoundPlaying = true;
    }
    crouteSoundStartTime = time;
    crouteSound.volume = Math.min(0.5 + fellCount * 0.1, 1);
  } else if (crouteSoundPlaying && time - crouteSoundStartTime > 0.15) {
    crouteSound.pause();
    crouteSoundPlaying = false;
  }

  const remaining = scabPieces.filter((s) => !s.falling).length;
  if (!videoStarted && remaining / numPieces <= 0.6) {
    videoStarted = true;
    bloodVideo.currentTime = 0;
    bloodVideo.play();
  }
  if (remaining === 0 && allClearedTime === -1) {
    allClearedTime = time;
    scratchSound.pause();
    isScratching = false;
  }
  if (
    allClearedTime !== -1 &&
    time - allClearedTime > 1.5 &&
    fadeOutStart === -1
  )
    fadeOutStart = time;
  if (fadeOutStart !== -1) {
    const fadeProgress = Math.min((time - fadeOutStart) / 0.5, 1);
    if (fadeProgress >= 1 && handOutroProgress < 1)
      handOutroProgress = Math.min(handOutroProgress + dt * 2, 1);
    if (handOutroProgress >= 1 && !finishCalled) {
      finishCalled = true;
      finish();
    }
  }

  // RENDU
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (fadeIn > 0) {
    ctx.fillStyle = `rgba(248, 192, 165, ${fadeIn})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (bloodVideo.readyState >= 2) {
    const vScale = canvas.height / bloodVideo.videoHeight;
    const alpha =
      fadeOutStart !== -1 ? 1 - Math.min((time - fadeOutStart) / 1, 1) : 1;
    if (alpha > 0) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        bloodVideo,
        (canvas.width - bloodVideo.videoWidth * vScale) / 2,
        0,
        bloodVideo.videoWidth * vScale,
        canvas.height
      );
      ctx.restore();
    }
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(scale, scale);
  ctx.translate(-refWidth / 2, -refHeight / 2);
  scabPieces.filter((s) => !s.falling).forEach((s) => s.draw(ctx));
  scabPieces.filter((s) => s.falling).forEach((s) => s.draw(ctx));
  ctx.restore();

  if (fadeOutStart !== -1) {
    const alpha = Math.min((time - fadeOutStart) / 0.5, 1);
    if (alpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  if (handImg.complete) {
    const handY = handMy - cursorOffsetY + introOff + outroOff;
    ctx.drawImage(
      handImg,
      handMx - handWidth / 2,
      handY,
      handWidth,
      handHeight
    );
  }
}

run(update);
