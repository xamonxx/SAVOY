"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import type { BufferGeometry, Material, Scene, Texture } from "three";

import { makeSolidBoardBuilder, useWireframeScene } from "@/components/motion/use-wireframe-scene";
import styles from "./closing-cta.module.css";

/** Light oak: a warm base, plank seams, and layered curved grain at real resolution. */
function createFloorTexture(THREE: typeof import("three")): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createLinearGradient(0, 0, canvas.width, 0);
  base.addColorStop(0, "#dccaa4");
  base.addColorStop(0.5, "#d3bd94");
  base.addColorStop(1, "#dccaa4");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const plankHeight = canvas.height / 6;
  for (let row = 0; row < 6; row++) {
    const y = row * plankHeight;
    ctx.strokeStyle = "rgba(80, 58, 32, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();

    // Layered grain: a few long, low-opacity strokes first for depth, then
    // finer high-frequency lines on top - a single pass of noise reads as a
    // scratch, several layered ones read as fibre.
    for (let layer = 0; layer < 3; layer++) {
      for (let i = 0; i < 6; i++) {
        const gy = y + Math.random() * plankHeight;
        const wobble = Math.random() * 10 - 5;
        ctx.strokeStyle = `rgba(${100 + layer * 15}, ${75 + layer * 10}, ${45 + layer * 8}, ${0.04 + Math.random() * 0.07})`;
        ctx.lineWidth = 0.4 + Math.random() * 1.6;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(canvas.width * 0.28, gy + wobble, canvas.width * 0.72, gy - wobble, canvas.width, gy);
        ctx.stroke();
      }
    }

    // The occasional knot - a small dark ellipse with a soft ring - is what
    // stops a wood texture from reading as repeating wallpaper.
    if (Math.random() > 0.5) {
      const kx = Math.random() * canvas.width;
      const ky = y + plankHeight / 2;
      const rg = ctx.createRadialGradient(kx, ky, 1, kx, ky, 10);
      rg.addColorStop(0, "rgba(70, 48, 26, 0.5)");
      rg.addColorStop(1, "rgba(70, 48, 26, 0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.ellipse(kx, ky, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.anisotropy = 4;
  return texture;
}

/** Lacquered cabinet-door white: a smoother, glossier cousin of a plain painted wall. */
function createWallTexture(THREE: typeof import("three")): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const base = ctx.createLinearGradient(0, 0, 0, canvas.height);
  base.addColorStop(0, "#f5f0e4");
  base.addColorStop(1, "#ece4d3");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const radius = Math.random() * 1.4;
    ctx.fillStyle = `rgba(150, 135, 105, ${Math.random() * 0.04})`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  return texture;
}

function buildClosingScene({ THREE, scene }: { THREE: typeof import("three"); scene: Scene }) {
  const geometries: BufferGeometry[] = [];
  // One large piece on the left, not a small flanking pair either side of
  // centered copy - the copy itself now lives in its own column on the
  // right (see `closing-cta.tsx`), so the sideboard is free to run big and
  // be the section's actual visual weight rather than a decoration peeking
  // in from the edge.
  const cabinet = new THREE.Group();
  scene.add(cabinet);

  const floorTexture = createFloorTexture(THREE);
  const wallTexture = createWallTexture(THREE);
  const textures: Texture[] = [floorTexture, wallTexture];

  // The wood body and its legs reuse the floor's oak grain; the door is a
  // lacquered `MeshPhysicalMaterial` (a thin clearcoat over the same
  // off-white) rather than plain `MeshStandardMaterial`, the same trick
  // `Process`'s HPL panels use for a glossy, finished-furniture highlight
  // instead of a flat matte card.
  const woodMaterial = new THREE.MeshStandardMaterial({ map: floorTexture, roughness: 0.5, metalness: 0.03 });
  const doorMaterial = new THREE.MeshPhysicalMaterial({
    map: wallTexture,
    roughness: 0.28,
    metalness: 0.02,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
  });
  const trimMaterial = new THREE.MeshStandardMaterial({ color: 0xc1d3a3, roughness: 0.45, metalness: 0.08 });
  const potMaterial = new THREE.MeshStandardMaterial({ color: 0xb56b45, roughness: 0.75, metalness: 0.02 });
  const soilMaterial = new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 0.95 });
  const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x6f8f5a, roughness: 0.6 });
  const leafMaterialDark = new THREE.MeshStandardMaterial({ color: 0x4f7048, roughness: 0.6 });
  const bookMaterialA = new THREE.MeshStandardMaterial({ color: 0xc1d3a3, roughness: 0.7 });
  const bookMaterialB = new THREE.MeshStandardMaterial({ color: 0x2c241c, roughness: 0.7 });
  const materials: Material[] = [
    woodMaterial,
    doorMaterial,
    trimMaterial,
    potMaterial,
    soilMaterial,
    leafMaterial,
    leafMaterialDark,
    bookMaterialA,
    bookMaterialB,
  ];

  const board = makeSolidBoardBuilder(THREE, geometries);

  // A low sideboard: an open shelf on one side, a closed door on the other,
  // standing on four slim legs - the same silhouette as the product photos
  // this was modelled on, not a floor-plus-wall room corner.
  //
  // Built as a real box joint, not five slabs eyeballed into roughly the
  // right place: the two sides run the *full* outer height and depth, top
  // and bottom are sized to fit exactly between them, and the back fits the
  // resulting inner cavity. Every touching pair of panels shares an actual
  // face coordinate, so there is no seam for the background to show through
  // at a corner and no arbitrary gap between the legs and the body - both
  // of which is what happened when top/bottom/side sizes were each picked
  // independently instead of derived from one shared set of dimensions.
  const W = 2.4; // outer width
  const H = 0.9; // outer height
  const D = 0.7; // outer depth
  const T = 0.06; // side/top/bottom panel thickness
  const TB = 0.05; // back panel thickness
  const sideX = W / 2 - T / 2;
  const topY = H / 2 - T / 2;
  const innerW = W - 2 * T;
  const innerH = H - 2 * T;
  const backZ = -D / 2 + TB / 2;
  const bottomOuterY = -topY - T / 2; // the floor this cabinet actually stands on

  board(cabinet, [T, H, D], [-sideX, 0, 0], woodMaterial); // left side
  board(cabinet, [T, H, D], [sideX, 0, 0], woodMaterial); // right side
  board(cabinet, [innerW, T, D], [0, topY, 0], woodMaterial); // top - flush with the sides' top face
  board(cabinet, [innerW, T, D], [0, -topY, 0], woodMaterial); // bottom - flush with the sides' bottom face
  board(cabinet, [innerW, innerH, TB], [0, 0, backZ], woodMaterial); // back - fills the inner cavity

  // The divider and shelf/door in front of it fit the inner cavity's own
  // depth (between the back's front face and the door's front plane), not a
  // guessed value - so they meet the sides and back cleanly too.
  const cavityFrontZ = D / 2;
  const cavityBackZ = backZ + TB / 2;
  const cavityDepth = cavityFrontZ - cavityBackZ;
  const cavityCenterZ = (cavityFrontZ + cavityBackZ) / 2;
  const dividerT = 0.05;
  board(cabinet, [dividerT, innerH, cavityDepth], [0, 0, cavityCenterZ], woodMaterial); // centre divider
  const shelfWidth = sideX - T / 2 - dividerT / 2;
  const shelfX = -sideX + T / 2 + shelfWidth / 2;
  board(cabinet, [shelfWidth, 0.04, cavityDepth - 0.02], [shelfX, 0.05, cavityCenterZ], woodMaterial); // open shelf
  const doorWidth = sideX - T / 2 - dividerT / 2;
  const doorX = sideX - T / 2 - doorWidth / 2;
  const doorThickness = 0.04;
  board(cabinet, [doorWidth, innerH + 0.04, doorThickness], [doorX, 0, cavityFrontZ - doorThickness / 2], doorMaterial); // door front
  board(cabinet, [0.03, 0.28, 0.03], [doorX, 0, cavityFrontZ + 0.03], trimMaterial); // door pull

  // Legs meet the bottom panel's actual outer face - not a re-guessed
  // number - so this holds even if the body's own dimensions change later.
  const legHeight = 0.36;
  const legY = bottomOuterY - legHeight / 2;
  const legPositions: Array<[number, number, number]> = [
    [-1.05, legY, -0.28],
    [-1.05, legY, 0.28],
    [1.05, legY, -0.28],
    [1.05, legY, 0.28],
  ];
  for (const position of legPositions) board(cabinet, [0.07, legHeight, 0.07], position, woodMaterial);

  // Styling on top: the tabletop attributes an empty sideboard in a product
  // photo never actually has - a tapered terracotta pot with a loose leaf
  // cluster, and a small stack of books, both catching the same shadows the
  // cabinet itself does.
  const potTop = topY + T / 2; // the cabinet's own top outer face
  const potGeometry = new THREE.CylinderGeometry(0.15, 0.11, 0.24, 16);
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.position.set(-0.75, potTop + 0.12, 0.12);
  pot.castShadow = true;
  pot.receiveShadow = true;
  cabinet.add(pot);
  geometries.push(potGeometry);

  const soilGeometry = new THREE.CylinderGeometry(0.13, 0.13, 0.03, 16);
  const soil = new THREE.Mesh(soilGeometry, soilMaterial);
  soil.position.set(-0.75, potTop + 0.24, 0.12);
  cabinet.add(soil);
  geometries.push(soilGeometry);

  const leafOffsets: Array<[number, number, number, number, number, number, boolean]> = [
    [0, 0.16, 0, 0.16, 0.22, 0.14, false],
    [0.08, 0.24, 0.03, 0.12, 0.18, 0.12, true],
    [-0.09, 0.22, -0.02, 0.13, 0.2, 0.13, false],
    [0.02, 0.32, -0.04, 0.1, 0.16, 0.1, true],
    [-0.05, 0.34, 0.05, 0.09, 0.14, 0.09, false],
  ];
  const leafGeometry = new THREE.IcosahedronGeometry(1, 0);
  geometries.push(leafGeometry);
  for (const [ox, oy, oz, sx, sy, sz, dark] of leafOffsets) {
    const leaf = new THREE.Mesh(leafGeometry, dark ? leafMaterialDark : leafMaterial);
    leaf.position.set(-0.75 + ox, potTop + 0.24 + oy, 0.12 + oz);
    leaf.scale.set(sx, sy, sz);
    leaf.rotation.set(Math.random(), Math.random(), Math.random());
    leaf.castShadow = true;
    cabinet.add(leaf);
  }

  const bookLarge = board(cabinet, [0.32, 0.035, 0.22], [0.32, potTop + 0.0175, 0.05], bookMaterialA);
  bookLarge.rotation.y = 0.08;
  const bookSmall = board(cabinet, [0.24, 0.035, 0.18], [0.35, potTop + 0.0525, 0.02], bookMaterialB);
  bookSmall.rotation.y = -0.05;

  const key = new THREE.DirectionalLight(0xfff2df, 2.0);
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

  const fill = new THREE.HemisphereLight(0xe8e2d0, 0x14302a, 0.75);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc1d3a3, 0.4);
  rim.position.set(-5, -2, -4);
  scene.add(rim);

  const ambient = new THREE.AmbientLight(0xfff6e8, 0.35);
  scene.add(ambient);

  return {
    onFrame(amount: number, aspect: number) {
      // Bigger, and positioned toward left-of-centre rather than pinned to
      // the far edge - `closing-cta.tsx` reserves the right column for copy,
      // so the sideboard has the whole left field to itself.
      const scale = aspect < 0.8 ? 1.4 : 2.15;
      cabinet.scale.setScalar(scale);
      cabinet.position.set(-aspect * 2.15, -0.3 + amount * 0.5, 0);
      // Starts turned almost fully into profile and unwinds to face the
      // reader by the time they have scrolled through the section, instead
      // of the small few-degree swing it used to do.
      cabinet.rotation.set(0.16 - amount * 0.08, -1.35 + amount * 1.35, 0);
    },
    dispose() {
      geometries.forEach(geometry => geometry.dispose());
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
    },
  };
}

export function ClosingCtaBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();
  useWireframeScene(canvasRef, buildClosingScene, reducedMotion, { shadows: true });

  return (
    <div aria-hidden="true" className={styles.backdrop}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
