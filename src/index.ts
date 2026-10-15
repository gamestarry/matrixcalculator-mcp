import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { addMatricesWithSteps } from "./tools/matrix-add";
import { determinantWithSteps } from "./tools/matrix-determinant";
import { inverseWithSteps } from "./tools/matrix-inverse";
import { multiplyMatricesWithSteps } from "./tools/matrix-multiply";
import { subtractMatricesWithSteps } from "./tools/matrix-subtract";

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

const handler = createMcpHandler(() => {
  const server = new McpServer({
    name: "MatrixCalculator.net MCP",
    version: "0.1.0"
  });

  server.registerTool(
    "matrix_add",
    {
      description:
        "Add two matrices with identical dimensions. Accepts integers, decimals, or fraction strings such as 1/2, and returns exact results with one calculation step per entry.",
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
        "Subtract the second matrix from the first matrix when both have identical dimensions. Accepts integers, decimals, or fraction strings such as 1/2, and returns exact results with one calculation step per entry.",
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
        "Multiply matrix A by matrix B when the number of columns of A equals the number of rows of B. Accepts integers, decimals, or fraction strings such as 1/2, and returns exact results with row-by-column calculation steps.",
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
        "Calculate the determinant of a square matrix exactly using elimination. Accepts integers, decimals, or fraction strings such as 1/2, and returns row-swap, elimination, diagonal-product, singularity, and final-result steps.",
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
        "Calculate the inverse of a square matrix exactly with Gauss-Jordan elimination. Accepts integers, decimals, or fraction strings such as 1/2, and returns exact row-operation steps, the inverse matrix, verification, and singularity information.",
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
          "matrix_inverse"
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
