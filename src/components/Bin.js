import * as THREE from "three";
import { tileSize } from "../constants";

export function Bin(tileIndex, type) {
  const bin = new THREE.Group();
  bin.position.x = tileIndex * tileSize;

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(25, 25, 30),
    new THREE.MeshLambertMaterial({
      color: type === 'organic' ? 0x228B22 : 0x1E90FF,
      flatShading: true,
    })
  );
  body.position.z = 15;
  body.castShadow = true;
  bin.add(body);

  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(27, 27, 3),
    new THREE.MeshLambertMaterial({ color: 0x333333 })
  );
  rim.position.z = 32;
  bin.add(rim);

  const symbol = new THREE.Mesh(
    new THREE.PlaneGeometry(15, 15),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    })
  );
  symbol.position.z = 33.1;
  symbol.rotation.x = -Math.PI / 2;
  bin.add(symbol);

  bin.userData = { type: 'bin', binType: type };
  return bin;
}