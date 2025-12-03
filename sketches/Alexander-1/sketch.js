import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";

const { renderer, input, run, finish } = createEngine();
const { ctx, canvas } = renderer;

const TWO_PI = Math.PI * 2;

let time = 0;
let fadeIn = 0;
let videoStarted = false;
let videoStartTime = -1;
let allClearedTime = -1;
let fadeOutStart = -1;
let finishCalled = false;
let wasDown = false;

// Tracking du mouvement pour le grattage
let lastMx = 0;
let lastMy = 0;
let scratchDistance = 0; // Distance totale grattée
let isScratching = false; // Est-ce qu'on gratte actuellement
let scratchStartTime = 0; // Quand on a commencé à gratter

// Animation de la main (entrée/sortie par le bas)
let handIntroProgress = 0; // 0 à 1 pour l'arrivée de la main
let handOutroProgress = 0; // 0 à 1 pour le départ de la main

// Springs pour suivre la position du curseur avec la main (fluide)
let handXSpring = new Spring({
  position: 0,
  frequency: 12,
  halfLife: 0.02,
});
let handYSpring = new Spring({
  position: 0,
  frequency: 12,
  halfLife: 0.02,
});
let handInitialized = false; // Pour initialiser les springs à la première frame

canvas.style.cursor = "none";

// Vidéo
const bloodVideo = document.createElement("video");
bloodVideo.src = "../sample-audio/assets/1sang.webm";
bloodVideo.loop = true;
bloodVideo.muted = true;
bloodVideo.preload = "auto";

bloodVideo.addEventListener("loadeddata", () => {
  bloodVideo.currentTime = 0;
  bloodVideo.pause();
});

bloodVideo.load();

