import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

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
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // cap for perf
document.getElementById('app').appendChild(renderer.domElement)

const textureLoader = new THREE.TextureLoader()
const earthTexture = textureLoader.load('/src/assets/8k_earth_daymap.jpg')

//Earth
const earthGeometry = new THREE.SphereGeometry(1, 64, 64) // radius, widthSegments, heightSegments
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

//Stars background 
function createStars() {
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 5000
  const positions = new Float32Array(starCount * 3) // x,y,z per star

  for (let i = 0; i < starCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 200 // spread stars in a big cube around scene
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.15,
    sizeAttenuation: true,
  })

  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
}
createStars()

const sunLight = new THREE.DirectionalLight(0xffffff, 2)
sunLight.position.set(5, 3, 5)
scene.add(sunLight)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.15) /
scene.add(ambientLight)
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.minDistance = 1.5   
controls.maxDistance = 10    
controls.autoRotate = true
controls.autoRotateSpeed = 0.5
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

function animate() {
  requestAnimationFrame(animate)
  earth.rotation.y += 0.001 
  controls.update();
  renderer.render(scene, camera);
}
animate();