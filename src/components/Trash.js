import * as THREE from "three";
import { tileSize } from "../constants";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const modelCache = {
  organic: null,
  inorganic: null,
  dangerous: null,
  loadingStates: {
    organic: false,
    inorganic: false,
    dangerous: false
  },
  promises: {
    organic: null,
    inorganic: null,
    dangerous: null
  }
};

async function loadTrashModel(type) {
  if (modelCache[type]) {
    return modelCache[type];
  }

  if (modelCache.loadingStates[type] && modelCache.promises[type]) {
    return modelCache.promises[type];
  }

  modelCache.loadingStates[type] = true;

  const modelPaths = {
    organic: '/organic_trash.glb',
    inorganic: '/inorganic_trash.glb',
    dangerous: '/dangerous_trash.glb'
  };

  modelCache.promises[type] = new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      modelPaths[type],
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
        const scale = 16 / maxDimension;
        model.scale.set(scale, scale, scale);

        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center.multiplyScalar(scale));

        modelCache[type] = model;
        resolve(model);
      },
      undefined,
      (error) => {
        console.error(`Error loading ${type} trash model:`, error);
        reject(error);
      }
    );
  });

  return modelCache.promises[type];
}

export function Trash(tileIndex, type) {
  const trash = new THREE.Group();
  trash.position.x = tileIndex * tileSize;

  const modelGroup = new THREE.Group();
  modelGroup.position.z = 8;

  loadTrashModel(type)
    .then(originalModel => {
      const clonedModel = originalModel.clone();
      modelGroup.add(clonedModel);
    })
    .catch(error => {
      console.error(`Failed to load ${type} 3D model, falling back to primitive shape:`, error);

      let geometry;
      let color;

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
      mesh.castShadow = true;
      mesh.userData = { type: 'trash', trashType: type };
      modelGroup.add(mesh);
    });

  modelGroup.userData = { type: 'trash', trashType: type };
  trash.add(modelGroup);

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
