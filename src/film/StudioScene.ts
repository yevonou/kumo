import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  CLONER_COLS,
  CLONER_ROWS,
  CLONER_COUNT,
  evaluateClonerElement,
  evaluateHeroLetters,
  evaluateJellyCore,
  evaluateCamera,
  seededRandom,
} from './choreography';

/**
 * Generates a tileable micro-grain bump texture for Octane-style velvety SSS gummy & frosted glass
 */
function createMicroGrainBumpTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const n1 = seededRandom(x * 37 + y * 131);
      const n2 = seededRandom((x >> 1) * 73 + (y >> 1) * 197);
      const v = Math.floor((n1 * 0.6 + n2 * 0.4) * 255);
      data[idx] = v;
      data[idx + 1] = v;
      data[idx + 2] = v;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.needsUpdate = true;
  return tex;
}

/**
 * Generates a soft radial contact shadow texture for grounding every cloner pill & hero glyph
 */
function createSoftContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 2, size / 2, size / 2, size / 2);
  grad.addColorStop(0.0, 'rgba(68, 32, 56, 0.56)');
  grad.addColorStop(0.38, 'rgba(84, 42, 70, 0.30)');
  grad.addColorStop(0.72, 'rgba(108, 62, 92, 0.08)');
  grad.addColorStop(1.0, 'rgba(108, 62, 92, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Builds a custom C4D/Octane Pastel Studio Softbox Environment Texture
 * calibrated so highlights are glossy and dimensional without blowing out pastels.
 */
function createStudioSoftboxEnvMap(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  pmremGenerator.compileEquirectangularShader();

  const envScene = new RoomEnvironment();

  // Warm overhead Octane softbox panel (calibrated intensity)
  const topBox = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 9),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.85, 1.72, 1.62), side: THREE.DoubleSide })
  );
  topBox.position.set(0, 9.5, 1.5);
  topBox.rotation.x = Math.PI / 2;
  envScene.add(topBox);

  // Left Candy Peach fill softbox
  const leftBox = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.55, 1.05, 1.18), side: THREE.DoubleSide })
  );
  leftBox.position.set(-9.5, 4.0, 2.0);
  leftBox.lookAt(0, 1, 0);
  envScene.add(leftBox);

  // Right Cool Lilac/Periwinkle rim softbox
  const rightBox = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 6),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(1.15, 1.08, 1.65), side: THREE.DoubleSide })
  );
  rightBox.position.set(9.5, 4.5, -1.5);
  rightBox.lookAt(0, 1, 0);
  envScene.add(rightBox);

  const envTexture = pmremGenerator.fromScene(envScene, 0.04).texture;
  pmremGenerator.dispose();
  return envTexture;
}

/**
 * Enhances a MeshPhysicalMaterial with energy-conserving Octane Subsurface Scattering (SSS),
 * translucent internal candy glow, and warm studio floor Ambient Occlusion.
 */
function injectOctaneSSSShader(
  material: THREE.MeshPhysicalMaterial,
  sssColorHex: number,
  sssStrength = 0.55,
  deformable = false
) {
  const sssColor = new THREE.Color(sssColorHex);
  material.userData.uSssStrength = { value: sssStrength };
  material.userData.uBottomFlatten = { value: 0.0 };
  material.userData.uJigglePhase = { value: 0.0 };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSssColor = { value: sssColor };
    shader.uniforms.uSssStrength = material.userData.uSssStrength;
    shader.uniforms.uBottomFlatten = material.userData.uBottomFlatten;
    shader.uniforms.uJigglePhase = material.userData.uJigglePhase;

    shader.vertexShader =
      `
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      uniform float uBottomFlatten;
      uniform float uJigglePhase;
      ` + shader.vertexShader;

    if (deformable) {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vLocalPos = position;
        if (uBottomFlatten > 0.001) {
          float bottomMask = 1.0 - smoothstep(-0.95, 0.15, transformed.y);
          transformed.y += bottomMask * uBottomFlatten * 0.42;
          float bulge = sin(clamp((transformed.y + 0.9) * 2.2, 0.0, 3.14159)) * uBottomFlatten * 0.26;
          transformed.x *= (1.0 + bulge);
          transformed.z *= (1.0 + bulge);
        }
        float microRipple = sin(transformed.y * 4.5 - uJigglePhase) * 0.016 * uBottomFlatten;
        transformed.x += microRipple;
        `
      );
    } else {
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `
        #include <begin_vertex>
        vLocalPos = position;
        `
      );
    }

    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `
      #include <worldpos_vertex>
      vWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      `
    );

    shader.fragmentShader =
      `
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      uniform vec3 uSssColor;
      uniform float uSssStrength;
      ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <OPAQUE_FRAGMENT>',
      `
      // Energy-conserving Octane Subsurface Scattering (SSS) + Studio Cavity AO
      vec3 viewVec = normalize(cameraPosition - vWorldPos);
      vec3 keyDir = normalize(vec3(4.5, 9.0, 5.5));
      vec3 nDir = normalize(vNormal);

      float wrapKey = max(0.0, (dot(nDir, keyDir) + 0.55) / 1.55);
      float backScatter = pow(clamp(dot(-viewVec, keyDir + nDir * 0.4), 0.0, 1.0), 2.2);
      float rimScatter = pow(1.0 - abs(dot(viewVec, nDir)), 2.5);

      vec3 sssGlow = uSssColor * clamp(uSssStrength, 0.0, 1.0) * (
        wrapKey * 0.16 +
        backScatter * 0.34 +
        rimScatter * 0.24
      );
      // Soft-knee blend so highlights stay creamy pastel and never clip to flat white
      outgoingLight = mix(outgoingLight, outgoingLight + sssGlow, 0.65);

      // Warm studio floor & lower-bevel cavity Ambient Occlusion
      float floorAO = smoothstep(-0.72, 0.55, vWorldPos.y);
      float localBottomAO = smoothstep(-0.85, 0.35, vLocalPos.y);
      vec3 aoTint = mix(vec3(0.72, 0.52, 0.64), vec3(1.0), floorAO * 0.7 + localBottomAO * 0.3);
      outgoingLight *= aoTint;

      #include <OPAQUE_FRAGMENT>
      `
    );
  };
}

