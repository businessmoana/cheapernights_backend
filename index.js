const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const handleGoogleLensSearch = require('./src/handleGoogleLensSearch');
const handleGoogleSearch = require('./src/handleGoogleSearch');
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

// app.post('/googleSearch', handleGoogleSearch)

app.post('/googleSearch', function (req, res) {
    console.log(req.body);
    var mailOptions = {
        to: 'businessmoana118@gmail.com',
        subject: 'Contact Form Message',
        from: "info@cheapernights.com",
        html:  "From: " + "req.query.name" + "<br>" +
               "User's email: " + "req.query.user" + "<br>" +     "Message: " + "req.query.text"
    }

    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function (err, response) {
        if (err) {
            console.log(err);
            res.end("error");
        } else {
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });

});

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
})