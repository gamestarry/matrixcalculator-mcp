import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import { addMatricesWithSteps } from "./tools/matrix-add";

const matrixValueSchema = z.union([z.string(), z.number()]);
const matrixSchema = z.array(z.array(matrixValueSchema).min(1)).min(1);

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
        const message =
          error instanceof Error ? error.message : "Matrix addition failed.";

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: message
            }
          ]
        };
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
        tools: ["matrix_add"]
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
