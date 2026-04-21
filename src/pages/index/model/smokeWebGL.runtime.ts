type FluidGL = WebGLRenderingContext & WebGL2RenderingContext;

type Color = {
  r: number;
  g: number;
  b: number;
};

type ClearColor = Color & {
  a: number;
};

type Pointer = {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: Color;
};

type SupportedFormat = {
  internalFormat: number;
  format: number;
};

type TextureFormat = SupportedFormat & {
  type: number;
};

type TextureConfig = TextureFormat & {
  filter: number;
};

type Resolution = {
  width: number;
  height: number;
};

type UniformMap = Record<string, WebGLUniformLocation | null>;

type TextureAttachment = {
  texture: WebGLTexture | null;
  width: number;
  height: number;
  attach: (id: number) => number;
};

type FramebufferObject = TextureAttachment & {
  fbo: WebGLFramebuffer | null;
  texelSizeX: number;
  texelSizeY: number;
};

type DoubleFramebufferObject = {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FramebufferObject;
  write: FramebufferObject;
  swap: () => void;
};

type ExtensionInfo = {
  formatRGBA: SupportedFormat;
  formatRG: SupportedFormat;
  formatR: SupportedFormat;
  halfFloatTexType: number;
  supportLinearFiltering: boolean;
};

type WebGLContextInfo = {
  gl: FluidGL;
  ext: ExtensionInfo;
};

type SimulationConfig = {
  SIM_RESOLUTION: number;
  DYE_RESOLUTION: number;
  DENSITY_DISSIPATION: number;
  VELOCITY_DISSIPATION: number;
  PRESSURE: number;
  PRESSURE_ITERATIONS: number;
  CURL: number;
  SPLAT_RADIUS: number;
  SPLAT_FORCE: number;
  SHADING: boolean;
  COLORFUL: boolean;
  COLOR_UPDATE_SPEED: number;
  PAUSED: boolean;
  BACK_COLOR: Color;
  TRANSPARENT: boolean;
  BLOOM: boolean;
  BLOOM_ITERATIONS: number;
  BLOOM_RESOLUTION: number;
  BLOOM_INTENSITY: number;
  BLOOM_THRESHOLD: number;
  BLOOM_SOFT_KNEE: number;
  SUNRAYS: boolean;
  SUNRAYS_RESOLUTION: number;
  SUNRAYS_WEIGHT: number;
};

type SplatPayload = {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: Color;
};

type PointerDownPayload = {
  id: number;
  posX: number;
  posY: number;
};

const createPointer = (): Pointer => ({
  id: -1,
  texcoordX: 0,
  texcoordY: 0,
  prevTexcoordX: 0,
  prevTexcoordY: 0,
  deltaX: 0,
  deltaY: 0,
  down: false,
  moved: false,
  color: { r: 30, g: 0, b: 300 },
});

const assertValue = <Value>(
  value: Value | null | undefined,
  message: string,
): Value => {
  if (value == null) {
    throw new Error(message);
  }

  return value;
};

