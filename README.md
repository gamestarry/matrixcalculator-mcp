# MatrixCalculator.net MCP

Remote MCP server for [MatrixCalculator.net](https://matrixcalculator.net) with step-by-step matrix calculations.

## V1 scope

Implemented tools:

- `matrix_add` — add two matrices with identical dimensions and return exact results plus one calculation step per entry.
- `matrix_subtract` — subtract two matrices with identical dimensions and return exact results plus one calculation step per entry.
- `matrix_multiply` — multiply compatible matrices and return exact results plus row-by-column calculation steps.
- `matrix_determinant` — calculate an exact determinant with row swaps, elimination steps, diagonal entries, and singularity information.
- `matrix_inverse` — calculate an exact inverse with Gauss-Jordan row operations, singularity detection, and verification.
- `matrix_transpose` — transpose a matrix and return the source position for every result entry.

## Development

```bash
npm install
npm run dev
```

The MCP endpoint is:

```text
/mcp
```

Health check:

```text
/health
```

This project is intentionally separate from the main MatrixCalculator.net website so MCP development cannot disturb the production calculator or billing system.
