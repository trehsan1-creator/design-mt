import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { DESIGN_TOKENS } from '../../tokens/tokens.js';

/**
 * راه‌اندازی نقشه بازتاب محیطی (PMREM + RoomEnvironment) برای نمایش واقعی Clearcoat
 */
export function setupClearcoatEnvironment(renderer, scene) {
  const gl = renderer.getContext();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const rendererName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
  const isSoftwareOrMobile = /SwiftShader|llvmpipe|Software/i.test(rendererName) || window.innerWidth <= 768;

  if (isSoftwareOrMobile) {
    // نقشه بازتاب استودیویی سبک ۶۴×۳۲ برای موبایل و رندررهای نرم‌افزاری بدون توقف نخ اصلی
    const w = 64;
    const h = 32;
    const data = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) {
      const v = 1 - y / (h - 1);
      const sky = Math.pow(Math.max(0, v), 1.4);
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1);
        const keySpot = Math.exp(-Math.pow((u - 0.28) * 5, 2) - Math.pow((v - 0.72) * 5, 2));
        const warmRim = Math.exp(-Math.pow((u - 0.78) * 6, 2) - Math.pow((v - 0.35) * 5, 2));
        const idx = (y * w + x) * 4;
        data[idx] = Math.min(255, Math.round(18 + sky * 150 + keySpot * 85 + warmRim * 95));
        data[idx + 1] = Math.min(255, Math.round(34 + sky * 165 + keySpot * 80 + warmRim * 42));
        data[idx + 2] = Math.min(255, Math.round(52 + sky * 185 + keySpot * 75 + warmRim * 16));
        data[idx + 3] = 255;
      }
    }
    const envTex = new THREE.DataTexture(data, w, h, THREE.RGBAFormat);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    envTex.colorSpace = THREE.SRGBColorSpace;
    envTex.needsUpdate = true;
    scene.environment = envTex;
    return envTex;
  }

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envRT = pmremGenerator.fromScene(roomEnv, 0.04);
  scene.environment = envRT.texture;
  roomEnv.dispose();
  pmremGenerator.dispose();
  return envRT;
}

/**
 * ساخت متریال فیزیکی استاندارد سامانه طراحی از روی DESIGN_TOKENS.material3d.pbr
 */
export function createClearcoatMaterial(options = {}) {
  const pbr = DESIGN_TOKENS.material3d.pbr;
  return new THREE.MeshPhysicalMaterial({
    roughness: pbr.roughness,
    metalness: pbr.metalness,
    clearcoat: pbr.clearcoat,
    clearcoatRoughness: pbr.clearcoatRoughness,
    envMapIntensity: 0.95,
    ...options,
  });
}

/**
 * تولید نقشه ارتفاع و نرمال بالشتکی (Inflate 76%) از مسیر برداری نشان برند
 * برای بازسازی گنبد پیوسته مطابق فایل مرجع 3d_front.webp
 */
