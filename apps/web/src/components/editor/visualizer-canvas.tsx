"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

interface VisualizerCanvasProps {
  width: number;
  height: number;
  mode: string;
  audioData?: Float32Array | null;
  isPlaying: boolean;
}

export function VisualizerCanvas({
  width,
  height,
  mode,
  audioData,
  isPlaying,
}: VisualizerCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const frameRef = useRef<number>(-1);
  const visualizerRef = useRef<THREE.Object3D | null>(null);
  const audioDataRef = useRef<Float32Array | null>(null);
  const modeRef = useRef<string>(mode);

  const createVisualizer = useCallback(
    (scene: THREE.Scene, visualMode: string) => {
      // Remove existing visualizer
      if (visualizerRef.current) {
        scene.remove(visualizerRef.current);
      }

      let visualizer: THREE.Object3D;

      switch (visualMode) {
        case "circular-spectrum":
          visualizer = createCircularSpectrum();
          break;
        case "linear-spectrum":
          visualizer = createLinearSpectrum();
          break;
        case "waveform":
          visualizer = createWaveform();
          break;
        case "particle-field":
          visualizer = createParticleField();
          break;
        case "logo-reactor":
          visualizer = createLogoReactor();
          break;
        case "minimal-pulse":
          visualizer = createMinimalPulse();
          break;
        case "radial-equalizer":
          visualizer = createRadialEqualizer();
          break;
        case "glitch-impact":
          visualizer = createGlitchImpact();
          break;
        case "ambient-gradient":
          visualizer = createAmbientGradient();
          break;
        default:
          visualizer = createCircularSpectrum();
      }

      scene.add(visualizer);
      visualizerRef.current = visualizer;
    },
    []
  );

  audioDataRef.current = audioData ?? null;
  modeRef.current = mode;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0a0a0f, 1);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    createVisualizer(scene, modeRef.current);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const data = audioDataRef.current;
      const currentMode = modeRef.current;
      if (visualizerRef.current && data) {
        updateVisualizer(visualizerRef.current, data, currentMode);
      }
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, [width, height, createVisualizer]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="w-full h-full"
    />
  );
}

// Visualizer creation functions
function createCircularSpectrum(): THREE.Group {
  const group = new THREE.Group();
  const segments = 128;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(segments * 3);
  const colors = new Float32Array(segments * 3);

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const line = new THREE.LineLoop(geometry, material);
  group.add(line);

  return group;
}

function createLinearSpectrum(): THREE.Group {
  const group = new THREE.Group();
  const bars = 64;
  const barWidth = 0.1;

  for (let i = 0; i < bars; i++) {
    const geometry = new THREE.BoxGeometry(barWidth, 1, 0.1);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / bars, 0.8, 0.5),
    });
    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = (i - bars / 2) * (barWidth + 0.02);
    bar.position.y = 0;
    bar.userData.index = i;
    group.add(bar);
  }

  return group;
}

function createWaveform(): THREE.Group {
  const group = new THREE.Group();
  const points = 256;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(points * 3);

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.LineBasicMaterial({
    color: 0x5c7cfa,
    transparent: true,
    opacity: 0.8,
  });

  const line = new THREE.Line(geometry, material);
  group.add(line);

  return group;
}

function createParticleField(): THREE.Points {
  const count = 2000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 5;

    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.8, 0.5);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.05,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
  });

  return new THREE.Points(geometry, material);
}

function createLogoReactor(): THREE.Group {
  const group = new THREE.Group();

  // Central circle
  const circleGeometry = new THREE.RingGeometry(0.8, 1, 64);
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: 0x5c7cfa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  group.add(circle);

  // Glow ring
  const glowGeometry = new THREE.RingGeometry(1.1, 1.3, 64);
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0x818cf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const glow = new THREE.Mesh(glowGeometry, glowMaterial);
  group.add(glow);

  return group;
}

