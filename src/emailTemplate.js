function generateEmailTemplate(firstName, lastName, email, message) {
    return `
        <html>
            <head>
            </head>
            <body style="font-family: Arial, sans-serif;max-width: 600px;padding: 20px;border: 1px solid #ddd;border-radius: 5px;text-align:center;color:#57606F;line-height: 25px; margin:auto;">
                <table style="margin:auto;">
                    <tr>
                        <td colspan="2">
                            <img src="https://api.cheapernights.com/images/logo.png" alt="Logo Image" style="width: 210px; height: auto;">
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size: 24px; font-weight:600; padding-top:60px; align-text:center">Notification Title</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="font-size:14px; padding-top:5px">
                            A new message has been received from a user on CheaperNights.com.<br>Please review the details below:
                        </td>
                    </tr>
                    <tr style="padding-top: 30px;">
                        <td style="font-weight:600; text-align: right; padding-right: 10px; padding-top:30px;">First Name:</td>
                        <td style="text-align: left; padding-top:30px;">${firstName}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:600; text-align: right; padding-right: 10px;">Last Name:</td>
                        <td style="text-align: left;">${lastName}</td>
                    </tr>
                    <tr>
                        <td style="font-weight:600; text-align: right; padding-right: 10px;">Email:</td>
                        <td style="text-align: left;">${email}</td>
                    </tr>
                    <tr>
                       <td colspan="2"  style="font-weight:600;">Message:</td>
                    </tr>
                    <tr>
                        <td colspan="2">${message}</td>
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