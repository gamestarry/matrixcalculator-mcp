import { add, divide, fraction, multiply, subtract } from "mathjs";
import {
  type FractionValue,
  type MatrixInputValue,
  fractionToString,
  matrixToStrings,
  parseMatrix
} from "../lib/matrix-values";

type StringMatrix = string[][];

export type DeterminantStep =
  | {
      type: "initial";
      matrix: StringMatrix;
    }
  | {
      type: "swap";
      rowA: number;
      rowB: number;
      swapCount: number;
      sign: string;
      matrix: StringMatrix;
    }
  | {
      type: "eliminate";
      pivotRow: number;
      targetRow: number;
      pivotColumn: number;
      pivot: string;
      multiplier: string;
      pivotRowValues: string[];
      targetRowBefore: string[];
      targetRowAfter: string[];
      matrix: StringMatrix;
    }
  | {
      type: "singular";
      pivotRow: number;
      pivotColumn: number;
      matrix: StringMatrix;
    }
  | {
      type: "final";
      matrix: StringMatrix;
      diagonalEntries: string[];
      swapCount: number;
      sign: string;
      result: string;
      singular: boolean;
    };

export interface MatrixDeterminantResult {
  operation: "matrix_determinant";
  matrix: StringMatrix;
  result: string;
  rows: number;
  columns: number;
  swapCount: number;
  sign: string;
  singular: boolean;
  steps: DeterminantStep[];
}

function isZero(value: FractionValue): boolean {
  return value.n === 0n;
}

function cleanZero(value: FractionValue): FractionValue {
  return isZero(value) ? fraction(0) : value;
}

export function determinantWithSteps(
  matrixInput: MatrixInputValue[][]
): MatrixDeterminantResult {
  const original = parseMatrix(matrixInput, "matrix");
  const size = original.length;
  const columns = original[0].length;

  if (size !== columns) {
    throw new Error(
      `Determinant requires a square matrix. Received ${size}×${columns}.`
    );
  }

  const working = original.map((row) =>
    row.map((value) => fraction(fractionToString(value)))
  );

  const steps: DeterminantStep[] = [
    {
      type: "initial",
      matrix: matrixToStrings(working)
    }
  ];

  let swapCount = 0;
  let sign = fraction(1);
  let singular = false;

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
    let pivotRow = pivotIndex;

    while (pivotRow < size && isZero(working[pivotRow][pivotIndex])) {
      pivotRow += 1;
    }

    if (pivotRow === size) {
      singular = true;
      steps.push({
        type: "singular",
        pivotRow: pivotIndex + 1,
        pivotColumn: pivotIndex + 1,
        matrix: matrixToStrings(working)
      });
      break;
    }

    if (pivotRow !== pivotIndex) {
      const temp = working[pivotIndex];
      working[pivotIndex] = working[pivotRow];
      working[pivotRow] = temp;

      swapCount += 1;
      sign = multiply(sign, -1) as FractionValue;

      steps.push({
        type: "swap",
        rowA: pivotIndex + 1,
        rowB: pivotRow + 1,
        swapCount,
        sign: fractionToString(sign),
        matrix: matrixToStrings(working)
      });
    }

    const pivot = cleanZero(working[pivotIndex][pivotIndex]);

    if (isZero(pivot)) {
      singular = true;
      steps.push({
        type: "singular",
        pivotRow: pivotIndex + 1,
        pivotColumn: pivotIndex + 1,
        matrix: matrixToStrings(working)
      });
      break;
    }

    for (let targetRow = pivotIndex + 1; targetRow < size; targetRow += 1) {
      if (isZero(working[targetRow][pivotIndex])) {
        continue;
      }

      const multiplier = cleanZero(
        divide(working[targetRow][pivotIndex], pivot) as FractionValue
      );

      const pivotRowValues = working[pivotIndex].map(fractionToString);
      const targetRowBefore = working[targetRow].map(fractionToString);

      for (let column = pivotIndex; column < size; column += 1) {
        const product = multiply(
          multiplier,
          working[pivotIndex][column]
        ) as FractionValue;

        working[targetRow][column] = cleanZero(
          subtract(working[targetRow][column], product) as FractionValue
        );
      }

      working[targetRow][pivotIndex] = fraction(0);

      steps.push({
        type: "eliminate",
        pivotRow: pivotIndex + 1,
        targetRow: targetRow + 1,
        pivotColumn: pivotIndex + 1,
        pivot: fractionToString(pivot),
        multiplier: fractionToString(multiplier),
        pivotRowValues,
        targetRowBefore,
        targetRowAfter: working[targetRow].map(fractionToString),
        matrix: matrixToStrings(working)
      });
    }
  }

  const diagonalEntries = working.map((row, index) =>
    cleanZero(row[index])
  );

  let determinant = sign;

  for (const entry of diagonalEntries) {
    determinant = multiply(determinant, entry) as FractionValue;
  }

  determinant = cleanZero(determinant);
  singular = singular || isZero(determinant);

  if (singular) {
    determinant = fraction(0);
  }

  steps.push({
    type: "final",
    matrix: matrixToStrings(working),
    diagonalEntries: diagonalEntries.map(fractionToString),
    swapCount,
    sign: fractionToString(sign),
    result: fractionToString(determinant),
    singular
  });

  return {
    operation: "matrix_determinant",
    matrix: matrixToStrings(original),
    result: fractionToString(determinant),
    rows: size,
    columns,
    swapCount,
    sign: fractionToString(sign),
    singular,
    steps
  };
}
