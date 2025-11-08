import { calculateFinalPosition } from './calculateFinalPosition.js';
import { minTileIndex, maxTileIndex } from '../constants';
import { metadata as rows } from "../components/Map";

export function endsUpInValidPosition(currentPosition, moves) {
  const finalPosition = calculateFinalPosition(currentPosition, moves);

  if (
    finalPosition.rowIndex === -1 ||
    finalPosition.tileIndex === minTileIndex - 1 ||
    finalPosition.tileIndex === maxTileIndex + 1
  ) {
    return false;
  }

  const finalRow = rows[finalPosition.rowIndex - 1];

  if (finalRow && finalRow.type === "forest") {
    if (finalRow.trees.some(
      (tree) => tree.tileIndex === finalPosition.tileIndex
    )) {
      return false;
    }
  }

  return true;
}

