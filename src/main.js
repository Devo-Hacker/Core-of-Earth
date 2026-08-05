import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import GUI from 'lil-gui'

import earthDay from './assets/texture/8k_earth_daymap.jpg'
import earthNight from './assets/texture/8k_earth_nightmap.jpg'
import rockTexture from './assets/texture/Rock035.png'
import lavaTexture from './assets/texture/Lava003.png'
import metalTexture from './assets/texture/Metal044B.png'

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

const heroOverlay = document.getElementById('hero-overlay')
const storyPanel = document.getElementById('story-panel')
const storyProgressEl = document.getElementById('story-progress')

const textureLoader = new THREE.TextureLoader()

const earthTexture = textureLoader.load(earthDay)
const nightTexture = textureLoader.load(earthNight)

const earthGeometry = new THREE.SphereGeometry(1, 64, 64)
const earthMaterial = new THREE.MeshStandardMaterial({
  map: earthTexture,
  emissiveMap: nightTexture,
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 1.2,
  transparent: true,
  depthWrite: false,
  opacity: 1,
  side: THREE.FrontSide,
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
earth.renderOrder = 0

const earthGroup = new THREE.Group()
scene.add(earthGroup)
earthGroup.add(earth)

const mantleTexture = textureLoader.load(rockTexture)
const outerCoreTexture = textureLoader.load(lavaTexture)
const innerCoreTexture = textureLoader.load(metalTexture)

const mantleMaterial = new THREE.MeshStandardMaterial({
  map: mantleTexture,
  roughness: 0.9,
  metalness: 0.0,
  emissive: new THREE.Color(0xff7f40),
  emissiveIntensity: 0.3,
  transparent: true,
  depthWrite: false,
  opacity: 0,
  side: THREE.FrontSide,
})
const mantleGeometry = new THREE.SphereGeometry(0.85, 64, 64)
const mantle = new THREE.Mesh(mantleGeometry, mantleMaterial)
mantle.renderOrder = 1
earthGroup.add(mantle)

const outerCoreMaterial = new THREE.MeshStandardMaterial({
  map: outerCoreTexture,
  roughness: 0.6,
  metalness: 0.1,
  emissive: new THREE.Color(0xff4500),
  emissiveIntensity: 0.55,
  transparent: true,
  depthWrite: false,
  opacity: 0,
  side: THREE.FrontSide,
})
const outerCoreGeometry = new THREE.SphereGeometry(0.55, 64, 64)
const outerCore = new THREE.Mesh(outerCoreGeometry, outerCoreMaterial)
outerCore.renderOrder = 2
earthGroup.add(outerCore)

const innerCoreMaterial = new THREE.MeshStandardMaterial({
  map: innerCoreTexture,
  roughness: 0.5,
  metalness: 0.8,
  emissive: new THREE.Color(0xffffff),
  emissiveIntensity: 0.4,
  transparent: true,
  depthWrite: false,
  opacity: 0,
  side: THREE.FrontSide,
})
const innerCoreGeometry = new THREE.SphereGeometry(0.2, 64, 64)
const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial)
innerCore.renderOrder = 3
earthGroup.add(innerCore)

// ----- Procedural galaxy: scattered starfield + tilted dense band -----
function createGalaxy() {
  const starColor = new THREE.Color()

  // Broad scattered starfield
  const starCount = 15000
  const starGeometry = new THREE.BufferGeometry()
  const positions = new Float32Array(starCount * 3)
  const colors = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3
    const radius = 60 + Math.random() * 300
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[i3 + 2] = radius * Math.cos(phi)

    const colorRoll = Math.random()
    if (colorRoll < 0.6) {
      starColor.setHSL(0, 0, 0.9 + Math.random() * 0.1)
    } else if (colorRoll < 0.85) {
      starColor.setHSL(0.6, 0.5, 0.75)
    } else {
      starColor.setHSL(0.12, 0.6, 0.75)
    }
    colors[i3] = starColor.r
    colors[i3 + 1] = starColor.g
    colors[i3 + 2] = starColor.b
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const starMaterial = new THREE.PointsMaterial({
    size: 0.2,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
  })

  const starsPoints = new THREE.Points(starGeometry, starMaterial)
  starsPoints.renderOrder = -1 // always draw before Earth/layers, fixes pass-through
  scene.add(starsPoints)

  // Dense flattened band — mimics the Milky Way's visible arm
  const bandCount = 6000
  const bandGeometry = new THREE.BufferGeometry()
  const bandPositions = new Float32Array(bandCount * 3)
  const bandColors = new Float32Array(bandCount * 3)

  for (let i = 0; i < bandCount; i++) {
    const i3 = i * 3
    const radius = 80 + Math.random() * 250
    const theta = Math.random() * Math.PI * 2
    const bandSpread = (Math.random() - 0.5) * 20

    bandPositions[i3] = radius * Math.cos(theta)
    bandPositions[i3 + 1] = bandSpread
    bandPositions[i3 + 2] = radius * Math.sin(theta)

    starColor.setHSL(0.6, 0.3, 0.6 + Math.random() * 0.2)
    bandColors[i3] = starColor.r
    bandColors[i3 + 1] = starColor.g
    bandColors[i3 + 2] = starColor.b
  }

  bandGeometry.setAttribute('position', new THREE.BufferAttribute(bandPositions, 3))
  bandGeometry.setAttribute('color', new THREE.BufferAttribute(bandColors, 3))

  const bandMaterial = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.5,
  })

  const band = new THREE.Points(bandGeometry, bandMaterial)
  band.rotation.x = Math.PI / 6
  band.renderOrder = -1 // always draw before Earth/layers, fixes pass-through
  scene.add(band)
}
createGalaxy()

