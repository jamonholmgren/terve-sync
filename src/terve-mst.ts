import { applyPatch, getType, IAnyComplexType, Instance, onPatch } from "mobx-state-tree"
import { connect, join } from "./terve-socket"
import { TerveCallbacks } from "./types"

export type TerveSyncOptions = {
  apiKey: string
  socketURL?: string
  clientId?: string
  storeName?: string
  mock?: boolean
}

// random client ID to identify the current client
const randomClientId = Math.random().toString(36).substring(2)

export function withTerveSync(options: TerveSyncOptions) {
  return function _withTerveSync<
    ModelType extends IAnyComplexType,
    InstanceType = Instance<ModelType>
  >(store: InstanceType) {
    const connectSocket = options.mock ? noop : connect
    const joinRoom = options.mock ? mockedJoin : join
    const socketURL = options.socketURL ? options.socketURL : "https://terve.fly.dev/socket"

    // ensure we're connected to the socket first
    connectSocket(socketURL)

    // if no store name is provided, use the name of the model
    const storeName = options.storeName || getType(store).name

    // if no clientId provided, use a random one
    const clientId = options.clientId || randomClientId

    let applyingPatch = false
    const { send } = joinRoom(`tervesync:${options.apiKey}:${storeName}`, {
      onError(resp) {
        console.error(resp)
      },
      onMessage(payload) {
        // don't re-apply my own patches
        if (payload.clientId !== clientId) {
          // when applying existing patches, avoid cyclical updates
          applyingPatch = true
          applyPatch(store, payload.patch)
          applyingPatch = false
        }
      },
    })

    onPatch(store, (patch) => {
      // avoid sending patches that are already applied
      if (!applyingPatch)
        send({
          clientId,
          patch,
        })
    })

    return {
      actions: {
        /**
         * This lets you kick off arbitrary messages to the Terve
         * server. It is primarily designed for testing, but could
         * open up other options in the future.
         */
        sendTerve(message: any) {
          send(message)
        },
      },
    }
  }
}

// these are primarily used for testing purposes
function noop() {}
function mockedJoin(_room: string, callbacks: TerveCallbacks = {}) {
  if (callbacks.onJoined) callbacks.onJoined({})
  return {
    send(payload: any) {
      // mocks sending and receiving messages
      setTimeout(() => {
        if (callbacks.onMessage) callbacks.onMessage(payload)
      }, 0)
    },
  }
}
