import { useRef } from "react";
import { extend, useFrame, Canvas } from "@react-three/fiber";
import { ShaderMaterial, PlaneGeometry } from "three";

// Define the shader
const MyShaderMaterial = {
    uniforms: {
        time: { value: 0.0 },
        // Add other uniforms here
    },
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    fragmentShader: `
    uniform float time;
    void main() {
      vec3 color = vec3(.3, .3, .3);
      //  vec3(sin(time), cos(time), sin(time * 2.0));
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

// Extend will make the ShaderMaterial available as a JSX element called shaderMaterial for use within the Canvas
extend({ ShaderMaterial: ShaderMaterial });
extend({ PlaneGeometry: PlaneGeometry });

function ShaderPlane() {
    const shaderRef = useRef();
    useFrame(({ clock }) => {
        shaderRef.current.uniforms.time.value = clock.getElapsedTime();
    });

    return (
        <mesh scale={1}>
            <planeGeometry args={[1, 1]} />
            <shaderMaterial
                ref={shaderRef}
                attach="material"
                args={[MyShaderMaterial]}
            />
        </mesh>
    );
}

// Main component
function FullScreenShader() {
    return <ShaderPlane />;
}

export default FullScreenShader;
