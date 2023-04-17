import * as THREE from 'three'
import { gl } from './core/WebGL'

export class Sandbox {
  private scene = new THREE.Scene()
  private renderTarget = new THREE.WebGLRenderTarget(gl.size.width * window.devicePixelRatio, gl.size.height * window.devicePixelRatio, {
    samples: 10,
  })

  constructor(private object: THREE.Object3D) {
    this.scene.add(object)

    this.createLights()
    this.createStage()
  }

  private createLights() {
    const lights = new THREE.Group()
    lights.name = 'lights'
    this.scene.add(lights)

    const ambientLight = new THREE.AmbientLight('#fff', 0.2)
    lights.add(ambientLight)

    {
      const directionalLight = new THREE.DirectionalLight('#fff', 0.5)
      directionalLight.position.set(3, 3, 3)
      directionalLight.castShadow = true
      directionalLight.shadow.camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.01, 10)
      directionalLight.shadow.mapSize.set(1024, 1024)
      lights.add(directionalLight)
    }
    {
      const directionalLight = new THREE.DirectionalLight('#fff', 0.1)
      directionalLight.position.set(-3, 3, 3)
      lights.add(directionalLight)
    }
  }

  private createStage() {
    const geo = new THREE.BoxGeometry(2, 2, 2)
    const mat = new THREE.MeshStandardMaterial({
      color: '#181818',
      side: THREE.BackSide,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.receiveShadow = true
    this.scene.add(mesh)
  }

  get texture() {
    return this.renderTarget.texture
  }

  resize() {
    this.renderTarget.setSize(gl.size.width * window.devicePixelRatio, gl.size.height * window.devicePixelRatio)
  }

  update() {
    const lights = this.scene.getObjectByName('lights') as THREE.Group
    lights.quaternion.copy(gl.camera.quaternion)

    this.object.rotation.x += gl.time.delta * 0.5
    this.object.rotation.y += gl.time.delta * 0.3
    this.object.rotation.z += gl.time.delta * 0.1

    gl.renderer.setRenderTarget(this.renderTarget)
    gl.renderer.render(this.scene, gl.camera)
    gl.renderer.setRenderTarget(null)
  }
}