// Main SVG COMPLET (TOUS LES ÉLÉMENTS PRÉSERVÉS)
const handSVG = `<svg id="Calque_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 458.25 3457.42"><path d="M381.86,3453l-14.83-2838.94c2.89-14.9,5.19-36.77.1-61.95-5.01-24.77-12.7-30.62-11.85-48.97,1.01-21.88,12.65-28.46,27.68-59.08,11.1-22.62,7.03-23.65,22.45-70.69,11.35-34.58,13.48-33.82,30.84-82.84,20.99-59.28,23.61-76.63,14.62-89.33-6.93-9.78-14.22-7.57-24.47-22.47-8.01-11.64-8.94-20.8-20.84-32.41-7.88-7.69-12.22-8.31-13.82-8.43-10.15-.81-19,9.44-22.91,16.42-9.66,17.28-2.03,37.84.74,44.23,6.18,14.23,12.23,13.17,14.86,24.46,3.62,15.56-4.49,32.03-14.74,41.52-3.72,3.44-13.88,12.84-23.39,10.05-8.5-2.5-12.13-13.47-14.93-23.26-12.39-43.29-12.86-70.3-12.86-70.3-.95-55.37-1.42-83.05-5.8-101.3-3.97-16.56-7.28-61.63-43.75-69.94-2.2-.5-15.96-4.83-25.71,2.4-9.44,6.99-9.82,20.74-10.01,27.39-.39,13.8,4.38,19.17,7.24,33.09,1.87,9.11,3.01,22.28-.74,39.35h0c3.3,36.1.62,52.51.62,52.51-1.64,10.03-3.92,23-11.92,25.52-4.79,1.5-9.71-1.34-10.94-2.05-8.08-4.67-10.25-14.12-12.32-21.39-2.09-7.32-6.75-17.77-16.07-38.67-11.67-26.18-21.19-36.44-16.29-44.27,3.07-4.92,8.42-3.44,11.45-9.13,5.23-9.82-5.3-24.42-6.21-25.65-8.17-11.06-24.7-20.65-40.87-16.3-15.34,4.13-22.43,18.68-25.99,25.96-5.93,12.16-10.42,30.21-3.39,64.36,11.21,54.42,38.87,87.48,32.47,92.4-2.44,1.88-8.02-1.75-16.77-7.43-6.4-4.16-21.69-14.37-31.24-34.47-2.68-5.65-13.32-29.79-5.35-55.54,5.27-17.03,14.61-21.61,12.33-32.84-2.22-10.93-14.01-21.09-25.06-21.17-21.9-.17-36.15,39.24-40.45,51.14-4.05,11.21-12.66,36-5.44,64.6,5.43,21.51,18.64,40.56,20.4,43.06,10.22,14.52,21.51,24.5,18.7,28.9-1.54,2.41-7.97-.08-12.37-1.64-10.43-3.7-1.92-17.64-18.56-46.37-6.39-11.03-6.74-23.79-8.16-23.94-9.24-1.02-37.51,51.04-20.41,84.6,8.25,16.19,19.75,15.08,30.65,38.28,6.67,14.2,5.58,21.48,14.27,33.02,9.11,12.1,17.8,14.04,26.8,20.77,28.25,21.13,14.12,55.45,38.54,96.77,15.17,25.68,26.72,22.73,43.09,44.29,17.04,22.43,31.83,61.57,17.45,134.44l-7.85,2823.17,211.03-1.9Z" style="fill:#b59e78; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M224.09,496.21s-26.23-64.27-50.52-90.48" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M19.96,260.3s7.12-8.15,14.95-6.95" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M10.02,256.65s3.47-10.46,22.17-14.99" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M40.28,106.79s11.46-9.28,30.71-3.34" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M33.73,114.96s14.56-7.73,29.83-2.86" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M93.2,322.57s-21.63,4.33-13.54,27.1" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M112.04,291.45s16.65-21.27,33.07-19.53" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M42.42,194.24s28.22-7.08,39.03-13.97" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M52.87,183.14s10.56-7.51,18.83-8.75" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M35.06,178.41s9.2-11.56,28.81-10.78" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M117.38,105.03s27.87-15.03,44.06-12.67" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M140.45,81.57s6.8-3.97,15.95.73" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M131.63,130.95s4.09-7.61,24.75-11.5" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M171.66,256.28s25.56-20.02,45.64-13.74" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M260.27,238.7s25.12,14.86,43.38,3.78" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M279.52,229.75s5.51,14.09,29.38,6.12" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M382.12,216.86s4.36-6.63,25.29-7.51" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M384.04,240.53s29.9-16,39.24-10.46" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M362.7,270.27s21.62,8.09,32.73,25.29" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M346.29,274.57s12.47,33.88,28.46,50.38" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M285.45,266.02s-10.67,55.43-7.6,81.06" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M277.95,373.05s-11.56,93.82-5.22,108.57" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M256.11,376.43s-12.83,81.01-2.27,105.96" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M230.25,431.63s-55.6-166.68-50.8-164.74" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M221.36,440.5s-41.17-111-61.7-123.83" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M330.24,504.61s23.22-67.68,47.1-83.08" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M173.78,96.8c-6.66-11.95-13.34-23.93-9.35-29.04" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M242.84,93.71s5.74-15.87,11.29-22.22" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M270.29,80.96s27.08-12.93,39.91-11.15" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M262.84,96.34s7.75-7.72,23.88-4.61" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M272.8,105.55s12.35-5.87,27.98-1.58" style="fill:none; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M52.67,76.8c31.02,15.22,32.52-10.51,32.52-10.51,0,0-.57-8.86-7.74-9.89-7.17-1.03-24.78,20.39-24.78,20.39Z" style="fill:#efdb88; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/><path d="M242.6,5c-13.28,5.98-5.58,20.28-2.86,21.10,9.51,2.89,39.91-7.62,33.44-15.16-11.98-7.73-18.98-11.16-30.57-5.94Z" style="fill:#efdb88; stroke:#000; stroke-linecap:round; stroke-miterlimit:10; stroke-width:5px;"/></svg>`;

const handImg = new Image();
handImg.src = URL.createObjectURL(
  new Blob([handSVG], { type: "image/svg+xml" })
);

// Points de grattage
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

