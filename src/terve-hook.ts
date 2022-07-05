// TODO: figure out whether I want to do this at all

// import { useEffect, useRef } from "react";
// import { Platform } from "react-native";
// import { connect, join } from "./terve-socket";
// import { TerveCallbacks, UseChannelHookReturn } from "./types";

// /**
//  * Convenience hook to clean up some boilerplate.
//  */
// export function useChannelRoom(
//   roomName: string,
//   callbacks: TerveCallbacks
// ): UseChannelHookReturn {
//   const sendUpdate = useRef(undefined);

//   useEffect(() => {
//     connect(
//       Platform.OS === "ios"
//         ? "ws://localhost:4000/socket"
//         : "ws://10.0.2.2:4000/socket"
//     );

//     const { send, leave } = join(roomName, callbacks);

//     sendUpdate.current = send;
//     return () => {
//       // clearInterval(timer)
//       leave();
//     };
//   }, []);

//   const send = (msg: any) => {
//     if (sendUpdate.current) {
//       sendUpdate.current(msg);
//     } else {
//       console.error("Not connected to channel, can't send message: ", msg);
//     }
//   };

//   return { send };
// }
