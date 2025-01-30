import nodemailer from 'nodemailer';

const transporterOptions = {
  service : 'gmail',
  // host: process.env.SMTP,
  port: parseInt(process.env.SENDGRID_PORT),
  auth: {
    user: process.env.FROM,
    pass: process.env.PASSWORD
  }
};

const transporter = nodemailer.createTransport(transporterOptions);

export const sendMail = (to, subject, html) => {
  try {
    transporter.verify((err, success) => {
      if (err) {
      } else {
      }
    });
    const mailOptions = {
      from: `"Rentranzact" <${process.env.FROM}>`,
      to,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error('Error sending email: ', error);
      }

      console.log(info, '=info')
      return info;
    });

    return '';
  } catch (e) {
    throw e;
  }
};


export const sendMailSupport = (subject, html) => {

  try {
    transporter.verify((err, success) => {
      if (err) {
      } else {
      }
    });
    const mailOptions = {
      from: mailCreds.username,
      to : 'dev.malvinder@gmail.com',
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error('Error sending email: ', error);
      }

      return info;
    });

    return '';
  } catch (e) {
    throw e;
  }
};