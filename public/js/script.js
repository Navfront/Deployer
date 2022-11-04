const root = document.querySelector("#root");
import { Logger } from "./logger.js";
const logger = new Logger(root);

const socket = io();
socket.on("hello", () => {
  logger.log(Date());
});