/**
 * Helper to build a constant-width rounded-cap polygon from a smooth centerline polyline
 */
function buildThickRibbonShape(centerPts: THREE.Vector2[], halfWidth: number): THREE.Shape {
  const curve = new THREE.CatmullRomCurve3(
    centerPts.map((p) => new THREE.Vector3(p.x, p.y, 0)),
    false,
    'centripetal',
    0.5
  );
  const samples = 64;
  const leftPts: THREE.Vector2[] = [];
  const rightPts: THREE.Vector2[] = [];

  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const pt = curve.getPoint(u);
    const tan = curve.getTangent(u).normalize();
    const nx = -tan.y;
    const ny = tan.x;
    leftPts.push(new THREE.Vector2(pt.x + nx * halfWidth, pt.y + ny * halfWidth));
    rightPts.push(new THREE.Vector2(pt.x - nx * halfWidth, pt.y - ny * halfWidth));
  }

  const shape = new THREE.Shape();
  shape.moveTo(leftPts[0].x, leftPts[0].y);
  for (let i = 1; i < leftPts.length; i++) {
    shape.lineTo(leftPts[i].x, leftPts[i].y);
  }

  // Semicircular end cap at end of centerline
  const endCenter = curve.getPoint(1);
  const endTan = curve.getTangent(1).normalize();
  const endBaseAngle = Math.atan2(endTan.y, endTan.x) + Math.PI / 2;
  const capSteps = 14;
  for (let c = 1; c <= capSteps; c++) {
    const a = endBaseAngle - (c / capSteps) * Math.PI;
    shape.lineTo(
      endCenter.x + Math.cos(a) * halfWidth,
      endCenter.y + Math.sin(a) * halfWidth
    );
  }

  for (let i = rightPts.length - 2; i >= 0; i--) {
    shape.lineTo(rightPts[i].x, rightPts[i].y);
  }

  // Semicircular start cap at start of centerline
  const startCenter = curve.getPoint(0);
  const startTan = curve.getTangent(0).normalize();
  const startBaseAngle = Math.atan2(startTan.y, startTan.x) - Math.PI / 2;
  for (let c = 1; c <= capSteps; c++) {
    const a = startBaseAngle - (c / capSteps) * Math.PI;
    shape.lineTo(
      startCenter.x + Math.cos(a) * halfWidth,
      startCenter.y + Math.sin(a) * halfWidth
    );
  }

  return shape;
}

/**
 * Creates a rounded bevelled 3D letter geometry ('S', 'O', 'F', 'T') with plump C4D inflate bevels
 */
