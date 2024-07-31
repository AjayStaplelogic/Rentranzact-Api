import { sendMail } from '../helpers/sendMail.mjs'

const forgot_password_email = (options) => {
    let { email, otp, token } = options;
    let html = `
         <html>
<head>
  <title>Rentranzact - Forgot Password</title>
</head>
<body>
  <p>Please use the following code for your Email verification process.</p>
  <p>
    <span style="font-size: 20px; font-weight: bold; margin: 20px 10px">${otp}</span>
  </p>
  <div style = "font-size: 18px; border: 1px solid black; background-color: #13556d; color: white; border-radius: 5px; text-align: center;">
    <a href="https://rentranzact.com/change-password?token=${token}">Reset Password</a>
  </div>
  <p>Looking forward to serve you better.</p>
  <p>
    Best regards,<br />
    <strong>Rentranzact Team</strong>
  </p>
</body>
</html>
    `

    sendMail(email, "Forgot Password", html)
}

export {
    forgot_password_email
}