import * as THREE from "three";

export interface VisualizerModeOptions {
  intensity: number;
  glow: number;
  opacity: number;
  color: string;
}

export class CircularSpectrum {
  private mesh: THREE.Mesh | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;

  create(scene: THREE.Scene): void {
    const segments = 128;
    const positions = new Float32Array(segments * 3);
    const colors = new Float32Array(segments * 3);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    this.geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uGlow: { value: 0.5 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        varying float vRadius;
        
        void main() {
          vColor = color;
          vRadius = length(position.xy);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vRadius;
        uniform float uGlow;
        
        void main() {
          float glow = exp(-vRadius * uGlow) * 0.5;
          gl_FragColor = vec4(vColor + glow, 1.0);
        }
      `,
      transparent: true,
    });

    this.mesh = new THREE.LineLoop(this.geometry, this.material);
    scene.add(this.mesh);
  }

  update(
    frequencyData: Float32Array,
    options: VisualizerModeOptions
  ): void {
    if (!this.geometry || !this.material) return;

    const positions = this.geometry.attributes.position.array as Float32Array;
    const colors = this.geometry.attributes.color.array as Float32Array;
    const segments = positions.length / 3;

    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const dataIndex = Math.floor((i / segments) * frequencyData.length);
      const value = (frequencyData[dataIndex] + 100) / 100; // Normalize from dB
      const radius = 1 + value * options.intensity * 2;

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = 0;

      // Color gradient based on frequency
      const hue = i / segments;
      const color = new THREE.Color();
      color.setHSL(hue, 0.8, 0.5 + value * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
    this.material.uniforms.uTime.value = performance.now() / 1000;
    this.material.uniforms.uIntensity.value = options.intensity;
    this.material.uniforms.uGlow.value = options.glow;
  }

  dispose(): void {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}

export class ParticleField {
  private points: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.PointsMaterial | null = null;
  private velocities: Float32Array | null = null;
  private count: number;

  constructor(count: number = 1000) {
    this.count = count;
  }

  create(scene: THREE.Scene): void {
    const positions = new Float32Array(this.count * 3);
    this.velocities = new Float32Array(this.count * 3);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

      this.velocities[i * 3] = (Math.random() - 0.5) * 0.01;
      this.velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      this.velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    this.material = new THREE.PointsMaterial({
      size: 0.05,
      color: 0x5c7cfa,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    scene.add(this.points);
  }

  update(
    frequencyData: Float32Array,
    options: VisualizerModeOptions
  ): void {
    if (!this.geometry || !this.velocities) return;

    const positions = this.geometry.attributes.position.array as Float32Array;
    const bass = (frequencyData[0] + 100) / 100;
    const mid = (frequencyData[Math.floor(frequencyData.length / 2)] + 100) / 100;

    for (let i = 0; i < this.count; i++) {
      // Apply velocity
      positions[i * 3] += this.velocities[i * 3] * (1 + bass * 2);
      positions[i * 3 + 1] += this.velocities[i * 3 + 1] * (1 + mid);
      positions[i * 3 + 2] += this.velocities[i * 3 + 2];

      // Bounce off boundaries
      for (let j = 0; j < 3; j++) {
        const limit = j === 2 ? 2.5 : 5;
        if (Math.abs(positions[i * 3 + j]) > limit) {
          this.velocities[i * 3 + j] *= -1;
        }
      }
    }

    this.geometry.attributes.position.needsUpdate = true;
    if (this.material) {
      this.material.opacity = options.opacity * 0.8;
    }
  }

  dispose(): void {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}
