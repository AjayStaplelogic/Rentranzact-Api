import { sendMail } from '../helpers/sendMail.mjs'

export const inviteForProperty = (options) => {
  let { email, property_id, landlord_name, invitation_token, address, about_property } = options;
  let html = `
         <html>
<head>
  <title>Invitation!</title>
</head>
<body>
<div style="
    text-align: center;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 10px;
    width: 66%;
    margin: auto;
">
  <h1> Invitation to Rent Our Property!</h1>
  <p style="line-height: 18px">
    I hope you’re doing well. I’d like to invite you to consider renting our property at ${address}.
  </p>
  <h4>About Property</h4>
    <p style="line-height: 18px">
    ${about_property}
  </p>
  <p style="line-height: 18px">
    If you're interested, I'd be happy to schedule a viewing at your convenience. Please let me know if you’d like more details or to arrange a time to visit.
  </p>
  <span>`;

  if (invitation_token) {
    html += `
     <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}?invitation_token=${invitation_token}" 
  style="
  color: #ffffff;
  text-decoration:none; 
  border-radius: 5px;
  background-color: #13556d;
      padding: 10px;
          display: inline-block;
  ">View Property</a>
    `;
  } else {
    html += `
    <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" 
 style="
 color: #ffffff;
 text-decoration:none; 
 border-radius: 5px;
 background-color: #13556d;
     padding: 10px;
         display: inline-block;
 ">View Property</a>`
  }

  html += `</span>
  <p>Looking forward to serve you better.</p>
  <p style="line-height: 18px">
    Best regards,<br />
    <strong>Rentranzact Team</strong>
  </p>
  </div>
</body>
</html>
    `

  sendMail(email, " Invitation to Rent Our Property", html)
}
