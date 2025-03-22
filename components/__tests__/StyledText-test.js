/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import renderer from 'react-test-renderer';
import { MonoText } from '../StyledText';

// Add eslint exceptions for Jest globals
/* global it, expect */

it(`renders correctly`, () => {
  const tree = renderer.create(<MonoText>Snapshot test!</MonoText>).toJSON();
  expect(tree).toMatchSnapshot();
});
