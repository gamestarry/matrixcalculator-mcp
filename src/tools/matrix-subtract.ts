import { subtract } from "mathjs";
import {
  type FractionValue,
  type MatrixInputValue,
  formatOperand,
  fractionToString,
  matrixToStrings,
  parseMatrix
} from "../lib/matrix-values";

export interface MatrixSubtractStep {
  row: number;
  column: number;
  calculation: string;
  result: string;
}

export interface MatrixSubtractResult {
  operation: "matrix_subtract";
  matrixA: string[][];
  matrixB: string[][];
  result: string[][];
  steps: MatrixSubtractStep[];
}

export function subtractMatricesWithSteps(
  matrixAInput: MatrixInputValue[][],
  matrixBInput: MatrixInputValue[][]
): MatrixSubtractResult {
  const matrixA = parseMatrix(matrixAInput, "matrixA");
  const matrixB = parseMatrix(matrixBInput, "matrixB");

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (rowsA !== rowsB || colsA !== colsB) {
    throw new Error(
      `Matrix subtraction requires equal dimensions. Received ${rowsA}×${colsA} and ${rowsB}×${colsB}.`
    );
  }

  const result: FractionValue[][] = [];
  const steps: MatrixSubtractStep[] = [];

  for (let row = 0; row < rowsA; row += 1) {
    const resultRow: FractionValue[] = [];

    for (let column = 0; column < colsA; column += 1) {
      const left = matrixA[row][column];
      const right = matrixB[row][column];
      const difference = subtract(left, right) as FractionValue;

      resultRow.push(difference);
      steps.push({
        row: row + 1,
        column: column + 1,
        calculation: `${formatOperand(left)} - ${formatOperand(right)}`,
        result: fractionToString(difference)
      });
    }

    result.push(resultRow);
  }

  return {
    operation: "matrix_subtract",
    matrixA: matrixToStrings(matrixA),
    matrixB: matrixToStrings(matrixB),
    result: matrixToStrings(result),
    steps
  };
}
