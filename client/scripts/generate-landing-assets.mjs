import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");
const imageDir = path.join(publicDir, "images");
const iconDir = path.join(publicDir, "icons");

const svg = (width, height, body) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="fire" x1="0" x2="1" y1="0" y2="1">
      <stop stop-color="#ffb347" offset="0"/>
      <stop stop-color="#ff6b35" offset=".48"/>
      <stop stop-color="#f97316" offset="1"/>
    </linearGradient>
    <radialGradient id="glow" cx="64%" cy="35%" r="62%">
      <stop stop-color="#fb923c" stop-opacity=".48" offset="0"/>
      <stop stop-color="#7c3aed" stop-opacity=".18" offset=".42"/>
      <stop stop-color="#050505" stop-opacity="0" offset="1"/>
    </radialGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="22" stdDeviation="22" flood-color="#000000" flood-opacity=".55"/>
    </filter>
  </defs>
  ${body}
</svg>`;

const hero = svg(1600, 1100, `
  <rect width="1600" height="1100" fill="#050505"/><rect width="1600" height="1100" fill="url(#glow)"/>
  <path d="M0 816 C340 716 558 764 834 690 C1100 618 1298 508 1600 558 L1600 1100 L0 1100 Z" fill="#0d1117"/>
  <path d="M0 894 C330 806 595 858 902 790 C1160 732 1322 650 1600 688 L1600 1100 L0 1100 Z" fill="#111827"/>
  <g opacity=".2" stroke="#ffffff" stroke-width="3"><path d="M180 220 V790 M330 160 V810 M1450 170 V825 M1300 110 V810"/><path d="M90 810 H1510"/></g>
  <g filter="url(#softShadow)">
    <rect x="156" y="188" width="556" height="668" rx="34" fill="#09090b" stroke="#27272a" stroke-width="3"/>
    <rect x="196" y="248" width="476" height="84" rx="20" fill="#18181b"/><rect x="226" y="274" width="268" height="22" rx="11" fill="#fb923c"/>
    <rect x="196" y="376" width="218" height="320" rx="20" fill="#141414" stroke="#2f2f33"/><rect x="450" y="376" width="222" height="320" rx="20" fill="#141414" stroke="#2f2f33"/>
    <circle cx="306" cy="462" r="58" fill="#f97316" opacity=".9"/><path d="M258 568 H374 M258 612 H350 M258 656 H386" stroke="#f4f4f5" stroke-width="18" stroke-linecap="round" opacity=".9"/>
    <path d="M496 458 H626 M496 516 H608 M496 574 H646 M496 632 H594" stroke="#e5e7eb" stroke-width="18" stroke-linecap="round" opacity=".82"/>
  </g>
  <g transform="translate(826 188)" filter="url(#softShadow)">
    <path d="M332 120 C420 126 470 206 452 316 C438 404 494 484 568 526 C632 562 646 678 560 744 C464 818 312 804 220 728 C128 652 90 522 130 414 C162 326 176 266 166 206 C150 118 238 112 332 120Z" fill="#161616"/>
    <circle cx="304" cy="120" r="58" fill="#d9a36d"/><path d="M220 190 C282 250 370 250 430 190 C470 286 492 382 454 488 C420 582 200 580 166 486 C128 378 154 284 220 190Z" fill="#f97316"/>
    <path d="M170 320 L74 468 M442 318 L568 462" stroke="#d9a36d" stroke-width="42" stroke-linecap="round"/><path d="M104 454 H532" stroke="#262626" stroke-width="30" stroke-linecap="round"/>
    <circle cx="78" cy="454" r="64" fill="#111827" stroke="#fb923c" stroke-width="16"/><circle cx="558" cy="454" r="64" fill="#111827" stroke="#fb923c" stroke-width="16"/>
    <path d="M230 566 L178 816 M396 566 L468 816" stroke="#27272a" stroke-width="54" stroke-linecap="round"/><path d="M152 830 H268 M438 830 H548" stroke="#f4f4f5" stroke-width="34" stroke-linecap="round"/>
  </g>
  <g filter="url(#softShadow)">
    <rect x="1114" y="154" width="236" height="116" rx="24" fill="#1f1309" stroke="#fb923c" stroke-opacity=".45" stroke-width="2"/><text x="1146" y="202" fill="#fed7aa" font-family="Arial Black,Arial,sans-serif" font-size="18">TODAY</text><text x="1146" y="244" fill="#fb923c" font-family="Arial Black,Arial,sans-serif" font-size="42">86%</text>
    <rect x="898" y="788" width="250" height="116" rx="24" fill="#09090b" stroke="#fb923c" stroke-opacity=".45" stroke-width="2"/><text x="934" y="836" fill="#a1a1aa" font-family="Arial Black,Arial,sans-serif" font-size="18">STREAK</text><text x="934" y="878" fill="#fb923c" font-family="Arial Black,Arial,sans-serif" font-size="38">21 DAYS</text>
  </g>
