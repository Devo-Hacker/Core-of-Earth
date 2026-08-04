import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 3

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
document.getElementById('app').appendChild(renderer.domElement)

const textureLoader = new THREE.TextureLoader()
const earthTexture = textureLoader.load('/src/assets/8k_earth_daymap.jpg')

const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTexture })
const earth = new THREE.Mesh(earthGeometry, earthMaterial)

const earthGroup = new THREE.Group()
scene.add(earthGroup)

earthGroup.add(earth) 

const mantleGeometry = new THREE.SphereGeometry(0.85, 64, 64)
const mantleMaterial = new THREE.MeshStandardMaterial({
  color: 0xff6a00, 
})
const mantle = new THREE.Mesh(mantleGeometry, mantleMaterial)
earthGroup.add(mantle)

const outerCoreGeometry = new THREE.SphereGeometry(0.55, 64, 64)
const outerCoreMaterial = new THREE.MeshStandardMaterial({
  color: 0xffae00,
})
const outerCore = new THREE.Mesh(outerCoreGeometry, outerCoreMaterial)
earthGroup.add(outerCore)

const innerCoreGeometry = new THREE.SphereGeometry(0.2, 64, 64)
const innerCoreMaterial = new THREE.MeshStandardMaterial({
  color: 0xfff2c2,
})
const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial)
earthGroup.add(innerCore)

function createStars() {
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 5000
  const positions = new Float32Array(starCount * 3)
  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200
  }
  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    sizeAttenuation: true,
  })
  scene.add(new THREE.Points(starGeometry, starMaterial))
}
createStars()

const sunLight = new THREE.DirectionalLight(0xffffff, 2)
sunLight.position.set(5, 3, 5)
scene.add(sunLight)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.15)
scene.add(ambientLight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enableZoom = false 
controls.minDistance = 1.5
controls.maxDistance = 10
controls.autoRotate = true
controls.autoRotateSpeed = 0.5

const zoomState = {
  current: 3,      // where the camera actually is right now
  target: 3,        // where we WANT the camera to be
  min: 0.5,          // closest allowed (deep zoom — future: inside the core)
  max: 8,            // farthest allowed (full space view)
  lerpFactor: 0.05,  // smoothing strength — smaller = smoother/slower catch-up
}

window.addEventListener('wheel', (event) => {
  const scrollSpeed = 0.002
  zoomState.target += event.deltaY * scrollSpeed
  zoomState.target = THREE.MathUtils.clamp(zoomState.target, zoomState.min, zoomState.max)
})
const gui = new GUI()

const zoomFolder = gui.addFolder('Scroll Zoom')
zoomFolder.add(zoomState, 'lerpFactor', 0.01, 0.2, 0.01).name('Smoothness')
zoomFolder.add(zoomState, 'min', 0.1, 3, 0.1).name('Min Distance')
zoomFolder.add(zoomState, 'max', 3, 15, 0.5).name('Max Distance')

const earthFolder = gui.addFolder('Earth')
let earthSpinSpeed = 0.001
earthFolder.add({ speed: earthSpinSpeed }, 'speed', 0, 0.02, 0.0001)
  .name('Spin Speed')
  .onChange((v) => { earthSpinSpeed = v })

const sunFolder = gui.addFolder('Sun')
sunFolder.add(sunLight, 'intensity', 0, 5, 0.1).name('Intensity')
sunFolder.add(sunLight.position, 'x', -10, 10, 0.1)
sunFolder.add(sunLight.position, 'y', -10, 10, 0.1)
sunFolder.add(sunLight.position, 'z', -10, 10, 0.1)

const ambientFolder = gui.addFolder('Ambient')
ambientFolder.add(ambientLight, 'intensity', 0, 1, 0.01).name('Intensity')

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)

  earthGroup.rotation.y += earthSpinSpeed

  zoomState.current = THREE.MathUtils.lerp(
    zoomState.current,
    zoomState.target,
    zoomState.lerpFactor
  )
  const direction = camera.position.clone().normalize()
  camera.position.copy(direction.multiplyScalar(zoomState.current))

  controls.update()
  renderer.render(scene, camera)
}
animate()