export function createInflateCushionMaps(svgPathD, viewW = 234.21, viewH = 324.76) {
  const w = 256;
  const h = Math.round((w * viewH) / viewW);

  const maskCanvas = document.createElement('canvas');
  maskCanvas.width = w;
  maskCanvas.height = h;
  const mCtx = maskCanvas.getContext('2d');

  // 1. Render crisp silhouette
  mCtx.clearRect(0, 0, w, h);
  mCtx.save();
  mCtx.scale(w / viewW, h / viewH);
  const path2d = new Path2D(svgPathD);
  mCtx.fillStyle = DESIGN_TOKENS.color.neutral.white;
  mCtx.fill(path2d);
  mCtx.restore();

  const hardImg = mCtx.getImageData(0, 0, w, h).data;

  // 2. Multi-scale Gaussian blur pyramid to approximate smooth signed-distance dome (Inflate 76%)
  const blurRadii = [3, 7, 14, 24];
  const weights = [0.22, 0.28, 0.28, 0.22];
  const accum = new Float32Array(w * h);

  const tmpCanvas = document.createElement('canvas');
  tmpCanvas.width = w;
  tmpCanvas.height = h;
  const tCtx = tmpCanvas.getContext('2d');

  blurRadii.forEach((rad, idx) => {
    tCtx.clearRect(0, 0, w, h);
    tCtx.filter = `blur(${rad}px)`;
    tCtx.drawImage(maskCanvas, 0, 0);
    const bData = tCtx.getImageData(0, 0, w, h).data;
    const wgt = weights[idx];
    for (let i = 0; i < w * h; i++) {
      accum[i] += (bData[i * 4 + 3] / 255) * wgt;
    }
  });

  // Apply sinusoidal cushion dome curve (Inflate 76% exponent) inside silhouette
  const heightField = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const inside = hardImg[i * 4 + 3] / 255;
    const raw = Math.min(1, accum[i] * 1.18);
    const dome = Math.pow(Math.sin((raw * Math.PI) / 2), 0.76);
    heightField[i] = dome * inside;
  }

  // 3. Convert heightField to Tangent-Space Normal Map + Bump Map
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = w;
  normalCanvas.height = h;
  const nCtx = normalCanvas.getContext('2d');
  const nImg = nCtx.createImageData(w, h);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = w;
  bumpCanvas.height = h;
  const bCtx = bumpCanvas.getContext('2d');
  const bImg = bCtx.createImageData(w, h);

  const strength = 5.2;
  const sampleH = (x, y) => {
    const cx = Math.max(0, Math.min(w - 1, x));
    const cy = Math.max(0, Math.min(h - 1, y));
    return heightField[cy * w + cx];
  };

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const dhdx = (sampleH(x + 1, y) - sampleH(x - 1, y)) * strength;
      const dhdy = (sampleH(x, y + 1) - sampleH(x, y - 1)) * strength;

      // Note: mesh is flipped Y (scale(1, -1, 1)), invert Y derivative for upward pillow light
      let nx = -dhdx;
      let ny = dhdy;
      let nz = 1.0;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len;
      ny /= len;
      nz /= len;

      const p = idx * 4;
      nImg.data[p] = Math.round((nx * 0.5 + 0.5) * 255);
      nImg.data[p + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      nImg.data[p + 2] = Math.round((nz * 0.5 + 0.5) * 255);
      nImg.data[p + 3] = 255;

      const hv = Math.round(heightField[idx] * 255);
      bImg.data[p] = hv;
      bImg.data[p + 1] = hv;
      bImg.data[p + 2] = hv;
      bImg.data[p + 3] = 255;
    }
  }

  nCtx.putImageData(nImg, 0, 0);
  bCtx.putImageData(bImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  normalMap.wrapS = THREE.ClampToEdgeWrapping;
  normalMap.wrapT = THREE.ClampToEdgeWrapping;
  normalMap.needsUpdate = true;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.ClampToEdgeWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.needsUpdate = true;

  // Helper to displace geometry Z along cushion heightField
  const applyDomeToGeometry = (geometry, domeHeight = 22) => {
    geometry.computeBoundingBox();
    const bb = geometry.boundingBox;
    const spanX = bb.max.x - bb.min.x || 1;
    const spanY = bb.max.y - bb.min.y || 1;

    const pos = geometry.attributes.position;
    const uv = geometry.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vy = pos.getY(i);
      const vz = pos.getZ(i);
      const u = (vx - bb.min.x) / spanX;
      const v = (vy - bb.min.y) / spanY;
      if (uv) {
        uv.setXY(i, u, 1 - v);
      }
      const px = Math.round(u * (w - 1));
      const py = Math.round(v * (h - 1));
      const domeVal = sampleH(px, py);
      if (vz > 0) {
        pos.setZ(i, vz + domeVal * domeHeight);
      } else {
        pos.setZ(i, vz - domeVal * domeHeight * 0.35);
      }
    }
    pos.needsUpdate = true;
    if (uv) uv.needsUpdate = true;
    geometry.computeVertexNormals();
  };

  return { normalMap, bumpMap, applyDomeToGeometry };
}