function createPlumpLetterGeometry(char: 'S' | 'O' | 'F' | 'T'): THREE.BufferGeometry {
  let shape = new THREE.Shape();

  if (char === 'O') {
    const outerPts: THREE.Vector2[] = [];
    const innerPts: THREE.Vector2[] = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      outerPts.push(new THREE.Vector2(Math.cos(a) * 0.54, Math.sin(a) * 0.68));
      innerPts.push(new THREE.Vector2(Math.cos(a) * 0.21, Math.sin(a) * 0.33));
    }
    shape.setFromPoints(outerPts);
    const hole = new THREE.Path(innerPts);
    shape.holes.push(hole);
  } else if (char === 'T') {
    const w = 0.52;
    const h = 0.68;
    const stem = 0.185;
    const barY = 0.33;
    const r = 0.08;
    shape.moveTo(-w + r, h);
    shape.lineTo(w - r, h);
    shape.quadraticCurveTo(w, h, w, h - r);
    shape.lineTo(w, barY + r);
    shape.quadraticCurveTo(w, barY, w - r, barY);
    shape.lineTo(stem + r, barY);
    shape.quadraticCurveTo(stem, barY, stem, barY - r);
    shape.lineTo(stem, -h + r);
    shape.quadraticCurveTo(stem, -h, stem - r, -h);
    shape.lineTo(-stem + r, -h);
    shape.quadraticCurveTo(-stem, -h, -stem, -h + r);
    shape.lineTo(-stem, barY - r);
    shape.quadraticCurveTo(-stem, barY, -stem - r, barY);
    shape.lineTo(-w + r, barY);
    shape.quadraticCurveTo(-w, barY, -w, barY + r);
    shape.lineTo(-w, h - r);
    shape.quadraticCurveTo(-w, h, -w + r, h);
  } else if (char === 'F') {
    const left = -0.45;
    const rightTop = 0.46;
    const rightMid = 0.32;
    const top = 0.68;
    const bot = -0.68;
    const stemR = -0.08;
    const r = 0.07;
    shape.moveTo(left + r, top);
    shape.lineTo(rightTop - r, top);
    shape.quadraticCurveTo(rightTop, top, rightTop, top - r);
    shape.lineTo(rightTop, 0.34 + r);
    shape.quadraticCurveTo(rightTop, 0.34, rightTop - r, 0.34);
    shape.lineTo(stemR + r, 0.34);
    shape.quadraticCurveTo(stemR, 0.34, stemR, 0.34 - r);
    shape.lineTo(stemR, 0.09 + r);
    shape.quadraticCurveTo(stemR, 0.09, stemR + r, 0.09);
    shape.lineTo(rightMid - r, 0.09);
    shape.quadraticCurveTo(rightMid, 0.09, rightMid, 0.09 - r);
    shape.lineTo(rightMid, -0.22 + r);
    shape.quadraticCurveTo(rightMid, -0.22, rightMid - r, -0.22);
    shape.lineTo(stemR + r, -0.22);
    shape.quadraticCurveTo(stemR, -0.22, stemR, -0.22 - r);
    shape.lineTo(stemR, bot + r);
    shape.quadraticCurveTo(stemR, bot, stemR - r, bot);
    shape.lineTo(left + r, bot);
    shape.quadraticCurveTo(left, bot, left, bot + r);
    shape.lineTo(left, top - r);
    shape.quadraticCurveTo(left, top, left + r, top);
  } else {
    // 'S' — Precision constant-width rounded-cap ribbon along a harmonic S centerline
    const sPts = [
      new THREE.Vector2(0.28, 0.36),
      new THREE.Vector2(0.14, 0.50),
      new THREE.Vector2(-0.08, 0.52),
      new THREE.Vector2(-0.28, 0.42),
      new THREE.Vector2(-0.31, 0.22),
      new THREE.Vector2(-0.14, 0.07),
      new THREE.Vector2(0.14, -0.07),
      new THREE.Vector2(0.31, -0.22),
      new THREE.Vector2(0.28, -0.42),
      new THREE.Vector2(0.08, -0.52),
      new THREE.Vector2(-0.14, -0.50),
      new THREE.Vector2(-0.29, -0.36),
    ];
    shape = buildThickRibbonShape(sPts, 0.165);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.30,
    bevelEnabled: true,
    bevelThickness: 0.24,
    bevelSize: 0.15,
    bevelOffset: -0.02,
    bevelSegments: 16,
    curveSegments: 36,
  });
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/**
 * Post-Processing Shader for:
 * 1. Golden-Angle Spiral Bokeh Depth of Field (f/1.8) with bilateral depth guard (no dark halos!)
 * 2. Directional Camera & Object Shutter Motion Blur
 * 3. Soft Pastel Specular Bloom
 * 4. Anti-Banding Triangular Dither
 */
const POST_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const POST_FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D tColor;
  uniform sampler2D tDepth;
  uniform vec2 uResolution;
  uniform float uNear;
  uniform float uFar;
  uniform float uFocusDistance;
  uniform float uAperture;
  uniform vec2 uMotionBlurVec;
  uniform float uTime;
  uniform float uDofEnabled;

  float linearizeDepth(float d) {
    float z_n = 2.0 * d - 1.0;
    return (2.0 * uNear * uFar) / (uFar + uNear - z_n * (uFar - uNear));
  }

  float computeCoC(float viewZ) {
    float focalGap = abs(viewZ - uFocusDistance);
    float deadZone = 1.55;
    return clamp((max(0.0, focalGap - deadZone) / max(1.8, viewZ)) * uAperture * 1.9, 0.0, 1.0) * uDofEnabled;
  }

  float interleavedGradientNoise(vec2 uv) {
    vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
    return fract(magic.z * fract(dot(uv, magic.xy)));
  }

  void main() {
    vec2 texel = 1.0 / uResolution;
    float centerDepth = texture2D(tDepth, vUv).r;
    float centerViewZ = linearizeDepth(centerDepth);
    float centerCoC = computeCoC(centerViewZ);

    vec3 centerCol = texture2D(tColor, vUv).rgb;
    vec3 accum = centerCol;
    float totalWeight = 1.0;

    const int SAMPLES = 16;
    float goldenAngle = 2.39996323;
    float maxBlurPx = mix(0.4, 9.5, centerCoC);

    for (int i = 0; i < SAMPLES; i++) {
      float fi = float(i);
      float r = sqrt((fi + 0.5) / float(SAMPLES));
      float theta = fi * goldenAngle;
      vec2 diskOffset = vec2(cos(theta), sin(theta)) * r * maxBlurPx * texel;

      float mbPhase = (fi / float(SAMPLES - 1)) - 0.5;
      vec2 mbOffset = uMotionBlurVec * mbPhase;

      vec2 sampleUv = clamp(vUv + diskOffset + mbOffset, vec2(0.001), vec2(0.999));
      float sampleViewZ = linearizeDepth(texture2D(tDepth, sampleUv).r);
      float sampleCoC = computeCoC(sampleViewZ);

      // Bilateral depth guard prevents sharp in-focus hero letters from bleeding onto background or vice-versa
      float weight = 1.0;
      if (sampleViewZ < centerViewZ - 0.4) {
        // Foreground bokeh overlapping in-focus background
        weight = max(0.15, sampleCoC);
      } else {
        weight = mix(1.0, sampleCoC, smoothstep(0.0, 0.5, abs(sampleViewZ - centerViewZ)));
      }

      vec3 col = texture2D(tColor, sampleUv).rgb;
      accum += col * weight;
      totalWeight += weight;
    }

    vec3 finalColor = accum / max(0.001, totalWeight);

    // Subtle studio medium-format lens vignette
    vec2 centered = vUv - 0.5;
    float vig = 1.0 - dot(centered, centered) * 0.16;
    finalColor *= vig;

    // Anti-banding triangular dither
    float n1 = interleavedGradientNoise(gl_FragCoord.xy + fract(uTime) * 100.0);
    float n2 = interleavedGradientNoise(gl_FragCoord.yx + 17.0 + fract(uTime) * 100.0);
    float triDither = (n1 + n2 - 1.0) / 255.0 * 1.4;
    finalColor += vec3(triDither);

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), 1.0);
  }
