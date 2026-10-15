import { add } from "mathjs";
import {
  type FractionValue,
  type MatrixInputValue,
  formatOperand,
  fractionToString,
  matrixToStrings,
  parseMatrix
} from "../lib/matrix-values";

export interface MatrixAddStep {
  row: number;
  column: number;
  calculation: string;
  result: string;
}

export interface MatrixAddResult {
  operation: "matrix_add";
  matrixA: string[][];
  matrixB: string[][];
  result: string[][];
  steps: MatrixAddStep[];
}

export function addMatricesWithSteps(
  matrixAInput: MatrixInputValue[][],
  matrixBInput: MatrixInputValue[][]
): MatrixAddResult {
  const matrixA = parseMatrix(matrixAInput, "matrixA");
  const matrixB = parseMatrix(matrixBInput, "matrixB");

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error(
      `Matrix addition requires equal dimensions. Received ${rowsA}×${colsA} and ${rowsB}×${colsB}.`
    );
  }

  const result: FractionValue[][] = [];
  const steps: MatrixAddStep[] = [];

  for (let row = 0; row < rowsA; row += 1) {
    const resultRow: FractionValue[] = [];

    for (let column = 0; column < colsA; column += 1) {
      const left = matrixA[row][column];
      const right = matrixB[row][column];
      const sum = add(left, right) as FractionValue;

      resultRow.push(sum);
      steps.push({
        row: row + 1,
        column: column + 1,
        calculation: `${formatOperand(left)} + ${formatOperand(right)}`,
        result: fractionToString(sum)
      });
    }

    result.push(resultRow);
  }

  return {
    operation: "matrix_add",
    matrixA: matrixToStrings(matrixA),
    matrixB: matrixToStrings(matrixB),
    result: matrixToStrings(result),
    steps
  };
}
