import './bootstrap'

import fs from 'fs-extra'
import path from 'path'
import { pipeline } from 'stream/promises'
import Fastify from 'fastify'
import ws from '@fastify/websocket'
import cors from '@fastify/cors'
import compress from '@fastify/compress'
import statics from '@fastify/static'
import multipart from '@fastify/multipart'

import { loadPhysX } from './physx/loadPhysX'

import { createServerWorld } from '../core/createServerWorld'
import { hashFile } from '../core/utils-server'

const rootDir = path.join(__dirname, '../')
const worldDir = path.join(rootDir, 'world')
const assetsDir = path.join(rootDir, 'world/assets')
const port = process.env.PORT

await fs.ensureDir(worldDir)
await fs.ensureDir(assetsDir)

const world = createServerWorld()
world.init({ loadPhysX })

const fastify = Fastify({ logger: { level: 'error' } })

fastify.register(cors)
fastify.register(compress)
fastify.register(statics, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
  decorateReply: false,
  setHeaders: res => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
  },
})
fastify.register(statics, {
  root: assetsDir,
  prefix: '/assets/',
  decorateReply: false,
  setHeaders: res => {
    // all assets are hashed & immutable so we can use aggressive caching
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable') // 1 year
    res.setHeader('Expires', new Date(Date.now() + 31536000000).toUTCString()) // older browsers
  },
})
fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
})
fastify.register(ws)
fastify.register(worldNetwork)

fastify.post('/api/upload', async (req, reply) => {
  const file = await req.file()
  const ext = file.filename.split('.').pop().toLowerCase()
  // create temp buffer to store contents
  const chunks = []
  for await (const chunk of file.file) {
    chunks.push(chunk)
  }
  const buffer = Buffer.concat(chunks)
  // hash from buffer
  const hash = await hashFile(buffer)
  const filename = `${hash}.${ext}`
  // save to fs
  const filePath = path.join(assetsDir, filename)
  const exists = await fs.exists(filePath)
  if (!exists) {
    await fs.writeFile(filePath, buffer)
  }
})

fastify.setErrorHandler((err, req, reply) => {
  console.error(err)
  reply.status(500).send()
})

try {
  await fastify.listen({ port })
} catch (err) {
  console.error(err)
  console.error(`failed to launch on port ${port}`)
  process.exit(1)
}

async function worldNetwork(fastify) {
  fastify.get('/ws', { websocket: true }, ws => {
    world.network.onConnection(ws)
  })
}

console.log(`running on port ${port}`)