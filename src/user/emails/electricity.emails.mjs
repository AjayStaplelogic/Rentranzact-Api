import { sendMail } from '../helpers/sendMail.mjs'

export const electricityBillInitiated = (options) => {
    try {
        let { email, fullName, amount, meter_number } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electricity Bill Payment Initiated</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Electricity Bill Payment Initiated</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that your electricity bill payment has been successfully initiated. 
    The amount of <strong>${amount}</strong> referenced to meter number <strong>${meter_number}</strong> will be processed shortly.</p>
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
        sendMail(email, `Electricity Bill Payment Initiated - ${meter_number}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}


// try {

//     electricityBillInitiated({
//         meter_number: "344dfaHHJHDJF3",
//         email: ["geivummaumeci-5197@yopmail.com"],
//         fullName: "parveen",
//         amount: "5709"
//     })
// } catch (error) {
//     console.log(error)
// }