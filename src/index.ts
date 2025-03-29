import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Client } from "minio";

const server = new McpServer({
  name: "mcp-minio-api",
  version: "1.0.0",
});

const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? "play.min.io",
  port: 9000,
  useSSL: process.env.MINIO_SSL === "true",
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
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

// Example function to get a file from a bucket
export async function getFile(bucketName: string, objectName: string) {
  const stream = await minioClient.getObject(bucketName, objectName);
  let data = "";
  stream.on("data", (chunk) => {
    data += chunk;
  });
  stream.on("end", () => {
    console.log("File retrieved successfully.");
  });
  stream.on("error", (err) => {
    console.log("Error in retrieving file:", err);
  });
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
  "getFile",
  {
    bucketName: z.string(),
    objectName: z.string(),
  },
  async ({ bucketName, objectName }) => {
    await getFile(bucketName, objectName);
    return {
      content: [{ type: "text", text: "File retrieved successfully." }],
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
