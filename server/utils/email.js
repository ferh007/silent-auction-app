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

function sendOutbidEmail(to, itemName, newBidAmount, yourBidAmount) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject: `You've been outbid on ${itemName}`,
    text: `Dear bidder,\n\nYour bid of $${yourBidAmount} on "${itemName}" has been outbid. The new highest bid is $${newBidAmount}.\n\nYou can place a new bid to stay in the running!\n\nThank you for participating!`,
  };
  console.log('Attempting to send outbid email:', mailOptions);
  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log('Outbid email sent:', info);
      return info;
    })
    .catch(error => {
      console.error('Outbid email send error:', error);
      throw error;
    });
}

module.exports = { sendWinnerEmail, sendOutbidEmail };
