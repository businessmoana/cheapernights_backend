const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const handleGoogleLensSearch = require('./src/handleGoogleLensSearch');
const handleGoogleSearch = require('./src/handleGoogleSearch');
const generateEmailTemplate = require('./src/emailTemplate');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let smtpTransport = nodemailer.createTransport({
    host: 'mail.privateemail.com', 
    port: 587, // Port for TLS
    secure: false, // Set to true if using port 465
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

app.get('/', (req, res) => {
    res.send('Hello')
});

app.post('/googleLensSearch', handleGoogleLensSearch);

app.post('/googleSearch', handleGoogleSearch)

app.post('/send-mail', function (req, res) {
    var mailOptions = {
        to: 'info@cheapernights.com',
        subject: 'Contact Form Message',
        from: "info@cheapernights.com",
        html: generateEmailTemplate(req.body.firstName, req.body.lastName, req.body.email, req.body.message)
    }
    smtpTransport.sendMail(mailOptions, function (err, response) {
        if (err) {
            console.log(err);
            res.end("error");
        } else {
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });
    res.send('mail sent');

});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})