import * as THREE from 'three'
import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import niceColors from 'nice-color-palettes'
import Effects from './Effects'
import { OrbitControls } from '@react-three/drei'
import './styles.css'

const cubeAmount = 1000;
const cubeAmountCubed = 10;
const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()
const randCube = Math.floor(Math.random() * 99)
const data = Array.from({ length: cubeAmount }, () => ({ color: niceColors[randCube][Math.floor(Math.random() * 5)], scale: 1 }))
let cubeCheck = Array.from({ length: cubeAmount })

function Boxes() {
  const [hovered, set] = useState()
  const colorArray = useMemo(() => Float32Array.from(new Array(cubeAmount).fill().flatMap((_, i) => tempColor.set(data[i].color).toArray())), [])
  const meshRef = useRef()
  const prevRef = useRef()
  
  useEffect(() => void (prevRef.current = hovered), [hovered])
  useFrame((state) => {
    let i = 0
    for (let x = 0; x < cubeAmountCubed; x++)
      for (let y = 0; y < cubeAmountCubed; y++)
        for (let z = 0; z < cubeAmountCubed; z++) {
          const id = i++
          
          if(cubeCheck[id] === 1){
            tempObject.position.set(1000,1000,1000)
          } else {
            tempObject.position.set(5 - x, 5 - y, 5 - z)
          }

          if (hovered !== prevRef.Current) {
            tempColor.set(id === hovered ? 'white' : data[id].color).toArray(colorArray, id * 3)
            meshRef.current.geometry.attributes.color.needsUpdate = true
          }

          const scale = (data[id].scale = THREE.MathUtils.lerp(data[id].scale, id === hovered ? 1.25 : 1, 0.1))
          tempObject.scale.setScalar(scale)
          tempObject.updateMatrix()
          meshRef.current.setMatrixAt(id, tempObject.matrix)
        }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, cubeAmount]} onPointerMove={(e) => set(e.instanceId)} onPointerOut={(e) => set(undefined)} onPointerDown={(e) => {cubeCheck[e.instanceId] = 1; } }>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute attachObject={['attributes', 'color']} args={[colorArray, 3]} />
      </boxGeometry>
      <meshPhongMaterial vertexColors={THREE.VertexColors} />
    </instancedMesh>
  )
}

function Cubes() {
  return (
    <Canvas
      linear
      gl={{ antialias: false, alpha: false }}
      camera={{ position: [0, 0, 15], far: 150 }}
      onCreated={({ gl }) => gl.setClearColor('#232b2b')}>
      <ambientLight />
      <Boxes />
      <Effects />
      <OrbitControls enablePan={false} maxDistance={50}/>
    </Canvas>
  );
}

export default Cubes;
