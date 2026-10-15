import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { addMatricesWithSteps } from "./tools/matrix-add";
import { determinantWithSteps } from "./tools/matrix-determinant";
import { inverseWithSteps } from "./tools/matrix-inverse";
import { multiplyMatricesWithSteps } from "./tools/matrix-multiply";
import { subtractMatricesWithSteps } from "./tools/matrix-subtract";
import { transposeWithSteps } from "./tools/matrix-transpose";

const matrixValueSchema = z.union([z.string(), z.number()]);
const matrixSchema = z.array(z.array(matrixValueSchema).min(1)).min(1);

function toolError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;

  return {
    isError: true as const,
    content: [
      {
        type: "text" as const,
        text: message
      }
    ]
  };
}

const serverInstructions = "MatrixCalculator.net provides deterministic matrix arithmetic tools. When a user asks for matrix addition, subtraction, multiplication, determinant, inverse, or transpose, use the matching available tool when it helps produce a reliable exact answer or show steps. The tools accept rectangular matrices of integers, decimal values, and fraction strings such as 1/2; determinant and inverse require square matrices. Tool responses include exact result values and structured calculation steps; present just the final result when requested, or explain the relevant steps when requested. Do not alter signs, fractions, or matrix entries while reformatting results; rely on the returned exact values and verification matrix when available. An inverse result of null with singular true means the matrix is not invertible. These tools are read-only calculations without external data access. Do not claim to have called a tool if it was not actually used.";

// All six operations compute from caller-provided inputs only.
// They do not write data, access external services, or have side effects.
const calculationAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

const handler = createMcpHandler(() => {
  const server = new McpServer(
    {
      name: "MatrixCalculator.net MCP",
      version: "0.1.0"
    },
    { instructions: serverInstructions }
  );

  server.registerTool(
    "matrix_add",
    {
      description:
        "Add two matrices of the same dimensions entry by entry. Useful for exact matrix addition or explaining each entry step by step. Accepts integers, decimals, and fraction strings (for example 1/2); returns the exact sum matrix and a calculation for each position.",
      annotations: calculationAnnotations,
      inputSchema: z.object({
        matrixA: matrixSchema.describe("First matrix."),
        matrixB: matrixSchema.describe("Second matrix.")
      })
    },
    async ({ matrixA, matrixB }) => {
      try {
        const result = addMatricesWithSteps(matrixA, matrixB);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return toolError(error, "Matrix addition failed.");
      }
    }
  );

  server.registerTool(
    "matrix_subtract",
    {
      description:
        "Subtract matrix B from matrix A when both have the same dimensions. Useful for exact matrix subtraction, including negative values and step-by-step entry calculations. Accepts integers, decimals, and fraction strings; returns each exact difference and its calculation.",
      annotations: calculationAnnotations,
      inputSchema: z.object({
        matrixA: matrixSchema.describe("Matrix to subtract from."),
        matrixB: matrixSchema.describe("Matrix to subtract.")
      })
    },
    async ({ matrixA, matrixB }) => {
      try {
        const result = subtractMatricesWithSteps(matrixA, matrixB);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return toolError(error, "Matrix subtraction failed.");
      }
    }
  );

  server.registerTool(
    "matrix_multiply",
    {
      description:
        "Multiply A by B when A's column count equals B's row count, including non-square matrices. Useful for exact matrix multiplication and step-by-step row-by-column dot products. Returns exact results plus each factor pair, product, and entry calculation; accepts fractions and decimals.",
      annotations: calculationAnnotations,
      inputSchema: z.object({
        matrixA: matrixSchema.describe("Left matrix A."),
        matrixB: matrixSchema.describe("Right matrix B.")
      })
    },
    async ({ matrixA, matrixB }) => {
      try {
        const result = multiplyMatricesWithSteps(matrixA, matrixB);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return toolError(error, "Matrix multiplication failed.");
      }
    }
  );

  server.registerTool(
    "matrix_determinant",
    {
      description:
        "Find the exact determinant of a square matrix using fraction-preserving elimination. Use for determinant questions requiring row swaps, elimination steps, pivot multipliers, sign changes, diagonal products, or singularity checks. Returns the determinant and detailed operation steps.",
      annotations: calculationAnnotations,
      inputSchema: z.object({
        matrix: matrixSchema.describe("Square matrix.")
      })
    },
    async ({ matrix }) => {
      try {
        const result = determinantWithSteps(matrix);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return toolError(error, "Determinant calculation failed.");
      }
    }
  );

  server.registerTool(
    "matrix_inverse",
    {
      description:
        "Find an exact inverse of a square matrix with step-by-step Gauss-Jordan elimination. Use for inverse questions needing exact fractions, augmented matrices, row swaps, normalization, elimination, and verification that A times A-inverse is identity. Returns the inverse and verification, or null with singular=true if not invertible.",
      annotations: calculationAnnotations,
      inputSchema: z.object({
        matrix: matrixSchema.describe("Square matrix.")
      })
    },
    async ({ matrix }) => {
      try {
        const result = inverseWithSteps(matrix);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (error) {
        return toolError(error, "Matrix inverse calculation failed.");
      }
    }
  );
  server.registerTool(
    "matrix_transpose",
    {
      description:
        "Transpose a rectangular or square matrix by exchanging rows and columns. Useful for requests to show where each result entry originated. Preserves exact integer, decimal, and fraction inputs and returns the transposed matrix with source-to-result position mappings.",
      annotations: calculationAnnotations,
      inputSchema: z.object({
        matrix: matrixSchema.describe("Matrix to transpose.")
      })
    },
    async ({ matrix }) => {
      try {
        const result = transposeWithSteps(matrix);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
        };
      } catch (error) {
        return toolError(error, "Matrix transpose failed.");
      }
    }
  );
  return server;
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return jsonResponse({
        name: "MatrixCalculator.net MCP",
        version: "0.1.0",
        status: "ok",
        mcpEndpoint: "/mcp",
        tools: [
          "matrix_add",
          "matrix_subtract",
          "matrix_multiply",
          "matrix_determinant",
          "matrix_inverse",
          "matrix_transpose"
        ]
      });
    }

    if (request.method === "GET" && url.pathname === "/health") {
      return jsonResponse({ status: "ok" });
    }

    if (url.pathname !== "/mcp") {
      return jsonResponse({ error: "Not found" }, 404);
    }

    return handler.fetch(request);
  }
};
