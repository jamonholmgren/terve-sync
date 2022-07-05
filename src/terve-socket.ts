import { Socket } from "phoenix"
import { TerveCallbacks } from "./types"

let socket: Socket

export function connect(socketURL: string) {
  if (!socket || socket.endPointURL() !== socketURL) {
    if (socket) disconnect()

    socket = new Socket(socketURL, { params: {} })
    socket.connect()
  }
}

export function join(room: string, callbacks: TerveCallbacks = {}) {
  if (!socket) throw new Error("socket not connected -- run `connect(socketURL)` first")

  // Now that you are connected, you can join channels with a topic:
  let channel = socket.channel(`tervesync:${room}`, {})

  channel
    .join()
    .receive("ok", (resp) => {
      if (callbacks.onJoined) callbacks.onJoined(resp)
    })
    .receive("error", (resp) => {
      if (callbacks.onError) callbacks.onError(resp)
    })
    .receive("timeout", (resp) => {
      if (callbacks.onTimeout) callbacks.onTimeout(resp)
    })

  channel.on("message", (resp) => {
    if (callbacks.onMessage) callbacks.onMessage(resp)
  })

  channel.onError((event) => {
    if (callbacks.onError) callbacks.onError(event)
  })

  channel.onClose(() => {
    if (callbacks.onClosed) callbacks.onClosed()
  })

  return {
    send(payload: any) {
      channel.push("message", payload)
    },
    leave() {
      channel.leave()
    },
  }
}

export function disconnect() {
  socket.disconnect()
  socket = undefined
}
