/**
 * توکن‌های جاوااسکریپت، Three.js و پیش‌تنظیم Tailwind برای دیزاین سیستم ناوگان
 */

export const DESIGN_TOKENS = {
  color: {
    signalOrange: '#FF742E',
    deepNavy: '#102333',
    warmSand: '#E8DECD',
    orange: {
      100: '#FFE4D4',
      200: '#FFC5A6',
      300: '#FFB085',
      400: '#FF8B4D',
      500: '#FF742E',
      600: '#E05612',
      700: '#B84309',
      800: '#9E3805',
    },
    navy: {
      50: '#58768B',
      100: '#3D5768',
      200: '#2D4658',
      300: '#213D4F',
      400: '#132D3F',
      500: '#112835',
      600: '#102333',
      700: '#0B1926',
      800: '#08141F',
      900: '#060E16',
      950: '#050B12',
    },
    sand: {
      50: '#F7F5F0',
      100: '#F6EFE4',
      200: '#EDE4D5',
      300: '#E8DECD',
      400: '#DFD2BC',
      500: '#C8B89E',
    },
    telemetry: {
      moving: '#4ADE80',
      signal: '#FF742E',
      corridor: '#38BDF8',
      coldChain: '#22D3EE',
      idle: '#FACC15',
      critical: '#EF4444',
    },
  },
  gradients: {
    clearcoatHorizon:
      'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
    signalFlare:
      'linear-gradient(155deg, #FF8B4D 0%, #FF742E 52%, #E05612 100%)',
    daylightSand:
      'linear-gradient(180deg, #EDE4D5 0%, #E8DECD 55%, #DFD2BC 100%)',
    cushionLight:
      'linear-gradient(145deg, #F6EFE4 0%, #E6DAC6 100%)',
  },
  geometry: {
    strokeModuleS: 23.145,
    logotypeUnitU: 23.86,
    capRadius: 11.57,
    goldenFillet: 14.54,
    squirclePercent: '31.25%',
    zeroCounterPercent: '43.4%',
    goldenSplitPercent: 38.06,
    kafShearDeg: -26.84,
    radarApertureDeg: 30.6,
    pinBladeDeg: 136.54,
    clothoidCurvature: 0.5,
    nuqtaGridPx: 24,
  },
  material3d: {
    pbr: {
      roughness: 0.4,
      metalness: 0.08,
      clearcoat: 0.35,
      clearcoatRoughness: 0.28,
      ambientIntensity: 0.5,
    },
    modeACushion: {
      inflatePercent: 76,
      bevelWidthPercent: 50,
      elevationDeg: 71,
      azimuthDeg: -124.7,
    },
    modeBChisel: {
      extrudePt: 175.5,
      bevelWidthPercent: 60,
      elevationDeg: 43.08,
      azimuthDeg: -149.74,
    },
  },
  motion: {
    springLock: 'cubic-bezier(0.34, 1.45, 0.64, 1)',
    clothoidCruise: 'cubic-bezier(0.65, 0, 0.35, 1)',
    shockwaveOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    tiltFollow: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },
};

export const tailwindFleetPreset = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Peyda', 'Tahoma', 'sans-serif'],
      },
      colors: {
        signal: DESIGN_TOKENS.color.orange,
        navy: DESIGN_TOKENS.color.navy,
        sand: DESIGN_TOKENS.color.sand,
        telemetry: DESIGN_TOKENS.color.telemetry,
      },
      borderRadius: {
        nuqta: '3px',
        plate: '7px',
        cap: '12px',
        fillet: '15px',
        squircle: '31.25%',
      },
      skew: {
        kaf: '-26.84deg',
      },
      backgroundImage: {
        clearcoat: DESIGN_TOKENS.gradients.clearcoatHorizon,
        'signal-flare': DESIGN_TOKENS.gradients.signalFlare,
        'daylight-sand': DESIGN_TOKENS.gradients.daylightSand,
      },
    },
  },
};

export default DESIGN_TOKENS;
