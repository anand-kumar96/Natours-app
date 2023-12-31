const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

//create a class
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Anand Singh <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      //BREVO SERVICE
      return nodemailer.createTransport({
        host: process.env.BREVO_HOST,
        port: process.env.BREVO_PORT,
        auth: {
          user: process.env.BREVO_LOGIN,
          pass: process.env.BREVO_SMTP_PASSWORD
        }
      });
    }
    // DEVELOPMENT => MAILTRAP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  //send the actual email
  async send(template, subject) {
    //1 Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    //2 Define email option
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText(html)
    };
    //3 Create a transporter and send Email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (only valid for 10 minutes) '
    );
  }

  async bookingConfirm() {
    await this.send(
      'booking',
      'Welcome to the Natours family! Thank you for booking awesome tour! '
    );
  }
};
