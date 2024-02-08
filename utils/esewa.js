var crypto = require("crypto");

function getSignature  (message) {
  const secret = process.env.ESEWA_SECRET; //different in production
  // Create an HMAC-SHA256 hash
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(message);

  // Get the digest in base64 format
  const hashInBase64 = hmac.digest("base64");

  return hashInBase64;
};

function verifySignature  (decodedData) {

  const message = decodedData.signed_field_names
    .split(",")
    .map((field) => `${field}=${decodedData[field] || ""}`)
    .join(",");

  console.log(message);

  const signature = getSignature(message);

  // Compare the expectedHash with the receivedHash
  return signature === decodedData.signature;

};

module.exports ={getSignature , verifySignature}