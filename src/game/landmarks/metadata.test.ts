import { expect, test } from '@jest/globals';

import { CityHall2, LoanOffice2, _LANDMARKS2 } from './metadata2';
import { Expansion, Version } from '../types';
import { _BASE_LANDMARKS, _HARBOR_LANDMARKS, _LANDMARKS } from './metadata';

test('correct count', () => {
  expect(_LANDMARKS.length).toBe(7);
  expect(_BASE_LANDMARKS.length).toBe(4);
  expect(_HARBOR_LANDMARKS.length).toBe(3);
  expect(_LANDMARKS2.length).toBe(21);
});

test('valid fields', () => {
  for (const land of _LANDMARKS) {
    expect(land.version).toBe(Version.MK1);
    expect(land.cost.length).toBe(1);
  }
  for (const land of _LANDMARKS2) {
    expect(land.version).toBe(Version.MK2);
    expect(land.expansion).toBe(Expansion.Base);
    if (land !== CityHall2 && land !== LoanOffice2) {
      expect(land.cost.length).toBe(3);
    } else {
      expect(land.cost.length).toBe(1);
    }
  }
});

test('establishment ids are in order', () => {
  for (const land_list of [_LANDMARKS, _LANDMARKS2]) {
    for (let i = 0; i < land_list.length; i++) {
      expect(land_list[i]._id).toBe(i);
    }
  }
});
