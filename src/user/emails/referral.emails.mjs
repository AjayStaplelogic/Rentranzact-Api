import { sendMail } from '../helpers/sendMail.mjs'

export const sendReferralLink = (options) => {
    let { email, referralCode } = options;
    let html = `
         <html>
<head>
  <title>Rentranzact - Referral program invitation!</title>
</head>
<body>
<div style="text-align: center">
  <p>Referral program invitation!</p>
  <p>Hi, your friend referred you to join Rentranzact. Click on the below signup button to register using referral</p>
  <p><b>${referralCode}</b></p>
  <span>
  <a href="${process.env.FRONTEND_URL}/signup?referral=${referralCode}" 
  style="
  color: #ffffff;
  text-decoration:none; 
  border-radius: 5px;
  background-color: rgba(19, 85, 109, 1);
  padding: 10px 20px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 20px";
  display: inline-block;
  ">Sign Up</a>
  </span>
  <p>Looking forward to serve you better.</p>
  <p>
    Best regards,<br />
    <strong>Rentranzact Team</strong>
  </p>
  </div>
</body>
</html>
    `

    sendMail(email, "Referral program invitation!", html)
}

