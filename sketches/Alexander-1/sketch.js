import { createEngine } from "../_shared/engine.js";
import { Spring } from "../_shared/spring.js";

const { renderer, input, run, finish } = createEngine();
const { ctx, canvas } = renderer;

const TWO_PI = Math.PI * 2;

// État global
let time = 0;
let fadeIn = 0;
let fadeOut = 0;
let finishCalled = false;
let finishTime = -1;
let wasDown = false;

// Canvas pour le masque du "1"
const maskCanvas = document.createElement("canvas");
maskCanvas.width = canvas.width;
maskCanvas.height = canvas.height;
const maskCtx = maskCanvas.getContext("2d");
maskCtx.fillStyle = "white";
maskCtx.font = "bold 1200px Helvetica";
maskCtx.textAlign = "center";
maskCtx.textBaseline = "middle";
maskCtx.fillText("1", canvas.width / 2, canvas.height / 2);

// Canvas pour la croûte (layer qu'on va gratter)
const scabCanvas = document.createElement("canvas");
scabCanvas.width = canvas.width;
scabCanvas.height = canvas.height;
const scabCtx = scabCanvas.getContext("2d");

// Dessine la croûte brune sur le "1"
scabCtx.fillStyle = "#8B4513"; // Brun croûte
scabCtx.font = "bold 1200px Helvetica";
scabCtx.textAlign = "center";
scabCtx.textBaseline = "middle";
scabCtx.fillText("1", canvas.width / 2, canvas.height / 2);

// Ajouter une texture rugueuse pour l'effet croûte
const imgData = scabCtx.getImageData(0, 0, scabCanvas.width, scabCanvas.height);
for (let i = 0; i < imgData.data.length; i += 4) {
  if (imgData.data[i + 3] > 0) {
    // Si pas transparent
    const noise = (Math.random() - 0.5) * 40; // Plus de variation pour texture rugueuse
    imgData.data[i] += noise; // R
    imgData.data[i + 1] += noise * 0.6; // G moins fort
    imgData.data[i + 2] += noise * 0.3; // B encore moins
  }
}
scabCtx.putImageData(imgData, 0, 0);

// Particules de croûte qui tombent
class ScabParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 100;
    this.vy = Math.random() * 50 + 50;
    this.rot = Math.random() * TWO_PI;
    this.rotSpeed = (Math.random() - 0.5) * 5;
    this.size = 8 + Math.random() * 12;
    this.alpha = 0.8 + Math.random() * 0.2;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.vy += 400 * dt; // Gravité
    this.rot += this.rotSpeed * dt;
    this.alpha -= dt * 0.8; // Fade out
    return this.y < canvas.height + 50 && this.alpha > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = "#6B3410"; // Brun foncé pour morceaux de croûte
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.7);
    ctx.restore();
  }
}

let particles = [];

// Spring pour l'effet de soulèvement de la croûte près du curseur (ongle qui gratte)
let liftSpring = new Spring({
  position: 0,
  frequency: 4,
  halfLife: 0.08,
});

let scratchProgress = 0; // 0 = tout croûté, 1 = tout gratté
let scratchedArea = 0; // Zone grattée en pixels
const totalArea = 500000; // Estimation de la zone du "1"
const scratchRadius = 40;

canvas.style.cursor = "none";

// Sons (tu peux utiliser un son de grattage existant)
const scratchSound = new Audio("../sample-audio/assets/peel.mp3");
scratchSound.volume = 0.5;

function update(dt) {
  time += dt;
  const mx = input.getX();
  const my = input.getY();
  const down = input.isPressed();
  const clicked = down && !wasDown;
  wasDown = down;

  // Fade in au début
  if (fadeIn < 1) fadeIn = Math.min(fadeIn + dt * 0.5, 1);

  // Calculer si on est sur le "1"
  const onOne =
    mx > 0 && my > 0 && maskCtx.getImageData(mx, my, 1, 1).data[3] > 128;

  // Spring pour le lift
  liftSpring.target = onOne && down ? 1 : 0;
  liftSpring.step(dt);

  // Gratter la croûte quand on clique et drag
  if (down && onOne) {
    // Effacer la croûte
    scabCtx.globalCompositeOperation = "destination-out";
    scabCtx.beginPath();
    scabCtx.arc(mx, my, scratchRadius, 0, TWO_PI);
    scabCtx.fill();
    scabCtx.globalCompositeOperation = "source-over";

    // Incrémenter la zone grattée
    scratchedArea += Math.PI * scratchRadius * scratchRadius * 0.5;
    scratchProgress = Math.min(scratchedArea / totalArea, 1);

    // Créer des particules de croûte
    if (Math.random() < 0.3) {
      particles.push(new ScabParticle(mx, my));
    }

    // Son de grattage
    if (clicked) {
      scratchSound.currentTime = 0;
      scratchSound.play();
    }
  }

  // Quand c'est fini
  if (scratchProgress > 0.95 && finishTime === -1) {
    finishTime = time;
  }

  if (finishTime !== -1) {
    const elapsed = time - finishTime;
    if (elapsed > 0.5) fadeOut = Math.min((elapsed - 0.5) / 0.5, 1);
    if (fadeOut >= 1 && !finishCalled) {
      finishCalled = true;
      finish();
    }
  }

  // Mettre à jour les particules
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update(dt)) particles.splice(i, 1);
  }

  // === RENDU ===

  // Fond noir
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Fond peau beige (sous la croûte)
  if (fadeIn > 0) {
    ctx.fillStyle = `rgba(248, 192, 165, ${fadeIn})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Dessiner le "1" en peau rose (révélé progressivement sous la croûte)
  ctx.fillStyle = "#ffb3ba"; // Rose chair (peau fraîche sous la croûte)
  ctx.font = "bold 1200px Helvetica";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("1", canvas.width / 2, canvas.height / 2);

  // Effet de soulèvement subtil (ombre sous la croûte qui se soulève)
  if (liftSpring.position > 0.01 && onOne) {
    const lift = liftSpring.position;
    ctx.save();
    ctx.globalAlpha = lift * 0.3;
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(mx + 2, my + 2, scratchRadius * (1 + lift * 0.2), 0, TWO_PI);
    ctx.fill();
    ctx.restore();
  }

  // Dessiner la croûte par-dessus
  ctx.drawImage(scabCanvas, 0, 0);

  // Dessiner les particules qui tombent
  particles.forEach((p) => p.draw(ctx));

  // Curseur (petit cercle)
  if (mx > 0 && my > 0) {
    ctx.strokeStyle = onOne ? "#ffffff" : "#666666";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(mx, my, 15, 0, TWO_PI);
    ctx.stroke();

    // Petit point au centre
    ctx.fillStyle = onOne ? "#ffffff" : "#666666";
    ctx.beginPath();
    ctx.arc(mx, my, 3, 0, TWO_PI);
    ctx.fill();
  }

  // Fade out final
  if (fadeOut > 0) {
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeOut})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

run(update);