// Classe ScabPiece OPTIMISÉE pour performance
class ScabPiece {
  constructor(x, y, rx, ry, color, clusterId) {
    this.originalX = x;
    this.originalY = y;
    this.x = x;
    this.y = y;
    this.rx = rx;
    this.ry = ry;
    this.color = color;
    this.clusterId = clusterId; // ID du cluster auquel appartient cette croûte
    this.rotation = 0;
    this.rotSpeed = 0;
    this.falling = false;
    this.vy = 0;

    // OPTIMISATION: Springs plus simples
    this.offsetX = new Spring({ position: 0, frequency: 2, halfLife: 0.05 });
    this.offsetY = new Spring({ position: 0, frequency: 2, halfLife: 0.05 });

    // Pré-générer forme UNE FOIS (évite tremblements)
    this.shapePoints = [];
    const numPoints = 6 + Math.floor(Math.random() * 3);
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * TWO_PI;
      const radiusVariation = 0.7 + Math.random() * 0.5;
      this.shapePoints.push({
        angle,
        rxVar: radiusVariation,
        ryVar: radiusVariation,
      });
    }
  }

  update(
    dt,
    mx,
    my,
    down,
    scratchPoints,
    handScale,
    cursorOffsetY,
    fallenClusters,
    velocityY,
    velocityX,
    offsetX,
    offsetY
  ) {
    // Position actuelle avec offset responsive
    const currentX = this.originalX + this.offsetX.position + offsetX;
    const currentY = this.originalY + this.offsetY.position + offsetY;

    if (this.falling) {
      this.y += this.vy * dt;
      this.vy += 600 * dt;
      this.rotation += this.rotSpeed * dt;
      // Stocker l'offset pour le rendu
      this._renderOffsetX = offsetX;
      this._renderOffsetY = offsetY;
      // OPTIMISATION: Supprimer croûtes hors écran
      return this.originalY + this.y + offsetY < canvas.height + 200;
    }

    // OPTIMISATION: Détection collision avec cache position main
    let closestDist = Infinity;
    let shouldFall = false;
    const handX = mx - 458.25 * handScale * 0.5;
    const handY = my - cursorOffsetY;

    // Calcul efficacité du grattage basé sur la direction
    // Vers le bas = 100% efficace, côtés = 50% efficace, vers le haut = 0%
    let scratchEfficiency = 0;
    if (velocityY > 2) {
      // Mouvement vers le bas (Y augmente = descend)
      scratchEfficiency = 1.0;
    } else if (Math.abs(velocityX) > 2 && velocityY >= -1) {
      // Mouvement latéral (mais pas vers le haut)
      scratchEfficiency = 0.5;
    }
    // Vers le haut = 0, pas de grattage

    // OPTIMISATION: Limiter vérification collision
    for (let i = 0; i < 10; i++) {
      const point = scratchPoints[i];
      const px = handX + point.x * handScale;
      const py = handY + point.y * handScale;
      const dx = px - currentX;
      const dy = py - currentY;
      const dist = Math.hypot(dx, dy);

      if (dist < closestDist) closestDist = dist;
      // Gratte seulement si: appuyé + mouvement efficace + proche
      if (down && scratchEfficiency > 0 && dist < 35) {
        // Probabilité de tomber basée sur l'efficacité
        if (Math.random() < scratchEfficiency) {
          shouldFall = true;
        }
      }
    }

    // Spring très léger
    if (closestDist < 60) {
      const force = (60 - closestDist) * 0.0005;
      this.offsetX.target = (mx - currentX) * force;
      this.offsetY.target = (my - currentY) * force;
    } else {
      this.offsetX.target = 0;
      this.offsetY.target = 0;
    }

    // Vérifier si cette croûte doit tomber (individuellement OU si son cluster tombe)
    if (shouldFall || fallenClusters.has(this.clusterId)) {
      this.falling = true;
      this.vy = 80 + Math.random() * 80;
      this.rotSpeed = (Math.random() - 0.5) * 8;

      // Ajouter le cluster aux tombés
      if (shouldFall && !fallenClusters.has(this.clusterId)) {
        fallenClusters.add(this.clusterId);
      }
    }

    this.offsetX.step(dt);
    this.offsetY.step(dt);
    this.x = this.originalX + this.offsetX.position;
    this.y = this.originalY + this.offsetY.position;

    // Stocker l'offset pour le rendu
    this._renderOffsetX = offsetX;
    this._renderOffsetY = offsetY;

    return true;
  }

  draw(ctx) {
    ctx.save();
    // Appliquer l'offset responsive
    const drawX = this.x + (this._renderOffsetX || 0);
    const drawY = this.y + (this._renderOffsetY || 0);
    ctx.translate(drawX, drawY);
    ctx.rotate(this.rotation);
    ctx.fillStyle = this.color;

    // Dessiner forme pré-générée
    ctx.beginPath();
    const len = this.shapePoints.length;
    for (let i = 0; i < len; i++) {
      const point = this.shapePoints[i];
      const px = Math.cos(point.angle) * this.rx * point.rxVar;
      const py = Math.sin(point.angle) * this.ry * point.ryVar;

      if (i === 0) {
        ctx.moveTo(px, py);
      } else {
        const prevPoint = this.shapePoints[i - 1];
        const cpx = Math.cos(prevPoint.angle + 0.3) * this.rx * prevPoint.rxVar;
        const cpy = Math.sin(prevPoint.angle + 0.3) * this.ry * prevPoint.ryVar;
        ctx.quadraticCurveTo(cpx, cpy, px, py);
      }
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Générer forme croûte
const scabPieces = [];
// Taille de référence (taille initiale du canvas)
const refWidth = canvas.width;
const refHeight = canvas.height;
// Centre de référence (pour les positions relatives)
const refCenterX = refWidth / 2 + 40;
const refCenterY = refHeight / 2;
const oneShapePoints = [];

for (let i = 0; i < 30; i++) {
  const angle = (i / 30) * TWO_PI;
  let radiusX, radiusY;

  if (angle > Math.PI * 0.7 && angle < Math.PI * 1.3) {
    radiusX = 180 + Math.random() * 100;
    radiusY = 220 + Math.random() * 60;
  } else if (angle < Math.PI * 0.3 || angle > Math.PI * 1.7) {
    radiusX = 130 + Math.random() * 70;
    radiusY = 220 + Math.random() * 60;
  } else if (angle > Math.PI * 0.3 && angle < Math.PI * 0.7) {
    radiusX = 60 + Math.random() * 40;
    radiusY = 280 + Math.random() * 80;
  } else {
    radiusX = 90 + Math.random() * 50;
    radiusY = 280 + Math.random() * 80;
  }

  radiusX *= 1.5;
  radiusY *= 1.3;

  const variation = Math.sin(angle * 3) * 40 + (Math.random() - 0.5) * 50;
  oneShapePoints.push({
    x: refCenterX + Math.cos(angle) * (radiusX + variation),
    y: refCenterY + Math.sin(angle) * (radiusY + variation),
  });
}

function isInsideScabShape(px, py) {
  let inside = false;
  for (let i = 0, j = 29; i < 30; j = i++) {
    const xi = oneShapePoints[i].x,
      yi = oneShapePoints[i].y;
    const xj = oneShapePoints[j].x,
      yj = oneShapePoints[j].y;
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// OPTIMISATION: 3000 croûtes au lieu de 4500 (équilibre performance/couverture)
const numPieces = 3000;
const numClusters = 60; // Nombre de clusters (amas de croûtes)
let attempts = 0;

// Créer clusters (positions centrales)
const clusters = [];
for (let i = 0; i < numClusters; i++) {
  const clusterX = refCenterX + (Math.random() - 0.5) * 600;
  const clusterY = refCenterY + (Math.random() - 0.5) * 800;
  clusters.push({ x: clusterX, y: clusterY });
}

while (scabPieces.length < numPieces && attempts < numPieces * 5) {
  attempts++;
  const x = refCenterX + (Math.random() - 0.5) * 700;
  const y = refCenterY + (Math.random() - 0.5) * 900;

  if (isInsideScabShape(x, y)) {
    // OPTIMISATION: Croûtes légèrement plus grosses pour compenser le nombre réduit
    const rx = 12 + Math.random() * 18;
    const ry = 10 + Math.random() * 14;

    // COULEURS: Brun foncé à rouge foncé, moins de variation
    // HSL: H 0-15 (rouge-brun), S 35-55% (saturation modérée), L 20-35% (FONCÉ)
    const hue = Math.random() * 15; // 0-15 (brun-rouge foncé)
    const sat = 35 + Math.random() * 20; // 35-55% (moins de variation)
    const light = 20 + Math.random() * 15; // 20-35% (TRÈS FONCÉ)

    // Trouver le cluster le plus proche
    let closestCluster = 0;
    let minDist = Infinity;
    for (let i = 0; i < clusters.length; i++) {
      const dx = x - clusters[i].x;
      const dy = y - clusters[i].y;
      const dist = Math.hypot(dx, dy);
      if (dist < minDist) {
        minDist = dist;
        closestCluster = i;
      }
    }

    scabPieces.push(
      new ScabPiece(
        x,
        y,
        rx,
        ry,
        `hsl(${hue}, ${sat}%, ${light}%)`,
        closestCluster
      )
    );
  }
}

const scratchSound = new Audio("../sample-audio/assets/gratte.mp3");
scratchSound.volume = 1;
scratchSound.loop = true; // Boucle pour grattage continu

// Set pour tracker les clusters tombés (amas de croûtes)
const fallenClusters = new Set();

function update(dt) {
  time += dt;
  let mx = input.getX();
  let my = input.getY();
  const down = input.isPressed();

  // Utiliser le centre si le curseur n'a pas encore été détecté
  const cursorActive = input.hasStarted();
  if (!cursorActive) {
    mx = canvas.width / 2;
    my = canvas.height / 2;
  }

  // Initialiser les springs de la main à la position actuelle du curseur
  // pour éviter la téléportation lors de l'apparition
  if (!handInitialized) {
    handXSpring.position = mx;
    handXSpring.velocity = 0;
    handYSpring.position = my;
    handYSpring.velocity = 0;
    handInitialized = true;
  }

  // Mettre à jour les springs pour suivre le curseur
  handXSpring.target = mx;
  handYSpring.target = my;
  handXSpring.step(dt);
  handYSpring.step(dt);

  // Positions lissées pour la main
  const handMx = handXSpring.position;
  const handMy = handYSpring.position;

  // Calcul de la vélocité (mouvement depuis la dernière frame)
  const velocityX = handMx - lastMx;
  const velocityY = handMy - lastMy;
  const speed = Math.hypot(velocityX, velocityY);

  // Déterminer si on est en train de gratter efficacement
  // Vers le bas = bon, côtés = ok, vers le haut = non
  const isValidScratchDirection =
    velocityY > 2 || (Math.abs(velocityX) > 2 && velocityY >= -1);
  const currentlyScratching = down && isValidScratchDirection && speed > 3;

  // Gestion du son de grattage
  if (currentlyScratching && !isScratching) {
    // Commence à gratter
    isScratching = true;
    scratchStartTime = time;
    scratchSound.currentTime = 0;
    scratchSound.play().catch(() => {});
  } else if (!currentlyScratching && isScratching) {
    // Arrête de gratter
    isScratching = false;
    scratchSound.pause();
  }

  // Ajuster le volume en fonction de la vitesse de grattage
  if (isScratching) {
    const volumeScale = Math.min(speed / 20, 1); // Plus rapide = plus fort
    scratchSound.volume = 0.6 + volumeScale * 0.4; // Entre 0.6 et 1.0
  }

  // Sauvegarder position pour la prochaine frame
  lastMx = handMx;
  lastMy = handMy;
  wasDown = down;

  if (fadeIn < 1) fadeIn = Math.min(fadeIn + dt * 0.5, 1);

  // Animation d'entrée de la main (2 secondes)
  if (handIntroProgress < 1) {
    handIntroProgress = Math.min(handIntroProgress + dt * 0.5, 1);
  }

  const handScale = 1.0;
  const handWidth = 458.25 * handScale;
  const handHeight = 3457.42 * handScale;
  const cursorOffsetY = handHeight * 0.05;

  // Calcul du décalage du centre (pour le responsive en temps réel)
  const currentCenterX = canvas.width / 2 + 40;
  const currentCenterY = canvas.height / 2;
  const offsetX = currentCenterX - refCenterX;
  const offsetY = currentCenterY - refCenterY;

  // OPTIMISATION: Update croûtes + supprimer tombées
  for (let i = scabPieces.length - 1; i >= 0; i--) {
    if (
      !scabPieces[i].update(
        dt,
        handMx,
        handMy,
        down,
        scratchPoints,
        handScale,
        cursorOffsetY,
        fallenClusters,
        velocityY,
        velocityX,
        offsetX,
        offsetY
      )
    ) {
      scabPieces.splice(i, 1);
    }
  }

  // Progression
  let remaining = 0;
  for (let i = 0; i < scabPieces.length; i++) {
    if (!scabPieces[i].falling) remaining++;
  }
  const progress = 1 - remaining / numPieces;

  if (progress >= 0.4 && !videoStarted) {
    videoStarted = true;
    videoStartTime = time;
    bloodVideo.currentTime = 0;
    bloodVideo.play();
  }

  if (remaining === 0 && allClearedTime === -1) {
    allClearedTime = time;
    // Arrêter le son de grattage
    scratchSound.pause();
    isScratching = false;
  }

  if (allClearedTime !== -1) {
    const elapsed = time - allClearedTime;

    // Démarrer le fade out rapidement (après 1 seconde)
    if (elapsed > 1 && fadeOutStart === -1) fadeOutStart = time;
  }

  if (fadeOutStart !== -1) {
    const fadeElapsed = time - fadeOutStart;

    // Fade out rapide (0.5 secondes)
    const fadeOutProgress = Math.min(fadeElapsed / 0.5, 1);

    // La main commence à partir APRÈS le fade out complet
    if (fadeOutProgress >= 1 && handOutroProgress < 1) {
      handOutroProgress = Math.min(handOutroProgress + dt * 2, 1);
    }

    // Finir après que la main soit partie
    if (handOutroProgress >= 1 && !finishCalled) {
      finishCalled = true;
      finish();
    }
  }

  // === RENDU ===
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fond beige
  if (fadeIn > 0) {
    ctx.fillStyle = `rgba(248, 192, 165, ${fadeIn})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Vidéo (taille fixe, centrée)
  if (bloodVideo.readyState >= 2) {
    // Taille fixe de la vidéo (ne change pas avec la fenêtre)
    const vw = bloodVideo.videoWidth;
    const vh = bloodVideo.videoHeight;

    let alpha = 1;
    if (fadeOutStart !== -1) {
      alpha = 1 - Math.min((time - fadeOutStart) / 1, 1);
    }

    if (alpha > 0) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.drawImage(
        bloodVideo,
        (canvas.width - vw) / 2,
        (canvas.height - vh) / 2,
        vw,
        vh
      );
      ctx.restore();
    }
  }

  // OPTIMISATION: Render croûtes
  for (let i = 0; i < scabPieces.length; i++) {
    scabPieces[i].draw(ctx);
  }

  // Fade out final (AVANT la main pour que la main reste au-dessus)
  if (fadeOutStart !== -1) {
    const fadeOutAlpha = Math.min((time - fadeOutStart) / 0.5, 1);
    if (fadeOutAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${fadeOutAlpha})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Main avec animation d'entrée/sortie (AU-DESSUS du fade out noir)
  if (handImg.complete) {
    // Smoothstep pour l'intro et l'outro
    const introSmooth =
      handIntroProgress * handIntroProgress * (3 - 2 * handIntroProgress);
    const outroSmooth =
      handOutroProgress * handOutroProgress * (3 - 2 * handOutroProgress);

    // Offset vertical : part du bas de l'écran et arrive à la position normale
    const introOffset = canvas.height * 1.5 * (1 - introSmooth);
    const outroOffset = canvas.height * 1.5 * outroSmooth;

    const handY = handMy - cursorOffsetY + introOffset + outroOffset;

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
