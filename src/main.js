import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 6

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.domElement.style.position = 'fixed'
renderer.domElement.style.inset = '0'
renderer.domElement.style.zIndex = '0'
document.getElementById('app').appendChild(renderer.domElement)
renderer.localClippingEnabled = true

const labelRenderer = new CSS2DRenderer()
labelRenderer.setSize(window.innerWidth, window.innerHeight)
labelRenderer.domElement.style.position = 'fixed'
labelRenderer.domElement.style.top = '0px'
labelRenderer.domElement.style.zIndex = '5'
labelRenderer.domElement.style.pointerEvents = 'none'
document.body.appendChild(labelRenderer.domElement)

const heroOverlay = document.getElementById('hero-overlay')

const textureLoader = new THREE.TextureLoader()
const earthTexture = textureLoader.load('/src/assets/8k_earth_daymap.jpg')
const nightTexture = textureLoader.load('src/assets/8k_earth_nightmap.jpg')
const starsTexture = textureLoader.load('src/assets/8k_stars_milky_way.jpg')
scene.background = starsTexture

const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  emissiveMap: nightTexture,
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 1.2,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)

const earthGroup = new THREE.Group()
scene.add(earthGroup)

earthGroup.add(earth)

const mantleTexture = textureLoader.load('src/assets/Rock035.png')
const outerCoreTexture = textureLoader.load('src/assets/Lava003.png')
const innerCoreTexture = textureLoader.load('src/assets/Metal044B.png')

const mantleMaterial = new THREE.MeshStandardMaterial({
  map: mantleTexture,
  roughness: 0.9,
  metalness: 0.0,
})
const mantleGeometry = new THREE.SphereGeometry(0.85, 64, 64)
const mantle = new THREE.Mesh(mantleGeometry, mantleMaterial)
earthGroup.add(mantle)

const outerCoreMaterial = new THREE.MeshStandardMaterial({
  map: outerCoreTexture,
  roughness: 0.6,
  metalness: 0.1,
  emissive: new THREE.Color(0xff4500),
  emissiveIntensity: 0.4,
})
const outerCoreGeometry = new THREE.SphereGeometry(0.55, 64, 64)
const outerCore = new THREE.Mesh(outerCoreGeometry, outerCoreMaterial)
earthGroup.add(outerCore)

const innerCoreMaterial = new THREE.MeshStandardMaterial({
  map: innerCoreTexture,
  roughness: 0.5,
  metalness: 0.8,
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 0.2,
})
const innerCoreGeometry = new THREE.SphereGeometry(0.2, 64, 64)
const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial)
earthGroup.add(innerCore)

// ----- Cutaway Wedge (two fixed planes forming a slice, like a pie cut) -----
const clipPlaneA = new THREE.Plane(new THREE.Vector3(1, 0, 0), 0)
const clipPlaneB = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)

;[earthMaterial, mantleMaterial, outerCoreMaterial, innerCoreMaterial].forEach((mat) => {
  mat.clippingPlanes = [clipPlaneA, clipPlaneB]
  mat.clipIntersection = true // only remove geometry where BOTH planes agree -> wedge shape
  mat.clipShadows = true
  mat.side = THREE.DoubleSide
})

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0)
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
  current: 6,
  target: 6,
  min: 0.5,
  max: 8,
  lerpFactor: 0.05,
}

window.addEventListener('wheel', (event) => {
  const scrollSpeed = 0.002
  zoomState.target -= event.deltaY * scrollSpeed
  zoomState.target = THREE.MathUtils.clamp(zoomState.target, zoomState.min, zoomState.max)
})

// ----- lil-gui (hidden by default, press "h" to toggle) -----
const gui = new GUI()
gui.hide()

window.addEventListener('keydown', (e) => {
  if (e.key === 'h') {
    gui._hidden ? gui.show() : gui.hide()
  }
})

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

const cutawayFolder = gui.addFolder('Cutaway')
const cutawaySettings = {
  cutStart: 3,
  cutEnd: 0.5,
}
cutawayFolder.add(cutawaySettings, 'cutStart', 1, 8, 0.1).name('Cut Start Distance')
cutawayFolder.add(cutawaySettings, 'cutEnd', 0.1, 3, 0.1).name('Cut End Distance')

