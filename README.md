# MatrixCalculator.net MCP

A remote Model Context Protocol (MCP) server for exact, step-by-step matrix calculations powered by [MatrixCalculator.net](https://matrixcalculator.net).

**Remote MCP endpoint**

```text
https://mcp.matrixcalculator.net/mcp
```

**Official MCP Registry name**

```text
io.github.gamestarry/matrixcalculator-mcp
```

Current version: **0.1.0**

## What it does

MatrixCalculator.net MCP gives MCP-compatible AI clients access to six core matrix operations. Results preserve exact fractions and include structured calculation steps that an AI client can present as a short answer or expand into a detailed solution.

| Tool | Description |
| --- | --- |
| `matrix_add` | Add two matrices with identical dimensions, with one step per entry. |
| `matrix_subtract` | Subtract the second matrix from the first, with one step per entry. |
| `matrix_multiply` | Multiply compatible matrices using row-by-column steps. |
| `matrix_determinant` | Calculate a determinant with row swaps, elimination steps, diagonal entries, and singularity information. |
| `matrix_inverse` | Calculate an inverse with Gauss-Jordan row operations, singularity detection, and verification. |
| `matrix_transpose` | Transpose a matrix and return the source position for every result entry. |

## Exact values

Inputs may be integers, decimals, or fraction strings:

```text
2
0.5
-3
1/2
-7/4
```

Calculations use exact fraction arithmetic where possible. For example:

```text
1/2 + 1/3 = 5/6
```

rather than converting the result to an approximate decimal.

## Example requests

An MCP-compatible AI client can use the server for requests such as:

```text
Add [[1/2, 2], [3, 4]] and [[1/3, 5], [-1, 6]] and show the steps.
```

```text
Multiply [[1, 2], [3, 4]] by [[5, 6], [7, 8]].
```

```text
Find the determinant of [[0, 1/2, 1], [2, 1, 3], [1, 4, 5]] step by step.
```

```text
Find the inverse of [[0, 2, 1], [1, 1, 0], [2, 3, 4]] and verify the result.
```

The MCP server returns structured result data and detailed steps. The connected AI client decides how much of that detail to display to the user.

## Tool inputs

### `matrix_add`

```json
{
  "matrixA": [["1/2", "2"], ["3", "4"]],
  "matrixB": [["1/3", "5"], ["-1", "6"]]
}
```

### `matrix_subtract`

```json
{
  "matrixA": [["5/6", "7"], ["2", "10"]],
  "matrixB": [["1/3", "2"], ["-1", "4"]]
}
```

### `matrix_multiply`

```json
{
  "matrixA": [["1/2", "2"], ["3", "4"]],
  "matrixB": [["3", "1"], ["4", "2"]]
}
```

### `matrix_determinant`

```json
{
  "matrix": [["0", "1/2", "1"], ["2", "1", "3"], ["1", "4", "5"]]
}
```

### `matrix_inverse`

```json
{
  "matrix": [["0", "2", "1"], ["1", "1", "0"], ["2", "3", "4"]]
}
```

### `matrix_transpose`

```json
{
  "matrix": [["1/2", "2", "3"], ["4", "-1", "5"]]
}
```

## Connect

Use the following Streamable HTTP endpoint in any MCP client that supports remote MCP servers:

```text
https://mcp.matrixcalculator.net/mcp
```

No API key is required for the current public V1 endpoint.

## Health check

```text
https://mcp.matrixcalculator.net/health
```

## Local development

Requirements:

- Node.js
- npm
- Cloudflare Wrangler

Clone and install:

```bash
git clone https://github.com/gamestarry/matrixcalculator-mcp.git
cd matrixcalculator-mcp
npm install
```

Run type checking:

```bash
npm run typecheck
```

Start the local Worker:

```bash
npm run dev
```

The local MCP endpoint is normally:

```text
http://127.0.0.1:8787/mcp
```

## Deployment

The production server runs on Cloudflare Workers.

```bash
npm run deploy
```

Production MCP endpoint:

```text
https://mcp.matrixcalculator.net/mcp
```

## MCP Registry

This server is published in the official MCP Registry as:

```text
io.github.gamestarry/matrixcalculator-mcp
```

Registry metadata is stored in [server.json](./server.json).

## Project structure

```text
src/
├─ index.ts
├─ lib/
│  └─ matrix-values.ts
└─ tools/
   ├─ matrix-add.ts
   ├─ matrix-subtract.ts
   ├─ matrix-multiply.ts
   ├─ matrix-determinant.ts
   ├─ matrix-inverse.ts
   └─ matrix-transpose.ts
```

## About MatrixCalculator.net

[MatrixCalculator.net](https://matrixcalculator.net) provides matrix calculators, learning tools, and step-by-step matrix operations on the web.

This MCP project is maintained separately from the main website so MCP development and deployment do not affect the production calculator or its billing system.
