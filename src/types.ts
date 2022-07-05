export type TerveCallbacks = {
  onJoined?: (resp: any) => void;
  onClosed?: () => void;
  onMessage?: (resp: any) => void;
  onTimeout?: (resp: any) => void;
  onError?: (resp: any) => void;
};

export type UseChannelHookReturn = { send: (msg: any) => void };
