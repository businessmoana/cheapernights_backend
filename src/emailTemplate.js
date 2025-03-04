function generateEmailTemplate(firstName, lastName, email, message) {
    return `
        <html>
            <head>
            </head>
            <body>
                <table style="font-family: Arial, sans-serif;max-width: 600px;margin: auto;padding: 20px;border: 1px solid #ddd;border-radius: 5px;text-align:center;color:#57606F;align-items: center;">
                    <tr>
                        <td colspan="2">
                            <img src="https://api.cheapernights.com/images/logo.png" alt="Logo Image" style="width: 210px; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size: 24px; font-weight:600; margin-top:60px">Notification Title</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size:14px; padding-top:5px">
                            A new message has been received from a user on CheaperNights.com.<br>Please review the details below:
                        </td>
                    </tr>
                    <tr>
                        <td style="font-weight:600; text-align: right; padding-right: 10px;">First Name:</td>
                        <td style="text-align: left;"><span>${firstName}</span></td>
                    </tr>
                    <tr>
                        <td style="font-weight:600; text-align: right; padding-right: 10px;">Last Name:</td>
                        <td style="text-align: left;"><span>${lastName}</span></td>
                    </tr>
                    <tr>
                        <td style="font-weight:600; text-align: right; padding-right: 10px;">Email:</td>
                        <td style="text-align: left;"><span>${email}</span></td>
                    </tr>
                    <tr>
                        <td style="font-weight:600; text-align: right; padding-right: 10px;">Message:</td>
                        <td style="text-align: left;"><span>${message}</span></td>
                    </tr>
                    <tr>
                        <td colspan="2" style="margin-top: 60px; font-size: 12px;">
                            <p>&copy; 2025 CheaperNights.com. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;
}

module.exports = generateEmailTemplate;