import { sendMail } from '../helpers/sendMail.mjs'

export const assignPMToProperty = (options) => {
    try {
        let { email, property_id, property_manager_name, landlord_name, property_name } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Assigned</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Property Assigned</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${property_manager_name}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that <strong>${landlord_name}</strong> assigned you as property manager on <strong>${property_name}</strong>. 
    Please click on the button to view property details.</p>
    <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" class="button" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px">View Property</a>

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
        sendMail(email, `Property Assigned - ${property_name}`, html)
    } catch (error) {
    }
}


export const assignLandlordToProperty = (options) => {
    try {
        let { email, property_id, property_manager_name, landlord_name, property_name } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Property Added</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Property Added</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${landlord_name}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that <strong>${property_manager_name}</strong> added a new property <strong>${property_name}</strong>
    on your behalf. Please click on the button to view property details.</p>
    <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" class="button" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px">View Property</a>

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
        sendMail(email, `Property Added - ${property_name}`, html)
    } catch (error) {
    }
}

export const editRent = (options) => {
    try {
        let { email, renter_name, property_id, property_name, old_rent, new_rent } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rent Price Changed</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">Rent Price Changed</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${renter_name}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that rent of your property has been changed by landlord from <strong>₦${old_rent}</strong> to <strong>₦${new_rent}</strong> for property <strong>${property_name}</strong>. 
    Please click on the button to view property details.</p>
    <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" class="button" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px">View Property</a>

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
        sendMail(email, `Rent Price Changed - ${property_name}`, html)
    } catch (error) {
    }
}


export const assignPMToPropertyEmailToRenter = (options) => {
    try {
        let { email, property_id, renter_name, property_manager_name, landlord_name, property_name } = options;
        let html = `
         <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Property Manager Assigned</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;"> 

<div class="container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333333">New Property Manager Assigned</h2>
    <p style="font-size: 16px; color: #333333;">Dear <strong>${renter_name}</strong>,</p>
    <p style="font-size: 16px; color: #555555">We hope this message finds you well.</p>
    <p style="font-size: 16px; color: #555555">We would like to inform you that <strong>${landlord_name}</strong> has assigned a new property manager <strong>${property_manager_name}</strong> to property <strong>${property_name}</strong>. 
    Please click on the button to view property details.</p>
    <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" class="button" style=" display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px">View Property</a>

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
        sendMail(email, `New Property Manager Assigned - ${property_name}`, html)
    } catch (error) {
        console.log(error)
    }
}


// assignPMToPropertyEmailToRenter({
//     email : "frenenefrimmeu-3510@yopmail.com",
//         renter_name : "Sunny Dhiman",
//         property_id : "jdfjkd",
//         property_manager_name : "Sunny Dhiman Manager",
//         landlord_name : "Sunny Dhiman Landloard",
//         property_name : "Sunny Dhiman ka beda",
//         old_rent : 10,
//         new_rent : 20000000
// })