function createMinimalPulse(): THREE.Group {
  const group = new THREE.Group();

  const circleGeometry = new THREE.CircleGeometry(1, 64);
  const circleMaterial = new THREE.MeshBasicMaterial({
    color: 0x5c7cfa,
    transparent: true,
    opacity: 0.5,
  });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  group.add(circle);

  return group;
}

function createRadialEqualizer(): THREE.Group {
  const group = new THREE.Group();
  const bars = 36;

  for (let i = 0; i < bars; i++) {
    const angle = (i / bars) * Math.PI * 2;
    const geometry = new THREE.BoxGeometry(0.05, 1, 0.05);
    const material = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(i / bars, 0.8, 0.5),
    });
    const bar = new THREE.Mesh(geometry, material);
    bar.position.x = Math.cos(angle) * 2;
    bar.position.y = Math.sin(angle) * 2;
    bar.rotation.z = angle;
    bar.userData.index = i;
    group.add(bar);
  }

  return group;
}

function createGlitchImpact(): THREE.Group {
  const group = new THREE.Group();

  // Create multiple offset rectangles
  for (let i = 0; i < 5; i++) {
    const geometry = new THREE.PlaneGeometry(2, 0.3);
    const material = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x5c7cfa : 0xef4444,
      transparent: true,
      opacity: 0.5,
    });
    const rect = new THREE.Mesh(geometry, material);
    rect.position.y = (i - 2) * 0.5;
    rect.userData.index = i;
    group.add(rect);
  }

  return group;
}

function createAmbientGradient(): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(10, 10);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;
      
      void main() {
        vec3 color1 = vec3(0.36, 0.49, 0.98);
        vec3 color2 = vec3(0.51, 0.55, 0.97);
        vec3 color3 = vec3(0.24, 0.39, 0.91);
        
        float t = sin(uTime * 0.5) * 0.5 + 0.5;
        vec3 color = mix(color1, color2, vUv.x);
        color = mix(color, color3, vUv.y * t);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
  });

  return new THREE.Mesh(geometry, material);
}

// Update visualizer based on audio data
function updateVisualizer(
  visualizer: THREE.Object3D,
  audioData: Float32Array,
  mode: string
) {
  const bands = extractBands(audioData);

  switch (mode) {
    case "circular-spectrum":
      updateCircularSpectrum(visualizer as THREE.Group, audioData, bands);
      break;
    case "linear-spectrum":
      updateLinearSpectrum(visualizer as THREE.Group, audioData, bands);
      break;
    case "waveform":
      updateWaveform(visualizer as THREE.Group, audioData, bands);
      break;
    case "particle-field":
      updateParticleField(visualizer as THREE.Points, audioData, bands);
      break;
    case "logo-reactor":
      updateLogoReactor(visualizer as THREE.Group, audioData, bands);
      break;
    case "minimal-pulse":
      updateMinimalPulse(visualizer as THREE.Group, audioData, bands);
      break;
    case "radial-equalizer":
      updateRadialEqualizer(visualizer as THREE.Group, audioData, bands);
      break;
    case "glitch-impact":
      updateGlitchImpact(visualizer as THREE.Group, audioData, bands);
      break;
    case "ambient-gradient":
      updateAmbientGradient(visualizer as THREE.Mesh, audioData, bands);
      break;
  }
}

function extractBands(data: Float32Array) {
  const len = data.length;
  return {
    bass: average(data, 0, Math.floor(len * 0.1)),
    mid: average(data, Math.floor(len * 0.1), Math.floor(len * 0.5)),
    treble: average(data, Math.floor(len * 0.5), len),
    volume: average(data, 0, len),
  };
}

function average(arr: Float32Array, start: number, end: number): number {
  let sum = 0;
  for (let i = start; i < end; i++) {
    sum += Math.abs(arr[i]);
  }
  return sum / (end - start);
}

