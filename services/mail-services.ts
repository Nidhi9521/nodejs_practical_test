import nodemailer from "nodemailer";
export class MailService {
  static async mailTrigger(email: string, subject: string, html: string) {
    const transporter = nodemailer.createTransport({
      host: "mail.mailtest.radixweb.net",
      port: 465,
      secure: true,
      auth: {
        user: "testdotnet@mailtest.radixweb.net",
        pass: "Radix@web#8",
      }
    });
    var mailOptions = {
      from: "testdotnet@mailtest.radixweb.net",
      to: email,
      subject: subject,
      text: "Hello,",
      html: html
    };
    await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          reject(error);
        }
        else {
          resolve(true);
        }
      })
    }
    ).catch((error) => { throw new Error(error); });
  }
}