const introSettings = {
  start: 6,
  end: 4.2,
}
const introFolder = gui.addFolder('Hero Intro')
introFolder.add(introSettings, 'start', 3, 8, 0.1).name('Fade Start Distance')
introFolder.add(introSettings, 'end', 1, 6, 0.1).name('Fade End Distance')

const materialsFolder = gui.addFolder('Layer Materials')

const earthMatFolder = materialsFolder.addFolder('Earth Surface')
earthMatFolder.add(earthMaterial, 'emissiveIntensity', 0, 3, 0.01).name('Night Lights Intensity')

const mantleMatFolder = materialsFolder.addFolder('Mantle')
mantleMatFolder.add(mantleMaterial, 'roughness', 0, 1, 0.01)
mantleMatFolder.add(mantleMaterial, 'metalness', 0, 1, 0.01)

const outerCoreMatFolder = materialsFolder.addFolder('Outer Core')
outerCoreMatFolder.add(outerCoreMaterial, 'roughness', 0, 1, 0.01)
outerCoreMatFolder.add(outerCoreMaterial, 'metalness', 0, 1, 0.01)
outerCoreMatFolder.add(outerCoreMaterial, 'emissiveIntensity', 0, 2, 0.01)

const innerCoreMatFolder = materialsFolder.addFolder('Inner Core')
innerCoreMatFolder.add(innerCoreMaterial, 'roughness', 0, 1, 0.01)
innerCoreMatFolder.add(innerCoreMaterial, 'metalness', 0, 1, 0.01)
innerCoreMatFolder.add(innerCoreMaterial, 'emissiveIntensity', 0, 2, 0.01)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
})

// ----- Labels -----
function createLabel(title, description, className) {
  const div = document.createElement('div')
  div.className = className

  const titleEl = document.createElement('div')
  titleEl.className = 'layer-label-title'
  titleEl.textContent = title

  const descEl = document.createElement('div')
  descEl.className = 'layer-label-desc'
  descEl.textContent = description

  div.appendChild(titleEl)
  div.appendChild(descEl)

  return new CSS2DObject(div)
}

const crustLabel = createLabel(
  'Crust',
  '~35 km thick — solid rock, where we live',
  'layer-label'
)
earth.add(crustLabel)
crustLabel.position.set(0, 1.0, 0)

const mantleLabel = createLabel(
  'Mantle',
  '~2,900 km thick — hot, slowly flowing rock',
  'layer-label'
)
mantle.add(mantleLabel)
mantleLabel.position.set(0, 0.85, 0)

const outerCoreLabel = createLabel(
  'Outer Core',
  '~2,300 km thick — molten iron & nickel',
  'layer-label'
)
outerCore.add(outerCoreLabel)
outerCoreLabel.position.set(0, 0.55, 0)

const innerCoreLabel = createLabel(
  'Inner Core',
  '~1,220 km radius — solid iron, ~5,400°C',
  'layer-label'
)
innerCore.add(innerCoreLabel)
innerCoreLabel.position.set(0, 0.2, 0)

const layerLabels = [
  { object: crustLabel, showAt: 0.6, progress: 'intro' },
  { object: mantleLabel, showAt: 0.15, progress: 'cut' },
  { object: outerCoreLabel, showAt: 0.5, progress: 'cut' },
  { object: innerCoreLabel, showAt: 0.8, progress: 'cut' },
]

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

  const cutProgress = THREE.MathUtils.clamp(
    (cutawaySettings.cutStart - zoomState.current) / (cutawaySettings.cutStart - cutawaySettings.cutEnd),
    0,
    1
  )
  const cutDepth = THREE.MathUtils.lerp(1, -0.2, cutProgress)
  clipPlaneA.constant = cutDepth
  clipPlaneB.constant = cutDepth

  const introProgress = THREE.MathUtils.clamp(
    (introSettings.start - zoomState.current) / (introSettings.start - introSettings.end),
    0,
    1
  )
  heroOverlay.style.opacity = String(1 - introProgress)

  layerLabels.forEach(({ object, showAt, progress }) => {
    const p = progress === 'intro' ? introProgress : cutProgress
    object.element.style.opacity = p > showAt ? '1' : '0'
  })

  controls.update()
  renderer.render(scene, camera)
  labelRenderer.render(scene, camera)
}
animate()