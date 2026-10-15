import { add, divide, fraction, multiply, subtract } from "mathjs";
import {
  type FractionValue,
  type MatrixInputValue,
  fractionToString,
  matrixToStrings,
  parseMatrix
} from "../lib/matrix-values";

type StringMatrix = string[][];

function isZero(value: FractionValue): boolean {
  return value.n === 0n;
}

function isOne(value: FractionValue): boolean {
  return fractionToString(value) === "1";
}

function cloneMatrix(matrix: FractionValue[][]): FractionValue[][] {
  return matrix.map((row) =>
    row.map((value) => fraction(fractionToString(value)))
  );
}

function identity(size: number): FractionValue[][] {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) =>
      fraction(row === col ? 1 : 0)
    )
  );
}

function multiplyMatrices(
  matrixA: FractionValue[][],
  matrixB: FractionValue[][]
): FractionValue[][] {
  const result = Array.from({ length: matrixA.length }, () =>
    Array.from({ length: matrixB[0].length }, () => fraction(0))
  );

  for (let row = 0; row < matrixA.length; row += 1) {
    for (let col = 0; col < matrixB[0].length; col += 1) {
      let sum = fraction(0);

      for (let index = 0; index < matrixB.length; index += 1) {
        sum = add(
          sum,
          multiply(matrixA[row][index], matrixB[index][col])
        ) as FractionValue;
      }

      result[row][col] = sum;
    }
  }

  return result;
}

export function inverseWithSteps(matrixInput: MatrixInputValue[][]) {
  const parsed = parseMatrix(matrixInput, "matrix");
  const size = parsed.length;
  const columns = parsed[0].length;

  if (size !== columns) {
    throw new Error(
      `Matrix inverse requires a square matrix. Received ${size}×${columns}.`
    );
  }

  const original = cloneMatrix(parsed);
  const augmented: FractionValue[][] = original.map((row, index) => [
    ...cloneMatrix([row])[0],
    ...identity(size)[index]
  ]);

  const steps: Record<string, unknown>[] = [
    {
      type: "augment",
      matrix: matrixToStrings(augmented)
    }
  ];

  let singular = false;
  let singularColumn: number | null = null;

  for (let pivotIndex = 0; pivotIndex < size; pivotIndex += 1) {
    let pivotRow = pivotIndex;

    while (pivotRow < size && isZero(augmented[pivotRow][pivotIndex])) {
      pivotRow += 1;
    }

    if (pivotRow === size) {
      singular = true;
      singularColumn = pivotIndex + 1;
      steps.push({
        type: "singular",
        pivotRow: pivotIndex + 1,
        pivotColumn: pivotIndex + 1,
        matrix: matrixToStrings(augmented)
      });
      break;
    }

    if (pivotRow !== pivotIndex) {
      [augmented[pivotIndex], augmented[pivotRow]] = [
        augmented[pivotRow],
        augmented[pivotIndex]
      ];

      steps.push({
        type: "swap",
        rowA: pivotIndex + 1,
        rowB: pivotRow + 1,
        pivotColumn: pivotIndex + 1,
        matrix: matrixToStrings(augmented)
      });
    }

    const pivot = augmented[pivotIndex][pivotIndex];

    if (!isOne(pivot)) {
      const originalRow = augmented[pivotIndex].map(fractionToString);
      const factor = divide(fraction(1), pivot) as FractionValue;

      for (let col = 0; col < size * 2; col += 1) {
        augmented[pivotIndex][col] = multiply(
          factor,
          augmented[pivotIndex][col]
        ) as FractionValue;
      }

      augmented[pivotIndex][pivotIndex] = fraction(1);

      steps.push({
        type: "normalize",
        pivotRow: pivotIndex + 1,
        pivotColumn: pivotIndex + 1,
        pivot: fractionToString(pivot),
        factor: fractionToString(factor),
        originalRow,
        resultingRow: augmented[pivotIndex].map(fractionToString),
        matrix: matrixToStrings(augmented)
      });
    }

    for (let targetRow = 0; targetRow < size; targetRow += 1) {
      if (
        targetRow === pivotIndex ||
        isZero(augmented[targetRow][pivotIndex])
      ) {
        continue;
      }

      const multiplier = augmented[targetRow][pivotIndex];
      const targetRowBefore = augmented[targetRow].map(fractionToString);

      for (let col = 0; col < size * 2; col += 1) {
        augmented[targetRow][col] = subtract(
          augmented[targetRow][col],
          multiply(multiplier, augmented[pivotIndex][col])
        ) as FractionValue;
      }

      augmented[targetRow][pivotIndex] = fraction(0);

      steps.push({
        type: "eliminate",
        pivotRow: pivotIndex + 1,
        targetRow: targetRow + 1,
        pivotColumn: pivotIndex + 1,
        multiplier: fractionToString(multiplier),
        targetRowBefore,
        targetRowAfter: augmented[targetRow].map(fractionToString),
        matrix: matrixToStrings(augmented)
      });
    }
  }

  let inverseMatrix: FractionValue[][] | null = null;
  let verificationMatrix: FractionValue[][] | null = null;

  if (!singular) {
    inverseMatrix = augmented.map((row) => row.slice(size));
    verificationMatrix = multiplyMatrices(original, inverseMatrix);

    steps.push({
      type: "extract",
      inverseMatrix: matrixToStrings(inverseMatrix)
    });

    steps.push({
      type: "verify",
      verificationMatrix: matrixToStrings(verificationMatrix)
    });
  }

  return {
    operation: "matrix_inverse",
    matrix: matrixToStrings(original),
    result: inverseMatrix ? matrixToStrings(inverseMatrix) : null,
    augmentedMatrix: matrixToStrings(augmented),
    verificationMatrix: verificationMatrix
      ? matrixToStrings(verificationMatrix)
      : null,
    rows: size,
    columns,
    singular,
    singularColumn,
    steps
  };
}