export const initSmokeWebGLRuntime = (
  canvas: HTMLCanvasElement,
): VoidFunction => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const IDLE_EFFECTS_DELAY_MS = 1200;
  const IDLE_EFFECTS_FADE_MS = 1800;
  const IDLE_DENSITY_DISSIPATION = 4;
  const IDLE_VELOCITY_DISSIPATION = 1.25;
  const IDLE_EFFECTS_THRESHOLD = 0.85;

  // Simulation section
  let animationFrameId: number | null = null;
  let isDestroyed = false;
  resizeCanvas();

  const config: SimulationConfig = {
    SIM_RESOLUTION: 128,
    DYE_RESOLUTION: 1024,
    DENSITY_DISSIPATION: 1,
    VELOCITY_DISSIPATION: 0.2,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: 30,
    SPLAT_RADIUS: 0.25,
    SPLAT_FORCE: 6000,
    SHADING: true,
    COLORFUL: true,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 9, g: 11, b: 12 },
    TRANSPARENT: true,
    BLOOM: true,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: true,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
  };

  const getClearColor = (): ClearColor =>
    config.TRANSPARENT
      ? { r: 0, g: 0, b: 0, a: 0 }
      : { ...normalizeColor(config.BACK_COLOR), a: 1 };

  const pointers: Pointer[] = [createPointer()];
  const splatStack: number[] = [];

  const context = getWebGLContext(canvas);
  if (context == null) {
    return () => {};
  }
  const { gl, ext } = context;

  if (isMobile()) {
    config.DYE_RESOLUTION = 512;
  }
  if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 512;
    config.SHADING = false;
    config.BLOOM = false;
    config.SUNRAYS = false;
  }

  function getWebGLContext(
    targetCanvas: HTMLCanvasElement,
  ): WebGLContextInfo | null {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    let contextGl = targetCanvas.getContext('webgl2', params) as FluidGL | null;
    const isWebGL2 = contextGl != null;
    if (!isWebGL2) {
      contextGl = (targetCanvas.getContext('webgl', params) ||
        targetCanvas.getContext(
          'experimental-webgl',
          params,
        )) as FluidGL | null;
    }

    if (contextGl == null) {
      return null;
    }

    let halfFloat: OES_texture_half_float | null = null;
    let supportLinearFiltering = false;
    if (isWebGL2) {
      contextGl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering =
        contextGl.getExtension('OES_texture_float_linear') != null;
    } else {
      halfFloat = contextGl.getExtension('OES_texture_half_float');
      supportLinearFiltering =
        contextGl.getExtension('OES_texture_half_float_linear') != null;
      if (halfFloat == null) {
        return null;
      }
    }

    const clearColor = getClearColor();
    contextGl.clearColor(
      clearColor.r,
      clearColor.g,
      clearColor.b,
      clearColor.a,
    );

    const halfFloatTexType = isWebGL2
      ? contextGl.HALF_FLOAT
      : assertValue(halfFloat, 'Half float extension is unavailable.')
          .HALF_FLOAT_OES;

    const formatRGBA = isWebGL2
      ? getSupportedFormat(contextGl, {
          internalFormat: contextGl.RGBA16F,
          format: contextGl.RGBA,
          type: halfFloatTexType,
        })
      : getSupportedFormat(contextGl, {
          internalFormat: contextGl.RGBA,
          format: contextGl.RGBA,
          type: halfFloatTexType,
        });
    const formatRG = isWebGL2
      ? getSupportedFormat(contextGl, {
          internalFormat: contextGl.RG16F,
          format: contextGl.RG,
          type: halfFloatTexType,
        })
      : getSupportedFormat(contextGl, {
          internalFormat: contextGl.RGBA,
          format: contextGl.RGBA,
          type: halfFloatTexType,
        });
    const formatR = isWebGL2
      ? getSupportedFormat(contextGl, {
          internalFormat: contextGl.R16F,
          format: contextGl.RED,
          type: halfFloatTexType,
        })
      : getSupportedFormat(contextGl, {
          internalFormat: contextGl.RGBA,
          format: contextGl.RGBA,
          type: halfFloatTexType,
        });

    if (formatRGBA == null || formatRG == null || formatR == null) {
      return null;
    }

    return {
      gl: contextGl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    };
  }

  function getSupportedFormat(
    contextGl: FluidGL,
    textureFormat: TextureFormat,
  ): SupportedFormat | null {
    if (!supportRenderTextureFormat(contextGl, textureFormat)) {
      switch (textureFormat.internalFormat) {
        case contextGl.R16F:
          return getSupportedFormat(contextGl, {
            internalFormat: contextGl.RG16F,
            format: contextGl.RG,
            type: textureFormat.type,
          });
        case contextGl.RG16F:
          return getSupportedFormat(contextGl, {
            internalFormat: contextGl.RGBA16F,
            format: contextGl.RGBA,
            type: textureFormat.type,
          });
        default:
          return null;
      }
    }

    return {
      internalFormat: textureFormat.internalFormat,
      format: textureFormat.format,
    };
  }

  function supportRenderTextureFormat(
    contextGl: FluidGL,
    textureFormat: TextureFormat,
  ): boolean {
    const texture = contextGl.createTexture();
    contextGl.bindTexture(contextGl.TEXTURE_2D, texture);
    contextGl.texParameteri(
      contextGl.TEXTURE_2D,
      contextGl.TEXTURE_MIN_FILTER,
      contextGl.NEAREST,
    );
    contextGl.texParameteri(
      contextGl.TEXTURE_2D,
      contextGl.TEXTURE_MAG_FILTER,
      contextGl.NEAREST,
    );
    contextGl.texParameteri(
      contextGl.TEXTURE_2D,
      contextGl.TEXTURE_WRAP_S,
      contextGl.CLAMP_TO_EDGE,
    );
    contextGl.texParameteri(
      contextGl.TEXTURE_2D,
      contextGl.TEXTURE_WRAP_T,
      contextGl.CLAMP_TO_EDGE,
    );
    contextGl.texImage2D(
      contextGl.TEXTURE_2D,
      0,
      textureFormat.internalFormat,
      4,
      4,
      0,
      textureFormat.format,
      textureFormat.type,
      null,
    );

    const fbo = contextGl.createFramebuffer();
    contextGl.bindFramebuffer(contextGl.FRAMEBUFFER, fbo);
    contextGl.framebufferTexture2D(
      contextGl.FRAMEBUFFER,
      contextGl.COLOR_ATTACHMENT0,
      contextGl.TEXTURE_2D,
      texture,
      0,
    );

    const status = contextGl.checkFramebufferStatus(contextGl.FRAMEBUFFER);
    return status === contextGl.FRAMEBUFFER_COMPLETE;
  }

  function isMobile(): boolean {
    return /Mobi|Android/i.test(navigator.userAgent);
  }

  class Material {
    vertexShader: WebGLShader;
    fragmentShaderSource: string;
    programs: Map<number, WebGLProgram>;
    activeProgram: WebGLProgram | null;
    uniforms: UniformMap;

    constructor(vertexShader: WebGLShader, fragmentShaderSource: string) {
      this.vertexShader = vertexShader;
      this.fragmentShaderSource = fragmentShaderSource;
      this.programs = new Map<number, WebGLProgram>();
      this.activeProgram = null;
      this.uniforms = {};
    }

    setKeywords(keywords: string[]): void {
      let hash = 0;
      for (let i = 0; i < keywords.length; i++) {
        hash += hashCode(keywords[i]);
      }

      let program = this.programs.get(hash);
      if (program == null) {
        const fragmentShader = compileShader(
          gl.FRAGMENT_SHADER,
          this.fragmentShaderSource,
          keywords,
        );
        program = createProgram(this.vertexShader, fragmentShader);
        this.programs.set(hash, program);
      }

      if (program === this.activeProgram) {
        return;
      }

      this.uniforms = getUniforms(program);
      this.activeProgram = program;
    }

    bind(): void {
      gl.useProgram(this.activeProgram);
    }
  }

  class Program {
    uniforms: UniformMap;
    program: WebGLProgram;

    constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
      this.uniforms = {};
      this.program = createProgram(vertexShader, fragmentShader);
      this.uniforms = getUniforms(this.program);
    }

    bind(): void {
      gl.useProgram(this.program);
    }
  }

  function createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader,
  ): WebGLProgram {
    const program = assertValue(
      gl.createProgram(),
      'Failed to create WebGL program.',
    );
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(
        gl.getProgramInfoLog(program) ?? 'Failed to link WebGL program.',
      );
    }

    return program;
  }

  function getUniforms(program: WebGLProgram): UniformMap {
    const uniforms: UniformMap = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformInfo = gl.getActiveUniform(program, i);
      if (uniformInfo == null) {
        continue;
      }

      uniforms[uniformInfo.name] = gl.getUniformLocation(
        program,
        uniformInfo.name,
      );
    }

    return uniforms;
  }

  function compileShader(
    type: number,
    source: string,
    keywords: string[] | null = null,
  ): WebGLShader {
    const shaderSource = addKeywords(source, keywords);

    const shader = assertValue(
      gl.createShader(type),
      'Failed to create WebGL shader.',
    );
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(
        gl.getShaderInfoLog(shader) ?? 'Failed to compile WebGL shader.',
      );
    }

    return shader;
  }

  function addKeywords(source: string, keywords: string[] | null): string {
    if (keywords == null) {
      return source;
    }

    let keywordsString = '';
    keywords.forEach((keyword) => {
      keywordsString += `#define ${keyword}\n`;
    });

    return keywordsString + source;
  }

  const baseVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`,
  );

  const blurVertexShader = compileShader(
    gl.VERTEX_SHADER,
    `
    precision highp float;
    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;
    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`,
  );

  const blurShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;
    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`,
  );

  const copyShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`,
  );

  const clearShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;
    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`,
  );

  const colorShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    uniform vec4 color;
    void main () {
        gl_FragColor = color;
    }
