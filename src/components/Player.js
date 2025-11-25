import * as THREE from "three";
import { endsUpInValidPosition } from "../utilities/endsUpInValidPosition.js";
import { metadata as rows, addRows, map } from "./Map";

export const inventory = [];
export let currentScore = 0;

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
export let isDepositPopupOpen = false;

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
  inventory.length = 0;
  currentScore = 0;
  updateScore(0);
  updateInventoryUI();
}

export function updateInventoryUI() {
  let ui = document.getElementById("inventory");
  if (!ui) {
    ui = document.createElement("div");
    ui.id = "inventory";
    ui.style.position = "absolute";
    ui.style.top = "70px";
    ui.style.left = "20px";
    ui.style.color = "white";
    ui.style.fontSize = "1.2em";
    document.body.appendChild(ui);
  }
  const organic = inventory.filter(t => t === 'organic').length;
  const inorganic = inventory.filter(t => t === 'inorganic').length;
  const dangerous = inventory.filter(t => t === 'dangerous').length;
  ui.innerHTML = `Inventory: Organic: ${organic} | Inorganic: ${inorganic} | Dangerous: ${dangerous}`;
}

export function updateScore(change = 0) {
  currentScore = currentScore + change;
  const scoreDOM = document.getElementById("score");
  if (scoreDOM) {
    scoreDOM.innerText = currentScore.toString();
  }
}

export function queueMove(direction) {
  // Prevent movement if game is over or popup is open
  if (isGameOver || isDepositPopupOpen) return;

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

  if (direction === "forward") {
    position.currentRow += 1;
    updateScore(1); // Add 1 point for moving forward
  }
  if (direction === "backward") position.currentRow -= 1;
  if (direction === "left") position.currentTile -= 1;
  if (direction === "right") position.currentTile += 1;

  if (position.currentRow > rows.length - 10) addRows();

  const currentRowData = rows[position.currentRow - 1];
  if (currentRowData && currentRowData.type === "forest" && currentRowData.trash) {
    currentRowData.trash = currentRowData.trash.filter(item => {
      if (item.tileIndex === position.currentTile && item.ref) {
        inventory.push(item.type);
        if (item.ref.parent) {
          item.ref.parent.remove(item.ref);
        }
        updateInventoryUI();
        return false;
      }
      return true;
    });
  }

  if (currentRowData && currentRowData.bins && !isDepositPopupOpen) {
    currentRowData.bins.forEach(bin => {
      if (bin.tileIndex === position.currentTile && inventory.length > 0) {
        showDepositPopup(() => {
          // Callback after deposit is complete
        });
      }
    });
  }
}

export function showDepositPopup(callback) {
  if (inventory.length === 0) return;

  isDepositPopupOpen = true;
  const popup = document.getElementById("deposit-popup");
  const optionsDiv = document.getElementById("trash-options");

  const organicCount = inventory.filter(t => t === 'organic').length;
  const inorganicCount = inventory.filter(t => t === 'inorganic').length;
  const dangerousCount = inventory.filter(t => t === 'dangerous').length;

  optionsDiv.innerHTML = `
    <div style="text-align: center; color: white; margin-bottom: 15px;">
      <h3>Choose Bin Section</h3>
      <p>Press letter key to select bin section and deposit trash:</p>
    </div>
    <div class="trash-option" style="background: rgba(34, 139, 34, 0.3); border: 2px solid #228B22;">
      <div class="trash-count">${organicCount}</div>
      <div class="trash-type">Organic Bin (O)</div>
    </div>
    <div class="trash-option" style="background: rgba(30, 144, 255, 0.3); border: 2px solid #1E90FF;">
      <div class="trash-count">${inorganicCount}</div>
      <div class="trash-type">Inorganic Bin (I)</div>
    </div>
    <div class="trash-option" style="background: rgba(255, 99, 71, 0.3); border: 2px solid #FF6347;">
      <div class="trash-count">${dangerousCount}</div>
      <div class="trash-type">Dangerous Bin (D)</div>
    </div>
    <div style="text-align: center; color: white; margin-top: 15px;">
      <p>Press ESC to cancel</p>
    </div>
  `;

  popup.style.display = "block";

  const handleKeyPress = (e) => {
    e.preventDefault();
    let depositedType = null;
    let binType = null;

    // Map keys to bin types (handle both uppercase and lowercase)
    if (e.key === 'I' || e.key === 'i') {
      binType = 'inorganic';
      // Find any trash type to deposit (priority: inorganic > organic > dangerous)
      if (inorganicCount > 0) {
        depositedType = 'inorganic';
      } else if (organicCount > 0) {
        depositedType = 'organic';
      } else if (dangerousCount > 0) {
        depositedType = 'dangerous';
      }
    } else if (e.key === 'D' || e.key === 'd') {
      binType = 'dangerous';
      // Find any trash type to deposit (priority: dangerous > inorganic > organic)
      if (dangerousCount > 0) {
        depositedType = 'dangerous';
      } else if (inorganicCount > 0) {
        depositedType = 'inorganic';
      } else if (organicCount > 0) {
        depositedType = 'organic';
      }
    } else if (e.key === 'O' || e.key === 'o') {
      binType = 'organic';
      // Find any trash type to deposit (priority: organic > dangerous > inorganic)
      if (organicCount > 0) {
        depositedType = 'organic';
      } else if (dangerousCount > 0) {
        depositedType = 'dangerous';
      } else if (inorganicCount > 0) {
        depositedType = 'inorganic';
      }
    } else if (e.key === 'Escape') {
      popup.style.display = "none";
      document.removeEventListener('keydown', handleKeyPress);
      isDepositPopupOpen = false;
      return;
    }

    if (depositedType && binType && inventory.length > 0) {
      // Remove one item of the deposited type from inventory
      const index = inventory.indexOf(depositedType);
      if (index !== -1) {
        inventory.splice(index, 1);

        // Check if the deposited trash matches the bin type
        const correct = depositedType === binType;
        const scoreChange = correct ? 5 : -5;

        updateScore(scoreChange);
        showFloatingText(
          correct ? `+5 Correct! ${depositedType} → ${binType} bin` : `-5 Wrong! ${depositedType} → ${binType} bin`,
          correct ? 0x00ff00 : 0xff0000
        );
        updateInventoryUI();
      }

      popup.style.display = "none";
      document.removeEventListener('keydown', handleKeyPress);
      isDepositPopupOpen = false;
      callback();
    }
  };

  document.addEventListener('keydown', handleKeyPress);
}

export function showFloatingText(text, color = 0xffffff) {
  const div = document.createElement("div");
  div.innerText = text;
  div.style.position = "absolute";
  div.style.color = `#${color.toString(16).padStart(6, '0')}`;
  div.style.fontSize = "2em";
  div.style.fontWeight = "bold";
  div.style.pointerEvents = "none";
  div.style.left = `${window.innerWidth / 2}px`;
  div.style.top = `${window.innerHeight / 2 - 100}px`;
  div.style.transform = "translateX(-50%)";
  div.style.zIndex = "1000";
  div.style.textShadow = "2px 2px 4px black";
  document.body.appendChild(div);

  let opacity = 1;
  const animate = () => {
    opacity -= 0.02;
    div.style.opacity = opacity;
    div.style.transform = `translateX(-50%) translateY(${100 * (1 - opacity)}px)`;
    if (opacity > 0) requestAnimationFrame(animate);
    else div.remove();
  };
  requestAnimationFrame(animate);
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
