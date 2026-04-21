import { useSmokeWebGL } from '../model/useSmokeWebGL';

export const SmokeWebGL = () => {
  const { canvasRef } = useSmokeWebGL();

  return <canvas ref={canvasRef} id="smoke-webgl" className="block h-full w-full" />;
};
