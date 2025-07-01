// utils/socket.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

let socket: any;

export const initializeSocket = async () => {
  const token = await AsyncStorage.getItem("token");
  socket = io("http://192.168.1.38:1234", {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;
