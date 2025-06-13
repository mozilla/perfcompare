/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
// @flow
//
import { TextDecoder, TextEncoder } from 'util';

import { TestEnvironment } from 'jest-environment-jsdom';

export default class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    // Register TextDecoder and TextEncoder with the global scope.
    // These are now available globally in nodejs, but not when running with jsdom
    // in jest apparently.
    // Still let's double check that they're from the global scope as expected, so
    // that this can be removed once it's implemented.
    if ('TextDecoder' in this.global) {
      throw new Error(
        'TextDecoder is already present in the global scope, please update custom-environment.js.',
      );
    }

    this.global.TextDecoder = TextDecoder;
    this.global.TextEncoder = TextEncoder;

    // Register ReadaleStream with the global scope. Request, Response and
    // fetch are already present in our current jsdom environment.
    // It is available globally in nodejs, but not yet when running with jsdom
    // in jest apparently.
    // Still let's double check that it's from the global scope as expected, so
    // that this can be removed once it's implemented.
    if ('ReadableStream' in this.global) {
      throw new Error(
        'ReadableStream is already present in the global scope, please update custom-environment.js.',
      );
    }
    this.global.ReadableStream = ReadableStream;
  }
}
