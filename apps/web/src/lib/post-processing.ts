import * as THREE from "three";

export interface PostProcessingEffect {
  id: string;
  name: string;
  enabled: boolean;
  uniforms: Record<string, { value: any; type: string }>;
}

export const BLOOM_EFFECT: PostProcessingEffect = {
  id: "bloom",
  name: "Bloom",
  enabled: false,
  uniforms: {
    intensity: { value: 0.8, type: "float" },
    threshold: { value: 0.6, type: "float" },
    radius: { value: 0.4, type: "float" },
  },
};

export const CHROMATIC_ABERRATION_EFFECT: PostProcessingEffect = {
  id: "chromatic-aberration",
  name: "Chromatic Aberration",
  enabled: false,
  uniforms: {
    offset: { value: 0.003, type: "float" },
  },
};

export const VIGNETTE_EFFECT: PostProcessingEffect = {
  id: "vignette",
  name: "Vignette",
  enabled: false,
  uniforms: {
    darkness: { value: 0.5, type: "float" },
    offset: { value: 1.0, type: "float" },
  },
};

export const NOISE_EFFECT: PostProcessingEffect = {
  id: "noise",
  name: "Film Grain",
  enabled: false,
  uniforms: {
    intensity: { value: 0.1, type: "float" },
  },
};

export const GLITCH_EFFECT: PostProcessingEffect = {
  id: "glitch",
  name: "Glitch",
  enabled: false,
  uniforms: {
    amount: { value: 0.5, type: "float" },
    speed: { value: 1.0, type: "float" },
  },
};

export const AVAILABLE_EFFECTS = [
  BLOOM_EFFECT,
  CHROMATIC_ABERRATION_EFFECT,
  VIGNETTE_EFFECT,
  NOISE_EFFECT,
  GLITCH_EFFECT,
];

// GLSL shaders for post-processing
export const POST_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const POST_FRAGMENT_SHADER = `
  uniform sampler2D tDiffuse;
  uniform float bloomIntensity;
  uniform float bloomThreshold;
  uniform float bloomRadius;
  uniform float chromaticOffset;
  uniform float vignetteDarkness;
  uniform float vignetteOffset;
  uniform float noiseIntensity;
  uniform float glitchAmount;
  uniform float glitchSpeed;
  uniform float time;
  varying vec2 vUv;

  // Random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec2 uv = vUv;

    // Glitch effect
    if (glitchAmount > 0.0) {
      float glitchTime = floor(time * glitchSpeed * 10.0);
      float glitchRandom = random(vec2(glitchTime, 0.0));
      if (glitchRandom > 0.95) {
        float glitchOffset = (random(vec2(glitchTime, uv.y)) - 0.5) * glitchAmount * 0.1;
        uv.x += glitchOffset;
      }
    }

    // Chromatic aberration
    float r = texture2D(tDiffuse, uv + vec2(chromaticOffset, 0.0)).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - vec2(chromaticOffset, 0.0)).b;
    vec3 color = vec3(r, g, b);

    // Bloom
    float brightness = dot(color, vec3(0.2126, 0.7152, 0.0722));
    if (brightness > bloomThreshold) {
      color += color * bloomIntensity * (brightness - bloomThreshold);
    }

    // Vignette
    float dist = distance(uv, vec2(0.5));
    float vignette = smoothstep(vignetteOffset, vignetteOffset - vignetteDarkness, dist);
    color *= vignette;

    // Film grain
    if (noiseIntensity > 0.0) {
      float grain = random(uv + time) * noiseIntensity;
      color += grain - noiseIntensity * 0.5;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

export class PostProcessor {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderTarget: THREE.WebGLRenderTarget;
  private material: THREE.ShaderMaterial;
  private mesh: THREE.Mesh;
  private enabledEffects: Map<string, boolean> = new Map();

  constructor(
    private renderer: THREE.WebGLRenderer,
    width: number,
    height: number
  ) {
    // Setup scene for post-processing
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Render target for input
    this.renderTarget = new THREE.WebGLRenderTarget(width, height);

    // Shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        bloomIntensity: { value: BLOOM_EFFECT.uniforms.intensity.value },
        bloomThreshold: { value: BLOOM_EFFECT.uniforms.threshold.value },
        bloomRadius: { value: BLOOM_EFFECT.uniforms.radius.value },
        chromaticOffset: { value: CHROMATIC_ABERRATION_EFFECT.uniforms.offset.value },
        vignetteDarkness: { value: VIGNETTE_EFFECT.uniforms.darkness.value },
        vignetteOffset: { value: VIGNETTE_EFFECT.uniforms.offset.value },
        noiseIntensity: { value: NOISE_EFFECT.uniforms.intensity.value },
        glitchAmount: { value: GLITCH_EFFECT.uniforms.amount.value },
        glitchSpeed: { value: GLITCH_EFFECT.uniforms.speed.value },
        time: { value: 0 },
      },
      vertexShader: POST_VERTEX_SHADER,
      fragmentShader: POST_FRAGMENT_SHADER,
    });

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  setSize(width: number, height: number) {
    this.renderTarget.setSize(width, height);
  }

  setEffectEnabled(effectId: string, enabled: boolean) {
    this.enabledEffects.set(effectId, enabled);
  }

  setEffectUniform(effectId: string, uniformName: string, value: any) {
    const uniform = this.material.uniforms[uniformName];
    if (uniform) {
      uniform.value = value;
    }
  }

  render(
    scene: THREE.Scene,
    camera: THREE.Camera,
    time: number = 0
  ) {
    // Check if any effects are enabled
    const anyEnabled = Array.from(this.enabledEffects.values()).some((v) => v);
    
    if (!anyEnabled) {
      // No effects, render directly
      this.renderer.render(scene, camera);
      return;
    }

    // Render scene to render target
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(scene, camera);
    this.renderer.setRenderTarget(null);

    // Apply post-processing
    this.material.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.material.uniforms.time.value = time;
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderTarget.dispose();
    this.material.dispose();
    this.mesh.geometry.dispose();
  }
}
