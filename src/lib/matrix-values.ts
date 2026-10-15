import { fraction, type Fraction } from "mathjs";

export type MatrixInputValue = string | number;
export type FractionValue = Fraction;

export function parseMatrix(
  input: MatrixInputValue[][],
  label: string
): FractionValue[][] {
  if (!Array.isArray(input) || input.length === 0) {
    throw new Error(`${label} must contain at least one row.`);
  }

  const columnCount = input[0]?.length ?? 0;
  if (columnCount === 0) {
    throw new Error(`${label} must contain at least one column.`);
  }

  return input.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== columnCount) {
      throw new Error(`${label} must be rectangular.`);
    }

    return row.map((value, columnIndex) => {
      const raw = String(value).trim();

      if (!raw) {
        throw new Error(
          `${label}[${rowIndex + 1},${columnIndex + 1}] cannot be empty.`
        );
      }

      try {
        return fraction(raw);
      } catch {
        throw new Error(
          `${label}[${rowIndex + 1},${columnIndex + 1}] is not a valid integer, decimal, or fraction.`
        );
      }
    });
  });
}

export function fractionToString(value: FractionValue): string {
  const numerator = value.s * value.n;

  if (value.d === 1n) {
    return String(numerator);
  }

  return `${numerator}/${value.d}`;
}

export function matrixToStrings(matrix: FractionValue[][]): string[][] {
  return matrix.map((row) => row.map(fractionToString));
}

export function formatOperand(value: FractionValue): string {
  const text = fractionToString(value);
  return text.startsWith("-") ? `(${text})` : text;
}
