'use client'

// Day preset; Task 22 adds the night blend.
export default function Lighting() {
  return (
    <>
      <hemisphereLight args={['#fff1dc', '#b9875a', 0.9]} />
      <directionalLight
        position={[-6, 9, 3]}
        intensity={1.6}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-bias={-0.0004}
      />
      <ambientLight intensity={0.25} />
    </>
  )
}
