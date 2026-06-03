import { Html, OrbitControls, PerspectiveCamera, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef } from "react";

const modelByType = {
  lower: "/models/mixamo/squat.glb",
  push: "/models/mixamo/push-up.glb",
  pull: "/models/mixamo/pull-up.glb",
  cardio: "/models/mixamo/jumping-jacks.glb",
  general: "/models/mixamo/workout.glb"
};

const colorByType = {
  lower: "#f97316",
  push: "#ff6b00",
  pull: "#22d3ee",
  cardio: "#facc15",
  general: "#fb923c"
};

const getPose = (type, time) => {
  const wave = Math.sin(time * (type === "cardio" ? 4.2 : 2.5));
  const rep = Math.max(0, wave);

  if (type === "lower") {
    return { y: 0.05 - rep * 0.34, torsoX: -rep * 0.36, armZ: 0.76, legX: 0.18 + rep * 0.7 };
  }

  if (type === "push") {
    return { y: -0.28 + wave * 0.1, torsoX: Math.PI / 2 + wave * 0.08, armZ: 0.88 - wave * 0.28, legX: -0.08 };
  }

  if (type === "pull") {
    return { y: 0.12 + rep * 0.38, torsoX: 0.03, armZ: 1.72 - rep * 0.58, legX: -0.12 };
  }

  if (type === "cardio") {
    return { y: Math.abs(wave) * 0.2, torsoX: 0, armZ: 0.35 + Math.abs(wave) * 1.12, legX: -0.05, legZ: Math.abs(wave) * 0.44 };
  }

  return { y: Math.sin(time * 1.4) * 0.05, torsoX: Math.sin(time * 1.4) * 0.08, armZ: 0.72 + wave * 0.22, legX: wave * 0.12 };
};

const AnimatedFallbackHuman = ({ type }) => {
  const group = useRef(null);
  const torso = useRef(null);
  const leftArm = useRef(null);
  const rightArm = useRef(null);
  const leftLeg = useRef(null);
  const rightLeg = useRef(null);
  const accent = colorByType[type] || colorByType.general;

  useFrame(({ clock }) => {
    const pose = getPose(type, clock.elapsedTime);

    if (group.current) {
      group.current.position.y = pose.y;
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.16;
    }
    if (torso.current) torso.current.rotation.x = pose.torsoX;
    if (leftArm.current) leftArm.current.rotation.z = -pose.armZ;
    if (rightArm.current) rightArm.current.rotation.z = pose.armZ;
    if (leftLeg.current) {
      leftLeg.current.rotation.x = pose.legX;
      leftLeg.current.rotation.z = pose.legZ || 0.08;
    }
    if (rightLeg.current) {
      rightLeg.current.rotation.x = pose.legX;
      rightLeg.current.rotation.z = -(pose.legZ || 0.08);
    }
  });

  return (
    <group ref={group} position={[0, -0.78, 0]} scale={1.08}>
      <mesh position={[0, 0.58, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.52} />
      </mesh>
      <mesh ref={torso} position={[0, 0.2, 0]}>
        <capsuleGeometry args={[0.22, 0.58, 16, 32]} />
        <meshStandardMaterial color={accent} metalness={0.08} roughness={0.36} />
      </mesh>
      <group ref={leftArm} position={[-0.27, 0.32, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.055, 0.52, 12, 24]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.48} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.27, 0.32, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.055, 0.52, 12, 24]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.48} />
        </mesh>
      </group>
      <group ref={leftLeg} position={[-0.12, -0.2, 0]}>
        <mesh position={[0, -0.36, 0]}>
          <capsuleGeometry args={[0.07, 0.7, 12, 24]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.5} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.12, -0.2, 0]}>
        <mesh position={[0, -0.36, 0]}>
          <capsuleGeometry args={[0.07, 0.7, 12, 24]} />
          <meshStandardMaterial color="#d1d5db" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

const MixamoModel = ({ type }) => {
  const group = useRef(null);
  const gltf = useGLTF(modelByType[type] || modelByType.general);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const { actions, names } = useAnimations(gltf.animations, group);

  useEffect(() => {
    const action = actions[names[0]];
    action?.reset().fadeIn(0.25).play();
    return () => action?.fadeOut(0.2);
  }, [actions, names]);

  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.35) * 0.16;
    }
  });

  return <primitive ref={group} object={scene} position={[0, -0.95, 0]} scale={1.12} />;
};

class ModelBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(previousProps) {
    if (previousProps.type !== this.props.type && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

const Scene = ({ type, exerciseName }) => {
  const accent = colorByType[type] || colorByType.general;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.75, 3.25]} fov={42} />
      <ambientLight intensity={0.92} />
      <directionalLight position={[3, 3, 3]} intensity={1.45} />
      <pointLight position={[-2, 1.5, 2]} intensity={1.8} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <circleGeometry args={[1.45, 96]} />
        <meshStandardMaterial color="#111111" roughness={0.74} metalness={0.16} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.43, 0]}>
        <ringGeometry args={[1.08, 1.12, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.8} />
      </mesh>
      <ModelBoundary type={type} fallback={<AnimatedFallbackHuman type={type} />}>
        <Suspense fallback={<AnimatedFallbackHuman type={type} />}>
          <MixamoModel type={type} />
        </Suspense>
      </ModelBoundary>
      <Html position={[0, 1.33, 0]} center>
        <div className="workout-3d-label">{exerciseName}</div>
      </Html>
      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={4.8} maxPolarAngle={Math.PI / 1.75} />
    </>
  );
};

const WorkoutThreeViewer = ({ type = "general", exerciseName = "Workout demo" }) => (
  <div className="workout-3d-viewer">
    <Canvas dpr={[1, 1.6]} shadows>
      <Scene type={type} exerciseName={exerciseName} />
    </Canvas>
    <div className="workout-3d-hint">Drag to rotate - Scroll to zoom</div>
  </div>
);

export default WorkoutThreeViewer;
