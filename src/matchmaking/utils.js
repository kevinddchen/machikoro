// This file contains some useful functions which are used in multiple places.

export function checkDifferent(a, b) {
  if (!a || !b || a.length !== b.length) {
    return true;
  }
  for (let i=0; i<a.length; i++) {
    if (a[i] !== b[i]) {
      return true;
    }
  }
  return false;
};