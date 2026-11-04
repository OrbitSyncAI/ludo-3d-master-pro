/**
 * Ludo 3D Pro - Direct Flat Top-Down Orthogonal View (Like Ludo King)
 * Zero Perspective Distortion, 100% Symmetrical, Pixel-Perfect Centered
 */

// Calculate perfect top-down camera height so the 16.6 unit board fills ~95% of mobile screen like Ludo King
export function calculateLudoKingCamera(width, height) {
  const aspect = width / height;
  
  // Board width is 16.6 units. 16.0 target world width brings board flush edge-to-edge
  const targetWorldWidth = 16.0;
  const fovVerticalRad = (38 * Math.PI) / 180;
  const tanHalfFov = Math.tan(fovVerticalRad / 2);

  // In top-down view, horizontal visible width = 2 * distance * tanHalfFov * aspect
  const requiredDist = (targetWorldWidth / 2) / (tanHalfFov * Math.min(aspect, 0.60));

  return {
    position: { x: 0, y: Math.max(20.5, requiredDist), z: 0.0001 },
    lookAt: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: -1 }
  };
}
