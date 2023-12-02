const nodemailer = require('nodemailer');
const { google } = require('googleapis');
// const CLIENT_ID = '850396080397-dj27h4o3irkqhmh65ekgoh29511n9kb5.apps.googleusercontent.com';
// const CLEINT_SECRET = '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';
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
// const REFRESH_TOKEN = '1//04UQrc6C5E2gBCgYIARAAGAQSNwF-L9IrWsxt1UkjiuPfAoReR8YZNBOHorhJ8W8f525svF4tF004IwqJZKv1cRyV8cNT0imqXxQ';
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLEINT_SECRET,
    process.env.REDIRECT_URI
   );

  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
  const accessToken =  oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.SMTP_MAIL,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLEINT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

const sendEmail = async(option)=>{
    var mailerOption = {
        from:process.env.SMTP_MAIL,
        to:option.email,
        subject:option.subject,
        text:option.message
    }

    try {
      const info = await transport.sendMail(mailerOption);
      console.log(info.response);
  } catch (err) {
      console.error(err);
  }
    
}

module.exports = sendEmail;