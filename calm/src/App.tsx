import { useRef, useState } from "react";
import { Canvas, ThreeElements, useFrame } from "@react-three/fiber";
import FullScreenShader from "./Screen";

function Box(props: ThreeElements["mesh"]) {
    const ref = useRef<THREE.Mesh>(null!);
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    useFrame((state, delta) => (ref.current.rotation.x += delta));
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
        >
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
        </mesh>
    );
}

export default function App() {
    return (
        <Canvas camera={{ fov: 75, near: 0.1, far: 1, position: [0, 0, 0.5] }}>
            {/* <ambientLight intensity={Math.PI / 2} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.15}
                penumbra={1}
                decay={0}
                intensity={Math.PI}
            />
            <pointLight
                position={[-10, -10, -10]}
                decay={0}
                intensity={Math.PI}
            /> */}
            {/* <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} /> */}
            <FullScreenShader />
        </Canvas>
    );
}
