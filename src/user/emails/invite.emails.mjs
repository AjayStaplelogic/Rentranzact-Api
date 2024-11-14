import { sendMail } from '../helpers/sendMail.mjs'

export const inviteForProperty = (options) => {
    let { email, property_id, landlord_name, property_name, address, about_property } = options;
    // console.log(`${process.env.FRONTEND_URL}/property-detail/${property_id}`);

    let html = `
         <html>
<head>
  <title>Invitation!</title>
</head>
<body>
<div style="
    text-align: center;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 10px;
    width: 66%;
    margin: auto;
">
  <h1> Invitation to Rent Our Property!</h1>
  <p style="line-height: 18px">
    I hope you’re doing well. I’d like to invite you to consider renting our property at ${address}.
  </p>
  <h4>About Property</h4>
    <p style="line-height: 18px">
    ${about_property}
  </p>
  <p style="line-height: 18px">
    If you're interested, I'd be happy to schedule a viewing at your convenience. Please let me know if you’d like more details or to arrange a time to visit.
  </p>
  <span>
  <a href="${process.env.FRONTEND_URL}/property-detail/${property_id}" 
  style="
  color: #ffffff;
  text-decoration:none; 
  border-radius: 5px;
  background-color: #13556d;
      padding: 10px;
          display: inline-block;
  ">View Property</a>
  </span>
  <p>Looking forward to serve you better.</p>
  <p style="line-height: 18px">
    Best regards,<br />
    <strong>Rentranzact Team</strong>
  </p>
  </div>
</body>
</html>
    `

    sendMail(email, " Invitation to Rent Our Property", html)
}
// try {
    
//     inviteForProperty({
//         property_id : "344dfaHHJHDJF3",
//         email : ["geivummaumeci-5197@yopmail.com"],
// landlord_name   : "Vladirmir putin",
// property_name : "Sunny Villa - Sunny Island",
// address : "Lekki Conservation Centre, Lekki - Epe Expressway, Lekki, Nigeria",
// about_property : "The project offers 3 BHK apartments in Dera Bassi, Chandigarh. These apartments have a carpet area, ranging from 1292.0 sq. ft. to 1390.0 sq. ft. and are available at a price range starting from Rs. 87.76 Lac to Rs. 1.3 Crore. It is a ready to move project, with 15 towers and features an array of facilities including a Spa, Table Tennis, Multipurpose Hall, Car Parking, Billiards. Lifts are available too."


//     })
// } catch (error) {
//     console.log(error)
// }