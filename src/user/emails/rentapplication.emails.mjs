import moment from "moment";
import { sendMail } from "../helpers/sendMail.mjs";

export const applicationAcceptedViaInviteRenter = (options) => {
    try {
        let { email, property_name, renter_name, property_id, rent_expiration_date } = options;
        let html = `
         <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent Application Update </title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 
  
  <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Application Update </h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${renter_name}</strong>,</p>
   <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that landlord have acceppted your rent application for property <strong>${property_name}</strong> and marked as rented for you. Current rent period will expire on ${moment(rent_expiration_date).format("DD MMM YYYY")} </p>
   <p style="font-size: 16px; color: #555555"> Thank you for choosing our services.</p>
   <a href="${process.env.FRONTEND_URL}/rented-property-detail/${property_id}" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px" class="download-button" target="_blank">View Property</a>
   <a href="${process.env.FRONTEND_URL}/login" class="button" style=" display: inline-block;
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
        sendMail(email, `Rent Application Update`, html)
    } catch (error) {
    }
}


// try {
//     applicationAcceptedViaInviteRenter({
//         email: "frewoikiprevoi-7190@yopmail.com",
//         property_id: "66b5c62537a9bec8bec98046",
//         property_name: "Sunny ka beda",
//         renter_name: "Sunny Dhiman The Gangster",
//     })
// } catch (error) {
//     console.log(error, '=======error')
// }