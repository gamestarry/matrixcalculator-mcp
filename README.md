# MatrixCalculator.net MCP

Remote MCP server for [MatrixCalculator.net](https://matrixcalculator.net) with step-by-step matrix calculations.

## V1 scope

Implemented tools:

- `matrix_add` — add two matrices with identical dimensions and return exact results plus one calculation step per entry.
- `matrix_subtract` — subtract two matrices with identical dimensions and return exact results plus one calculation step per entry.

Planned next tools:

- `matrix_multiply`
- `matrix_determinant`
- `matrix_inverse`
- `matrix_transpose`

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
