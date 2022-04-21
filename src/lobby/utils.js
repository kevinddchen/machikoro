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

/* Name generating fuctions */

export function expansion_name(expr) {
  switch (expr) {
    case 'base':
      return 'Base Game';
    case 'harbor':
      return 'Harbor Expansion';
    default:
      return '??? Expansion';
  }
}

export function supplyVariant_name(expr) {
  switch (expr) {
    case 'hybrid':
      return 'Hybrid Supply';
    case 'variable':
      return 'Variable Supply';
    case 'total':
      return 'Total Supply';
    default:
      return '??? Supply Variant';
  }
}