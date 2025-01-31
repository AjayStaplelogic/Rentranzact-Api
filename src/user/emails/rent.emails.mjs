import moment from 'moment';
import { sendMail } from '../helpers/sendMail.mjs'
export const rentPaidEmail = (options) => {
    try {
        let { email, fullName, amount, property_name, renter_name } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent Payment Update </title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Payment Update </h2>
   <!-- <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p> --!>
   <!-- <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>  --!>
    <p style="font-size: 16px; color: #555555">We would like to inform you that <strong>${renter_name}</strong> has paid the rent of <strong>₦${amount}</strong> for the <strong>${property_name}</strong> property. 
    You will receive the amount once it is approved by the administration.</p>
   <p style="font-size: 16px; color: #555555"> Thank you for choosing our services.</p>
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
        sendMail(email, `Rent Payment Update`, html)
    } catch (error) {
    }
}

export const rentPaidEmailToRenter = (options) => {
    try {
        let { email, amount, property_name, renter_name, transaction_id } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent Payment Update </title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Payment Update </h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${renter_name}</strong>,</p>
   <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that we have received <strong>₦${amount}</strong> for the rent of <strong>${property_name}</strong> property. </p>
   <p style="font-size: 16px; color: #555555"> Thank you for choosing our services.</p>
   <a href="${process.env.BACKEND_URL}/api/admin/transactions/download?id=${transaction_id}" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px" class="download-button" target="_blank">Download Invoice</a>
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
        sendMail(email, `Rent Payment Update`, html)
    } catch (error) {
    }
}

export const rentReminderEmailToRenter = (options) => {
    try {
        console.log("Rent Reminder Email To Renter")
        let { email, amount, property_name, renter_name, property_id, next_payment_at } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent Payment Reminder </title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Payment Reminder </h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${renter_name}</strong>,</p>
   <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that your rent payment of property <strong>${property_name}</strong> is due on Date <strong>${moment(next_payment_at).format("DD-MM-YYYY")}</strong>. </p>
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
        sendMail(email, `Rent Payment Reminder`, html)
    } catch (error) {
        console.log(error)
    }
}

// rentReminderEmailToRenter({
//     email: "rani@yopmail.com",
//     property_name: "Villa da visatara KM",
//     renter_name: "sunny",
//     property_id: "jehjxnklsdfhudnf",
//     next_payment_at: new Date(),
//   }
// )