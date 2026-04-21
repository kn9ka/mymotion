import { initSmokeWebGLRuntime } from './smokeWebGL.runtime';

export const initSmokeWebGL = (canvas: HTMLCanvasElement): VoidFunction =>
  initSmokeWebGLRuntime(canvas);
