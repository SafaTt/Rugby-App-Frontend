// utils/socket.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";

let socket: any;
//"https://rugby-app-backend-2.onrender.com"
export const initializeSocket = async () => {
  const token = await AsyncStorage.getItem("token");
  socket = io("http://192.168.1.7:5000", {
    auth: { token },
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;
