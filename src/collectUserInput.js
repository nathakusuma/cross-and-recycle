import { queueMove, movesQueue } from "./components/Player";

const pressedKeys = new Set();

document
  .getElementById("forward")
  ?.addEventListener("click", () => queueMove("forward"));

document
  .getElementById("backward")
  ?.addEventListener("click", () => queueMove("backward"));

document
  .getElementById("left")
  ?.addEventListener("click", () => queueMove("left"));

document
  .getElementById("right")
  ?.addEventListener("click", () => queueMove("right"));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (!pressedKeys.has("ArrowUp")) {
      pressedKeys.add("ArrowUp");
      queueMove("forward");
    }
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    if (!pressedKeys.has("ArrowDown")) {
      pressedKeys.add("ArrowDown");
      queueMove("backward");
    }
  } else if (event.key === "ArrowLeft") {
    event.preventDefault();
    if (!pressedKeys.has("ArrowLeft")) {
      pressedKeys.add("ArrowLeft");
      queueMove("left");
    }
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    if (!pressedKeys.has("ArrowRight")) {
      pressedKeys.add("ArrowRight");
      queueMove("right");
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key === "ArrowUp" || event.key === "ArrowDown" ||
    event.key === "ArrowLeft" || event.key === "ArrowRight") {
    pressedKeys.delete(event.key);

    if (pressedKeys.size === 0) {
      if (movesQueue.length > 1) {
        movesQueue.splice(1);
      }
    }
  }
});
