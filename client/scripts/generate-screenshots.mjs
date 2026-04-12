import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
mkdirSync(path.join(__dirname, "../public/screenshots"), { recursive: true });

const roundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

function makeScreen(filename, title, subtitle) {
  const w = 390;
  const h = 844;
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, w, 60);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 18px Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("GYM", 20, 38);
  ctx.fillStyle = "#f97316";
  ctx.fillText("FORGE", 65, 38);
  ctx.fillStyle = "#f97316";
  ctx.font = "700 28px Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(title, w / 2, 160);
  ctx.fillStyle = "#666";
  ctx.font = "400 16px Arial, sans-serif";
  ctx.fillText(subtitle, w / 2, 200);
  ctx.fillStyle = "#1a1a1a";
  roundedRect(ctx, 20, 240, w - 40, 100, 12);
  ctx.fill();
  ctx.fillStyle = "#333";
  roundedRect(ctx, 20, 360, w - 40, 80, 12);
  ctx.fill();
  roundedRect(ctx, 20, 460, w - 40, 80, 12);
  ctx.fill();
  writeFileSync(path.join(__dirname, `../public/screenshots/${filename}`), canvas.toBuffer("image/png"));
  console.log(`Generated ${filename}`);
}

makeScreen("dashboard.png", "Dashboard", "Your weekly progress at a glance");
makeScreen("workout.png", "Workout Plan", "AI-generated exercise cards");
