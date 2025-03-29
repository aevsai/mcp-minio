import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client } from "minio";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "mcp-minio-api",
  version: "1.0.0",
});

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
  port: 9000,
  useSSL: process.env.MINIO_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER ?? "minioadmin",
  secretKey: process.env.MINIO_ROOT_PASSWORD ?? "minioadmin",
});

// Example function to upload a file using Blob
export async function uploadFile(
  bucketName: string,
  objectName: string,
  buffer: Buffer,
) {
  await minioClient.putObject(bucketName, objectName, buffer);
  console.log("File uploaded successfully.");
}

// Example function to get file content from a bucket
export async function getFileContent(
  bucketName: string,
  objectName: string,
): Promise<string> {
  const stream = await minioClient.getObject(bucketName, objectName);
  return new Promise((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk;
    });
    stream.on("end", () => {
      console.log("File content retrieved successfully.");
      resolve(data);
    });
    stream.on("error", (err) => {
      console.log("Error in retrieving file content:", err);
      reject(err);
    });
  });
}

// Example function to get a file URL from a bucket
export async function getFileUrl(
  bucketName: string,
  objectName: string,
): Promise<string> {
  try {
    const url = await minioClient.presignedUrl("GET", bucketName, objectName);
    console.log("File URL retrieved successfully:", url);
    return url;
  } catch (error) {
    console.log("Error in retrieving file URL:", error);
    throw error;
  }
}

// Function to create a new bucket
export async function createBucket(bucketName: string) {
  const exists = await minioClient.bucketExists(bucketName);
  if (!exists) {
    await minioClient.makeBucket(bucketName, "us-east-1");
    console.log("Bucket created successfully.");
  } else {
    console.log("Bucket already exists.");
  }
}

// Function to get the list of buckets
export async function getBuckets() {
  const buckets = await minioClient.listBuckets();
  console.log("Buckets retrieved successfully:", buckets);
  return buckets;
}

// Function to list files in a bucket
export async function listFiles(bucketName: string) {
  const stream = minioClient.listObjects(bucketName, "", true);
  const files: string[] = [];
  return new Promise<string[]>((resolve, reject) => {
    stream.on("data", (obj) => {
      if (obj.name) {
        files.push(obj.name);
      }
    });
    stream.on("end", () => {
      console.log("Files listed successfully.");
      resolve(files);
    });
    stream.on("error", (err) => {
      console.log("Error in listing files:", err);
      reject(err);
    });
  });
}

server.tool(
  "uploadFile",
  {
    bucketName: z.string(),
    objectName: z.string(),
    buffer: z.string(),
  },
  async ({ bucketName, objectName, buffer }) => {
    await uploadFile(bucketName, objectName, Buffer.from(buffer));
    return { content: [{ type: "text", text: "File uploaded successfully." }] };
  },
);

server.tool(
  "getFileContent",
  {
    bucketName: z.string(),
    objectName: z.string(),
  },
  async ({ bucketName, objectName }) => {
    const content = await getFileContent(bucketName, objectName);
    return {
      content: [{ type: "text", text: content }],
    };
  },
);

server.tool(
  "getFileUrl",
  {
    bucketName: z.string(),
    objectName: z.string(),
  },
  async ({ bucketName, objectName }) => {
    const url = await getFileUrl(bucketName, objectName);
    return {
      content: [{ type: "text", text: `File URL: ${url}` }],
    };
  },
);

server.tool(
  "createBucket",
  { bucketName: z.string() },
  async ({ bucketName }) => {
    await createBucket(bucketName);
    return {
      content: [{ type: "text", text: "Bucket handled successfully." }],
    };
  },
);

server.tool("getBuckets", {}, async () => {
  const buckets = await getBuckets();
  return {
    content: [
      {
        type: "text",
        text: `Buckets retrieved successfully: ${JSON.stringify(buckets)}`,
      },
    ],
  };
});

server.tool(
  "listFiles",
  {
    bucketName: z.string(),
  },
  async ({ bucketName }) => {
    const files = await listFiles(bucketName);
    return {
      content: [
        {
          type: "text",
          text: `Files retrieved successfully: ${JSON.stringify(files)}`,
        },
      ],
    };
  },
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Minio MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
