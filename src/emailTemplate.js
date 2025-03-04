

function generateEmailTemplate(firstName, lastName, email, message) {
    return `
        <html>
            <head>
            </head>
            <body>
                <p style="font-family: Arial, sans-serif;max-width: 600px;margin: auto;padding: 20px;border: 1px solid #ddd;border-radius: 5px;text-align:center;color:#57606F;align-items: center;">
                    <img src="https://api.cheapernights.com/images/logo.png" alt="Logo Image" style="width: 210px; height: auto;">
                    <p style="font-size: 24px; font-weight:600; margin-top:60px">Notification Title</p>
                    <p style="font-size:14px; padding-top:5px">A new message has been received from a user on CheaperNights.com.<br>Please review the details below:
                    </p>
                    <p style="margin-top: 30px;font-size: 14px;line-height: 25px;">
                        <p>
                            <span style="font-weight:600">First Name:</span>
                            <span style="">${firstName}</span>
                        </p>
                        <p>
                            <span style="font-weight:600">Last Name:</span>
                            <span style="">${lastName}</span>
                        </p>
                        <p>
                            <span style="font-weight:600">Email:</span>
                            <span style="">${email}</span>
                        </p>
                        
                        <p style="font-weight:600">Message:</p>
                        <p>${message}</p>
                    </p>
                    <p style="margin-top: 60px; font-size: 12px;">
                        <p>&copy; 2025 CheaperNights.com. All rights reserved.</p>
                    </p>
                </p>
            </body>
        </html>
    `;
}

module.exports = generateEmailTemplate;