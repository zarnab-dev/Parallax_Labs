import type { ShapeKind } from "./shapeForCategory";

interface ProceduralProductMeshProps {
  shape: ShapeKind;
  color: string;
}

/** A stylized shoe: curved sole + upper, suggestive rather than literal. */
function ShoeMesh({ color }: { color: string }) {
  return (
    <group rotation={[0, Math.PI * 0.15, 0]}>
      <mesh position={[0, -0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.25, 0.7]} />
        <meshStandardMaterial color="#1f2937" roughness={0.8} />
      </mesh>
      {/* Capsules point along Y by default; rotating 90° about Z lays it
          along the sole's X axis. Scale applies in local axes, so X/Z here
          flatten the height and narrow the width after rotation. */}
      <mesh
        position={[0.05, -0.08, 0]}
        rotation={[0, 0, Math.PI / 2]}
        scale={[0.7, 1, 0.9]}
        castShadow
      >
        <capsuleGeometry args={[0.35, 0.9, 8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  );
}

/** A folded garment: a flattened, slightly bent box. */
function FoldedApparelMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.3, 1.4]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[1.1, 0.06, 1.1]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

/** A ring/torus for accessories (belts, bags reduced to an abstract loop). */
function RingMesh({ color }: { color: string }) {
  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]} castShadow receiveShadow>
      <torusGeometry args={[0.7, 0.22, 24, 64]} />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

/** A simple rounded device slab for electronics. */
function DeviceMesh({ color }: { color: string }) {
  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[1.3, 0.9, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

/** A vessel (mug/carafe/lamp stand-in) for home goods. */
function VesselMesh({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 1.2, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Half-ring arcs toward -X after a +90° Z rotation (i.e. into the cup),
          so rotate -90° to bulge outward, centered on the cup wall. */}
      <mesh position={[0.6, 0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <torusGeometry args={[0.28, 0.07, 16, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
}

/** A tent-like cone for outdoor gear. */
function TentMesh({ color }: { color: string }) {
  return (
    <mesh castShadow receiveShadow>
      <coneGeometry args={[0.85, 1.1, 4]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

const MESH_BY_SHAPE: Record<ShapeKind, typeof ShoeMesh> = {
  shoe: ShoeMesh,
  "folded-apparel": FoldedApparelMesh,
  ring: RingMesh,
  device: DeviceMesh,
  vessel: VesselMesh,
  tent: TentMesh,
};

export function ProceduralProductMesh({ shape, color }: ProceduralProductMeshProps) {
  const MeshComponent = MESH_BY_SHAPE[shape];
  return <MeshComponent color={color} />;
}
