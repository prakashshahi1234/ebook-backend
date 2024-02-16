const {PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner")
const s3Client = require("../config/awsS3");

async function fileUpload(key , contentType , expiresInSeconds){
    
    const command = new PutObjectCommand({
        Bucket: "ebook-nepal-1",
        Key: key,
        ContentType:contentType, // Replace with your desired content type
      });
    
      const url = await getSignedUrl(s3Client,command, { expiresIn: expiresInSeconds });
 
      return url;
    }
    
 async function loadFile(key  ,  expiresInSeconds){

    const command = new GetObjectCommand({
        Bucket: "ebook-nepal-1",
        Key: key,
      });
    
      const url = await getSignedUrl(s3Client,command, { expiresIn: expiresInSeconds });
 
      return url;
}

module.exports = {fileUpload , loadFile};