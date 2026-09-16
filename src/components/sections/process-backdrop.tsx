"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";
import type { BufferGeometry, Material, Group } from "three";

import styles from "./process-storytelling.module.css";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export function ProcessBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

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

      const scene = new THREE.Scene();
      const sampleTarget = process.env.NODE_ENV === "development" ? new THREE.WebGLRenderTarget(64, 64) : null;
      const samplePixels = sampleTarget ? new Uint8Array(64 * 64 * 4) : null;
      const camera = new THREE.OrthographicCamera(-6, 6, 4.2, -4.2, 0.1, 40);
      camera.position.z = 12;
      const geometries: BufferGeometry[] = [];
      const materials: Material[] = [];
      const cabinet = new THREE.Group();
      const panels = new THREE.Group();
      scene.add(cabinet, panels);

      const board = (parent: Group, size: [number, number, number], position: [number, number, number], color: number) => {
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

      const sage = 0xc1d3a3;
      board(cabinet, [2.4, 0.07, 1.2], [0, -1.6, 0], sage);
      board(cabinet, [2.4, 0.07, 1.2], [0, 1.6, 0], sage);
      board(cabinet, [0.07, 3.2, 1.2], [-1.2, 0, 0], sage);
      board(cabinet, [0.07, 3.2, 1.2], [1.2, 0, 0], sage);
      board(cabinet, [2.4, 3.2, 0.05], [0, 0, -0.6], sage);
      board(cabinet, [2.4, 0.05, 1.2], [0, -0.4, 0], sage);
      const floatingPanels = Array.from({ length: 4 }, (_, index) =>
        board(panels, [3.2, 0.06, 1.8], [0, index * 0.48, 0], 0x9cc9c0)
      );

      let progress = 0;
      let aspect = 1;
      let animationFrame = 0;
      const render = () => {
        animationFrame = 0;
        if (cancelled || !visible) return;
        const amount = reducedMotion ? 0.35 : progress;
        const scale = aspect < 0.8 ? 0.58 : 1;
        cabinet.scale.setScalar(scale);
        panels.scale.setScalar(scale);
        cabinet.position.set(-aspect * 3.5, 1.4 - amount * 2, 0);
        cabinet.rotation.set(0.15 + amount * 0.18, -0.5 + amount * 1.2, -0.12 + amount * 0.15);
        panels.position.set(aspect * 3.5, -2.6 + amount * 1.4, -1);
        panels.rotation.set(0.5 + amount * 0.35, 0.3 - amount * 1.1, 0.15);
        floatingPanels.forEach((panel, index) => {
          panel.position.y = index * (0.32 + amount * 0.38);
          panel.rotation.y = index * amount * 0.075;
        });
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
        geometries.forEach(geometry => geometry.dispose());
        materials.forEach(material => material.dispose());
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
  }, [reducedMotion]);

  return (
    <div aria-hidden="true" className={styles.backgroundTrack}>
      <div className={styles.backgroundViewport}>
        <canvas ref={canvasRef} data-process-backdrop="true" className={styles.backgroundCanvas} />
      </div>
    </div>
  );
}
