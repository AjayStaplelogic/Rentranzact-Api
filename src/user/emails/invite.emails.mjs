import moment from 'moment';
import { sendMail } from '../helpers/sendMail.mjs'

export const inviteForProperty = (options) => {
  let { email, property_id, property_name, invitation_token, address, about_property } = options;

  // New renter
  let first_message = `We hope you're doing well! We're thrilled to invite you to consider our rental space in <strong>${address}</strong>. Our property offers a serene and cool environment, perfect for relaxation`
  let second_message = `If you're interested, we'd be delighted to schedule a viewing at your convenience. Please let us know if you'd like more details or to arrange a visit.`

  if (invitation_token) {   // Existing renter
    first_message = `We're excited to inform you that we'll be transitioning to Rentranzact, a platform that will make managing our property more efficient. As a valued tenant, we'd like to invite you to link your rental agreement to our Rentranzact account.`;
    second_message = `This will enable us to streamline rent payments and communications. You'll receive notifications and updates about your rental agreement, and we'll ensure a smooth experience for future renewals or payments.
  To link your account, Please click on the link below.`;
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
background-color: rgba(19, 85, 109, 1);
     padding: 10px;
         display: inline-block;
 ">View Property</a>`
  } else {
    html += `
      <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}?invitation_token=${invitation_token}" 
  style="
   color: #ffffff;
   text-decoration:none; 
   border-radius: 5px;
  background-color: rgba(19, 85, 109, 1);
       padding: 10px;
           display: inline-block;
  "><strong>Link</strong></a>
    `
  }

  html += `</span>
  <p>We're looking forward to this new chapter in our relationship.</p>
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

export const notifyRenterPropertyLinked = (options) => {
  const { email, property_id, property_name, address, rent_expiration_date } = options;

  const first_message = `
    We are pleased to inform you that the rental linking process has been successfully completed for the property <strong>${property_name}</strong> located at <strong>${address}</strong>.
  `;

  const second_message = `
   You are now officially linked to this property effective <strong>${moment(rent_expiration_date).format("DD-MM-YYYY")}</strong>.
  `;

  let html = `
    <html>
      <head>
        <title>Rental Linking Initiated</title>
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

          <p style="line-height: 18px">
            No further action is required from your side at this time.
          </p>

          <span>
            <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}"
              style="
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                background-color: rgba(19, 85, 109, 1);
                padding: 10px;
                display: inline-block;
              ">
              View Property
            </a>
          </span>

          <p style="margin-top: 20px;">
            Best regards,<br />
            <strong>Rentranzact Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  sendMail(
    email,
    `You linked to property ${property_name}`,
    html
  );
};

export const notifyLandlordPropertyLinked = (options) => {
  const { email, property_id, property_name, address, renter_name, rent_expiration_date } = options;

  const first_message = `
    We are pleased to inform you that the rental linking process has been successfully completed for your property <strong>${property_name}</strong> located at <strong>${address}</strong>.
  `;

  const second_message = `
   The renter, <strong>${renter_name}</strong>, has been successfully linked to your property effective <strong>${moment(rent_expiration_date).format("DD-MM-YYYY")}</strong>.
  `;

  let html = `
    <html>
      <head>
        <title>Rental Linking Initiated</title>
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

          <p style="line-height: 18px">
              No further action is required from your side at this time.
          </p>

          <span>
            <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}"
              style="
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
                background-color: rgba(19, 85, 109, 1);
                padding: 10px;
                display: inline-block;
              ">
              View Property
            </a>
          </span>

          <p style="margin-top: 20px;">
            Best regards,<br />
            <strong>Rentranzact Team</strong>
          </p>
        </div>
      </body>
    </html>
  `;

  sendMail(
    email,
    `Admin linked ${renter_name} to property ${property_name}`,
    html
  );
};
