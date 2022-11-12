import { Logger } from "./logger.js";

const root = document.querySelector("#root");
const body = document.querySelector("body");
const themeSwitcher = body.querySelector("#theme-switcher-input");
themeSwitcher.addEventListener("click", () => {
  body.classList.toggle("page-theme-dark");
  themeSwitcher.ariaPressed = !themeSwitcher.ariaPressed;
});

const logger = new Logger(root);

const socket = io();

socket.emit("hi", "images");

socket.on("message", (data) => {
  console.log(data);
  logger.log(data);
});