function updateCircularSpectrum(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  const line = group.children[0] as THREE.LineLoop;
  if (!line) return;

  const geometry = line.geometry;
  const positions = geometry.attributes.position.array as Float32Array;
  const colors = geometry.attributes.color.array as Float32Array;
  const segments = positions.length / 3;

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const dataIndex = Math.floor((i / segments) * data.length);
    const value = (data[dataIndex] + 100) / 100;
    const radius = 1.5 + value * 2 * (1 + bands.bass * 0.5);

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = 0;

    const hue = (i / segments + performance.now() / 5000) % 1;
    const color = new THREE.Color();
    color.setHSL(hue, 0.8, 0.5 + value * 0.3);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
}

function updateLinearSpectrum(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  group.children.forEach((child, i) => {
    const bar = child as THREE.Mesh;
    const dataIndex = Math.floor((i / group.children.length) * data.length);
    const value = (data[dataIndex] + 100) / 100;
    bar.scale.y = 0.1 + value * 3;
    bar.position.y = bar.scale.y / 2;
  });
}

function updateWaveform(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  const line = group.children[0] as THREE.Line;
  if (!line) return;

  const geometry = line.geometry;
  const positions = geometry.attributes.position.array as Float32Array;
  const points = positions.length / 3;

  for (let i = 0; i < points; i++) {
    const dataIndex = Math.floor((i / points) * data.length);
    positions[i * 3] = (i / points - 0.5) * 8;
    positions[i * 3 + 1] = data[dataIndex] * 3;
    positions[i * 3 + 2] = 0;
  }

  geometry.attributes.position.needsUpdate = true;
}

function updateParticleField(
  points: THREE.Points,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  const positions = points.geometry.attributes.position.array as Float32Array;
  const count = positions.length / 3;

  for (let i = 0; i < count; i++) {
    positions[i * 3 + 1] += bands.bass * 0.02 * (Math.random() - 0.5);
    positions[i * 3] += bands.mid * 0.01 * (Math.random() - 0.5);

    // Boundary check
    if (Math.abs(positions[i * 3]) > 5) positions[i * 3] *= -0.9;
    if (Math.abs(positions[i * 3 + 1]) > 5) positions[i * 3 + 1] *= -0.9;
  }

  points.geometry.attributes.position.needsUpdate = true;
}

function updateLogoReactor(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  const scale = 1 + bands.bass * 0.5;
  group.scale.set(scale, scale, 1);

  if (group.children[1]) {
    const glow = group.children[1] as THREE.Mesh;
    (glow.material as THREE.MeshBasicMaterial).opacity = 0.2 + bands.volume * 0.5;
  }
}

function updateMinimalPulse(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  const scale = 0.8 + bands.volume * 0.5;
  group.scale.set(scale, scale, 1);

  const circle = group.children[0] as THREE.Mesh;
  if (circle) {
    (circle.material as THREE.MeshBasicMaterial).opacity = 0.3 + bands.volume * 0.4;
  }
}

function updateRadialEqualizer(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  group.children.forEach((child, i) => {
    const bar = child as THREE.Mesh;
    const dataIndex = Math.floor((i / group.children.length) * data.length);
    const value = (data[dataIndex] + 100) / 100;
    bar.scale.y = 0.5 + value * 2;
  });

  group.rotation.z += 0.002;
}

function updateGlitchImpact(
  group: THREE.Group,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  group.children.forEach((child, i) => {
    const rect = child as THREE.Mesh;
    const offset = bands.bass > 0.3 ? (Math.random() - 0.5) * 0.5 : 0;
    rect.position.x = offset;
    rect.scale.x = 1 + bands.volume * 0.3;
  });
}

function updateAmbientGradient(
  mesh: THREE.Mesh,
  data: Float32Array,
  bands: { bass: number; mid: number; treble: number; volume: number }
) {
  const material = mesh.material as THREE.ShaderMaterial;
  if (material.uniforms) {
    material.uniforms.uTime.value = performance.now() / 1000;
  }
}
