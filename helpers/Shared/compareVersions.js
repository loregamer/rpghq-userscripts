/**
 * Compare version strings (e.g., 1.2.3 vs 1.10.0)
 * @param {string} a - First version string
 * @param {string} b - Second version string
 * @returns {number} - Negative if a < b, positive if a > b, 0 if equal
 */
export function compareVersions(a, b) {
  const partsA = a.split(".").map(Number);
  const partsB = b.split(".").map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;

    if (numA !== numB) {
      return numA - numB;
    }
  }

  return 0;
}
