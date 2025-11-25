import * as THREE from "three";
import { tileSize } from "../constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const modelCache = {
  garbageBin: null,
  isLoading: false,
  promise: null
};

async function loadGarbageBinModel() {
  if (modelCache.garbageBin) {
    return modelCache.garbageBin;
  }

  if (modelCache.isLoading && modelCache.promise) {
    return modelCache.promise;
  }

  modelCache.isLoading = true;
  modelCache.promise = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      '/garbage_bin.glb',
      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDimension = Math.max(size.x, size.y, size.z);
        const scale = 50 / maxDimension;
        model.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));

        modelCache.garbageBin = model;
        resolve(model);
      },
      undefined,
      (error) => {
        console.error('Error loading garbage bin model:', error);
        reject(error);
      }
    );
  });

  return modelCache.promise;
}

export function Bin(tileIndex) {
  const bin = new THREE.Group();
  bin.position.x = tileIndex * tileSize;

  const modelGroup = new THREE.Group();
  modelGroup.position.z = 15;

  loadGarbageBinModel()
    .then(originalModel => {
      const clonedModel = originalModel.clone();

      clonedModel.rotation.x = -Math.PI / 2; // Rotate 90 degrees to stand
      clonedModel.rotation.z = Math.PI; // Rotate 180 degrees to face forward

      modelGroup.add(clonedModel);
    })
    .catch(error => {
      console.error('Failed to load 3D model, falling back to primitive shape:', error);
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(25, 25, 30),
        new THREE.MeshLambertMaterial({
          color: 0x808080,
          flatShading: true,
        })
      );

      body.position.z = 15;
      body.castShadow = true;
      modelGroup.add(body);

      const rim = new THREE.Mesh(
        new THREE.BoxGeometry(27, 27, 3),
        new THREE.MeshLambertMaterial({ color: 0x333333 })
      );
      rim.position.z = 32;
      modelGroup.add(rim);

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
      modelGroup.add(symbol);
    });

  bin.add(modelGroup);

  bin.userData = { type: 'bin', isMultiBin: true };
  return bin;
}
