import { sendMail } from '../helpers/sendMail.mjs'

export const sendReferralLink = (options) => {
    let { email, referralCode } = options;
    console.log(`${process.env.FRONTEND_URL}/signup?referral=${referralCode}`);
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
  background-color: #13556d;
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
// try {
    
//     sendReferralLink({
//         code : "344dfaHHJHDJF3",
//         email : ["geivummaumeci-5197@yopmail.com", "shravan@yopmail.com"]
//     })
// } catch (error) {
//     console.log(error)
// }