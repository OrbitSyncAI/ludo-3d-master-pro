/**
 * Ludo 3D Pro - Direct Flat Top-Down Orthogonal View (Like Ludo King)
 * Zero Perspective Distortion, 100% Symmetrical, Pixel-Perfect Centered
 */

// Calculate perfect top-down camera height so the 16.5 unit board fits mobile screen edge-to-edge
export function calculateLudoKingCamera(width, height) {
  const aspect = width / height;
  
  // Board width is 16.5 units. Total target width with clean 3% mobile margins = 17.2 units
  const targetWorldWidth = 17.2;
  const fovVerticalRad = (40 * Math.PI) / 180;
  const tanHalfFov = Math.tan(fovVerticalRad / 2);

  // In top-down view, horizontal visible width = 2 * distance * tanHalfFov * aspect
  // distance = targetWorldWidth / (2 * tanHalfFov * aspect)
  const requiredDist = (targetWorldWidth / 2) / (tanHalfFov * Math.min(aspect, 0.72));

  return {
    position: { x: 0, y: Math.max(26, requiredDist), z: 0.001 },
    lookAt: { x: 0, y: 0, z: 0 }
  };
}
