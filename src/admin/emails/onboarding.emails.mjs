import { sendMail } from '../../user/helpers/sendMail.mjs'

export const addEmployeeEmail = (options) => {
    try {
        let { email, password, fullName } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Rentranzact</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Welcome to Rentranzact, ${fullName}!</h2>
    <p style="font-size: 16px; color: #555555">We are excited to have you onboard with Rentranzact. Your account has been successfully created, and you're all set to get started.</p>

    <h3>Your login credentials:</h3>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Password:</strong> ${password}</p>

    <p>To access your account, please log in to the platform</p>

    <a href="${process.env.FRONTEND_URL}/admin/login" class="button" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px">Login to Rentranzact</a>

    <div class="footer" style=" font-size: 12px;
            color: #888888;
            text-align: center;
            margin-top: 40px;">
        <p>Best regards,<br>The Rentranzact Team</p>
    </div>
</div>
</body>
</html>
    `
        sendMail(email, `Welcome to Rentranzact - ${fullName}`, html)
    } catch (error) {
    }
}
