import { sendMail } from '../helpers/sendMail.mjs'
 console.log("Email File")
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
        let { email, amount, property_name, renter_name } = options;
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

// try {
//     rentPaidEmailToRenter({
//         email: "frewoikiprevoi-7190@yopmail.com",
//         fullName: "Sunny Dhiman The Gangster",
//         amount: 100,
//         property_name: "Sunny ka beda",
//         renter_name: "Sunny Dhiman The Gangster",
//     })
// } catch (error) {
//     console.log(error, '=======error')
// }