import { ContactShadows, Html, OrbitControls, PerspectiveCamera, Sparkles, useAnimations, useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";

const modelByType = {
  lower: "/models/mixamo/squat.glb",
  hinge: "/models/mixamo/deadlift.glb",
  push: "/models/mixamo/push-up.glb",
  pull: "/models/mixamo/pull-up.glb",
  shoulder: "/models/mixamo/shoulder-press.glb",
  arms: "/models/mixamo/curl.glb",
  core: "/models/mixamo/plank.glb",
  cardio: "/models/mixamo/jumping-jacks.glb",
  general: "/models/mixamo/workout.glb"
};

const colorByType = {
  lower: "#f97316",
  hinge: "#f59e0b",
  push: "#ff6b00",
  pull: "#22d3ee",
  shoulder: "#fb7185",
  arms: "#a78bfa",
  core: "#38bdf8",
  cardio: "#facc15",
  general: "#fb923c"
};

const hotColor = "#ff4d00";
const secondaryHotColor = "#facc15";

const normalizeMuscle = (name = "") => String(name).toLowerCase();

const zoneMatches = (muscles, patterns) => muscles.some((muscle) => patterns.some((pattern) => muscle.includes(pattern)));

const getActiveZones = (muscles = [], type = "general") => {
  const normalized = muscles.map(([name]) => normalizeMuscle(name));

  return {
    chest: zoneMatches(normalized, ["chest", "pec"]) || type === "push",
    shoulders: zoneMatches(normalized, ["shoulder", "delt"]) || type === "push",
    triceps: zoneMatches(normalized, ["tricep"]) || type === "push",
    biceps: zoneMatches(normalized, ["bicep"]) || type === "pull",
    lats: zoneMatches(normalized, ["lat", "back"]) || type === "pull",
    core: zoneMatches(normalized, ["core", "abs", "full body"]) || type === "cardio" || type === "core" || type === "general",
    glutes: zoneMatches(normalized, ["glute"]) || type === "lower" || type === "hinge",
    quads: zoneMatches(normalized, ["quad", "leg drive"]) || type === "lower",
    hamstrings: zoneMatches(normalized, ["hamstring"]) || type === "lower" || type === "hinge",
    calves: zoneMatches(normalized, ["calf", "calves"]) || type === "cardio"
  };
};

const HeatSpot = ({ active, position, scale = [1, 1, 1], color = hotColor, opacity = 0.82 }) => {
  if (!active) return null;

  return (
    <mesh position={position} scale={scale}>
      <sphereGeometry args={[0.11, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={1.6}
        transparent
        opacity={opacity}
        roughness={0.2}
      />
    </mesh>
  );
};

const AnatomyHeatMap = ({ muscles, type }) => {
  const pulse = useRef(null);
  const zones = useMemo(() => getActiveZones(muscles, type), [muscles, type]);

  useFrame(({ clock }) => {
    if (!pulse.current) return;
    const scale = 1 + Math.sin(clock.elapsedTime * 4.2) * 0.055;
    pulse.current.scale.setScalar(scale);
  });

  return (
    <group ref={pulse} position={[0, -0.82, 0]} scale={1.08}>
      <HeatSpot active={zones.chest} position={[-0.12, 0.5, 0.25]} scale={[1.22, 0.76, 0.34]} />
      <HeatSpot active={zones.chest} position={[0.12, 0.5, 0.25]} scale={[1.22, 0.76, 0.34]} />
      <HeatSpot active={zones.shoulders} position={[-0.35, 0.55, 0.06]} scale={[0.92, 0.72, 0.72]} />
      <HeatSpot active={zones.shoulders} position={[0.35, 0.55, 0.06]} scale={[0.92, 0.72, 0.72]} />
      <HeatSpot active={zones.triceps} position={[-0.5, 0.16, -0.04]} scale={[0.48, 1.25, 0.42]} color={secondaryHotColor} opacity={0.7} />
      <HeatSpot active={zones.triceps} position={[0.5, 0.16, -0.04]} scale={[0.48, 1.25, 0.42]} color={secondaryHotColor} opacity={0.7} />
      <HeatSpot active={zones.biceps} position={[-0.46, 0.2, 0.1]} scale={[0.48, 1.18, 0.42]} />
      <HeatSpot active={zones.biceps} position={[0.46, 0.2, 0.1]} scale={[0.48, 1.18, 0.42]} />
      <HeatSpot active={zones.lats} position={[-0.2, 0.35, -0.18]} scale={[0.68, 1.55, 0.26]} />
      <HeatSpot active={zones.lats} position={[0.2, 0.35, -0.18]} scale={[0.68, 1.55, 0.26]} />
      <HeatSpot active={zones.core} position={[0, 0.13, 0.26]} scale={[1.08, 1.38, 0.32]} color="#38bdf8" opacity={0.7} />
      <HeatSpot active={zones.glutes} position={[-0.13, -0.14, -0.12]} scale={[0.75, 0.72, 0.38]} color={secondaryHotColor} />
      <HeatSpot active={zones.glutes} position={[0.13, -0.14, -0.12]} scale={[0.75, 0.72, 0.38]} color={secondaryHotColor} />
      <HeatSpot active={zones.quads} position={[-0.15, -0.58, 0.12]} scale={[0.6, 1.55, 0.36]} />
      <HeatSpot active={zones.quads} position={[0.15, -0.58, 0.12]} scale={[0.6, 1.55, 0.36]} />
      <HeatSpot active={zones.hamstrings} position={[-0.15, -0.58, -0.13]} scale={[0.5, 1.35, 0.3]} color={secondaryHotColor} opacity={0.65} />
      <HeatSpot active={zones.hamstrings} position={[0.15, -0.58, -0.13]} scale={[0.5, 1.35, 0.3]} color={secondaryHotColor} opacity={0.65} />
      <HeatSpot active={zones.calves} position={[-0.15, -1.05, -0.02]} scale={[0.44, 1.12, 0.34]} />
      <HeatSpot active={zones.calves} position={[0.15, -1.05, -0.02]} scale={[0.44, 1.12, 0.34]} />
    </group>
  );
};

const getPose = (type, time) => {
  const wave = Math.sin(time * (type === "cardio" ? 4.2 : 2.5));
  const rep = Math.max(0, wave);

  if (type === "lower") {
    return { y: 0.05 - rep * 0.34, torsoX: -rep * 0.36, armZ: 0.76, legX: 0.18 + rep * 0.7 };
  }

  if (type === "hinge") {
    return { y: -0.02 - rep * 0.08, torsoX: -0.14 - rep * 0.78, armZ: 0.38 + rep * 0.18, legX: 0.1 + rep * 0.26 };
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

  if (type === "shoulder") {
    return { y: Math.sin(time * 1.2) * 0.03, torsoX: 0.02, armZ: 1.42 - rep * 0.65, legX: 0.02 };
  }

  if (type === "arms") {
    return { y: Math.sin(time * 1.3) * 0.03, torsoX: 0, armZ: 0.58 + rep * 0.18, legX: 0.02 };
  }

  if (type === "core") {
    return { y: -0.34 + Math.sin(time * 1.7) * 0.025, torsoX: Math.PI / 2, armZ: 0.72, legX: -0.04 };
  }

  return { y: Math.sin(time * 1.4) * 0.05, torsoX: Math.sin(time * 1.4) * 0.08, armZ: 0.72 + wave * 0.22, legX: wave * 0.12 };
};

const AnimatedFallbackHuman = ({ type }) => {
  const group = useRef(null);
  const torso = useRef(null);
  const leftArm = useRef(null);
  const rightArm = useRef(null);
  const leftForearm = useRef(null);
  const rightForearm = useRef(null);
  const leftLeg = useRef(null);
  const rightLeg = useRef(null);
  const leftShin = useRef(null);
  const rightShin = useRef(null);
  const head = useRef(null);
  const accent = colorByType[type] || colorByType.general;

  useFrame(({ clock }) => {
    const pose = getPose(type, clock.elapsedTime);
    const wave = Math.sin(clock.elapsedTime * (type === "cardio" ? 4.4 : 2.6));

    if (group.current) {
      group.current.position.y = pose.y;
      group.current.rotation.y = Math.sin(clock.elapsedTime * 0.45) * 0.16;
    }
    if (torso.current) torso.current.rotation.x = pose.torsoX;
    if (leftArm.current) leftArm.current.rotation.z = -pose.armZ;
    if (rightArm.current) rightArm.current.rotation.z = pose.armZ;
    if (leftForearm.current) leftForearm.current.rotation.z = -0.22 - Math.max(0, wave) * 0.42;
    if (rightForearm.current) rightForearm.current.rotation.z = 0.22 + Math.max(0, wave) * 0.42;
    if (leftLeg.current) {
      leftLeg.current.rotation.x = pose.legX;
      leftLeg.current.rotation.z = pose.legZ || 0.08;
    }
    if (rightLeg.current) {
      rightLeg.current.rotation.x = pose.legX;
      rightLeg.current.rotation.z = -(pose.legZ || 0.08);
    }
    if (leftShin.current) leftShin.current.rotation.x = -0.24 - Math.max(0, wave) * 0.34;
    if (rightShin.current) rightShin.current.rotation.x = -0.24 - Math.max(0, wave) * 0.34;
    if (head.current) head.current.rotation.y = Math.sin(clock.elapsedTime * 1.2) * 0.18;
  });

  return (
    <group ref={group} position={[0, -0.82, 0]} scale={1.08}>
      <mesh ref={head} position={[0, 0.92, 0]}>
        <sphereGeometry args={[0.17, 40, 40]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.42} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.75, 0]}>
        <capsuleGeometry args={[0.075, 0.16, 16, 24]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.46} />
      </mesh>
      <mesh ref={torso} position={[0, 0.36, 0]}>
        <capsuleGeometry args={[0.25, 0.7, 24, 42]} />
        <meshStandardMaterial color={accent} metalness={0.12} roughness={0.28} emissive={accent} emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <sphereGeometry args={[0.22, 28, 28]} />
        <meshStandardMaterial color="#27272a" roughness={0.44} />
      </mesh>

      <mesh position={[-0.13, 0.5, 0.22]}>
        <sphereGeometry args={[0.055, 18, 18]} />
        <meshStandardMaterial color="#fff7ed" emissive="#f97316" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0.13, 0.5, 0.22]}>
        <sphereGeometry args={[0.055, 18, 18]} />
        <meshStandardMaterial color="#fff7ed" emissive="#f97316" emissiveIntensity={0.2} />
      </mesh>

      <group ref={leftArm} position={[-0.32, 0.52, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.065, 0.42, 16, 28]} />
          <meshStandardMaterial color="#f4f4f5" roughness={0.42} />
        </mesh>
        <group ref={leftForearm} position={[0, -0.46, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.34, 16, 28]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.48} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.065, 18, 18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.46} />
          </mesh>
        </group>
      </group>
      <group ref={rightArm} position={[0.32, 0.52, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <capsuleGeometry args={[0.065, 0.42, 16, 28]} />
          <meshStandardMaterial color="#f4f4f5" roughness={0.42} />
        </mesh>
        <group ref={rightForearm} position={[0, -0.46, 0]}>
          <mesh position={[0, -0.18, 0]}>
            <capsuleGeometry args={[0.055, 0.34, 16, 28]} />
            <meshStandardMaterial color="#e5e7eb" roughness={0.48} />
          </mesh>
          <mesh position={[0, -0.4, 0]}>
            <sphereGeometry args={[0.065, 18, 18]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.46} />
          </mesh>
        </group>
      </group>

      <group ref={leftLeg} position={[-0.13, -0.22, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.075, 0.52, 16, 28]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.46} />
        </mesh>
        <group ref={leftShin} position={[0, -0.56, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.065, 0.54, 16, 28]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.58, 0.06]} scale={[1.45, 0.45, 0.9]}>
            <sphereGeometry args={[0.08, 20, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.42} />
          </mesh>
        </group>
      </group>
      <group ref={rightLeg} position={[0.13, -0.22, 0]}>
        <mesh position={[0, -0.28, 0]}>
          <capsuleGeometry args={[0.075, 0.52, 16, 28]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.46} />
        </mesh>
        <group ref={rightShin} position={[0, -0.56, 0]}>
          <mesh position={[0, -0.28, 0]}>
            <capsuleGeometry args={[0.065, 0.54, 16, 28]} />
            <meshStandardMaterial color="#d4d4d8" roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.58, 0.06]} scale={[1.45, 0.45, 0.9]}>
            <sphereGeometry args={[0.08, 20, 20]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.42} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

const MotionGuide = ({ type }) => {
  const guide = useRef(null);
  const accent = colorByType[type] || colorByType.general;

  useFrame(({ clock }) => {
    if (guide.current) {
      guide.current.rotation.y = clock.elapsedTime * 0.26;
      guide.current.position.y = -0.12 + Math.sin(clock.elapsedTime * 1.8) * 0.05;
    }
  });

  return (
    <group ref={guide}>
      <mesh position={[0, -0.08, -0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.72, 0.008, 8, 96]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.95} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.36, -0.18]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.48, 0.006, 8, 96]} />
        <meshStandardMaterial color="#ffffff" emissive={accent} emissiveIntensity={0.28} transparent opacity={0.22} />
      </mesh>
      <mesh position={[-0.72, 0.16, -0.22]} rotation={[0.1, 0, -0.42]}>
        <capsuleGeometry args={[0.012, 0.62, 8, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.75} transparent opacity={0.38} />
      </mesh>
      <mesh position={[0.72, 0.16, -0.22]} rotation={[0.1, 0, 0.42]}>
        <capsuleGeometry args={[0.012, 0.62, 8, 16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.75} transparent opacity={0.38} />
      </mesh>
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

const Scene = ({ type, exerciseName, muscles, view }) => {
  const accent = colorByType[type] || colorByType.general;
  const rig = useRef(null);
  const viewRotation = view === "side" ? Math.PI / 2 : view === "back" ? Math.PI : 0;

  useFrame(() => {
    if (rig.current) {
      rig.current.rotation.y += (viewRotation - rig.current.rotation.y) * 0.08;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.62, 3.75]} fov={36} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[3.5, 4, 3]} intensity={1.8} />
      <directionalLight position={[-3, 2.2, -2]} intensity={0.72} color="#38bdf8" />
      <pointLight position={[-2, 1.5, 2]} intensity={2.4} color={accent} />
      <spotLight position={[0, 4, 2.4]} angle={0.42} penumbra={0.7} intensity={2.2} color="#ffffff" />
      <Sparkles count={52} speed={0.45} opacity={0.45} color={accent} size={2.2} scale={[3.2, 2.4, 2.2]} />
      <group ref={rig}>
        <MotionGuide type={type} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
        <circleGeometry args={[1.72, 128]} />
        <meshStandardMaterial color="#0b0b0b" roughness={0.74} metalness={0.22} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.43, 0]}>
        <ringGeometry args={[1.26, 1.31, 128]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.25} />
      </mesh>
      <ContactShadows position={[0, -1.42, 0]} opacity={0.45} scale={4.2} blur={2.6} far={2.6} />
      <group rotation={[0, viewRotation, 0]}>
        <ModelBoundary type={type} fallback={<AnimatedFallbackHuman type={type} />}>
          <Suspense fallback={<AnimatedFallbackHuman type={type} />}>
            <MixamoModel type={type} />
          </Suspense>
        </ModelBoundary>
        <AnatomyHeatMap muscles={muscles} type={type} />
      </group>
      <Html position={[0, 1.33, 0]} center>
        <div className="workout-3d-label">{exerciseName}</div>
      </Html>
      <Html position={[0, -1.18, 0.92]} center>
        <div className="workout-3d-rep">Live form path</div>
      </Html>
      <OrbitControls
        enablePan={false}
        minDistance={2.25}
        maxDistance={5}
        maxPolarAngle={Math.PI / 1.72}
        autoRotate
        autoRotateSpeed={0.72}
      />
    </>
  );
};

const WorkoutThreeViewer = ({ type = "general", exerciseName = "Workout demo", muscles = [] }) => {
  const [view, setView] = useState("front");
  const strongestMuscle = muscles[0]?.[0] || "Full Body";
  const strongestValue = muscles[0]?.[1] || 84;

  return (
    <div className="workout-3d-viewer">
      <Canvas dpr={[1, 1.6]} shadows>
        <Scene type={type} exerciseName={exerciseName} muscles={muscles} view={view} />
      </Canvas>
      <div className="workout-3d-view-tabs" aria-label="Anatomy view selector">
        {["front", "side", "back"].map((item) => (
          <button
            key={item}
            type="button"
            className={view === item ? "is-active" : ""}
            onClick={() => setView(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="workout-3d-muscle-readout">
        <span>Most stretch</span>
        <strong>{strongestMuscle}</strong>
        <small>{strongestValue}% activation</small>
      </div>
      <div className="workout-3d-hint">360 rotate - Drag body - Scroll zoom</div>
    </div>
  );
};

export default WorkoutThreeViewer;
