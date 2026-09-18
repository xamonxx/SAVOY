"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { BufferGeometry, Material, Mesh, Scene, Texture } from "three";

import { makeSolidBoardBuilder, useWireframeScene } from "@/components/motion/use-wireframe-scene";
import styles from "./process-storytelling.module.css";

/** A light oak HPL sheet: a bright base tone with faint printed grain, not a flat color. */
function createHplTexture(THREE: typeof import("three")): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#e8ddc7";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 48; i++) {
    const y = Math.random() * canvas.height;
    const wobble = Math.random() * 8 - 4;
    ctx.strokeStyle = `rgba(151, 121, 82, ${0.03 + Math.random() * 0.06})`;
    ctx.lineWidth = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(canvas.width * 0.3, y + wobble, canvas.width * 0.7, y - wobble, canvas.width, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2.4);
  return texture;
}

/** Multiplek/plywood, seen edge-on: thin alternating veneer plies, not a single wood surface. */
function createPlywoodTexture(THREE: typeof import("three")): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#c99a63";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plyCount = 9;
  const plyHeight = canvas.height / plyCount;
  for (let i = 0; i < plyCount; i++) {
    const y = i * plyHeight;
    const light = i % 2 === 0;
    ctx.fillStyle = light ? "rgba(224, 190, 140, 0.55)" : "rgba(120, 78, 42, 0.4)";
    ctx.fillRect(0, y, canvas.width, plyHeight * 0.62);

    // A hairline seam between plies, the actual glue-line a real sheet shows.
    ctx.strokeStyle = "rgba(70, 44, 20, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Faint vertical grain running across every ply, so it never reads as flat stripes.
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * canvas.width;
    ctx.strokeStyle = `rgba(90, 58, 28, ${0.03 + Math.random() * 0.05})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + (Math.random() * 6 - 3), canvas.height);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1.6);
  return texture;
}

/** Particle board/blockboard core: a matte speckled tan, the "before the coating" material. */
function createParticleBoardTexture(THREE: typeof import("three")): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#cbb894";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 900; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 0.6 + Math.random() * 2.2;
    const shade = Math.random();
    ctx.fillStyle =
      shade < 0.5
        ? `rgba(94, 68, 38, ${0.12 + Math.random() * 0.18})`
        : `rgba(238, 222, 190, ${0.15 + Math.random() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.6), Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.4, 1.4);
  return texture;
}

/** Dark walnut veneer: the deep, high-contrast grain used for premium finishes. */
function createWalnutTexture(THREE: typeof import("three")): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#3c2818";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 60; i++) {
    const y = Math.random() * canvas.height;
    const wobble = Math.random() * 14 - 7;
    ctx.strokeStyle = `rgba(20, 12, 6, ${0.15 + Math.random() * 0.25})`;
    ctx.lineWidth = 0.8 + Math.random() * 2.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(canvas.width * 0.3, y + wobble, canvas.width * 0.7, y - wobble, canvas.width, y);
    ctx.stroke();
  }
  for (let i = 0; i < 24; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = `rgba(120, 84, 52, ${0.08 + Math.random() * 0.12})`;
    ctx.lineWidth = 0.5 + Math.random();
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y + (Math.random() * 10 - 5));
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2.2);
  return texture;
}

