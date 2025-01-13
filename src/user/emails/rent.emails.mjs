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
    <title>Rent Paid</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Paid</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that ${renter_name} paid rent successfully. 
    The amount of <strong>${amount}</strong> referenced to property <strong>${property_name}</strong>. You will receive amount after admin confirmation. Thank you for choosing our services.</p>
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
        sendMail(email, `Rent Paid - ${property_name}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}

// try {

//     rentPaidEmail({
//         fullName: "344dfaHHJHDJF3",
//         email: ["geivummaumeci-5197@yopmail.com"],
//         renter: "parveen",
//         landlord_name: "sunny",
//         property_name: "sunny villa at kharar",
//         amount: "1500"
//     })
// } catch (error) {
//     console.log(error)
// }
