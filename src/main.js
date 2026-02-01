import {
  Color3,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  UniversalCamera,
  Vector3,
  Ray
} from '@babylonjs/core';

const canvas = document.getElementById('game-canvas');
canvas.tabIndex = 0; // allow keyboard focus for WASD
const engine = new Engine(canvas, true);

const infoPanel = document.createElement('div');
infoPanel.style.position = 'absolute';
infoPanel.style.bottom = '12px';
infoPanel.style.left = '12px';
infoPanel.style.padding = '10px 12px';
infoPanel.style.background = 'rgba(0, 0, 0, 0.45)';
infoPanel.style.border = '1px solid rgba(255, 255, 255, 0.12)';
infoPanel.style.borderRadius = '8px';
infoPanel.style.backdropFilter = 'blur(8px)';
infoPanel.style.fontSize = '12px';
infoPanel.style.lineHeight = '1.4';
infoPanel.style.color = '#f5f7fb';
document.getElementById('app').appendChild(infoPanel);

function formatVec3(v) {
  return `${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}`;
}

function isGameActive() {
  return document.pointerLockElement === canvas;
}

function maybePreventDefault(ev) {
  if (!isGameActive()) return;
  const blockKeys = new Set([
    'w',
    'a',
    's',
    'd',
    'W',
    'A',
    'S',
    'D',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'Shift',
    'Control',
    ' ',
    'c',
    'C'
  ]);
  if (blockKeys.has(ev.key)) {
    ev.preventDefault();
  }
}

function createScene() {
  const scene = new Scene(engine);

  // Lighting
  const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  // Camera setup
  const camera = new UniversalCamera('camera', new Vector3(0, 2, -8), scene);
  camera.attachControl(canvas, true);
  const baseSpeed = 0.35;
  const sprintMultiplier = 1.8;
  const crouchMultiplier = 0.55;
  camera.speed = baseSpeed;
  camera.angularSensibility = 4000;
  camera.applyGravity = true;
  camera.checkCollisions = true;
  camera.ellipsoid = new Vector3(0.6, 1, 0.6);
  // Babylon expects keycodes (numbers), not strings, for movement bindings.
  // WASD + arrow keys.
  camera.keysUp = [87, 38]; // W, ArrowUp
  camera.keysDown = [83, 40]; // S, ArrowDown
  camera.keysLeft = [65, 37]; // A, ArrowLeft
  camera.keysRight = [68, 39]; // D, ArrowRight

  // Enable gravity & collisions in the scene
  scene.gravity = new Vector3(0, -0.75, 0);
  scene.collisionsEnabled = true;
  scene.onPointerDown = () => {
    console.log('[input] pointer down -> focus + request pointer lock');
    canvas.focus();
    canvas.requestPointerLock?.();
  };

  // Movement state
  let isSprinting = false;
  let isCrouching = false;
  let jumpQueued = false;
  const crouchOffset = 0.5;
  const standEllipsoidY = 1;
  const crouchEllipsoidY = 0.6;

  canvas.addEventListener('pointerlockchange', () => {
    console.log(
      `[input] pointer lock state: ${document.pointerLockElement === canvas}`
    );
  });

  canvas.addEventListener('keydown', (ev) => {
    maybePreventDefault(ev);
    console.log(`[input] keydown: ${ev.key}`);
    if (ev.key === 'Shift') {
      isSprinting = true;
    }
    if (ev.key === 'Control' || ev.key === 'c') {
      if (!isCrouching) {
        camera.position.y -= crouchOffset;
        camera.ellipsoid.y = crouchEllipsoidY;
        isCrouching = true;
      }
    }
    if (ev.key === ' ') {
      jumpQueued = true;
    }
  });

  canvas.addEventListener('keyup', (ev) => {
    maybePreventDefault(ev);
    console.log(`[input] keyup: ${ev.key}`);
    if (ev.key === 'Shift') {
      isSprinting = false;
    }
    if (ev.key === 'Control' || ev.key === 'c') {
      if (isCrouching) {
        camera.position.y += crouchOffset;
        camera.ellipsoid.y = standEllipsoidY;
        isCrouching = false;
      }
    }
  });

  // Ground
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: 24, height: 24, subdivisions: 8 },
    scene
  );
  ground.checkCollisions = true;
  const groundMat = new StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new Color3(0.18, 0.2, 0.24);
  ground.material = groundMat;

  // Simple tree (cylinder trunk + sphere canopy)
  const trunk = MeshBuilder.CreateCylinder(
    'trunk',
    { diameterTop: 0.6, diameterBottom: 0.8, height: 3, tessellation: 12 },
    scene
  );
  trunk.position = new Vector3(0, 1.5, 5);
  trunk.checkCollisions = true;
  const trunkMat = new StandardMaterial('trunkMat', scene);
  trunkMat.diffuseColor = new Color3(0.36, 0.21, 0.11);
  trunk.material = trunkMat;

  const canopyDiameter = 3.8;
  const canopyRadius = canopyDiameter / 2;
  const canopy = MeshBuilder.CreateSphere(
    'canopy',
    { diameter: canopyDiameter, segments: 16 },
    scene
  );
  // Parent first so position is local to trunk
  canopy.parent = trunk;
  // Position canopy locally so it sits on top of the trunk.
  // Trunk origin is center (y = height / 2 = 1.5). To sit on top:
  // localY = (trunkHeight / 2) + canopyRadius = 1.5 + 1.9 = 3.4
  canopy.position = new Vector3(0, (3 / 2) + canopyRadius, 0);
  canopy.checkCollisions = true;
  const canopyMat = new StandardMaterial('canopyMat', scene);
  canopyMat.diffuseColor = new Color3(0.1, 0.45, 0.2);
  canopy.material = canopyMat;

  // Keep canopy and trunk together for collisions (parent set above)

  // Horizon tint to avoid pure black background
  scene.clearColor = new Color3(0.04, 0.05, 0.08).toColor4();

  const groundCheckDistance = camera.ellipsoid.y + 0.6; // a bit more forgiving
  const jumpStrength = 0.9; // higher hop to feel responsive

  function isGrounded() {
    const ray = new Ray(camera.position, Vector3.Down(), groundCheckDistance);
    const pick = scene.pickWithRay(ray, (mesh) => mesh.checkCollisions);
    return pick?.hit ?? false;
  }

  // Debug overlay (F3-style) + movement handling
  scene.onBeforeRenderObservable.add(() => {
    // Sprint / crouch speed adjustment
    const sprintFactor = isSprinting ? sprintMultiplier : 1;
    const crouchFactor = isCrouching ? crouchMultiplier : 1;
    camera.speed = baseSpeed * sprintFactor * crouchFactor;

    // Jump handling
    if (jumpQueued && isGrounded()) {
      camera.cameraDirection.y = jumpStrength;
    }
    jumpQueued = false;

    const pos = camera.position;
    const rot = camera.rotation;
    const fps = engine.getFps().toFixed(0);
    const isLocked = document.pointerLockElement === canvas;
    infoPanel.innerText = [
      `FPS: ${fps}`,
      `Pos: ${formatVec3(pos)}`,
      `Rot: ${formatVec3(rot)}`,
      `Pointer lock: ${isLocked ? 'yes' : 'no'}`,
      `Sprint: ${isSprinting ? 'on' : 'off'}`,
      `Crouch: ${isCrouching ? 'on' : 'off'}`,
      `Grounded: ${isGrounded() ? 'yes' : 'no'}`
    ].join('\n');
  });

  return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener('resize', () => {
  engine.resize();
});
