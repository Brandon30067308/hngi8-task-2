const express = require('express');
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require('dotenv');
const app = express();

const port = process.env.PORT || 8000;

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendMail(subject, text) {
  return oAuth2Client.getAccessToken()
    .then(accessToken => {
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              type: "OAuth2",
              user: process.env.TO,
              clientId: process.env.CLIENT_ID,
              clientSecret: process.env.CLIENT_SECRET,
              refreshToken: process.env.REFRESH_TOKEN,
              accessToken: accessToken
          }
      });

      const mailOptions = {
          from: process.env.TO,
          to: process.env.FROM,
          subject: subject,
          text: text
      };

      transporter.sendMail(mailOptions)
        .then(result => {
          return result;
        })
        .catch(error => {
          throw error;
        });
    })
    .catch(error => {
      throw error;
    });
}

app.use(express.static('public'));

app.use(express.json());

app.post("/contact", (req, res) => {
  sendMail("message", `name: ${req.body.name}\nemail: ${req.body.email}\nmessage: ${req.body.message}`)
    .then(() => {
      console.log("mail sent successfully");
      res.json("mail sent successfully");
    })
    .catch(error => {
      console.log("error: ", error.message);
      res.status(500).json(error);
    });
});

app.listen(port, () => console.log(`application is running on port ${port}`));