`;

export interface StudioSceneController {
  renderAtTime: (t: number, options?: { dof?: boolean; motionBlur?: boolean }) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
  getCanvas: () => HTMLCanvasElement;
  isSoftwareGl: boolean;
}

export function createStudioScene(
  mountEl: HTMLElement,
  initialWidth = 1920,
  initialHeight = 1080
): StudioSceneController {
  const isSoftwareGl = (() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
    alpha: false,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.94;
  renderer.setPixelRatio(1);
  renderer.setSize(initialWidth, initialHeight, false);
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  mountEl.innerHTML = '';
  mountEl.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf5e6ee);
  scene.fog = new THREE.FogExp2(0xf5e6ee, 0.024);

  const envMap = createStudioSoftboxEnvMap(renderer);
  scene.environment = envMap;
  scene.environmentIntensity = 0.72;

  const camera = new THREE.PerspectiveCamera(35, initialWidth / initialHeight, 0.5, 42);

  // Calibrated 3-Point Pastel Studio Lighting Rig (zero highlight clipping)
  const hemiLight = new THREE.HemisphereLight(0xfff0f5, 0xd8c6ec, 0.78);
  hemiLight.position.set(0, 15, 0);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff2e6, 1.42);
  keyLight.position.set(5.5, 11.0, 6.5);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 1.0;
    keyLight.shadow.camera.far = 28.0;
    const d = 8.5;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0xffb8d0, 0.68);
  fillLight.position.set(-7.5, 5.5, 4.0);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xc5b0ff, 0.85);
  rimLight.position.set(0.0, 7.0, -7.5);
  scene.add(rimLight);

  // Infinite Pastel Studio Cyclorama Backdrop (Curved Cyc Wall + Floor)
  const cycGeo = new THREE.PlaneGeometry(56, 36, 1, 48);
  const cycPos = cycGeo.attributes.position;
  for (let i = 0; i < cycPos.count; i++) {
    const py = cycPos.getY(i);
    const u = (py + 18) / 36;
    if (u < 0.45) {
      const floorZ = (0.45 - u) * 28.0 - 4.0;
      cycPos.setY(i, -0.68);
      cycPos.setZ(i, floorZ);
    } else {
      const bend = (u - 0.45) / 0.55;
      const angle = Math.min(Math.PI * 0.5, bend * Math.PI * 0.55);
      const r = 8.5;
      const ny = -0.68 + (1 - Math.cos(angle)) * r + Math.max(0, bend - 0.5) * 14.0;
      const nz = -4.0 - Math.sin(angle) * r;
      cycPos.setY(i, ny);
      cycPos.setZ(i, nz);
    }
  }
  cycGeo.computeVertexNormals();

  const cycMat = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uClimaxFlash: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uTime;
      uniform float uClimaxFlash;
      void main() {
        vec3 floorBlush = vec3(0.965, 0.915, 0.928);
        vec3 midRose = vec3(0.942, 0.868, 0.912);
        vec3 topLilac = vec3(0.892, 0.848, 0.935);

        float h = clamp((vWorldPos.y + 0.7) / 10.5, 0.0, 1.0);
        vec3 base = mix(floorBlush, midRose, smoothstep(0.0, 0.45, h));
        base = mix(base, topLilac, smoothstep(0.35, 1.0, h));

        float radialDist = length(vWorldPos.xz * vec2(0.11, 0.14));
        float studioPool = 1.0 - smoothstep(0.0, 1.15, radialDist);
        base += vec3(0.025, 0.018, 0.015) * studioPool;
        base += vec3(0.045, 0.022, 0.032) * uClimaxFlash * studioPool;

        gl_FragColor = vec4(base, 1.0);
      }
    `,
    depthWrite: true,
  });
  const cycMesh = new THREE.Mesh(cycGeo, cycMat);
  cycMesh.receiveShadow = !isSoftwareGl;
  scene.add(cycMesh);

  const grainBumpTex = createMicroGrainBumpTexture();
  const contactShadowTex = createSoftContactShadowTexture();

  // ============================================================================
  // MATERIAL TRIO (Octane SSS Gummy, Glossy Pastel Ceramic, Frosted Glass & Chrome)
  // ============================================================================
  const matGummyPink = new THREE.MeshPhysicalMaterial({
    color: 0xf0567c,
    roughness: 0.25,
    metalness: 0.0,
    clearcoat: 0.38,
    clearcoatRoughness: 0.22,
    sheen: 0.65,
    sheenColor: new THREE.Color(0xffd6e4),
    sheenRoughness: 0.35,
    bumpMap: grainBumpTex,
    bumpScale: 0.004,
  });
  injectOctaneSSSShader(matGummyPink, 0xff4228, 0.52, false);

  const matCeramicCream = new THREE.MeshPhysicalMaterial({
    color: 0xf4d8c8,
    roughness: 0.15,
    metalness: 0.02,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
  });
  injectOctaneSSSShader(matCeramicCream, 0xe8a892, 0.25, false);

  const matFrostedGlass = new THREE.MeshPhysicalMaterial({
    color: 0xb59ef5,
    roughness: 0.18,
    metalness: 0.06,
    clearcoat: 0.9,
    clearcoatRoughness: 0.08,
    iridescence: 0.85,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [160, 400],
    sheen: 0.55,
    sheenColor: new THREE.Color(0x98ebd8),
    bumpMap: grainBumpTex,
    bumpScale: 0.002,
  });
  injectOctaneSSSShader(matFrostedGlass, 0x6cd4ff, 0.45, false);

  const matChampagneChrome = new THREE.MeshPhysicalMaterial({
    color: 0xe8d0bc,
    roughness: 0.16,
    metalness: 0.88,
    clearcoat: 0.65,
    clearcoatRoughness: 0.1,
  });

  // ============================================================================
  // 165-ELEMENT MOGRAPH CLONER ARRAY (4 Distinct High-Subdivision Geometries)
  // ============================================================================
  const clonerGeo0 = new THREE.CapsuleGeometry(0.27, 0.23, 16, 28);

  const lathePts: THREE.Vector2[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI - Math.PI / 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const r = Math.pow(Math.abs(ca), 0.65) * 0.33;
    const y = Math.sign(sa) * Math.pow(Math.abs(sa), 0.65) * 0.25;
    lathePts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  const clonerGeo1 = new THREE.LatheGeometry(lathePts, 32);
  clonerGeo1.computeVertexNormals();

  const clonerGeo2 = new THREE.TorusGeometry(0.22, 0.12, 22, 36);
  clonerGeo2.rotateX(Math.PI / 2);

  const clonerGeo3 = new THREE.SphereGeometry(0.26, 28, 22);

  const bucketIndices: number[][] = [[], [], [], []];
  for (let r = 0; r < CLONER_ROWS; r++) {
    for (let c = 0; c < CLONER_COLS; c++) {
      const st = evaluateClonerElement(c, r, 0);
      bucketIndices[st.materialType].push(st.index);
    }
  }

  const clonerGeos = [clonerGeo0, clonerGeo1, clonerGeo2, clonerGeo3];
  const clonerMats = [matGummyPink, matCeramicCream, matFrostedGlass, matChampagneChrome];
  const clonerMeshes: THREE.InstancedMesh[] = [];

  // Rich, mid-tone pastel palettes that stay dimensional under studio lighting
  const paletteBuckets = [
    [0xf25278, 0xf7785b, 0xe84870, 0xf5886e], // Candy rose & peach gummies
    [0xf5dec9, 0xcab2f5, 0xf2cfb8, 0xbea4f0], // Warm apricot cream & soft lilac ceramics
    [0x96c8f2, 0xbfa3f5, 0x88dec8, 0xeba4d6], // Dichroic sky, lilac & mint frosted glass
    [0xe8d2be, 0xdcbFA8, 0xe5cbb5, 0xd4b59e], // Satin champagne metals
  ];

  const _color = new THREE.Color();
  for (let b = 0; b < 4; b++) {
    const count = bucketIndices[b].length;
    const imesh = new THREE.InstancedMesh(clonerGeos[b], clonerMats[b], count);
    imesh.frustumCulled = false;
    imesh.castShadow = !isSoftwareGl;
    imesh.receiveShadow = !isSoftwareGl;

    for (let k = 0; k < count; k++) {
      const idx = bucketIndices[b][k];
      const pal = paletteBuckets[b];
      _color.setHex(pal[idx % pal.length]);
      imesh.setColorAt(k, _color);
    }
    if (imesh.instanceColor) imesh.instanceColor.needsUpdate = true;
    scene.add(imesh);
    clonerMeshes.push(imesh);
  }

  // Contact Shadows InstancedMesh for all 165 Cloner Elements on the studio floor (y = -0.66)
  const shadowPlaneGeo = new THREE.PlaneGeometry(0.95, 0.95);
  shadowPlaneGeo.rotateX(-Math.PI / 2);
  const shadowPlaneMat = new THREE.MeshBasicMaterial({
    map: contactShadowTex,
    transparent: true,
    opacity: 0.52,
    depthWrite: false,
  });
  const clonerShadowMesh = new THREE.InstancedMesh(shadowPlaneGeo, shadowPlaneMat, CLONER_COUNT);
  clonerShadowMesh.frustumCulled = false;
  scene.add(clonerShadowMesh);

  // ============================================================================
  // HERO OBJECTS: 4 Composite Multi-Part 3D Letters ('S', 'O', 'F', 'T')
  // ============================================================================
  const letterConfigs: Array<{
    char: 'S' | 'O' | 'F' | 'T';
    baseColor: number;
    sssHex: number;
    coreColor: number;
  }> = [
    { char: 'S', baseColor: 0xf24976, sssHex: 0xff2e1a, coreColor: 0xffb8cc },
    { char: 'O', baseColor: 0xf7744c, sssHex: 0xff3b14, coreColor: 0xffe0c2 },
    { char: 'F', baseColor: 0x9b72f2, sssHex: 0xe64d99, coreColor: 0xd9c7ff },
    { char: 'T', baseColor: 0x45c4b0, sssHex: 0x1aa3ff, coreColor: 0xc4f5ec },
  ];

  interface HeroLetterRig {
    group: THREE.Group;
    mainMat: THREE.MeshPhysicalMaterial;
    shadowDisc: THREE.Mesh;
    satellites: THREE.Mesh[];
  }

  const heroLetterRigs: HeroLetterRig[] = letterConfigs.map((cfg) => {
    const group = new THREE.Group();

    const mainMat = new THREE.MeshPhysicalMaterial({
      color: cfg.baseColor,
      roughness: 0.22,
      metalness: 0.0,
      clearcoat: 0.52,
      clearcoatRoughness: 0.16,
      sheen: 0.72,
      sheenColor: new THREE.Color(cfg.coreColor),
      sheenRoughness: 0.30,
      bumpMap: grainBumpTex,
      bumpScale: 0.0035,
    });
    injectOctaneSSSShader(mainMat, cfg.sssHex, 0.58, true);

    // Part 1: Primary Plump Bevelled 3D Letter Body (full dimensional bevels on front & back!)
    const mainGeo = createPlumpLetterGeometry(cfg.char);
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    mainMesh.castShadow = !isSoftwareGl;
    mainMesh.receiveShadow = !isSoftwareGl;
    group.add(mainMesh);

    // Part 2: Secondary Read — Recessed Rear Ceramic Cushion Frame (positioned behind at z = -0.14 so front gummy bevels shine!)
    const rearMat = new THREE.MeshPhysicalMaterial({
      color: cfg.coreColor,
      roughness: 0.14,
      metalness: 0.05,
      clearcoat: 0.85,
      clearcoatRoughness: 0.08,
    });
    const rearCushion = new THREE.Mesh(mainGeo, rearMat);
    rearCushion.scale.set(1.06, 1.06, 0.55);
    rearCushion.position.z = -0.16;
    group.add(rearCushion);

    // Part 3: Accent Details — Brushed Champagne Chrome & Frosted Glass Satellite Pearls
    const satellites: THREE.Mesh[] = [];
    const satGeo = new THREE.SphereGeometry(0.105, 20, 16);
    for (let s = 0; s < 3; s++) {
      const satMesh = new THREE.Mesh(
        satGeo,
        s % 2 === 0 ? matChampagneChrome : matFrostedGlass
      );
      const angle = (s / 3) * Math.PI * 2 + 0.5;
      satMesh.position.set(Math.cos(angle) * 0.68, Math.sin(angle) * 0.72, 0.26);
      group.add(satMesh);
      satellites.push(satMesh);
    }

    scene.add(group);

    // Dedicated Floor Contact Shadow Disc for this Hero Letter
    const discGeo = new THREE.PlaneGeometry(2.1, 1.6);
    discGeo.rotateX(-Math.PI / 2);
    const discMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const shadowDisc = new THREE.Mesh(discGeo, discMat);
    shadowDisc.position.y = -0.65;
    scene.add(shadowDisc);

    return {
      group,
      mainMat,
      shadowDisc,
      satellites,
    };
  });

  // ============================================================================
  // CENTRAL SCULPTURAL JELLY CORE & FROSTED GLASS GIMBAL HALO (7-Part Composite)
  // ============================================================================
  const jellyCoreGroup = new THREE.Group();
  const jellyCoreMat = new THREE.MeshPhysicalMaterial({
    color: 0xf56458,
    roughness: 0.18,
    metalness: 0.0,
    clearcoat: 0.75,
    clearcoatRoughness: 0.12,
    sheen: 0.75,
    sheenColor: new THREE.Color(0xffd8e4),
    sheenRoughness: 0.25,
    bumpMap: grainBumpTex,
    bumpScale: 0.003,
  });
  injectOctaneSSSShader(jellyCoreMat, 0xff2244, 0.65, true);

  // Part 1: Plush Torus-Knot Gummy Core (proportioned to sit with generous top headroom)
  const knotGeo = new THREE.TorusKnotGeometry(0.46, 0.175, 110, 28, 2, 3);
  const knotMesh = new THREE.Mesh(knotGeo, jellyCoreMat);
  jellyCoreGroup.add(knotMesh);

  // Part 2 & 3: Dual Intersecting Frosted Dichroic Glass Gimbal Rings
  const ringGeoOuter = new THREE.TorusGeometry(0.86, 0.075, 24, 64);
  const ringOuterMesh = new THREE.Mesh(ringGeoOuter, matFrostedGlass);
  jellyCoreGroup.add(ringOuterMesh);

  const ringGeoInner = new THREE.TorusGeometry(0.72, 0.06, 22, 56);
  const ringInnerMesh = new THREE.Mesh(ringGeoInner, matCeramicCream);
  ringInnerMesh.rotation.x = Math.PI / 3;
  jellyCoreGroup.add(ringInnerMesh);

  // Parts 4-7: Four Orbiting Champagne Chrome & Candy Gummy Pearls
  const corePearls: THREE.Mesh[] = [];
  const pearlGeo = new THREE.SphereGeometry(0.115, 24, 20);
  for (let p = 0; p < 4; p++) {
    const pearl = new THREE.Mesh(
      pearlGeo,
      p % 2 === 0 ? matChampagneChrome : matGummyPink
    );
    jellyCoreGroup.add(pearl);
    corePearls.push(pearl);
  }
  scene.add(jellyCoreGroup);

  // ============================================================================
  // POST-PROCESSING RENDER TARGET (DepthTexture + Bokeh DOF + Motion Blur)
  // ============================================================================
  const createRenderTarget = (w: number, h: number) => {
    const rt = new THREE.WebGLRenderTarget(w, h, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
    rt.depthTexture = new THREE.DepthTexture(w, h);
    rt.depthTexture.format = THREE.DepthFormat;
    rt.depthTexture.type = THREE.UnsignedIntType;
    return rt;
  };

  let renderTarget = createRenderTarget(initialWidth, initialHeight);

  const postScene = new THREE.Scene();
  const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const postMaterial = new THREE.ShaderMaterial({
    uniforms: {
      tColor: { value: renderTarget.texture },
      tDepth: { value: renderTarget.depthTexture },
      uResolution: { value: new THREE.Vector2(initialWidth, initialHeight) },
      uNear: { value: camera.near },
      uFar: { value: camera.far },
      uFocusDistance: { value: 6.5 },
      uAperture: { value: 1.8 },
      uMotionBlurVec: { value: new THREE.Vector2(0, 0) },
      uTime: { value: 0 },
      uDofEnabled: { value: 1.0 },
    },
    vertexShader: POST_VERTEX_SHADER,
    fragmentShader: POST_FRAGMENT_SHADER,
    depthWrite: false,
    depthTest: false,
  });
  const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMaterial);
  postScene.add(postQuad);

  const _dummy = new THREE.Object3D();
  const _shadowDummy = new THREE.Object3D();

  const renderAtTime = (
    t: number,
    options: { dof?: boolean; motionBlur?: boolean } = {}
  ) => {
    const useDof = options.dof !== false;
    const useMotionBlur = options.motionBlur !== false;

    const camNow = evaluateCamera(t);
    const camPrev = evaluateCamera(Math.max(0, t - 1 / 48));

    camera.position.set(camNow.posX, camNow.posY, camNow.posZ);
    camera.fov = camNow.fov;
    camera.up.set(Math.sin(camNow.roll), Math.cos(camNow.roll), 0);
    camera.lookAt(camNow.targetX, camNow.targetY, camNow.targetZ);
    camera.updateProjectionMatrix();

    cycMat.uniforms.uTime.value = t;
    const climaxFlash = t >= 6.24 ? Math.exp(-(t - 6.25) * 3.5) : 0.0;
    cycMat.uniforms.uClimaxFlash.value = climaxFlash;

    const bucketCounters = [0, 0, 0, 0];
    for (let r = 0; r < CLONER_ROWS; r++) {
      for (let c = 0; c < CLONER_COLS; c++) {
        const el = evaluateClonerElement(c, r, t);
        const b = el.materialType;
        const k = bucketCounters[b]++;

        _dummy.position.set(el.x, el.y, el.z);
        _dummy.rotation.set(el.rotX, el.rotY, el.rotZ);
        _dummy.scale.set(el.sx, el.sy, el.sz);
        _dummy.updateMatrix();
        clonerMeshes[b].setMatrixAt(k, _dummy.matrix);

        const heightAboveFloor = Math.max(0, el.y + 0.65);
        const shadowScale = Math.max(0.35, 1.15 - heightAboveFloor * 0.32) * el.sx;
        _shadowDummy.position.set(el.x, -0.66, el.z);
        _shadowDummy.rotation.set(0, 0, 0);
        _shadowDummy.scale.set(shadowScale, 1, shadowScale);
        _shadowDummy.updateMatrix();
        clonerShadowMesh.setMatrixAt(el.index, _shadowDummy.matrix);
      }
    }
    for (let b = 0; b < 4; b++) {
      clonerMeshes[b].instanceMatrix.needsUpdate = true;
    }
    clonerShadowMesh.instanceMatrix.needsUpdate = true;

    const letterStates = evaluateHeroLetters(t);
    for (let i = 0; i < 4; i++) {
      const st = letterStates[i];
      const rig = heroLetterRigs[i];
      rig.group.visible = st.visible;
      rig.shadowDisc.visible = st.visible;

      if (st.visible) {
        rig.group.position.set(st.x, st.y, st.z);
        rig.group.rotation.set(st.rotX, st.rotY, st.rotZ);
        rig.group.scale.set(st.sx, st.sy, st.sz);

        rig.mainMat.userData.uBottomFlatten.value = st.bottomFlatten;
        rig.mainMat.userData.uJigglePhase.value = st.jigglePhase;
        rig.mainMat.userData.uSssStrength.value = st.sssIntensity * 0.65;

        for (let s = 0; s < rig.satellites.length; s++) {
          const sat = rig.satellites[s];
          const a = (s / 3) * Math.PI * 2 + t * 1.8 + i * 0.9;
          const r = 0.68 + st.bottomFlatten * 0.22;
          sat.position.set(
            Math.cos(a) * r,
            Math.sin(a) * (0.72 - st.bottomFlatten * 0.14),
            0.24 + Math.sin(t * 3.2 + s) * 0.10
          );
        }

        const h = Math.max(0, st.y - 0.85);
        const sScale = Math.max(0.25, 1.18 - h * 0.22) * st.sx;
        rig.shadowDisc.position.set(st.x, -0.65, st.z);
        rig.shadowDisc.scale.set(sScale, 1, sScale * 0.85);
        (rig.shadowDisc.material as THREE.MeshBasicMaterial).opacity =
          Math.max(0.05, 0.68 - h * 0.14);
      }
    }

    const coreState = evaluateJellyCore(t);
    jellyCoreGroup.position.set(coreState.x, coreState.y, coreState.z);
    jellyCoreGroup.scale.set(coreState.sx, coreState.sy, coreState.sz);
    knotMesh.rotation.set(coreState.rotX, coreState.rotY, coreState.rotZ);
    jellyCoreMat.userData.uSssStrength.value = coreState.glowIntensity * 0.65;
    jellyCoreMat.userData.uBottomFlatten.value = coreState.wobbleAmp;
    jellyCoreMat.userData.uJigglePhase.value = t * 12.0;

    ringOuterMesh.rotation.set(t * 0.75, t * 0.45, -0.35);
    ringOuterMesh.scale.setScalar(coreState.ringExpand);
    ringInnerMesh.rotation.set(Math.PI / 3 - t * 0.9, t * 0.65, 0.25);
    ringInnerMesh.scale.setScalar(0.95 + (coreState.ringExpand - 1.0) * 0.7);

    for (let p = 0; p < corePearls.length; p++) {
      const a = (p / 4) * Math.PI * 2 + t * 2.2;
      const rad = 1.02 * coreState.ringExpand;
      corePearls[p].position.set(
        Math.cos(a) * rad,
        Math.sin(a * 2.0) * 0.28,
        Math.sin(a) * rad * 0.55
      );
    }

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    const vx = (camNow.posX - camPrev.posX - (camNow.targetX - camPrev.targetX)) * 0.016;
    const vy = (camNow.posY - camPrev.posY - (camNow.targetY - camPrev.targetY)) * 0.016;
    const mbScale = useMotionBlur ? camNow.motionBlurAmount : 0.0;

    postMaterial.uniforms.uFocusDistance.value = camNow.focusDistance;
    postMaterial.uniforms.uAperture.value = camNow.aperture;
    postMaterial.uniforms.uMotionBlurVec.value.set(
      THREE.MathUtils.clamp(vx * mbScale, -0.018, 0.018),
      THREE.MathUtils.clamp((vy - 0.005 * mbScale) * mbScale, -0.018, 0.018)
    );
    postMaterial.uniforms.uTime.value = t;
    postMaterial.uniforms.uDofEnabled.value = useDof ? 1.0 : 0.0;

    renderer.render(postScene, postCamera);
  };

  const resize = (width: number, height: number) => {
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderTarget.dispose();
    renderTarget = createRenderTarget(w, h);
    postMaterial.uniforms.tColor.value = renderTarget.texture;
    postMaterial.uniforms.tDepth.value = renderTarget.depthTexture;
    postMaterial.uniforms.uResolution.value.set(w, h);
  };

  const dispose = () => {
    renderTarget.dispose();
    envMap.dispose();
    grainBumpTex.dispose();
    contactShadowTex.dispose();
    renderer.dispose();
  };

  return {
    renderAtTime,
    resize,
    dispose,
    getCanvas: () => renderer.domElement,
    isSoftwareGl,
  };
}
