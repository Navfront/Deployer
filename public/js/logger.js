export class Logger {
  constructor(parent) {
    this.parent = parent;
    this.list = document.createElement("ol");
    this.list.classList.add("list");
    this.parent.appendChild(this.list);
  }

  log(text) {
    const messageParagraph = document.createElement("pre");
    messageParagraph.classList.add("message");
    messageParagraph.textContent = String(text);
    if (this.list.childNodes.length > 5) {
      this.list.childNodes[0].remove();
    }
    this.list.appendChild(messageParagraph);
  }
}
