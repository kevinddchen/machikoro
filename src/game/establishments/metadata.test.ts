import { expect, test } from '@jest/globals';

import { Expansion, Version } from '../types';
import { _BASE_ESTABLISHMENTS, _ESTABLISHMENTS, _HARBOR_ESTABLISHMENTS, _MILLION_ESTABLISHMENTS } from './metadata';
import { _ESTABLISHMENTS2 } from './metadata2';

test('correct count', () => {
  expect(_ESTABLISHMENTS.length).toBe(39);
  expect(_BASE_ESTABLISHMENTS.length).toBe(15);
  expect(_HARBOR_ESTABLISHMENTS.length).toBe(10);
  expect(_MILLION_ESTABLISHMENTS.length).toBe(14);
  expect(_ESTABLISHMENTS2.length).toBe(20);
});

test('valid fields', () => {
  for (const est of _ESTABLISHMENTS) {
    expect(est.version).toBe(Version.MK1);
    expect(est.rolls.length).toBeGreaterThanOrEqual(1);
  }
  for (const est of _ESTABLISHMENTS2) {
    expect(est.version).toBe(Version.MK2);
    expect(est.expansion).toBe(Expansion.Base);
    expect(est.rolls.length).toBeGreaterThanOrEqual(1);
  }
});

test('establishment ids are in order', () => {
  for (const est_list of [_ESTABLISHMENTS, _ESTABLISHMENTS2]) {
    for (let i = 0; i < est_list.length; i++) {
      expect(est_list[i]._id).toBe(i);
    }
  }
});
