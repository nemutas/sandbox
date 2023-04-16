import * as THREE from 'three'
import { gl } from './core/WebGL'
import { controls } from './utils/OrbitControls'
import fragmentShader from './shader/fs.glsl'
import vertexShader from './shader/vs.glsl'
import { Assets, loadAssets } from './utils/assetLoader'
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader'
import { Sandbox } from './Sandbox'

export class TCanvas {
  private sandboxes: Sandbox[] = []
  private screens: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>[] = []

  private assets: Assets = {
    frame: { path: 'models/frame.glb' },
    envMap: { path: 'images/blocky_photo_studio_1k.hdr' },
  }

  constructor(private container: HTMLElement) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.createScreens()
      this.createSandboxes()
      this.createFrame()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.container)
    gl.scene.background = new THREE.Color('#0a0a0a')
    gl.camera.position.set(0, 0, 5)

    gl.setResizeCallback(() => {
      this.sandboxes.forEach((sandbox) => {
        sandbox.resize()
      })
    })
  }

  private createScreens() {
    const screenOpritons: { rot: { axis: 'x' | 'y' | 'z'; angle: number } }[] = [
      { rot: { axis: 'x', angle: 0 } },
      { rot: { axis: 'x', angle: Math.PI / 2 } },
      { rot: { axis: 'x', angle: -Math.PI / 2 } },
      { rot: { axis: 'y', angle: Math.PI / 2 } },
      { rot: { axis: 'y', angle: Math.PI } },
      { rot: { axis: 'y', angle: -Math.PI / 2 } },
    ]

    screenOpritons.forEach((opt) => {
      const geometry = new THREE.PlaneGeometry(1.99, 1.99, 100, 100)
      geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, 0.995))
      const material = new THREE.ShaderMaterial({
        uniforms: {
          tImage: { value: null },
        },
        vertexShader,
        fragmentShader,
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.rotation[opt.rot.axis] = opt.rot.angle
      gl.scene.add(mesh)

      this.screens.push(mesh)
    })
  }

  private createSandboxes() {
    const createMesh = (g: THREE.BufferGeometry, m: THREE.MeshStandardMaterial) => {
      const mesh = new THREE.Mesh(g, m)
      mesh.castShadow = true
      mesh.receiveShadow = true
      return mesh
    }

    {
      const geo = new THREE.BoxGeometry(0.7, 0.7, 0.7)
      const mat = new THREE.MeshStandardMaterial({ color: '#fff' })
      this.sandboxes.push(new Sandbox(createMesh(geo, mat)))
    }
    {
      const geo = new THREE.OctahedronGeometry(0.5, 0)
      const mat = new THREE.MeshStandardMaterial({ color: '#0af' })
      this.sandboxes.push(new Sandbox(createMesh(geo, mat)))
    }
    {
      const geo = new THREE.TetrahedronGeometry(0.5, 0)
      const mat = new THREE.MeshStandardMaterial({ color: '#f66' })
      this.sandboxes.push(new Sandbox(createMesh(geo, mat)))
    }
    {
      const geo = new THREE.TorusKnotGeometry(0.3, 0.1, 200, 20, 1, 3)
      geo.rotateY(Math.PI / 2)
      const mat = new THREE.MeshStandardMaterial({ color: '#fa0' })
      this.sandboxes.push(new Sandbox(createMesh(geo, mat)))
    }
    {
      const geo = new THREE.TorusKnotGeometry(0.3, 0.1, 200, 20, 2, 1)
      const mat = new THREE.MeshStandardMaterial({ color: '#af0' })
      this.sandboxes.push(new Sandbox(createMesh(geo, mat)))
    }
    {
      const geo = new THREE.TorusKnotGeometry(0.3, 0.1, 200, 20, 2, 3)
      geo.rotateY(Math.PI / 2)
      const mat = new THREE.MeshStandardMaterial({ color: '#a0f' })
      this.sandboxes.push(new Sandbox(createMesh(geo, mat)))
    }
  }

  private createFrame() {
    const frame = (this.assets.frame.data as GLTF).scene.children[0] as THREE.Mesh
    const envMap = this.assets.envMap.data as THREE.Texture
    frame.material = new THREE.MeshStandardMaterial({
      color: '#aa0',
      envMap,
      envMapIntensity: 0.2,
      metalness: 1,
      roughness: 0.2,
    })
    frame.scale.multiplyScalar(0.995)
    gl.scene.add(frame)
  }

  // ----------------------------------
  // animation
  private anime = () => {
    controls.update()

    this.sandboxes.forEach((sandbox, i) => {
      sandbox.update()
      this.screens[i].material.uniforms.tImage.value = sandbox.texture
    })

    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
