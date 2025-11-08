import * as THREE from 'three';
import { generateRows } from "../utilities/generateRows";
import { tileSize } from "../constants";
import { Grass } from './Grass';
import { Road } from './Road';
import { Tree } from './Tree';
import { Car } from './Car';
import { Truck } from './Truck';
import { Trash } from './Trash';
import { Bin } from './Bin';

export const metadata = [];

export const map = new THREE.Group();

export function initializeMap() {
  metadata.length = 0;
  map.remove(...map.children);

  for (let rowIndex = 0; rowIndex > -5; rowIndex--) {
    const grass = Grass(rowIndex);
    map.add(grass);
  }
  addRows();
}

export function addRows() {
  const newMetadata = generateRows(20);

  const startIndex = metadata.length;

  metadata.push(...newMetadata);

  newMetadata.forEach((rowData, index) => {
    const rowIndex = startIndex + index + 1;

    if (rowData.type === "forest") {
      const row = Grass(rowIndex);

      rowData.trees.forEach(({ tileIndex, height }) => {
        const tree = Tree(tileIndex, height);
        tree.position.x = tileIndex * tileSize;
        row.add(tree);
      });

      rowData.trash = rowData.trash || [];
      rowData.trash.forEach(item => {
        const trash = Trash(item.tileIndex, item.type);
        item.ref = trash;
        row.add(trash);
      });

      rowData.bins = rowData.bins || [];
      rowData.bins.forEach(binData => {
        const bin = Bin(binData.tileIndex, binData.type);
        binData.ref = bin;
        row.add(bin);
      });

      map.add(row);
    }

    if (rowData.type === "car") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const car = Car(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = car;
        row.add(car);
      });

      map.add(row);
    }

    if (rowData.type === "truck") {
      const row = Road(rowIndex);

      rowData.vehicles.forEach((vehicle) => {
        const truck = Truck(
          vehicle.initialTileIndex,
          rowData.direction,
          vehicle.color
        );
        vehicle.ref = truck;
        row.add(truck);
      });

      map.add(row);
    }
  });
}

