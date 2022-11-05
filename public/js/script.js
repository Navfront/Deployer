const root = document.querySelector("#root");
import { Logger } from "./logger.js";
const logger = new Logger(root);

const socket = io();
socket.on("hello", (data) => {
  const date = new Date();
  console.log(data);
  logger.log(
    `${date.toLocaleDateString()} ${date.toLocaleTimeString()} - ${
      "message" + data
    }`
  );
});
