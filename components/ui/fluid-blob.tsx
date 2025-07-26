import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `
varying vec2 vUv;
uniform float time;
uniform vec4 resolution;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float time;
uniform vec4 resolution;

float PI = 3.141592653589793238;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
                0.0,                                0.0,                                0.0,                                1.0);
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
}

float smin( float a, float b, float k ) {
    k *= 6.0;
    float h = max( k-abs(a-b), 0.0 )/k;
    return min(a,b) - h*h*h*k*(1.0/6.0);
}

float sphereSDF(vec3 p, float r) {
    return length(p) - r;
}

float sdf(vec3 p) {
    vec3 p1 = rotate(p, vec3(0.0, 0.0, 1.0), time/6.0);
    vec3 p2 = rotate(p, vec3(1.), -time/6.0);
    vec3 p3 = rotate(p, vec3(1., 1., 0.), -time/5.5);
    
    float final = sphereSDF(p1 - vec3(-0.4, 0.0, 0.0), 0.4);
    float nextSphere = sphereSDF(p2 - vec3(0.5, 0.0, 0.0), 0.35);
    final = smin(final, nextSphere, 0.15);
    nextSphere = sphereSDF(p3 - vec3(0.0, 0.4, 0.0), 0.25);
    final = smin(final, nextSphere, 0.12);
    
    return final;
}

vec3 getNormal(vec3 p) {
    float d = 0.01;
    return normalize(vec3(
        sdf(p + vec3(d, 0.0, 0.0)) - sdf(p - vec3(d, 0.0, 0.0)),
        sdf(p + vec3(0.0, d, 0.0)) - sdf(p - vec3(0.0, d, 0.0)),
        sdf(p + vec3(0.0, 0.0, d)) - sdf(p - vec3(0.0, 0.0, d))
    ));
}

float rayMarch(vec3 rayOrigin, vec3 ray) {
    float t = 0.0;
    for (int i = 0; i < 50; i++) {
        vec3 p = rayOrigin + ray * t;
        float d = sdf(p);
        if (d < 0.01) return t;
        t += d;
        if (t > 50.0) break;
    }
    return -1.0;
}

void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec3 cameraPos = vec3(0.0, 0.0, 5.0);
    vec3 ray = normalize(vec3((vUv - vec2(0.5)) * resolution.zw, -1));
    vec3 color = vec3(0.0); // Black background
    
    float t = rayMarch(cameraPos, ray);
    if (t > 0.0) {
        vec3 p = cameraPos + ray * t;
        vec3 normal = getNormal(p);
        float fresnel = pow(1.0 + dot(ray, normal), 2.0);
        color = vec3(1.0); // White blobs
        gl_FragColor = vec4(color, 1.0);
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Black background
    }
}
`;

function LavaLampShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();
  
  const uniforms = useMemo(() => ({
    time: { value: 0 },
    resolution: { value: new THREE.Vector4() }
  }), []);

  // Update resolution when size changes
  React.useEffect(() => {
    const { width, height } = size;
    const imageAspect = 1;
    let a1, a2;
    
    if (height / width > imageAspect) {
      a1 = (width / height) * imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = (height / width) / imageAspect;
    }
    
    uniforms.resolution.value.set(width, height, a1, a2);
  }, [size, uniforms]);

  useFrame((state) => {
    if (meshRef.current) {
      uniforms.time.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[5, 5]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
}

export const LavaLamp = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#000000', position: "absolute" }}>
      <Canvas
        camera={{
          left: -0.5,
          right: 0.5,
          top: 0.5,
          bottom: -0.5,
          near: -1000,
          far: 1000,
          position: [0, 0, 2]
        }}
        orthographic
        gl={{ antialias: true, alpha: false, premultipliedAlpha: false }}
        style={{ background: '#000000' }}
      >
        <LavaLampShader />
      </Canvas>
    </div>
  );
} 