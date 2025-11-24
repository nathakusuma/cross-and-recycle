import * as THREE from "three";
import { tileSize } from "../constants";

export function Trash(tileIndex, type) {
  const trash = new THREE.Group();
  trash.position.x = tileIndex * tileSize;

  let color, geometry;

  if (type === 'organic') {
    color = 0x8B4513;
    geometry = new THREE.CylinderGeometry(8, 8, 2, 6);
  } else if (type === 'inorganic') {
    color = 0x4682B4;
    geometry = new THREE.BoxGeometry(12, 12, 12);
  } else if (type === 'dangerous') {
    color = 0xFF4500;
    geometry = new THREE.OctahedronGeometry(10, 0);
  }

  const material = new THREE.MeshLambertMaterial({
    color,
    flatShading: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.z = 8;
  mesh.castShadow = true;
  mesh.userData = { type: 'trash', trashType: type };
  trash.add(mesh);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 10),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    })
  );
  label.position.z = 20;
  label.position.y = 10;
  label.rotation.x = -Math.PI / 2;
  trash.add(label);

  trash.userData = { collectable: true, trashType: type };
  return trash;
}