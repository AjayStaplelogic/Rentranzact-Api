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

export const electricityBillPaid = (options) => {
    try {
        let { email, fullName, amount, meter_number } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electricity Bill Payment Paid</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Electricity Bill Payment Paid</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that your electricity bill payment has been successfully paid. 
    The amount of <strong>${amount}</strong> referenced to meter number <strong>${meter_number}</strong>. Thank you for choosing our services.</p>
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
        sendMail(email, `Electricity Bill Payment Paid - ${meter_number}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}

export const electricityBillFailed = (options) => {
    try {
        let { email, fullName, amount, meter_number } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electricity Bill Payment Failed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Electricity Bill Payment Failed</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that your electricity bill payment has been failed due to some technical reasons. 
    The amount of <strong>${amount}</strong> referenced to meter number <strong>${meter_number}</strong>. Refund will be intiated shortly. We are sorry for inconvenience</p>
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
        sendMail(email, `Electricity Bill Payment Failed - ${meter_number}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}

export const electricityBillRefundInitiated = (options) => {
    try {
        let { email, fullName, amount, meter_number } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electricity Bill Refund Initiated</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Electricity Bill Refund Initiated</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that your electricity bill payment refund has been successfully initiated. 
    The amount of <strong>${amount}</strong> referenced to meter number <strong>${meter_number}</strong>. Thank you for choosing our services.</p>
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
        sendMail(email, `Electricity Bill Refund Initiated - ${meter_number}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}

export const electricityBillRefundCompleted = (options) => {
    try {
        let { email, fullName, amount, meter_number, status } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Electricity Bill Refund Completed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Electricity Bill Refund Initiated</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${fullName}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that your electricity bill payment refund has been completed and your current status is <strong>${status}</strong>. 
    The amount of <strong>${amount}</strong> referenced to meter number <strong>${meter_number}</strong>. Thank you for choosing our services.</p>
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
        sendMail(email, `Electricity Bill Refund Completed - ${meter_number}`, html)
    } catch (error) {
        console.log(error, "====error")
    }
}


// try {

//     electricityBillRefundCompleted({
//         meter_number: "344dfaHHJHDJF3",
//         email: ["geivummaumeci-5197@yopmail.com"],
//         fullName: "parveen",
//         amount: "5709",
//             status : "paid"
//     })
// } catch (error) {
//     console.log(error)
// }