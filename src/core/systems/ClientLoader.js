import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { VRMLoaderPlugin } from '@pixiv/three-vrm'

import { System } from './System'
import { createNode } from '../extras/createNode'
import { createVRMFactory } from '../extras/createVRMFactory'
import { glbToNodes } from '../extras/glbToNodes'
import { createEmoteFactory } from '../extras/createEmoteFactory'

/**
 * Client Loader System
 *
 * - Runs on the client
 * - Basic file loader for many different formats, cached.
 *
 */
export class ClientLoader extends System {
  constructor(world) {
    super(world)
    this.cache = new Map()
    this.rgbeLoader = new RGBELoader()
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.register(parser => new VRMLoaderPlugin(parser))
  }

  start() {
    // ...
  }

  has(type, url) {
    const key = `${type}/${url}`
    return this.cache.has(key)
  }

  load(type, url) {
    const key = `${type}/${url}`
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }
    url = this.resolveURL(url)
    let promise
    if (type === 'hdr') {
      promise = this.rgbeLoader.loadAsync(url).then(texture => {
        return texture
      })
    }
    if (type === 'glb') {
      promise = this.gltfLoader.loadAsync(url).then(glb => {
        let node
        glb.toNodes = () => {
          if (!node) {
            node = glbToNodes(glb, this.world)
          }
          return node.clone(true)
        }
        return glb
      })
    }
    if (type === 'vrm') {
      promise = this.gltfLoader.loadAsync(url).then(glb => {
        const factory = createVRMFactory(glb, this.world)
        glb.toNodes = () => {
          return createNode({
            name: 'vrm',
            factory,
          })
        }
        return glb
      })
    }
    if (type === 'emote') {
      promise = this.gltfLoader.loadAsync(url).then(glb => {
        const factory = createEmoteFactory(glb, url)
        glb.toClip = factory.toClip
        return glb
      })
    }
    this.cache.set(key, promise)
    return promise
  }

  insert(type, url, file) {
    const key = `${type}/${url}`
    const localUrl = URL.createObjectURL(file)
    let promise
    if (type === 'glb') {
      promise = this.gltfLoader.loadAsync(localUrl).then(glb => {
        let node
        glb.toNodes = () => {
          if (!node) {
            node = glbToNodes(glb, this.world)
          }
          return node.clone(true)
        }
        return glb
      })
    }
    this.cache.set(key, promise)
  }

  resolveURL(url) {
    if (url.startsWith('asset://')) {
      return url.replace('asset:/', process.env.PUBLIC_ASSETS_URL)
    }
    return url
  }
}
