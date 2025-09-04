import { sendMail } from '../helpers/sendMail.mjs'

// export const inviteForProperty = (options) => {
//   let { email, property_id, property_name, invitation_token, address, about_property } = options;
//   let html = `
//          <html>
// <head>
//   <title>Invitation!</title>
// </head>
// <body>
// <div style="
//     text-align: center;
//     border: 1px solid gray;
//     border-radius: 10px;
//     padding: 10px;
//     width: 66%;
//     margin: auto;
// ">
//   <h1> Invitation to Rent Our Property!</h1>
//   <p style="line-height: 18px">
//     I hope you’re doing well. I’d like to invite you to consider renting our property ${property_name ?? ""} at ${address}.
//   </p>
//   <h4>About Property</h4>
//     <p style="line-height: 18px">
//     ${about_property}
//   </p>
//   <p style="line-height: 18px">
//     If you're interested, I'd be happy to schedule a viewing at your convenience. Please let me know if you’d like more details or to arrange a time to visit.
//   </p>
//   <span>`;

//   if (invitation_token) {
//     html += `
//      <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}?invitation_token=${invitation_token}" 
//   style="
//   color: #ffffff;
//   text-decoration:none; 
//   border-radius: 5px;
//   background-color: #13556d;
//       padding: 10px;
//           display: inline-block;
//   ">View Property</a>
//     `;
//   } else {
//     html += `
//     <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" 
//  style="
//  color: #ffffff;
//  text-decoration:none; 
//  border-radius: 5px;
//  background-color: #13556d;
//      padding: 10px;
//          display: inline-block;
//  ">View Property</a>`
//   }

//   html += `</span>
//   <p>Looking forward to serve you better.</p>
//   <p style="line-height: 18px">
//     Best regards,<br />
//     <strong>Rentranzact Team</strong>
//   </p>
//   </div>
// </body>
// </html>
//     `

//   sendMail(email, " Invitation to Rent Our Property", html)
// }

export const inviteForProperty = (options) => {
  let { email, property_id, property_name, invitation_token, address, about_property } = options;

  // New renter
  let first_message = `We hope you're doing well! We're thrilled to invite you to consider our rental space in <strong>${address}</strong>. Our property offers a serene and cool environment, perfect for relaxation`
  let second_message = `If you're interested, we'd be delighted to schedule a viewing at your convenience. Please let us know if you'd like more details or to arrange a visit.`

  if (invitation_token) {   // Existing renter
    first_message = `We're excited to inform you that we'll be transitioning to Rentranzact, a platform that will make managing our property more efficient. As a valued tenant, we'd like to invite you to link your rental agreement to our Rentranzact account.`;
    second_message = `This will enable us to streamline rent payments and communications. You'll receive notifications and updates about your rental agreement, and we'll ensure a smooth experience for future renewals or payments.
  To link your account, please click 
  <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}?invitation_token=${invitation_token}" 
  style="
  display: inline-block;
  "><strong>Link</strong></a>. We're looking forward to this new chapter in our relationship.`;
  }

  let html = `
         <html>
<head>
  <title>Invitation!</title>
</head>
<body>
<div style="
    border: 1px solid gray;
    border-radius: 10px;
    padding: 10px;
    width: 66%;
    margin: auto;
">
  <h4>Dear Renter</h4>
  <p style="line-height: 18px">
    ${first_message}
  </p>
  <p style="line-height: 18px">
    ${second_message}
  </p>
  <span>`;

  if (!invitation_token) {
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

  sendMail(email, "Exciting Opportunity to Rent Our Property!", html)
}
