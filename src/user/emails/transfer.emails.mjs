import { sendMail } from '../helpers/sendMail.mjs'

export const transferSucceedEmail = (options) => {
    try {
        let { email, fullName, amount, property_name } = options;
        let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent Paid Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Paid Confirmation</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that rentrazact has approved the rent payment and transferred to your wallet successfully. 
   Your can withdraw the amount of <strong>${amount}</strong> referenced to property <strong>${property_name}</strong> from your wallet. Thank you for choosing our services.</p>
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
        sendMail(email, `Rent Paid Confirmation - ${property_name}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}

// try {

//     transferSucceedEmail({
//         fullName: "344dfaHHJHDJF3",
//         email: ["geivummaumeci-5197@yopmail.com"],
//         last_four: "7676",
//         landlord_name: "sunny",
//         property_name: "sunny villa at kharar",
//         amount: "1500",
//     })
// } catch (error) {
//     console.log(error)
// }
