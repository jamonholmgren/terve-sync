import { applyAction, IAnyComplexType, Instance, onAction } from "mobx-state-tree"
import { connect, join } from "./terve-socket"

export type TerveSyncOptions = {
  socketURL: string
  clientId: string
  storeName: string
}

export function withTerveSync(options: TerveSyncOptions) {
  return function _withTerveSync<
    ModelType extends IAnyComplexType,
    InstanceType = Instance<ModelType>
  >(store: InstanceType) {
    // ensure we're connected to the socket first
    connect(options.socketURL)

    let applyingAction = false
    const { send } = join(`sync:${options.storeName}`, {
      onMessage(payload) {
        // don't re-apply my own actions
        if (payload.clientId !== options.clientId) {
          // when applying existing actions, avoid cyclical updates
          applyingAction = true
          applyAction(store, payload.action)
          applyingAction = false
        }
      },
    })

    onAction(store, (action) => {
      // avoid sending actions that are already applied
      if (!applyingAction)
        send({
          clientId: options.clientId,
          action,
        })
    })

    return {}
  }
}
