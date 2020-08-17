// @flow
import { Group } from '../..';

jest.mock('../..', () => {
  const mod = jest.requireActual('../..');
  expect(mod.Group).toBeDefined();
  return mod;
});

describe('navigation-next-tests', () => {
  it('passes without blowing up', () => {
    expect(Group).toBeDefined();
  });
});
