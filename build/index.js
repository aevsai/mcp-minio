#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = uploadFile;
exports.getFileContent = getFileContent;
exports.getFileUrl = getFileUrl;
exports.createBucket = createBucket;
exports.getBuckets = getBuckets;
exports.listFiles = listFiles;
exports.deleteFile = deleteFile;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const zod_1 = require("zod");
const minio_1 = require("minio");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const server = new mcp_js_1.McpServer({
    name: "mcp-minio-api",
    version: "1.0.0",
});
const minioClient = new minio_1.Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: parseInt(process.env.MINIO_PORT ?? "9000"),
    useSSL: process.env.MINIO_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY ?? process.env.MINIO_ROOT_USER ?? "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY ??
        process.env.MINIO_ROOT_PASSWORD ??
        "minioadmin",
});
// Example function to upload a file using Blob
async function uploadFile(bucketName, objectName, buffer) {
    await minioClient.putObject(bucketName, objectName, buffer);
    console.log("File uploaded successfully.");
}
// Example function to get file content from a bucket
async function getFileContent(bucketName, objectName) {
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
async function getFileUrl(bucketName, objectName) {
    try {
        const url = await minioClient.presignedUrl("GET", bucketName, objectName);
        console.log("File URL retrieved successfully:", url);
        return url;
    }
    catch (error) {
        console.log("Error in retrieving file URL:", error);
        throw error;
    }
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
// Function to list files in a bucket
async function listFiles(bucketName) {
    const stream = minioClient.listObjects(bucketName, "", true);
    const files = [];
    return new Promise((resolve, reject) => {
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
// Function to delete a file from a bucket
async function deleteFile(bucketName, objectName) {
    await minioClient.removeObject(bucketName, objectName);
    console.log("File deleted successfully.");
}
server.tool("uploadFile", {
    bucketName: zod_1.z.string(),
    objectName: zod_1.z.string(),
    buffer: zod_1.z.string(),
}, async ({ bucketName, objectName, buffer }) => {
    await uploadFile(bucketName, objectName, Buffer.from(buffer));
    return { content: [{ type: "text", text: "File uploaded successfully." }] };
});
server.tool("getFileContent", {
    bucketName: zod_1.z.string(),
    objectName: zod_1.z.string(),
}, async ({ bucketName, objectName }) => {
    const content = await getFileContent(bucketName, objectName);
    return {
        content: [{ type: "text", text: content }],
    };
});
server.tool("getFileUrl", {
    bucketName: zod_1.z.string(),
    objectName: zod_1.z.string(),
}, async ({ bucketName, objectName }) => {
    const url = await getFileUrl(bucketName, objectName);
    return {
        content: [{ type: "text", text: `File URL: ${url}` }],
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
server.tool("listFiles", {
    bucketName: zod_1.z.string(),
}, async ({ bucketName }) => {
    const files = await listFiles(bucketName);
    return {
        content: [
            {
                type: "text",
                text: `Files retrieved successfully: ${JSON.stringify(files)}`,
            },
        ],
    };
});
server.tool("deleteFile", {
    bucketName: zod_1.z.string(),
    objectName: zod_1.z.string(),
}, async ({ bucketName, objectName }) => {
    await deleteFile(bucketName, objectName);
    return {
        content: [{ type: "text", text: "File deleted successfully." }],
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