`,
  );

  const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform vec2 texelSize;
    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }
    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;
        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);
        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);
        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif
    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif
    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif
    #ifdef BLOOM
        float bloomMax = max(bloom.r, max(bloom.g, bloom.b));
        if (bloomMax > 0.001) {
            bloom = linearToGamma(bloom);
            c += bloom;
        }
    #endif
        float a = max(c.r, max(c.g, c.b));
        if (a < 0.0015) {
            gl_FragColor = vec4(0.0);
        } else {
            gl_FragColor = vec4(c, a);
        }
    }
`;

  const bloomPrefilterShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;
    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`,
  );

  const bloomBlurShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`,
  );

  const bloomFinalShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;
    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`,
  );

  const sunraysMaskShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`,
  );

  const sunraysShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;
    #define ITERATIONS 16
    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;
        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;
        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;
        float color = texture2D(uTexture, vUv).a;
        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }
        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`,
  );

  const splatShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;
    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`,
  );

  const advectionShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;
    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;
        vec2 iuv = floor(st);
        vec2 fuv = fract(st);
        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }
    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING'],
  );

  const divergenceShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;
        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }
        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`,
  );

  const curlShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`,
  );

  const vorticityShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision highp float;
    precision highp sampler2D;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;
    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`,
  );

  const pressureShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`,
  );

  const gradientSubtractShader = compileShader(
    gl.FRAGMENT_SHADER,
    `
    precision mediump float;
    precision mediump sampler2D;
    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;
    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`,
  );

  const blit: (target: FramebufferObject | null, clear?: boolean) => void =
    (() => {
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
        gl.STATIC_DRAW,
      );
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ELEMENT_ARRAY_BUFFER,
        new Uint16Array([0, 1, 2, 0, 2, 3]),
        gl.STATIC_DRAW,
      );
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(0);

      return (target: FramebufferObject | null, clear = false): void => {
        if (target == null) {
          gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
          gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        } else {
          gl.viewport(0, 0, target.width, target.height);
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
          const clearColor = getClearColor();
          gl.clearColor(clearColor.r, clearColor.g, clearColor.b, clearColor.a);
          gl.clear(gl.COLOR_BUFFER_BIT);
        }
        // CHECK_FRAMEBUFFER_STATUS();
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
      };
    })();

  let dye: DoubleFramebufferObject | null = null;
  let velocity: DoubleFramebufferObject | null = null;
  let divergence: FramebufferObject | null = null;
  let curl: FramebufferObject | null = null;
  let pressure: DoubleFramebufferObject | null = null;
  let bloom: FramebufferObject | null = null;
  let bloomFramebuffers: FramebufferObject[] = [];
  let sunrays: FramebufferObject | null = null;
  let sunraysTemp: FramebufferObject | null = null;

  const blurProgram = new Program(blurVertexShader, blurShader);
  const copyProgram = new Program(baseVertexShader, copyShader);
  const clearProgram = new Program(baseVertexShader, clearShader);
  const colorProgram = new Program(baseVertexShader, colorShader);
  const bloomPrefilterProgram = new Program(
    baseVertexShader,
    bloomPrefilterShader,
  );
  const bloomBlurProgram = new Program(baseVertexShader, bloomBlurShader);
  const bloomFinalProgram = new Program(baseVertexShader, bloomFinalShader);
  const sunraysMaskProgram = new Program(baseVertexShader, sunraysMaskShader);
  const sunraysProgram = new Program(baseVertexShader, sunraysShader);
  const splatProgram = new Program(baseVertexShader, splatShader);
  const advectionProgram = new Program(baseVertexShader, advectionShader);
  const divergenceProgram = new Program(baseVertexShader, divergenceShader);
  const curlProgram = new Program(baseVertexShader, curlShader);
  const vorticityProgram = new Program(baseVertexShader, vorticityShader);
  const pressureProgram = new Program(baseVertexShader, pressureShader);
  const gradienSubtractProgram = new Program(
    baseVertexShader,
    gradientSubtractShader,
  );

  const displayMaterial = new Material(baseVertexShader, displayShaderSource);

  function initFramebuffers(): void {
    const simRes = getResolution(config.SIM_RESOLUTION);
    const dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const rg = ext.formatRG;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    const dyeConfig: TextureConfig = {
      internalFormat: rgba.internalFormat,
      format: rgba.format,
      type: texType,
      filter: filtering,
    };
    const velocityConfig: TextureConfig = {
      internalFormat: rg.internalFormat,
      format: rg.format,
      type: texType,
      filter: filtering,
    };
    const scalarConfig: TextureConfig = {
      internalFormat: r.internalFormat,
      format: r.format,
      type: texType,
      filter: gl.NEAREST,
    };

    gl.disable(gl.BLEND);

    if (dye == null) {
      dye = createDoubleFBO(dyeRes, dyeConfig);
    } else {
      dye = resizeDoubleFBO(dye, dyeRes, dyeConfig);
    }

    if (velocity == null) {
      velocity = createDoubleFBO(simRes, velocityConfig);
    } else {
      velocity = resizeDoubleFBO(velocity, simRes, velocityConfig);
    }

    divergence = createFBO(simRes, scalarConfig);
    curl = createFBO(simRes, scalarConfig);
    pressure = createDoubleFBO(simRes, scalarConfig);

    initBloomFramebuffers();
    initSunraysFramebuffers();
  }

  function initBloomFramebuffers(): void {
    const res = getResolution(config.BLOOM_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    const bloomConfig: TextureConfig = {
      internalFormat: rgba.internalFormat,
      format: rgba.format,
      type: texType,
      filter: filtering,
    };

    bloom = createFBO(res, bloomConfig);

    bloomFramebuffers.length = 0;
    for (let i = 0; i < config.BLOOM_ITERATIONS; i++) {
      const width = res.width >> (i + 1);
      const height = res.height >> (i + 1);

      if (width < 2 || height < 2) {
        break;
      }

      const fbo = createFBO({ width, height }, bloomConfig);
      bloomFramebuffers.push(fbo);
    }
  }

  function initSunraysFramebuffers(): void {
    const res = getResolution(config.SUNRAYS_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
    const sunraysConfig: TextureConfig = {
      internalFormat: r.internalFormat,
      format: r.format,
      type: texType,
      filter: filtering,
    };

    sunrays = createFBO(res, sunraysConfig);
    sunraysTemp = createFBO(res, sunraysConfig);
  }

  function createFBO(
    size: Resolution,
    textureConfig: TextureConfig,
  ): FramebufferObject {
    const { width, height } = size;
    const { internalFormat, format, type, filter } = textureConfig;

    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      width,
      height,
      0,
      format,
      type,
      null,
    );

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      texture,
      0,
    );
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const texelSizeX = 1.0 / width;
    const texelSizeY = 1.0 / height;

    return {
      texture,
      fbo,
      width,
      height,
      texelSizeX,
      texelSizeY,
      attach(id: number): number {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  function createDoubleFBO(
    size: Resolution,
    textureConfig: TextureConfig,
  ): DoubleFramebufferObject {
    let fbo1 = createFBO(size, textureConfig);
    let fbo2 = createFBO(size, textureConfig);

    return {
      width: size.width,
      height: size.height,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      get read() {
        return fbo1;
      },
      set read(value: FramebufferObject) {
        fbo1 = value;
      },
      get write() {
        return fbo2;
      },
      set write(value: FramebufferObject) {
        fbo2 = value;
      },
      swap(): void {
        const temp = fbo1;
        fbo1 = fbo2;
        fbo2 = temp;
      },
    };
  }

  function resizeFBO(
    target: FramebufferObject,
    size: Resolution,
    textureConfig: TextureConfig,
  ): FramebufferObject {
    const newFBO = createFBO(size, textureConfig);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
  }

  function resizeDoubleFBO(
    target: DoubleFramebufferObject,
    size: Resolution,
    textureConfig: TextureConfig,
  ): DoubleFramebufferObject {
    if (target.width === size.width && target.height === size.height) {
      return target;
    }

    target.read = resizeFBO(target.read, size, textureConfig);
    target.write = createFBO(size, textureConfig);
    target.width = size.width;
    target.height = size.height;
    target.texelSizeX = 1.0 / size.width;
    target.texelSizeY = 1.0 / size.height;
    return target;
  }

  const getDye = (): DoubleFramebufferObject =>
    assertValue(dye, 'Dye framebuffer is not initialized.');

  const getVelocity = (): DoubleFramebufferObject =>
    assertValue(velocity, 'Velocity framebuffer is not initialized.');

  const getDivergence = (): FramebufferObject =>
    assertValue(divergence, 'Divergence framebuffer is not initialized.');

  const getCurl = (): FramebufferObject =>
    assertValue(curl, 'Curl framebuffer is not initialized.');

  const getPressure = (): DoubleFramebufferObject =>
    assertValue(pressure, 'Pressure framebuffer is not initialized.');

  const getBloom = (): FramebufferObject =>
    assertValue(bloom, 'Bloom framebuffer is not initialized.');

  const getSunrays = (): FramebufferObject =>
    assertValue(sunrays, 'Sunrays framebuffer is not initialized.');

  const getSunraysTemp = (): FramebufferObject =>
    assertValue(
      sunraysTemp,
      'Temporary sunrays framebuffer is not initialized.',
    );

  let isBloomEnabled = false;
  let isSunraysEnabled = false;
  let lastInteractionTime = 0;
  let idleCleared = true;

  function updateKeywords(): void {
    const displayKeywords: string[] = [];
    if (config.SHADING) {
      displayKeywords.push('SHADING');
    }
    if (isBloomEnabled) {
      displayKeywords.push('BLOOM');
    }
    if (isSunraysEnabled) {
      displayKeywords.push('SUNRAYS');
    }
    displayMaterial.setKeywords(displayKeywords);
  }

  function syncPostEffects(idleMix: number): void {
    const shouldEnableEffects = idleMix < IDLE_EFFECTS_THRESHOLD;
    const nextBloomEnabled = config.BLOOM && shouldEnableEffects;
    const nextSunraysEnabled = config.SUNRAYS && shouldEnableEffects;

    if (
      nextBloomEnabled === isBloomEnabled &&
      nextSunraysEnabled === isSunraysEnabled
    ) {
      return;
    }

    isBloomEnabled = nextBloomEnabled;
    isSunraysEnabled = nextSunraysEnabled;
    updateKeywords();
  }

  updateKeywords();
  initFramebuffers();
  // Kick off the simulation with the same burst the legacy version had.
  multipleSplats(Math.floor(Math.random() * 20) + 5);

  let lastUpdateTime = Date.now();
  let colorUpdateTimer = 0.0;
  update();

  function update(): void {
    if (isDestroyed) {
      return;
    }

    const dt = calcDeltaTime();
    if (resizeCanvas()) {
      initFramebuffers();
    }
    const idleMix = getIdleMix();
    syncPostEffects(idleMix);
    updateColors(dt);
    applyInputs();
    if (!config.PAUSED) {
      step(dt, idleMix);
    }
    if (idleMix >= 1 && !idleCleared) {
      clearSimulation();
      idleCleared = true;
    }
    render(null);
    animationFrameId = requestAnimationFrame(update);
  }

  function calcDeltaTime(): number {
    const now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
  }

  function getIdleMix(): number {
    const idleElapsed =
      Date.now() - lastInteractionTime - IDLE_EFFECTS_DELAY_MS;

    return clamp(idleElapsed / IDLE_EFFECTS_FADE_MS, 0, 1);
  }

  function resizeCanvas(): boolean {
    const width = scaleByPixelRatio(canvas.clientWidth);
    const height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      return true;
    }
    return false;
  }

  function updateColors(dt: number): void {
    if (!config.COLORFUL) {
      return;
    }

    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
      colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
      pointers.forEach((p) => {
        p.color = generateColor();
      });
    }
  }

  function applyInputs(): void {
    const nextSplatAmount = splatStack.pop();
    if (nextSplatAmount != null) {
      multipleSplats(nextSplatAmount);
    }

    pointers.forEach((p) => {
      if (p.moved) {
        p.moved = false;
        splatPointer(p);
      }
    });
  }

  function step(dt: number, idleMix: number): void {
    const currentVelocity = getVelocity();
    const currentCurl = getCurl();
    const currentDivergence = getDivergence();
    const currentPressure = getPressure();
    const currentDye = getDye();
    const velocityDissipation = mix(
      config.VELOCITY_DISSIPATION,
      IDLE_VELOCITY_DISSIPATION,
      idleMix,
    );
    const densityDissipation = mix(
      config.DENSITY_DISSIPATION,
      IDLE_DENSITY_DISSIPATION,
      idleMix,
    );

    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(
      curlProgram.uniforms.texelSize,
      currentVelocity.texelSizeX,
      currentVelocity.texelSizeY,
    );
    gl.uniform1i(
      curlProgram.uniforms.uVelocity,
      currentVelocity.read.attach(0),
    );
    blit(currentCurl);

    vorticityProgram.bind();
    gl.uniform2f(
      vorticityProgram.uniforms.texelSize,
      currentVelocity.texelSizeX,
      currentVelocity.texelSizeY,
    );
    gl.uniform1i(
      vorticityProgram.uniforms.uVelocity,
      currentVelocity.read.attach(0),
    );
    gl.uniform1i(vorticityProgram.uniforms.uCurl, currentCurl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(currentVelocity.write);
    currentVelocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(
      divergenceProgram.uniforms.texelSize,
      currentVelocity.texelSizeX,
      currentVelocity.texelSizeY,
    );
    gl.uniform1i(
      divergenceProgram.uniforms.uVelocity,
      currentVelocity.read.attach(0),
    );
    blit(currentDivergence);

    clearProgram.bind();
    gl.uniform1i(
      clearProgram.uniforms.uTexture,
      currentPressure.read.attach(0),
    );
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(currentPressure.write);
    currentPressure.swap();

    pressureProgram.bind();
    gl.uniform2f(
      pressureProgram.uniforms.texelSize,
      currentVelocity.texelSizeX,
      currentVelocity.texelSizeY,
    );
    gl.uniform1i(
      pressureProgram.uniforms.uDivergence,
      currentDivergence.attach(0),
    );
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
      gl.uniform1i(
        pressureProgram.uniforms.uPressure,
        currentPressure.read.attach(1),
      );
      blit(currentPressure.write);
      currentPressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(
      gradienSubtractProgram.uniforms.texelSize,
      currentVelocity.texelSizeX,
      currentVelocity.texelSizeY,
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uPressure,
      currentPressure.read.attach(0),
    );
    gl.uniform1i(
      gradienSubtractProgram.uniforms.uVelocity,
      currentVelocity.read.attach(1),
    );
    blit(currentVelocity.write);
    currentVelocity.swap();

    advectionProgram.bind();
    gl.uniform2f(
      advectionProgram.uniforms.texelSize,
      currentVelocity.texelSizeX,
      currentVelocity.texelSizeY,
    );
    if (!ext.supportLinearFiltering) {
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        currentVelocity.texelSizeX,
        currentVelocity.texelSizeY,
      );
    }
    const velocityId = currentVelocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, velocityDissipation);
    blit(currentVelocity.write);
    currentVelocity.swap();

    if (!ext.supportLinearFiltering) {
      gl.uniform2f(
        advectionProgram.uniforms.dyeTexelSize,
        currentDye.texelSizeX,
        currentDye.texelSizeY,
      );
    }
    gl.uniform1i(
      advectionProgram.uniforms.uVelocity,
      currentVelocity.read.attach(0),
    );
    gl.uniform1i(advectionProgram.uniforms.uSource, currentDye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dissipation, densityDissipation);
    blit(currentDye.write);
    currentDye.swap();
  }

  function render(target: FramebufferObject | null): void {
    const currentDye = getDye();

    if (isBloomEnabled) {
      applyBloom(currentDye.read, getBloom());
    }
    if (isSunraysEnabled) {
      applySunrays(currentDye.read, currentDye.write, getSunrays());
      blur(getSunrays(), getSunraysTemp(), 1);
    }

    if (target == null || !config.TRANSPARENT) {
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.enable(gl.BLEND);
    } else {
      gl.disable(gl.BLEND);
    }

    if (!config.TRANSPARENT) {
      drawColor(target, normalizeColor(config.BACK_COLOR));
    }
    drawDisplay(target);
  }

  function drawColor(target: FramebufferObject | null, color: Color): void {
    colorProgram.bind();
    gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
    blit(target);
  }

  function drawDisplay(target: FramebufferObject | null): void {
    const currentDye = getDye();
    const width = target == null ? gl.drawingBufferWidth : target.width;
    const height = target == null ? gl.drawingBufferHeight : target.height;

    displayMaterial.bind();
    if (config.SHADING) {
      gl.uniform2f(
        displayMaterial.uniforms.texelSize,
        1.0 / width,
        1.0 / height,
      );
    }
    gl.uniform1i(displayMaterial.uniforms.uTexture, currentDye.read.attach(0));
    if (isBloomEnabled) {
      gl.uniform1i(displayMaterial.uniforms.uBloom, getBloom().attach(1));
    }
    if (isSunraysEnabled) {
      gl.uniform1i(displayMaterial.uniforms.uSunrays, getSunrays().attach(3));
    }
    blit(target);
  }

  function clearFramebuffer(target: FramebufferObject | null): void {
    if (target == null) {
      return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    gl.viewport(0, 0, target.width, target.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  function clearDoubleFramebuffer(
    target: DoubleFramebufferObject | null,
  ): void {
    if (target == null) {
      return;
    }

    clearFramebuffer(target.read);
    clearFramebuffer(target.write);
  }

  function clearSimulation(): void {
    gl.disable(gl.BLEND);
    clearDoubleFramebuffer(dye);
    clearDoubleFramebuffer(velocity);
    clearFramebuffer(divergence);
    clearFramebuffer(curl);
    clearDoubleFramebuffer(pressure);
    clearFramebuffer(bloom);
    bloomFramebuffers.forEach((framebuffer) => {
      clearFramebuffer(framebuffer);
    });
    clearFramebuffer(sunrays);
    clearFramebuffer(sunraysTemp);
  }

  function applyBloom(
    source: FramebufferObject,
    destination: FramebufferObject,
  ): void {
    if (bloomFramebuffers.length < 2) {
      return;
    }

    let last = destination;

    gl.disable(gl.BLEND);
    bloomPrefilterProgram.bind();
    let knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
    let curve0 = config.BLOOM_THRESHOLD - knee;
    let curve1 = knee * 2;
    let curve2 = 0.25 / knee;
    gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    gl.uniform1f(
      bloomPrefilterProgram.uniforms.threshold,
      config.BLOOM_THRESHOLD,
    );
    gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    blit(last);

    bloomBlurProgram.bind();
    for (let i = 0; i < bloomFramebuffers.length; i++) {
      const dest = bloomFramebuffers[i];
      gl.uniform2f(
        bloomBlurProgram.uniforms.texelSize,
        last.texelSizeX,
        last.texelSizeY,
      );
      gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
      blit(dest);
      last = dest;
    }

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
      const baseTex = bloomFramebuffers[i];
      gl.uniform2f(
        bloomBlurProgram.uniforms.texelSize,
        last.texelSizeX,
        last.texelSizeY,
      );
      gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
      gl.viewport(0, 0, baseTex.width, baseTex.height);
      blit(baseTex);
      last = baseTex;
    }

    gl.disable(gl.BLEND);
    bloomFinalProgram.bind();
    gl.uniform2f(
      bloomFinalProgram.uniforms.texelSize,
      last.texelSizeX,
      last.texelSizeY,
    );
    gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
    gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
    blit(destination);
  }

  function applySunrays(
    source: FramebufferObject,
    mask: FramebufferObject,
    destination: FramebufferObject,
  ): void {
    gl.disable(gl.BLEND);
    sunraysMaskProgram.bind();
    gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, source.attach(0));
    blit(mask);

    sunraysProgram.bind();
    gl.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT);
    gl.uniform1i(sunraysProgram.uniforms.uTexture, mask.attach(0));
    blit(destination);
  }

  function blur(
    target: FramebufferObject,
    temp: FramebufferObject,
    iterations: number,
  ): void {
    blurProgram.bind();
    for (let i = 0; i < iterations; i++) {
      gl.uniform2f(blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
      gl.uniform1i(blurProgram.uniforms.uTexture, target.attach(0));
      blit(temp);

      gl.uniform2f(blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
      gl.uniform1i(blurProgram.uniforms.uTexture, temp.attach(0));
      blit(target);
    }
  }

  function splatPointer(pointer: Pointer): void {
    const dx = pointer.deltaX * config.SPLAT_FORCE;
    const dy = pointer.deltaY * config.SPLAT_FORCE;

    splat({
      x: pointer.texcoordX,
      y: pointer.texcoordY,
      dx,
      dy,
      color: pointer.color,
    });
  }

  function multipleSplats(amount: number): void {
    for (let i = 0; i < amount; i++) {
      const color = generateColor();
      color.r *= 10.0;
      color.g *= 10.0;
      color.b *= 10.0;
      const x = Math.random();
      const y = Math.random();
      const dx = 1000 * (Math.random() - 0.5);
      const dy = 1000 * (Math.random() - 0.5);

      splat({ x, y, dx, dy, color });
    }
  }

  function splat({ x, y, dx, dy, color }: SplatPayload): void {
    lastInteractionTime = Date.now();
    idleCleared = false;

    const currentVelocity = getVelocity();
    const currentDye = getDye();

    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, currentVelocity.read.attach(0));
    gl.uniform1f(
      splatProgram.uniforms.aspectRatio,
      canvas.width / canvas.height,
    );
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(
      splatProgram.uniforms.radius,
      correctRadius(config.SPLAT_RADIUS / 100.0),
    );
    blit(currentVelocity.write);
    currentVelocity.swap();

    gl.uniform1i(splatProgram.uniforms.uTarget, currentDye.read.attach(0));
    gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
    blit(currentDye.write);
    currentDye.swap();
  }

  function correctRadius(radius: number): number {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) {
      radius *= aspectRatio;
    }

    return radius;
  }

  const handleMouseDown = (event: MouseEvent): void => {
    const posX = scaleByPixelRatio(event.offsetX);
    const posY = scaleByPixelRatio(event.offsetY);
    const pointer = pointers[0];

    updatePointerDownData(pointer, { id: -1, posX, posY });
  };

  const handleMouseMove = (event: MouseEvent): void => {
    const pointer = pointers[0];
    if (!pointer.down) {
      return;
    }

    const posX = scaleByPixelRatio(event.offsetX);
    const posY = scaleByPixelRatio(event.offsetY);
    updatePointerMoveData(pointer, posX, posY);
  };

  const handleMouseUp = (): void => {
    updatePointerUpData(pointers[0]);
  };

  const handleTouchStart = (event: TouchEvent): void => {
    event.preventDefault();
    const touches = event.targetTouches;
    while (touches.length >= pointers.length) {
      pointers.push(createPointer());
    }
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      const posX = scaleByPixelRatio(touch.pageX);
      const posY = scaleByPixelRatio(touch.pageY);

      updatePointerDownData(pointers[i + 1], {
        id: touch.identifier,
        posX,
        posY,
      });
    }
  };

  const handleTouchMove = (event: TouchEvent): void => {
    event.preventDefault();
    const touches = event.targetTouches;
    for (let i = 0; i < touches.length; i++) {
      const pointer = pointers[i + 1];
      if (!pointer.down) {
        continue;
      }

      const touch = touches[i];
      const posX = scaleByPixelRatio(touch.pageX);
      const posY = scaleByPixelRatio(touch.pageY);
      updatePointerMoveData(pointer, posX, posY);
    }
  };

  const handleTouchEnd = (event: TouchEvent): void => {
    const touches = event.changedTouches;
    for (let i = 0; i < touches.length; i++) {
      const pointer = pointers.find((p) => p.id === touches[i].identifier);
      if (pointer == null) {
        continue;
      }

      updatePointerUpData(pointer);
    }
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (event.code === 'KeyP') {
      config.PAUSED = !config.PAUSED;
    }
    if (event.key === ' ') {
      splatStack.push(Math.floor(Math.random() * 20) + 5);
    }
  };

  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('touchstart', handleTouchStart);
  canvas.addEventListener('touchmove', handleTouchMove, false);
  window.addEventListener('touchend', handleTouchEnd);
  window.addEventListener('keydown', handleKeyDown);

  function updatePointerDownData(
    pointer: Pointer,
    { id, posX, posY }: PointerDownPayload,
  ): void {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor();
  }

  function updatePointerMoveData(
    pointer: Pointer,
    posX: number,
    posY: number,
  ): void {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved =
      Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
  }

  function updatePointerUpData(pointer: Pointer): void {
    pointer.down = false;
  }

  function correctDeltaX(delta: number): number {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) {
      delta *= aspectRatio;
    }

    return delta;
  }

  function correctDeltaY(delta: number): number {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) {
      delta /= aspectRatio;
    }

    return delta;
  }

  function generateColor(): Color {
    const color = hsvToRgb(Math.random(), 1.0, 1.0);
    color.r *= 0.15;
    color.g *= 0.15;
    color.b *= 0.15;
    return color;
  }

  function hsvToRgb(h: number, s: number, v: number): Color {
    let r = 0;
    let g = 0;
    let b = 0;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
      case 0:
        r = v;
        g = t;
        b = p;
        break;
      case 1:
        r = q;
        g = v;
        b = p;
        break;
      case 2:
        r = p;
        g = v;
        b = t;
        break;
      case 3:
        r = p;
        g = q;
        b = v;
        break;
      case 4:
        r = t;
        g = p;
        b = v;
        break;
      case 5:
        r = v;
        g = p;
        b = q;
        break;
      default:
        break;
    }

    return {
      r,
      g,
      b,
    };
  }

  function normalizeColor(input: Color): Color {
    return {
      r: input.r / 255,
      g: input.g / 255,
      b: input.b / 255,
    };
  }

  function wrap(value: number, min: number, max: number): number {
    const range = max - min;
    if (range === 0) {
      return min;
    }

    return ((value - min) % range) + min;
  }

  function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  function mix(from: number, to: number, amount: number): number {
    return from + (to - from) * amount;
  }

  function getResolution(resolution: number): Resolution {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1) {
      aspectRatio = 1.0 / aspectRatio;
    }

    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);

    if (gl.drawingBufferWidth > gl.drawingBufferHeight) {
      return { width: max, height: min };
    }

    return { width: min, height: max };
  }

  function scaleByPixelRatio(input: number): number {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  function hashCode(value: string): number {
    if (value.length === 0) {
      return 0;
    }

    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }

    return hash;
  }

  return () => {
    isDestroyed = true;

    if (animationFrameId != null) {
      cancelAnimationFrame(animationFrameId);
    }

    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove, false);
    window.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('keydown', handleKeyDown);
  };
};
