const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function sendWinnerEmail(to, itemName) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: `Congratulations! You won the auction for ${itemName}`,
    text: `Dear bidder,\n\nYou have won the auction for "${itemName}". Please check your account for details.\n\nThank you for participating!`,
  };
  console.log('Attempting to send email:', mailOptions);
  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Email sent:', info);
      return info;
    })
    .catch(error => {
      console.error('Email send error:', error);
      throw error;
    });
}

module.exports = { sendWinnerEmail };