function buildProcessScene({ THREE, scene }: { THREE: typeof import("three"); scene: Scene }) {
  const geometries: BufferGeometry[] = [];
  const cabinet = new THREE.Group();
  const panels = new THREE.Group();
  scene.add(cabinet, panels);

  const hplTexture = createHplTexture(THREE);
  const plywoodTexture = createPlywoodTexture(THREE);
  const particleBoardTexture = createParticleBoardTexture(THREE);
  const walnutTexture = createWalnutTexture(THREE);
  const textures: Texture[] = [hplTexture, plywoodTexture, particleBoardTexture, walnutTexture];

  // Bright HPL laminate: light oak base with a printed grain map, glossy
  // clearcoat rather than the flat matte a plain color material would give.
  const hpl = new THREE.MeshPhysicalMaterial({
    map: hplTexture,
    roughness: 0.3,
    metalness: 0.02,
    clearcoat: 0.6,
    clearcoatRoughness: 0.16,
  });
  // Plywood core, seen edge-on: no coating yet, so no clearcoat - a raw,
  // matte surface with the glue-line plies doing all the visual work.
  const plywood = new THREE.MeshStandardMaterial({
    map: plywoodTexture,
    roughness: 0.85,
    metalness: 0,
  });
  // Particle board/blockboard: the roughest of the four, slightly duller
  // than plywood since it has no visible grain direction to catch light.
  const particleBoard = new THREE.MeshStandardMaterial({
    map: particleBoardTexture,
    roughness: 0.95,
    metalness: 0,
  });
  // Dark walnut veneer: a furniture-grade satin finish, between the raw
  // cores and the fully glossy HPL.
  const walnut = new THREE.MeshPhysicalMaterial({
    map: walnutTexture,
    roughness: 0.4,
    metalness: 0.04,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
  });
  const sageAccent = new THREE.MeshStandardMaterial({ color: 0xc1d3a3, roughness: 0.5, metalness: 0.12 });
  const materials: Material[] = [hpl, plywood, particleBoard, walnut, sageAccent];
  // One sample of each real material this step's copy is describing -
  // "mesin potong presisi dan pelapisan rapi" spans raw board (plywood,
  // particle board) through to the coated finishes (HPL, walnut veneer), so
  // the floating stack shouldn't show four identical sheets.
  const panelMaterials = [hpl, plywood, particleBoard, walnut];

  const board = makeSolidBoardBuilder(THREE, geometries);

  board(cabinet, [2.4, 0.08, 1.2], [0, -1.6, 0], hpl);
  board(cabinet, [2.4, 0.08, 1.2], [0, 1.6, 0], hpl);
  board(cabinet, [0.08, 3.2, 1.2], [-1.2, 0, 0], hpl);
  board(cabinet, [0.08, 3.2, 1.2], [1.2, 0, 0], hpl);
  board(cabinet, [2.4, 3.2, 0.06], [0, 0, -0.6], hpl);
  board(cabinet, [2.4, 0.06, 1.2], [0, -0.4, 0], hpl);
  board(cabinet, [2.42, 0.03, 0.03], [0, -0.42, 0.6], sageAccent);

  const floatingPanels: Mesh[] = Array.from({ length: 4 }, (_, index) =>
    board(panels, [3.2, 0.07, 1.8], [0, index * 0.48, 0], panelMaterials[index])
  );

  // Warm key light + a cool sage-tinted rim, so the panels read under the
  // section's own dark-green light rather than under a neutral studio one.
  // Fill and ambient run brighter than a wood version would need, since a
  // light HPL finish should never read as a dark cavity.
  const key = new THREE.DirectionalLight(0xfff2df, 2.2);
  key.position.set(4, 6, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 9;
  key.shadow.camera.bottom = -9;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 20;
  key.shadow.bias = -0.0015;
  scene.add(key);

  const fill = new THREE.HemisphereLight(0xf3ede0, 0x18352c, 1.0);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc1d3a3, 0.5);
  rim.position.set(-5, -2, -4);
  scene.add(rim);

  const ambient = new THREE.AmbientLight(0xfff6e8, 0.45);
  scene.add(ambient);

  return {
    onFrame(amount: number, aspect: number) {
      const scale = aspect < 0.8 ? 0.58 : 1;
      cabinet.scale.setScalar(scale);
      panels.scale.setScalar(scale);
      cabinet.position.set(-aspect * 3.5, 1.4 - amount * 2, 0);
      cabinet.rotation.set(0.15 + amount * 0.18, -0.5 + amount * 1.2, -0.12 + amount * 0.15);
      panels.position.set(aspect * 3.5, -2.6 + amount * 1.4, -1);
      panels.rotation.set(0.5 + amount * 0.35, 0.3 - amount * 1.1, 0.15);
      // Each sample needs real daylight between it and its neighbours - at
      // the old 0.32 spacing the four material samples overlapped into one
      // fused block and the whole point (four different materials) was lost
      // under the top sheet.
      floatingPanels.forEach((panel, index) => {
        panel.position.y = index * (1.35 + amount * 1.1);
        panel.rotation.y = index * amount * 0.075;
      });
    },
    dispose() {
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
    },
  };
}

export function ProcessBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  useWireframeScene(canvasRef, buildProcessScene, reducedMotion, { shadows: true });

  return (
    <div aria-hidden="true" className={styles.backgroundTrack}>
      <div className={styles.backgroundViewport}>
        <canvas ref={canvasRef} data-process-backdrop="true" className={styles.backgroundCanvas} />
      </div>
    </div>
  );
}
