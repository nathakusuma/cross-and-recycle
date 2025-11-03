import * as THREE from "three";
import { Renderer } from "./components/Renderer";
import { Camera } from "./components/Camera";
import { DirectionalLight } from "./components/DirectionalLight";
import { player } from "./components/Player";
import { map, initializeMap } from "./components/Map";
import { animateVehicles } from "./animateVehicles";
import { animatePlayer } from "./animatePlayer";
import "./style.css";
import "./collectUserInput";

const scene = new THREE.Scene();
// add player & map
scene.add(player);
scene.add(map);

// add ambient and directional light 
const ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);

const directionalLight = DirectionalLight();
scene.add(directionalLight);

const camera = Camera();
scene.add(camera);

initializeGame();

function initializeGame() {
  initializeMap();
}

const renderer = Renderer();
renderer.setAnimationLoop(animate)

function animate() {
  animateVehicles();
  animatePlayer();
  renderer.render(scene, camera);
}