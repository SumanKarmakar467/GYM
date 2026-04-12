import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#0a0a0a"/>
  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
    font-family="Arial Black,sans-serif" font-weight="900" font-size="13"
    fill="#f97316">GF</text>
</svg>
`;

const createGfIconSvg = (size) => {
  const radius = Math.round(size * 0.2);
  const fontSize = Math.round(size * 0.42);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0a0a0a"/>
  <text x="50%" y="51%" dominant-baseline="central" text-anchor="middle"
    font-family="Arial Black,sans-serif" font-weight="900" font-size="${fontSize}" fill="#f97316">GF</text>
</svg>`;
};

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#0a0a0a"/>
  <text x="600" y="292" text-anchor="middle" font-family="Arial Black,sans-serif" font-size="128" font-weight="900">
    <tspan fill="#ffffff">GYM</tspan><tspan fill="#f97316">FORGE</tspan>
  </text>
  <text x="600" y="370" text-anchor="middle" font-family="Arial,sans-serif" font-size="38" fill="#e5e7eb">
    Forge Your Best Self — AI Workout Planner
  </text>
  <rect x="80" y="572" width="1040" height="10" rx="5" fill="#f97316"/>
</svg>`;

await fs.mkdir(publicDir, { recursive: true });

await fs.writeFile(path.join(publicDir, "favicon.svg"), faviconSvg, "utf8");

await sharp(Buffer.from(ogSvg))
  .png({ compressionLevel: 9, quality: 90, adaptiveFiltering: true })
  .toFile(path.join(publicDir, "og-image.png"));

await sharp(Buffer.from(createGfIconSvg(180)))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, "apple-touch-icon.png"));

await sharp(Buffer.from(createGfIconSvg(192)))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, "icon-192.png"));

await sharp(Buffer.from(createGfIconSvg(512)))
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(path.join(publicDir, "icon-512.png"));

console.log("Generated favicon.svg, og-image.png, apple-touch-icon.png, icon-192.png, icon-512.png");
