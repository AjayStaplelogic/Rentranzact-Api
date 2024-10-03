function html(otp, fullName) {
  return `<html>
<head>
  <title>Rentranzact - OTP Verification</title>
</head>
<body>
  <p>Hi, ${fullName ?? ""}</p>
  <p>Please use the following code for your Email verification process.</p>
  <p>
    <span style="font-size: 20px; font-weight: bold; margin: 20px 10px">${otp}</span>
  </p>
  <p>Looking forward to serve you better.</p>
  <p>
    Best regards,<br />
    <strong>Rentranzact Team</strong>
  </p>
</body>
</html>`;
}

export { html };
