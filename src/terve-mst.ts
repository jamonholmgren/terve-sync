import {
  applyPatch,
  applySnapshot,
  getSnapshot,
  getType,
  IAnyComplexType,
  Instance,
  onPatch,
} from "mobx-state-tree"
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

    // when did I join the room? oldest one is the "leader"
    const joinedAt = Date.now()

    // are we currently listening for a snapshot?
    let requestingSnapshot = false

    // the oldest one that responds to us "wins" and we apply their snapshot
    let lastSnapshotResponderJoinedAt = joinedAt

    let applyingPatch = false
    const { send } = joinRoom(`tervesync:${options.apiKey}:${storeName}`, {
      onError(resp) {
        console.error(resp)
      },
      onMessage(payload) {
        // don't re-apply my own patches
        if (payload.clientId === clientId) return

        // when applying existing patches etc, avoid cyclical updates
        applyingPatch = true
        if (payload.patch) {
          applyPatch(store, payload.patch)
        } else if (payload.requestSnapshot) {
          // someone wants a snapshot, so let's send ours
          // TODO: only send it directly to them, not broadcast?
          send({
            clientId,
            snapshot: getSnapshot(store),
            joinedAt,
          })
        } else if (requestingSnapshot && payload.snapshot) {
          // someone sent us a snapshot, so let's apply it if they're the leader
          if (payload.joinedAt < lastSnapshotResponderJoinedAt) {
            lastSnapshotResponderJoinedAt = payload.joinedAt
            applySnapshot(store, payload.snapshot)
            requestingSnapshot = false
          }
        }
        applyingPatch = false
      },
    })

    onPatch(store, (patch) => {
      // avoid sending patches that are already applied
      if (!applyingPatch) {
        send({
          clientId,
          patch,
        })
      }
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

        /**
         * This lets you request a snapshot from all the other clients.
         */
        requestSnapshot() {
          requestingSnapshot = true

          send({
            clientId,
            requestSnapshot: true,
          })

          // if nobody responds in 3 seconds, we'll stop listening
          setTimeout(() => {
            requestingSnapshot = false
          }, 3000)
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
