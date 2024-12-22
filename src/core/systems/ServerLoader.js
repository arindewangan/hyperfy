import fs from 'fs-extra'
import path from 'path'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { VRMLoaderPlugin as VRMLoader } from '../libs/three-vrm'

import { System } from './System'

/**
 * Server Loader System
 *
 * - Runs on the server
 * - Basic file loader for many different formats, cached.
 *
 */
export class ServerLoader extends System {
  constructor(world) {
    super(world)
    this.assetsDir = path.join(__dirname, '../', process.env.ASSETS_DIR)
    this.cache = new Map()
    this.rgbeLoader = new RGBELoader()
    this.gltfLoader = new GLTFLoader()
    this.gltfLoader.register(parser => new VRMLoader(parser))

    // mock globals to allow gltf loader to work in nodejs
    globalThis.self = { URL }
    globalThis.window = {}
    globalThis.document = {
      createElementNS: () => ({ style: {} }),
    }
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
      // promise = this.rgbeLoader.loadAsync(url).then(texture => {
      //   return texture
      // })
    }
    if (type === 'glb') {
      promise = new Promise(async resolve => {
        const buffer = await fs.readFile(url)
        const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        this.gltfLoader.parse(arrayBuffer, '', gltf => {
          resolve(gltf)
        })
      })
    }
    this.cache.set(key, promise)
    return promise
  }

  resolveURL(url) {
    if (url.startsWith('asset://')) {
      return url.replace('asset:/', this.assetsDir)
    }
    return url
  }
}