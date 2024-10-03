import { sendMail } from '../helpers/sendMail.mjs'

const forgot_password_email = (options) => {
  let { email, otp, user_id, fullName } = options;
  let html = `
         <html>
<head>
  <title>Rentranzact - Forgot Password</title>
</head>
<body>
<div style="text-align: center">
  <p>Hi, ${fullName ?? ""}</p>
  <p>We have received your reset password request. Please find the OTP to reset your password.</p>
  <p><b>${otp}</b></p>
  <p>Looking forward to serve you better.</p>
  <p>
    Best regards,<br />
    <strong>Rentranzact Team</strong>
  </p>
  </div>
</body>
</html>
    `

  sendMail(email, "Forgot Password", html)
}

export {
  forgot_password_email
}