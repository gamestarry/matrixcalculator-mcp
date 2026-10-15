import { add, fraction, multiply } from "mathjs";
import {
  type FractionValue,
  type MatrixInputValue,
  formatOperand,
  fractionToString,
  matrixToStrings,
  parseMatrix
} from "../lib/matrix-values";

export interface MatrixMultiplyFactor {
  index: number;
  a: string;
  b: string;
  product: string;
}

export interface MatrixMultiplyStep {
  row: number;
  column: number;
  factors: MatrixMultiplyFactor[];
  calculation: string;
  result: string;
}

export interface MatrixMultiplyResult {
  operation: "matrix_multiply";
  matrixA: string[][];
  matrixB: string[][];
  result: string[][];
  steps: MatrixMultiplyStep[];
}

export function multiplyMatricesWithSteps(
  matrixAInput: MatrixInputValue[][],
  matrixBInput: MatrixInputValue[][]
): MatrixMultiplyResult {
  const matrixA = parseMatrix(matrixAInput, "matrixA");
  const matrixB = parseMatrix(matrixBInput, "matrixB");

  const rowsA = matrixA.length;
  const colsA = matrixA[0].length;
  const rowsB = matrixB.length;
  const colsB = matrixB[0].length;

  if (colsA !== rowsB) {
    throw new Error(
      `Matrix multiplication requires columns of A to equal rows of B. Received ${rowsA}×${colsA} and ${rowsB}×${colsB}.`
    );
  }

  const result: FractionValue[][] = [];
  const steps: MatrixMultiplyStep[] = [];

  for (let row = 0; row < rowsA; row += 1) {
    const resultRow: FractionValue[] = [];

    for (let column = 0; column < colsB; column += 1) {
      let sum = fraction(0);
      const factors: MatrixMultiplyFactor[] = [];
      const calculationParts: string[] = [];

      for (let index = 0; index < colsA; index += 1) {
        const left = matrixA[row][index];
        const right = matrixB[index][column];
        const product = multiply(left, right) as FractionValue;

        sum = add(sum, product) as FractionValue;

        factors.push({
          index: index + 1,
          a: fractionToString(left),
          b: fractionToString(right),
          product: fractionToString(product)
        });

        calculationParts.push(
          `${formatOperand(left)} * ${formatOperand(right)}`
        );
      }

      resultRow.push(sum);
      steps.push({
        row: row + 1,
        column: column + 1,
        factors,
        calculation: calculationParts.join(" + "),
        result: fractionToString(sum)
      });
    }

    result.push(resultRow);
  }

  return {
    operation: "matrix_multiply",
    matrixA: matrixToStrings(matrixA),
    matrixB: matrixToStrings(matrixB),
    result: matrixToStrings(result),
    steps
  };
}
