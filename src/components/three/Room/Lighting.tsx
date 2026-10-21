'use client'

// Day preset; Task 22 adds the night blend.
// Lights are physically based (r155+) and tone-mapped with ACES, so the hemisphere
// carries most of the wall light: walls get half sky + half ground.
export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#fff8ec', '#f3e0c4', 2.4]} />
      <directionalLight
        position={[-6, 9, 3]}
        intensity={1.3}
        color="#fff1d6"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-intensity={0.8}
      />
      <ambientLight intensity={0.25} />
    </>
  )
}
