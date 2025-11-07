import * as THREE from "three";
import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition.js";
import { metadata as rows, addRows } from "./Map";

export const player = Player();

function Player() {
  const player = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(15, 15, 20),
    new THREE.MeshLambertMaterial({
      color: "white",
      flatShading: true,
    })
  );
  body.position.z = 10;
  body.castShadow = true;
  body.receiveShadow = true;
  player.add(body);

  const cap = new THREE.Mesh(
    new THREE.BoxGeometry(2, 4, 2),
    new THREE.MeshLambertMaterial({ color: 0xf0619a, flatShading: true })
  );

  cap.position.z = 21;
  cap.castShadow = true;
  cap.receiveShadow = true;
  player.add(cap);

  const playerContainer = new THREE.Group();
  playerContainer.add(player);

  return playerContainer;
}

export const position = {
  currentRow: 0,
  currentTile: 0,
};

export const movesQueue = [];
export let isGameOver = false;

export function initializePlayer() {
  player.position.x = 0;
  player.position.y = 0;
  player.children[0].position.z = 0;

  // Reset player rotation and scale for sprawl animation
  player.children[0].rotation.x = 0;
  player.children[0].rotation.y = 0;
  player.children[0].rotation.z = 0;
  player.children[0].scale.set(1, 1, 1);

  position.currentRow = 0;
  position.currentTile = 0;

  movesQueue.length = 0;
  isGameOver = false;
}

export function queueMove(direction) {
  // Prevent movement if game is over
  if (isGameOver) return;

  const isValidMove = endsUpInValidPosition(
    {
      rowIndex: position.currentRow,
      tileIndex: position.currentTile,
    },
    [...movesQueue, direction]
  );

  if (!isValidMove) return;

  movesQueue.push(direction);
}

export function stepCompleted() {
  const direction = movesQueue.shift();

  if (direction === "forward") position.currentRow += 1;
  if (direction === "backward") position.currentRow -= 1;
  if (direction === "left") position.currentTile -= 1;
  if (direction === "right") position.currentTile += 1;

  if (position.currentRow > rows.length - 10) addRows();

  const scoreDOM = document.getElementById("score");
  if (scoreDOM) {
    scoreDOM.innerText = position.currentRow.toString();
  }
}

export function triggerGameOver() {
  isGameOver = true;

  // Get the player mesh (first child of playerContainer)
  const playerMesh = player.children[0];

  // Create sprawl animation
  const duration = 1000; // 1 second
  const startTime = Date.now();

  function animateSprawl() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Apply easing function (ease-out)
    const easedProgress = 1 - Math.pow(1 - progress, 3);

    // Make character fall forward and spread out
    playerMesh.rotation.x = easedProgress * Math.PI / 2; // Fall forward 90 degrees
    playerMesh.rotation.z = easedProgress * 0.3; // Slight tilt to the side
    playerMesh.position.z = 10 + (1 - easedProgress) * 10; // Lower to ground

    // Spread limbs by scaling
    playerMesh.scale.x = 1 + easedProgress * 0.4; // Spread wider
    playerMesh.scale.y = 1 - easedProgress * 0.3; // Flatten vertically
    playerMesh.scale.z = 1 + easedProgress * 0.6; // Spread longer

    if (progress < 1) {
      requestAnimationFrame(animateSprawl);
    }
  }

  animateSprawl();
}
