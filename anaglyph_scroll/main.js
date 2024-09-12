// import * as THREE from 'three'
import * as THREE from 'https://cdn.skypack.dev/three@0.128.0/build/three.module.js';
// import vertexShader from './shaders/vertextShader.glsl'
// import vertexShader from './shaders/vertextShader.glsl'
// import fragmentShader from './shaders/fragmentShader.glsl'

//===================================================
// Shader Souce
//===================================================



const vertexShader = `
uniform sampler2D uTexture;
uniform vec2 uOffset;
varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795

vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
   position.x = position.x + (sin(uv.y * M_PI) * offset.x);
   position.y = position.y + (sin(uv.x * M_PI) * offset.y);
   return position;
}

void main() {
   vUv = uv;
   vec3 newPosition = deformationCurve(position, uv, uOffset);
   gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}
`;


const fragmentShader = `
uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec2 uOffset;
varying vec2 vUv;

vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
   float r = texture2D(textureImage, uv + offset).r;
   vec2 gb = texture2D(textureImage, uv).gb;
   return vec3(r, gb);
 }

void main() {
   vec3 color = rgbShift(uTexture, vUv, uOffset);
   gl_FragColor = vec4(color, uAlpha);
 }
 `;




const scrollable = document.querySelector('.scrollable')

let current = 0
let target = 0
let ease = 0.075

function lerp(start, end, t) {
  return start * (1 - t) + end * t
}

function init() {
  document.body.style.height = `${scrollable.getBoundingClientRect().height}px`
}

function smoothScroll() {
  target = scrollY
  current = lerp(current, target, ease)
  scrollable.style.transform = `translate3d(0, ${-current}px, 0)`
}

class EffectCanvas {
  constructor() {
    this.container = document.querySelector('main')
    this.images = [...document.querySelectorAll('img')]
    this.meshItems = []
    this.setupCamera()
    this.createMeshItems()
    this.render()
  }

  get viewport() {
    let width = innerWidth
    let height = innerHeight
    let aspectRatio = width / height
    return { width, height, aspectRatio }
  }

  setupCamera() {
    window.addEventListener('resize', this.onWindowResize.bind(this), false)

    this.scene = new THREE.Scene()

    let perspective = 1000
    // const fov = (360 * (2 * Math.atan(innerHeight / 3 / perspective))) / Math.PI
    const fov = (260 * (2 * Math.atan(innerHeight / 3 / perspective))) / Math.PI
    this.camera = new THREE.PerspectiveCamera(fov, this.viewport.aspectRatio, 1, 10000)
    this.camera.position.set(-300, 0, perspective)
    this.renderer = new THREE.WebGL1Renderer({ antialias: true, alpha: true })
    this.renderer.setSize(this.viewport.width, this.viewport.height)
    this.renderer.setPixelRatio(devicePixelRatio)
    this.container.appendChild(this.renderer.domElement)
  }

  onWindowResize() {
    init()
    this.camera.aspect = this.viewport.aspectRatio
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(this.viewport.width, this.viewport.height)
  }

  createMeshItems() {
    this.images.forEach(image => {
      let meshItem = new MeshItem(image, this.scene)
      this.meshItems.push(meshItem)
    })
  }

  render() {
    smoothScroll()
    for(let i = 0; i < this.meshItems.length; i++) {
      this.meshItems[i].render()
    }
    this.renderer.render(this.scene, this.camera)
    requestAnimationFrame(this.render.bind(this))
  }
}

class MeshItem {
  constructor(element, scene) {
    this.element = element
    this.scene = scene
    this.offset = new THREE.Vector2(0, 0)
    this.sizes = new THREE.Vector2(0, 0)
    this.createMesh()
  }
  
  getDimensions() {
    const { width, height, top, left } = this.element.getBoundingClientRect()
    this.sizes.set(width, height)
    this.offset.set(left - innerWidth / 2 + width / 2, -top + innerHeight / 2 - height / 2)
  }

  createMesh() {
    this.geometry = new THREE.PlaneBufferGeometry(1, 1, 30, 30)
    this.imageTexture = new THREE.TextureLoader().load(this.element.src)
    this.uniforms = { 
      uTexture:  { value: this.imageTexture },
      uOffset: { value: new THREE.Vector2(0.0, 0.0) },
      uAlpha: { value: 1 },
    }
    this.material = new THREE.ShaderMaterial({ 
      uniforms: this.uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      side: THREE.DoubleSide
    })
    this.mesh = new THREE.Mesh(this.geometry, this.material)
    this.getDimensions()
    this.mesh.position.set(this.offset.x, this.offset.y, 0)
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 0)

    this.scene.add(this.mesh)
  }
  
  render() {
    this.getDimensions()
    this.mesh.position.set(this.offset.x, this.offset.y, 0)
    this.mesh.scale.set(this.sizes.x, this.sizes.y, 0)
    this.uniforms.uOffset.value.set(0.0, -(target - current) * 0.0002)

    this.mesh.rotation.y = -0.5;
    this.mesh.rotation.x = -0.3;
    this.mesh.rotation.z = -0.3;
  }
}

init()
new EffectCanvas()















// ////////////////
// const vertexSource = `
// attribute vec3 color;
// uniform float time;
// uniform float size;
// varying vec3 vColor;
// varying float vGray;
// void main() {
//     // To fragmentShader
//     vColor = color;
//     vGray = (vColor.x + vColor.y + vColor.z) / 10.0;
//     //original is divided by 3

//     // Set vertex size
//     // slider.value;
//     gl_PointSize = size * vGray * 5.0;
//     // gl_PointSize = size * vGray * 5.0;
//     //original point size is 3
//     // gl_PointSize = size;

//     // Set vertex position
//     gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
// }
// `;

// const fragmentSource = `
// varying vec3 vColor;
// varying float vGray;
// void main() {
//     float gray = vGray;

//     // Decide whether to draw particle
//     if(gray > 0.9){
//         gray = 0.0;
//     }else{
//         gray = 5.0;
//     }

//     // Set vertex color
//     gl_FragColor = vec4(vColor, gray);
// }
// `;