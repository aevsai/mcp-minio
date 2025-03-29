# MCP Minio API README

This Model Context Protocol (MCP) API facilitates interaction with MinIO storage servers, aiming to perform all operations through buffers without relying on filesystem paths for files.

## Features
- **Upload Files**: Directly upload files to a specified bucket using a buffer.
- **Retrieve File Content**: Access and retrieve file contents from a specific bucket.
- **Generate File URLs**: Create URLs for accessing files stored in MinIO.
- **Create Buckets**: Initiate the creation of new storage buckets if they do not already exist.
- **List Buckets**: Obtain a list of all existing buckets.
- **List Files**: Retrieve a list of all files stored within a specified bucket.

## Usage

### Uploading a File
Utilize the `uploadFile` method by providing the bucket name, object name, and file buffer to transfer a file to the MinIO server.

### Retrieving File Content
Invoke the `getFileContent` method with the bucket name and object name to access the file content in the MinIO server.

### Creating a Bucket
Execute the `createBucket` method with the intended bucket name to establish a new bucket if one does not already exist.

### Listing Buckets
Deploy the `getBuckets` method to collect a comprehensive list of all available storage buckets.

### Listing Files
Apply the `listFiles` method by specifying the bucket name to list all files in that bucket.

## Installation
Ensure Node.js is installed. Clone the repository and execute `npm install` to install all necessary dependencies. Properly configure environment variables for MinIO credentials and endpoint settings.

## Author
This MCP Minio API was crafted by @aevsai.
