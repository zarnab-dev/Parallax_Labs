/**
 * Detects whether the browser can create a WebGL context, without actually
 * mounting a Three.js canvas. Used to decide whether to offer the 3D viewer
 * at all, falling back to the 2D gallery when WebGL is unavailable
 * (disabled by the browser/OS, software-blocked GPU, etc.).
 */
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}
