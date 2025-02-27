function generateEmailTemplate(firstName, lastName, email, message) {
    return `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; }
                .container { padding: 20px; }
                .header { font-size: 20px; font-weight: bold; }
                .content { margin-top: 10px; }
                .footer { margin-top: 20px; font-size: 12px; color: #888; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">Contact Form Message</div>
                <div class="content">
                    <p><strong>From:</strong> ${firstName} ${lastName}</p>
                    <p><strong>User's email:</strong> ${email}</p>
                    <p><strong>Message:</strong> ${message}</p>
                </div>
                <div class="footer">
                    <p>This email was sent from the contact form on your website.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

module.exports = generateEmailTemplate;