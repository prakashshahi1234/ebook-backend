/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */

const { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { PDFDocument } = require('@pdf-lib/core');

const s3Client = new S3Client({ region: 'ap-south-1' }); // Set your AWS region

export const lambdaHandler = async (event, context) => {
  try {
    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    // Check if the file is a PDF
    if (key.toLowerCase().endsWith('.pdf')) {
      await processPdf(bucket, key);
    } else {
      console.log(`Skipped processing non-PDF file: ${key}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Processing complete',
      }),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error processing file',
      }),
    };
  }
};

const processPdf = async (bucket, key) => {
  try {
    // Download the PDF file from S3
    const getObjectParams = { Bucket: bucket, Key: key };
    const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(await Body.arrayBuffer());

    // Check the number of pages
    const numPages = pdfDoc.getPageCount();

    if (numPages <= 5) {
        const newFilename = `1.pdf`;
  
        // Upload the renamed PDF to S3
        const putObjectParams = {
          Bucket: bucket,
          Key: newFilename,
          Body: await Body.arrayBuffer(),
        };
        await s3Client.send(new PutObjectCommand(putObjectParams));
  
        // Delete the original PDF file from S3
        await s3Client.send(new DeleteObjectCommand(getObjectParams));
  
        console.log(`Renamed and processed for ${key}`);
        return;
      }

    // Determine if the PDF needs to be chunked
    const chunkSize = 5;
    const numChunks = Math.ceil(numPages / chunkSize);

    // Process each chunk
    for (let i = 0; i < numChunks; i++) {
      const startPage = i * chunkSize;
      const endPage = Math.min((i + 1) * chunkSize, numPages);

      // Extract the pages for the current chunk
      const chunkPdf = await PDFDocument.create();
      for (let pageIdx = startPage; pageIdx < endPage; pageIdx++) {
        const [copiedPage] = await chunkPdf.copyPages(pdfDoc, [pageIdx]);
        chunkPdf.addPage(copiedPage);
      }

      // Convert the chunked PDF to a buffer
      const chunkBuffer = await chunkPdf.save();

      // Determine the filename
      const chunkedFilename = `${key.split('.pdf')[0]}_${i / 5 + 1}.pdf`;
      // Upload the chunked PDF to S3
      const putObjectParams = {
        Bucket: bucket,
        Key: chunkedFilename,
        Body: chunkBuffer,
      };
      await s3Client.send(new PutObjectCommand(putObjectParams));
    }

    // Delete the original PDF file from S3
    await s3Client.send(new DeleteObjectCommand(getObjectParams));

    console.log(`Processing complete for ${key}`);
  } catch (error) {
    console.error(`Error processing ${key}: ${error.message}`);
  }
};

// // Usage
// const bucketName = 'your-bucket-name';
// const objectKey = 'path/to/your/file.pdf';

// processPdf(bucketName, objectKey);




