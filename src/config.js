import { defineProperty } from './utils';

export const CACHE_KEY = 'NAVIGATION_RECORD';

const STACK_MODE = 'stack';
const CACHE_MODE = 'cache';

const config = {
  key: '_sk',
  mode: STACK_MODE, // stack|cache
  keepAlive: true,
  localCache: false,
  disableFirstActivated: true
};

defineProperty(config, STACK_MODE, {
  get() {
    return this.mode == STACK_MODE || this.mode != CACHE_MODE;
  }
});

export default config;