`);

const aiWorkout = svg(900, 620, `
  <rect width="900" height="620" fill="#080808"/><rect width="900" height="620" fill="url(#glow)" opacity=".7"/>
  <rect x="78" y="74" width="744" height="472" rx="34" fill="#111111" stroke="#2a2a2d" stroke-width="3"/>
  <text x="124" y="146" fill="#fb923c" font-family="Arial Black,Arial,sans-serif" font-size="36">AI PLAN BUILDER</text>
  <path d="M128 208 H500 M128 260 H396 M128 312 H462" stroke="#f4f4f5" stroke-opacity=".82" stroke-width="24" stroke-linecap="round"/>
  <rect x="558" y="184" width="180" height="236" rx="28" fill="#fb923c" opacity=".95"/><path d="M604 290 H692 M648 246 V334" stroke="#111" stroke-width="24" stroke-linecap="round"/>
  <path d="M128 420 C230 380 318 476 430 430 C538 386 620 448 746 402" fill="none" stroke="#38bdf8" stroke-width="16" stroke-linecap="round"/>
`);

const todoTracker = svg(900, 620, `
  <rect width="900" height="620" fill="#070707"/><rect width="900" height="620" fill="url(#glow)" opacity=".6"/>
  <rect x="94" y="70" width="712" height="480" rx="36" fill="#111111" stroke="#303033" stroke-width="3"/>
  <text x="142" y="142" fill="#ffffff" font-family="Arial Black,Arial,sans-serif" font-size="38">TODAY'S TRACKER</text><text x="142" y="188" fill="#fb923c" font-family="Arial,sans-serif" font-weight="700" font-size="24">Workout, water, meals, recovery</text>
  <g font-family="Arial,sans-serif" font-size="26" fill="#f4f4f5" font-weight="700">
    <rect x="142" y="242" width="616" height="62" rx="16" fill="#18181b"/><circle cx="178" cy="273" r="16" fill="#22c55e"/><path d="M170 272 l7 8 l15 -18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><text x="220" y="283">Push day strength session</text>
    <rect x="142" y="326" width="616" height="62" rx="16" fill="#18181b"/><circle cx="178" cy="357" r="16" fill="#22c55e"/><path d="M170 356 l7 8 l15 -18" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round"/><text x="220" y="367">Protein target completed</text>
    <rect x="142" y="410" width="616" height="62" rx="16" fill="#18181b"/><circle cx="178" cy="441" r="16" fill="#fb923c"/><text x="220" y="451">Mobility before sleep</text>
  </g>
`);

const wallpaperStudio = svg(900, 620, `
  <rect width="900" height="620" fill="#060606"/><rect width="900" height="620" fill="url(#glow)" opacity=".8"/>
  <rect x="108" y="62" width="684" height="496" rx="38" fill="#101010" stroke="#303033" stroke-width="3"/>
  <rect x="174" y="120" width="552" height="326" rx="30" fill="#111827"/><path d="M174 446 C292 330 362 374 438 286 C502 210 604 238 726 132 L726 446Z" fill="url(#fire)"/><circle cx="614" cy="204" r="72" fill="#fde68a" opacity=".84"/>
  <text x="234" y="504" fill="#ffffff" font-family="Arial Black,Arial,sans-serif" font-size="40">FORGE MODE</text><text x="236" y="538" fill="#fb923c" font-family="Arial,sans-serif" font-weight="700" font-size="22">Custom motivational wallpapers</text>
