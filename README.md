# MCP Minio API README

This is a Model Context Protocol (MCP) API that allows you to interact with MinIO storage servers. Its key goal is to make all operations threw buffer without providing paths to files from filesystem.

## Features
- **Upload Files**: Upload files directly to a specified bucket using a buffer.
- **Retrieve Files**: Access and download files from a specified bucket.
- **Create Buckets**: Create new storage buckets if they do not already exist.
- **List Buckets**: Retrieve a list of all existing buckets.

## Usage

### Uploading a File
Use the `uploadFile` method by providing the bucket name, object name, and file buffer to upload a file to the MinIO server.

### Retrieving a File
Invoke the `getFile` method with the bucket name and object name to download a file from the MinIO server.

### Creating a Bucket
Call the `createBucket` method with the desired bucket name to create a new bucket if it does not already exist.

### Listing Buckets
Use the `getBuckets` method to fetch a list of all available storage buckets.

## Installation
Ensure you have Node.js installed. Clone the repository and run `npm install` to install all dependencies. Configure environment variables for MinIO credentials and endpoint.

## Author
This MCP Minio API was created by @aevsai
