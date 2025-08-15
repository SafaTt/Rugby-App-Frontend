// utils/socket.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

let socket: any;
export const initializeSocket = async () => {
  const token = await AsyncStorage.getItem("token");
  socket = io("https://rugby-app-backend-8.onrender.com", {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;
