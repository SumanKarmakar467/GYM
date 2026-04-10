const toDataSvgUrl = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const animatedCardSvg = ({ title, subtitle, colorA, colorB, glyph }) => toDataSvgUrl(`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colorA}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${colorB}" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${colorA}"/>
      <stop offset="100%" stop-color="${colorB}"/>
    </linearGradient>
  </defs>
  <rect width="640" height="360" fill="#07161f"/>
  <rect x="12" y="12" width="616" height="336" rx="24" fill="url(#bg)" stroke="${colorA}" stroke-opacity="0.35"/>
  <g opacity="0.72">
    <circle cx="80" cy="80" r="22" fill="${colorA}">
      <animate attributeName="r" values="20;28;20" dur="2.2s" repeatCount="indefinite"/>
    </circle>
    <circle cx="565" cy="280" r="24" fill="${colorB}">
      <animate attributeName="r" values="24;30;24" dur="2.8s" repeatCount="indefinite"/>
    </circle>
  </g>
  <g>
    <text x="44" y="120" fill="#c8f7ff" font-size="42" font-family="Montserrat, Arial, sans-serif" font-weight="700">${title}</text>
    <text x="44" y="160" fill="#95b8c2" font-size="24" font-family="Inter, Arial, sans-serif">${subtitle}</text>
  </g>
  <g transform="translate(430 186)" fill="none" stroke="url(#line)" stroke-width="10" stroke-linecap="round">
    <path d="M-120 0 L110 0"/>
    <path d="M-142 -22 L-124 -22 L-124 22 L-142 22 Z"/>
    <path d="M-166 -30 L-146 -30 L-146 30 L-166 30 Z"/>
    <path d="M112 -22 L130 -22 L130 22 L112 22 Z"/>
    <path d="M132 -30 L152 -30 L152 30 L132 30 Z"/>
    <animateTransform attributeName="transform" type="translate" values="430 186;430 174;430 186" dur="1.7s" repeatCount="indefinite"/>
  </g>
  <text x="44" y="304" fill="#dcffef" font-size="58" font-family="JetBrains Mono, monospace">${glyph}</text>
</svg>`);

const onboardingMedia = {
  inputs: [
    {
      key: "metrics",
      title: "Input Metrics",
      subtitle: "Age, weight, height with live conversion",
      imageUrl: animatedCardSvg({
        title: "Smart Inputs",
        subtitle: "Track your exact body metrics",
        colorA: "#00E5FF",
        colorB: "#39FF14",
        glyph: "01"
      })
    },
    {
      key: "gender",
      title: "Profile Setup",
      subtitle: "Gender and baseline profile calibration",
      imageUrl: animatedCardSvg({
        title: "Body Profile",
        subtitle: "Choose identity for better plan tuning",
        colorA: "#39FF14",
        colorB: "#00E5FF",
        glyph: "02"
      })
    }
  ],
  goals: {
    bodybuilder: animatedCardSvg({
      title: "Bodybuilder",
      subtitle: "Hypertrophy and shape",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "BB"
    }),
    calisthenics: animatedCardSvg({
      title: "Calisthenics",
      subtitle: "Control and bodyweight skill",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "CL"
    }),
    powerlifter: animatedCardSvg({
      title: "Powerlifter",
      subtitle: "Heavy compound progression",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "PL"
    }),
    crossfit: animatedCardSvg({
      title: "CrossFit",
      subtitle: "Strength + conditioning",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "CF"
    }),
    athlete: animatedCardSvg({
      title: "Athlete",
      subtitle: "Explosive all-around fitness",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "AT"
    })
  },
  environments: {
    gym: animatedCardSvg({
      title: "Gym Setup",
      subtitle: "Barbells, machines, cables, dumbbells",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "GYM"
    }),
    home: animatedCardSvg({
      title: "Home Setup",
      subtitle: "Bodyweight, bands, compact gear",
      colorA: "#39FF14",
      colorB: "#00E5FF",
      glyph: "HOME"
    })
  }
};

const videoSources = [
  "https://samplelib.com/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/preview/mp4/sample-10s.mp4",
  "https://samplelib.com/preview/mp4/sample-15s.mp4",
  "https://samplelib.com/preview/mp4/sample-20s.mp4"
];

const workoutDemos = {
  lower_body: {
    title: "Lower Body Demo Loop",
    videoUrl: videoSources[0],
    posterImageUrl: animatedCardSvg({
      title: "Lower Body",
      subtitle: "Control depth and drive",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "LB"
    })
  },
  hinge: {
    title: "Hip Hinge Demo Loop",
    videoUrl: videoSources[1],
    posterImageUrl: animatedCardSvg({
      title: "Hip Hinge",
      subtitle: "Neutral spine and glute drive",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "HG"
    })
  },
  push: {
    title: "Push Pattern Demo Loop",
    videoUrl: videoSources[2],
    posterImageUrl: animatedCardSvg({
      title: "Push Mechanics",
      subtitle: "Press with shoulder control",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "PS"
    })
  },
  pull: {
    title: "Pull Pattern Demo Loop",
    videoUrl: videoSources[3],
    posterImageUrl: animatedCardSvg({
      title: "Pull Mechanics",
      subtitle: "Lead with elbows and lats",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "PL"
    })
  },
  shoulder: {
    title: "Shoulder Stability Demo Loop",
    videoUrl: videoSources[0],
    posterImageUrl: animatedCardSvg({
      title: "Shoulders",
      subtitle: "Stable overhead positioning",
      colorA: "#39FF14",
      colorB: "#00E5FF",
      glyph: "SH"
    })
  },
  arms: {
    title: "Arm Isolation Demo Loop",
    videoUrl: videoSources[1],
    posterImageUrl: animatedCardSvg({
      title: "Arm Isolation",
      subtitle: "Controlled elbow movement",
      colorA: "#39FF14",
      colorB: "#00E5FF",
      glyph: "AR"
    })
  },
  core: {
    title: "Core Tension Demo Loop",
    videoUrl: videoSources[2],
    posterImageUrl: animatedCardSvg({
      title: "Core Control",
      subtitle: "Brace and breathe rhythmically",
      colorA: "#39FF14",
      colorB: "#00E5FF",
      glyph: "CR"
    })
  },
  cardio: {
    title: "Cardio Flow Demo Loop",
    videoUrl: videoSources[3],
    posterImageUrl: animatedCardSvg({
      title: "Conditioning",
      subtitle: "Pace and form consistency",
      colorA: "#39FF14",
      colorB: "#00E5FF",
      glyph: "CD"
    })
  },
  general: {
    title: "General Exercise Demo Loop",
    videoUrl: videoSources[0],
    posterImageUrl: animatedCardSvg({
      title: "Workout Demo",
      subtitle: "Form and tempo reference",
      colorA: "#00E5FF",
      colorB: "#39FF14",
      glyph: "GF"
    })
  }
};

export const getOnboardingMedia = (req, res) => {
  return res.json(onboardingMedia);
};

export const getWorkoutDemos = (req, res) => {
  return res.json({ demos: workoutDemos });
};
