const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
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
  return transporter.sendMail(mailOptions);
}

module.exports = { sendWinnerEmail };
