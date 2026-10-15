import {
  type MatrixInputValue,
  matrixToStrings,
  parseMatrix
} from "../lib/matrix-values";

export interface MatrixTransposeStep {
  row: number;
  column: number;
  sourceRow: number;
  sourceColumn: number;
  value: string;
}

export function transposeWithSteps(matrixInput: MatrixInputValue[][]) {
  const matrix = parseMatrix(matrixInput, "matrix");
  const rows = matrix.length;
  const columns = matrix[0].length;

  const result = Array.from({ length: columns }, (_, resultRow) =>
    Array.from({ length: rows }, (_, resultColumn) =>
      matrix[resultColumn][resultRow]
    )
  );

  const steps: MatrixTransposeStep[] = [];

  for (let resultRow = 0; resultRow < columns; resultRow += 1) {
    for (let resultColumn = 0; resultColumn < rows; resultColumn += 1) {
      steps.push({
        row: resultRow + 1,
        column: resultColumn + 1,
        sourceRow: resultColumn + 1,
        sourceColumn: resultRow + 1,
        value: matrixToStrings([[matrix[resultColumn][resultRow]]])[0][0]
      });
    }
  }

  return {
    operation: "matrix_transpose",
    matrix: matrixToStrings(matrix),
    result: matrixToStrings(result),
    rows,
    columns,
    resultRows: columns,
    resultColumns: rows,
    steps
  };
}
