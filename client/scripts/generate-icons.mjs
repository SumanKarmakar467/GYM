import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

mkdirSync(path.join(__dirname, "../public/icons"), { recursive: true });

sizes.forEach((size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const r = size * 0.18;

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.beginPath();
  ctx.moveTo(r, 0);
  ctx.lineTo(size - r, 0);
  ctx.quadraticCurveTo(size, 0, size, r);
  ctx.lineTo(size, size - r);
  ctx.quadraticCurveTo(size, size, size - r, size);
  ctx.lineTo(r, size);
  ctx.quadraticCurveTo(0, size, 0, size - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fill();

  // Orange accent bar at top
  ctx.fillStyle = "#f97316";
  ctx.fillRect(size * 0.12, size * 0.08, size * 0.76, size * 0.06);

  // "GYM" text in white
  ctx.fillStyle = "#ffffff";
  ctx.font = `900 ${size * 0.22}px Arial Black, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GYM", size * 0.5, size * 0.42);

  // "FORGE" text in orange
  ctx.fillStyle = "#f97316";
  ctx.font = `900 ${size * 0.18}px Arial Black, sans-serif`;
  ctx.fillText("FORGE", size * 0.5, size * 0.65);

  // Orange accent bar at bottom
  ctx.fillStyle = "#f97316";
  ctx.fillRect(size * 0.12, size * 0.84, size * 0.76, size * 0.04);

  const buffer = canvas.toBuffer("image/png");
  const outPath = path.join(__dirname, `../public/icons/icon-${size}.png`);
  writeFileSync(outPath, buffer);
  console.log(`Generated icon-${size}.png`);
});

// Also generate apple-touch-icon (180x180)
const canvas = createCanvas(180, 180);
const ctx = canvas.getContext("2d");
ctx.fillStyle = "#0a0a0a";
ctx.fillRect(0, 0, 180, 180);
ctx.fillStyle = "#ffffff";
ctx.font = "900 40px Arial Black, sans-serif";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.fillText("GYM", 90, 75);
ctx.fillStyle = "#f97316";
ctx.font = "900 32px Arial Black, sans-serif";
ctx.fillText("FORGE", 90, 118);
writeFileSync(path.join(__dirname, "../public/apple-touch-icon.png"), canvas.toBuffer("image/png"));
console.log("Generated apple-touch-icon.png");
