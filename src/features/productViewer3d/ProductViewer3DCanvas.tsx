"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { ProceduralProductMesh } from "./ProceduralProductMesh";
import { colorForCategory } from "./colorForCategory";
import { shapeForCategory } from "./shapeForCategory";
import type { Product } from "@/types/product";

const KEYBOARD_ROTATE_STEP = Math.PI / 24; // 7.5 degrees per key press

export function ProductViewer3DCanvas({ product }: { product: Product }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const controls = controlsRef.current;
    if (!controls) return;

    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() - KEYBOARD_ROTATE_STEP);
        break;
      case "ArrowRight":
        e.preventDefault();
        controls.setAzimuthalAngle(controls.getAzimuthalAngle() + KEYBOARD_ROTATE_STEP);
        break;
      case "ArrowUp":
        e.preventDefault();
        controls.setPolarAngle(Math.max(0.3, controls.getPolarAngle() - KEYBOARD_ROTATE_STEP));
        break;
      case "ArrowDown":
        e.preventDefault();
        controls.setPolarAngle(Math.min(Math.PI - 0.3, controls.getPolarAngle() + KEYBOARD_ROTATE_STEP));
        break;
    }
  }

  return (
    <div>
      <div
        role="img"
        aria-label={`Interactive 3D preview of ${product.title}. Use arrow keys, drag, or touch to rotate.`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onPointerDown={() => setAutoRotate(false)}
        style={{ touchAction: "none" }}
        className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:bg-gray-800"
      >
        <Canvas shadows camera={{ position: [2, 1.4, 2.6], fov: 40 }} dpr={[1, 1.5]}>
          {/* Lit entirely locally. (An earlier version used drei's <Environment
              preset="city" />, which downloads an HDR image from a public CDN
              at runtime — it broke offline/PWA use and crashed the page when
              the download failed.) */}
          <ambientLight intensity={0.5} />
          <hemisphereLight args={["#ffffff", "#475569", 0.7]} />
          <directionalLight position={[3, 4, 2]} intensity={1.2} castShadow />
          <ProceduralProductMesh
            shape={shapeForCategory(product.category)}
            color={colorForCategory(product.category)}
          />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.8, 0]} receiveShadow>
            <circleGeometry args={[2.2, 32]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
          <OrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            autoRotateSpeed={1.4}
            enablePan={false}
            minDistance={1.8}
            maxDistance={4.5}
            minPolarAngle={0.3}
            maxPolarAngle={Math.PI - 0.3}
          />
        </Canvas>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>Drag, pinch, or use arrow keys to rotate</span>
        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className="rounded-md px-2 py-1 font-medium text-brand-600 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-brand-400 dark:hover:bg-brand-900/30"
        >
          {autoRotate ? "Stop rotation" : "Auto-rotate"}
        </button>
      </div>
    </div>
  );
}
