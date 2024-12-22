import { World } from './World'

import { Client } from './systems/Client'
import { ClientControls } from './systems/ClientControls'
import { ClientNetwork } from './systems/ClientNetwork'
import { ClientLoader } from './systems/ClientLoader'
import { ClientGraphics } from './systems/ClientGraphics'
import { ClientEnvironment } from './systems/ClientEnvironment'
import { ClientStats } from './systems/ClientStats'
import { ClientDrop } from './systems/ClientDrop'

export function createClientWorld() {
  const world = new World()
  world.register('client', Client)
  world.register('controls', ClientControls)
  world.register('network', ClientNetwork)
  world.register('loader', ClientLoader)
  world.register('graphics', ClientGraphics)
  world.register('environment', ClientEnvironment)
  world.register('stats', ClientStats)
  world.register('drop', ClientDrop)
  return world
}