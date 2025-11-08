import * as THREE from "three";
import { tileSize } from "../constants";

export function Trash(tileIndex, type) {
  const trash = new THREE.Group();
  trash.position.x = tileIndex * tileSize;

  const color = type === 'organic' ? 0x8B4513 : 0x4682B4;
  const geometry = type === 'organic'
    ? new THREE.CylinderGeometry(8, 8, 2, 6)
    : new THREE.BoxGeometry(12, 12, 12);

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