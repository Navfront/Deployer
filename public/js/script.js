import { Logger } from "./logger.js";

const root = document.querySelector("#root");

const logger = new Logger(root);

const socket = io();

socket.emit("hi", "images");

socket.on("message", (data) => {
  const date = new Date();
  console.log(data);
  logger.log(
    `${date.toLocaleDateString()} ${date.toLocaleTimeString()} - ${data}`
  );
});