const sunLight = new THREE.DirectionalLight(0xffffff, 2)
sunLight.position.set(5, 3, 5)
scene.add(sunLight)

// Sun
const sunGeometry = new THREE.SphereGeometry(2.5, 64, 64)

const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xfff2b3
})

const sun = new THREE.Mesh(sunGeometry, sunMaterial)
sun.position.copy(sunLight.position).multiplyScalar(18)
scene.add(sun)

const sunGlow = new THREE.PointLight(
  0xfff2b3,
  10,
  150
)

sunGlow.position.copy(sun.position)
scene.add(sunGlow)

const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
fillLight.position.set(-5, -2, -5)
scene.add(fillLight)

const ambientLight = new THREE.AmbientLight(0xffffff, 0.02)
scene.add(ambientLight)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.dampingFactor = 0.05
controls.enableZoom = false
controls.minDistance = 0.3
controls.maxDistance = 10
controls.autoRotate = true
controls.autoRotateSpeed = 0.5

const stages = [
  { id: 'hero', distance: 6 },
  { id: 'crust', distance: 2.4 },
  { id: 'mantle', distance: 1.6 },
  { id: 'outerCore', distance: 1.0 },
  { id: 'innerCore', distance: 0.45 },
]

const layerKeyframes = {
  crust:     [0,   0,   1.3, 1.8],
  mantle:    [1.0, 1.8, 2.2, 2.8],
  outerCore: [2.0, 2.8, 3.2, 3.8],
  innerCore: [3.0, 3.8, 4,   4],
}

const layers = [
  { mesh: earth, key: 'crust', stage: 1 },
  { mesh: mantle, key: 'mantle', stage: 2 },
  { mesh: outerCore, key: 'outerCore', stage: 3 },
  { mesh: innerCore, key: 'innerCore', stage: 4 },
]

function trapezoid(t, inStart, fullStart, fullEnd, outEnd) {
  if (fullStart <= inStart) {
    if (t <= fullEnd) return 1
    if (t >= outEnd) return 0
    return 1 - (t - fullEnd) / (outEnd - fullEnd)
  }
  if (t <= inStart) return 0
  if (t < fullStart) return (t - inStart) / (fullStart - inStart)
  if (t <= fullEnd) return 1
  if (t < outEnd) return 1 - (t - fullEnd) / (outEnd - fullEnd)
  return 0
}

const storyState = {
  current: 0,
  target: 0,
  min: 0,
  max: stages.length - 1,
  lerpFactor: 0.07,
}

window.addEventListener('wheel', (event) => {
  const scrollSpeed = 0.0012
  storyState.target += event.deltaY * scrollSpeed
  storyState.target = THREE.MathUtils.clamp(storyState.target, storyState.min, storyState.max)
})

const gui = new GUI()
gui.hide()
window.addEventListener('keydown', (e) => {
  if (e.key === 'h') gui._hidden ? gui.show() : gui.hide()
})

const storyFolder = gui.addFolder('Story Scroll')
storyFolder.add(storyState, 'lerpFactor', 0.01, 0.2, 0.01).name('Smoothness')

const sunFolder = gui.addFolder('Sun')
sunFolder.add(sunLight, 'intensity', 0, 5, 0.1).name('Key Light')
sunFolder.add(fillLight, 'intensity', 0, 2, 0.1).name('Fill Light')

const ambientFolder = gui.addFolder('Ambient')
ambientFolder.add(ambientLight, 'intensity', 0, 1, 0.01).name('Intensity')

const materialsFolder = gui.addFolder('Layer Materials')
materialsFolder.add(earthMaterial, 'emissiveIntensity', 0, 3, 0.01).name('Night Lights')
materialsFolder.add(mantleMaterial, 'emissiveIntensity', 0, 1, 0.01).name('Mantle Glow')
materialsFolder.add(outerCoreMaterial, 'emissiveIntensity', 0, 2, 0.01).name('Outer Core Glow')
materialsFolder.add(innerCoreMaterial, 'emissiveIntensity', 0, 2, 0.01).name('Inner Core Glow')

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const storyCards = Array.from(storyPanel.querySelectorAll('.story-card')).map((el) => ({
  el,
  stage: Number(el.dataset.stage),
}))

storyProgressEl.innerHTML = stages
  .slice(1)
  .map(() => `<div class="dot"></div>`)
  .join('')
const progressDots = Array.from(storyProgressEl.querySelectorAll('.dot'))

function animate() {
  requestAnimationFrame(animate)

  earthGroup.rotation.y += 0.0006

  storyState.current = THREE.MathUtils.lerp(
    storyState.current,
    storyState.target,
    storyState.lerpFactor
  )

  const idx = Math.floor(storyState.current)
  const t = storyState.current - idx
  const distA = stages[idx].distance
  const distB = stages[Math.min(idx + 1, stages.length - 1)].distance
  const dist = THREE.MathUtils.lerp(distA, distB, t)

  const direction = camera.position.clone().normalize()
  camera.position.copy(direction.multiplyScalar(dist))

  layers.forEach(({ mesh, key }) => {
    const [inStart, fullStart, fullEnd, outEnd] = layerKeyframes[key]
    const opacity = trapezoid(storyState.current, inStart, fullStart, fullEnd, outEnd)
    mesh.material.opacity = opacity
    mesh.visible = opacity > 0.01
  })

  const heroOpacity = THREE.MathUtils.clamp(1 - storyState.current / 0.25, 0, 1)
  heroOverlay.style.opacity = String(heroOpacity)

  storyCards.forEach(({ el, stage }) => {
    const d = Math.abs(storyState.current - stage)
    el.style.opacity = d < 0.5 ? '1' : '0'
  })

  const activeStage = Math.round(storyState.current)
  progressDots.forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === activeStage)
  })

  controls.update()
  renderer.render(scene, camera)
}
animate()