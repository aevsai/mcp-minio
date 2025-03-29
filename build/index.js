"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.getFile = getFile;
exports.createBucket = createBucket;
exports.getBuckets = getBuckets;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const minio_1 = require("minio");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const server = new mcp_js_1.McpServer({
    name: "mcp-minio-api",
    version: "1.0.0",
});
const minioClient = new minio_1.Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "play.min.io",
    port: 9000,
    useSSL: process.env.MINIO_SSL === "true",
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
});
// Example function to upload a file using Blob
async function uploadFile(bucketName, objectName, buffer) {
    await minioClient.putObject(bucketName, objectName, buffer);
    console.log("File uploaded successfully.");
}
// Example function to get a file from a bucket
async function getFile(bucketName, objectName) {
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
async function createBucket(bucketName) {
    const exists = await minioClient.bucketExists(bucketName);
    if (!exists) {
        await minioClient.makeBucket(bucketName, "us-east-1");
        console.log("Bucket created successfully.");
    }
    else {
        console.log("Bucket already exists.");
    }
}
// Function to get the list of buckets
async function getBuckets() {
    const buckets = await minioClient.listBuckets();
    console.log("Buckets retrieved successfully:", buckets);
    return buckets;
}
server.tool("uploadFile", {
    bucketName: zod_1.z.string(),
    objectName: zod_1.z.string(),
    buffer: zod_1.z.string(),
}, async ({ bucketName, objectName, buffer }) => {
    await uploadFile(bucketName, objectName, Buffer.from(buffer));
    return { content: [{ type: "text", text: "File uploaded successfully." }] };
});
server.tool("getFile", {
    bucketName: zod_1.z.string(),
    objectName: zod_1.z.string(),
}, async ({ bucketName, objectName }) => {
    await getFile(bucketName, objectName);
    return {
        content: [{ type: "text", text: "File retrieved successfully." }],
    };
});
server.tool("createBucket", { bucketName: zod_1.z.string() }, async ({ bucketName }) => {
    await createBucket(bucketName);
    return {
        content: [{ type: "text", text: "Bucket handled successfully." }],
    };
});
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
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Minio MCP Server running on stdio");
}
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
