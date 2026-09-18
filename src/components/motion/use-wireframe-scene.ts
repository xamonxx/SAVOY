"use client";

import { type RefObject, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { BufferGeometry, Group, Material, Mesh, Scene } from "three";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

type WireframeScene = {
  onFrame: (amount: number, aspect: number) => void;
  dispose: () => void;
};

type SceneBuilder = (args: { THREE: typeof import("three"); scene: Scene }) => WireframeScene;

/** A translucent box + edge outline, the one shape every wireframe backdrop is built from. */
export function makeBoardBuilder(THREE: typeof import("three"), geometries: BufferGeometry[], materials: Material[]) {
  return function board(parent: Group, size: [number, number, number], position: [number, number, number], color: number) {
    const geometry = new THREE.BoxGeometry(...size);
    const edges = new THREE.EdgesGeometry(geometry);
    const surface = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.045, depthWrite: false });
    const outline = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.24, depthWrite: false });
    const group = new THREE.Group();
    group.add(new THREE.Mesh(geometry, surface), new THREE.LineSegments(edges, outline));
    group.position.set(...position);
    parent.add(group);
    geometries.push(geometry, edges);
    materials.push(surface, outline);
    return group;
  };
}

/** A shadow-casting, lit box - the shape a realistic wood-panel backdrop is built from. */
export function makeSolidBoardBuilder(THREE: typeof import("three"), geometries: BufferGeometry[]) {
  return function board(parent: Group, size: [number, number, number], position: [number, number, number], material: Material): Mesh {
    const geometry = new THREE.BoxGeometry(...size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.set(...position);
    parent.add(mesh);
    geometries.push(geometry);
    return mesh;
  };
}

/**
 * Shared scaffolding for a scroll-driven three.js wireframe backdrop: lazy-loads
 * three.js, renders only while the host section is on screen, and re-renders on
 * scroll/resize rather than every frame. `build` supplies the geometry and the
 * per-frame update; `build` must be a stable reference (defined outside the
 * component) since it only runs once per mount.
 */
export function useWireframeScene(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  build: SceneBuilder,
  reducedMotion: boolean | null,
  options?: { shadows?: boolean }
) {
  const shadows = options?.shadows ?? false;

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest("section");
    if (!canvas || !section || reducedMotion === null) return;

    let cancelled = false;
    let started = false;
    let visible = false;
    let dispose = () => {};

    const initialize = async () => {
      const THREE = await import("three");
      if (cancelled) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      // Lit materials need this to read as real furniture rather than flat cutouts.
      if (shadows) {
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
      }

      const scene = new THREE.Scene();
      const sampleTarget = process.env.NODE_ENV === "development" ? new THREE.WebGLRenderTarget(64, 64) : null;
      const samplePixels = sampleTarget ? new Uint8Array(64 * 64 * 4) : null;
      const camera = new THREE.OrthographicCamera(-6, 6, 4.2, -4.2, 0.1, 40);
      camera.position.z = 12;

      const wireframeScene = build({ THREE, scene });

      let progress = 0;
      let aspect = 1;
      let animationFrame = 0;
      const render = () => {
        animationFrame = 0;
        if (cancelled || !visible) return;
        wireframeScene.onFrame(reducedMotion ? 0.35 : progress, aspect);
        renderer.render(scene, camera);
        if (sampleTarget && samplePixels) {
          renderer.setRenderTarget(sampleTarget);
          renderer.render(scene, camera);
          renderer.readRenderTargetPixels(sampleTarget, 0, 0, 64, 64, samplePixels);
          renderer.setRenderTarget(null);
          let coverage = 0;
          let checksum = 0;
          for (let index = 3; index < samplePixels.length; index += 4) {
            if (samplePixels[index]) coverage++;
            checksum = (checksum + samplePixels[index] * (index % 997)) % 2147483647;
          }
          canvas.dataset.pixelCoverage = String(coverage);
          canvas.dataset.frameChecksum = String(checksum);
        }
      };
      const schedule = () => {
        if (!animationFrame && visible) animationFrame = requestAnimationFrame(render);
      };
      const resize = () => {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (!width || !height) return;
        aspect = width / height;
        camera.left = -aspect * 4.2;
        camera.right = aspect * 4.2;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
        schedule();
      };

      const trigger = reducedMotion ? null : ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onUpdate: self => { progress = self.progress; schedule(); },
        onRefresh: self => { progress = self.progress; schedule(); },
      });
      if (trigger) progress = trigger.progress;
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      resize();

      // Render only on scroll or resize, and stop GPU work outside this section.
      const visibilityObserver = new IntersectionObserver(entries => {
        visible = entries[0].isIntersecting;
        if (visible) schedule();
      });
      visibilityObserver.observe(section);

      dispose = () => {
        cancelAnimationFrame(animationFrame);
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        trigger?.kill();
        wireframeScene.dispose();
        sampleTarget?.dispose();
        renderer.dispose();
      };
    };

    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !started) {
        started = true;
        void initialize();
      }
    }, { rootMargin: "200px" });
    observer.observe(section);
    return () => {
      cancelled = true;
      observer.disconnect();
      dispose();
    };
  }, [reducedMotion, canvasRef, build, shadows]);
}