`);

const todoPreview = svg(1200, 820, `
  <rect width="1200" height="820" fill="#050505"/><rect width="1200" height="820" fill="url(#glow)" opacity=".65"/>
  <rect x="108" y="82" width="984" height="656" rx="44" fill="#101010" stroke="#2f2f33" stroke-width="3" filter="url(#softShadow)"/>
  <text x="166" y="164" fill="#ffffff" font-family="Arial Black,Arial,sans-serif" font-size="48">Daily Todo Tracker</text><text x="166" y="210" fill="#a1a1aa" font-family="Arial,sans-serif" font-size="26">GymForge turns your plan into repeatable daily actions.</text>
  <rect x="802" y="122" width="208" height="96" rx="24" fill="#1f1309" stroke="#fb923c" stroke-opacity=".45"/><text x="842" y="158" fill="#fed7aa" font-family="Arial Black,Arial,sans-serif" font-size="16">TODAY</text><text x="842" y="198" fill="#fb923c" font-family="Arial Black,Arial,sans-serif" font-size="42">72%</text>
  <g font-family="Arial,sans-serif" font-size="28" fill="#f4f4f5" font-weight="700">
    <rect x="166" y="286" width="868" height="78" rx="20" fill="#18181b"/><circle cx="214" cy="325" r="20" fill="#22c55e"/><path d="M204 324 l9 10 l20 -24" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><text x="264" y="335">Warm-up and compound lifts</text><text x="842" y="335" fill="#fb923c">Done</text>
    <rect x="166" y="396" width="868" height="78" rx="20" fill="#18181b"/><circle cx="214" cy="435" r="20" fill="#22c55e"/><path d="M204 434 l9 10 l20 -24" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round"/><text x="264" y="445">Log sets, reps, and notes</text><text x="842" y="445" fill="#fb923c">Done</text>
    <rect x="166" y="506" width="868" height="78" rx="20" fill="#18181b"/><circle cx="214" cy="545" r="20" fill="#fb923c"/><text x="264" y="555">Recovery walk and mobility</text><text x="842" y="555" fill="#a1a1aa">Next</text>
  </g>
  <rect x="166" y="638" width="868" height="26" rx="13" fill="#27272a"/><rect x="166" y="638" width="625" height="26" rx="13" fill="url(#fire)"/>
`);

const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="10" x2="54" y1="8" y2="58" gradientUnits="userSpaceOnUse"><stop stop-color="#ffb347"/><stop offset=".48" stop-color="#ff6b35"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#080808"/><path d="M18 38h-6v-12h6v-8h8v28h-8v-8Zm28 0h6v-12h-6v-8h-8v28h8v-8ZM26 28h12v8H26z" fill="url(#g)"/><path d="M20 14h24" stroke="#fff7ed" stroke-width="4" stroke-linecap="round" opacity=".88"/></svg>`;
const iconSvg = () => faviconSvg;

await fs.mkdir(imageDir, { recursive: true });
await fs.mkdir(iconDir, { recursive: true });

for (const [file, source, quality] of [
  ["hero-gymforge-forge.webp", hero, 88],
  ["feature-ai-workout.webp", aiWorkout, 88],
  ["feature-todo-tracker.webp", todoTracker, 88],
  ["feature-wallpapers.webp", wallpaperStudio, 88],
  ["todo-tracker-showcase.webp", todoPreview, 90]
]) {
  await sharp(Buffer.from(source)).webp({ quality }).toFile(path.join(imageDir, file));
}

await fs.writeFile(path.join(publicDir, "favicon.svg"), faviconSvg, "utf8");

for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
  await sharp(Buffer.from(iconSvg())).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(iconDir, `icon-${size}.png`));
}

await sharp(Buffer.from(iconSvg())).resize(180, 180).png({ compressionLevel: 9 }).toFile(path.join(publicDir, "apple-touch-icon.png"));
await sharp(Buffer.from(iconSvg())).resize(192, 192).png({ compressionLevel: 9 }).toFile(path.join(publicDir, "icon-192.png"));
await sharp(Buffer.from(iconSvg())).resize(512, 512).png({ compressionLevel: 9 }).toFile(path.join(publicDir, "icon-512.png"));

console.log("Generated GymForge landing images and app icons.");
