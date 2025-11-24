import nodemailer from "nodemailer";

const sendOtpEmail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // DEBUG LOG
    transporter.verify((error, success) => {
      if (error) {
        console.log("❌ Nodemailer Error:", error);
      } else {
        console.log("✅ Nodemailer is ready to send emails!");
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Verification Code",
      text: `Your OTP code is: ${otp}. It is valid for 5 minutes.`
    });

    console.log("OTP Email sent");
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

export default sendOtpEmail;
