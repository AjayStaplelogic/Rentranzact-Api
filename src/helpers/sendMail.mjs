import nodemailer from 'nodemailer';

const transporterOptions = {
  host: process.env.SMTP,
  port: parseInt(process.env.SENDGRID_PORT),
  auth: {
    user: process.env.USERNAME,
    pass: process.env.PASSWORD
  }
};

const transporter = nodemailer.createTransport(transporterOptions);

export const sendMail = (to, subject, html) => {
  try {
    transporter.verify((err, success) => {
      if (err) {
        console.log('TRANSPORTER ERR: ', err);
      } else {
        console.log('TRANSPORTER SUCCESS: ', success);
      }
    });
    const mailOptions = {
      from: process.env.FROM,
      to,
      subject,
      html,
    };


    console.log(mailOptions,"---mail Opitons")

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        throw new Error('Error sending email: ', error);
      }

      console.log(`Email sent to ${to} for ${subject}`);
      return info;
    });

    return '';
  } catch (e) {
    console.log('MAIL ERROR : ', e);
    throw e;
  }
};


export const sendMailSupport = (subject, html) => {

  try {
    transporter.verify((err, success) => {
      if (err) {
        console.log('TRANSPORTER ERR: ', err);
      } else {
        console.log('TRANSPORTER SUCCESS: ', success);
      }
    });
    console.log('mailCreds.username: ', mailCreds.username);
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

      console.log(`Email sent to ${to} for ${subject}`);
      return info;
    });

    return '';
  } catch (e) {
    console.log('MAIL ERROR : ', e);
    throw e;
  }
};