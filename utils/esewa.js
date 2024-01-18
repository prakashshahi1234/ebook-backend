const crypto = require("crypto")
// for esewa payment
exports.getSignature = function(message){ 

    const secret = process.env.ESEWA_SECRET;
    
    const hmac = crypto.createHmac('sha256', secret);
    
    hmac.update(message);
    
    const hashInBase64 = hmac.digest('base64');
    
    return hashInBase64;
    
    }


    exports.verifySignature = function(message, receivedHash) {

        const secret = process.env.ESEWA_SECRET;
      
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(message);
      
        const expectedHash = hmac.digest('base64');

        // Compare the expectedHash with the receivedHash
        return expectedHash === receivedHash;

      };


