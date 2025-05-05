import User from "../model/User.model.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const registerUser = async (req, res) => {
  //get data
  // validate
  // check if user already exists
  // create a user in database
  // create a verification token
  //save the token in database
  //send token as email to user
  //send success status to user

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }
  try {
    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });
    console.log(user, "user");
    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    console.log(token, "token");
    user.verificationToken = token;

    await user.save();

    // Create a test account or replace with real credentials.
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_SENDER_EMAIL,
      to: user.email,
      subject: "Verify your email",
      text: `Please click on the following link:
      ${process.env.BASE_URL}${process.env.PORT}/api/v1/users/verify/${token}
      `,
    };
    console.log(mailOptions);
    await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "User registered Successfully",
    });
  } catch (error) {
    res.status(201).json({
      message: "User not registered",
      error: error,
      success: false,
    });
  }
};

const verifyUser = async (req, res) => {
  //get token from url
  //validate token
  //check from the token present in database
  //if user found -->isVerified:true
  //delete verification token
  //save
  //return response

  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  const user = await User.findOne({ verificationToken: token });

  if (!user) {
    return res.status(400).json({
      message: "Invalid token",
    });
  }
  user.isVerified = true;
  user.verificationToken = undefined; //null was still persiting the key but undefined removed the key as well

  await user.save();

  return res.status(400).json({
    message: "user verified successfully",
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Invalid email or password1",
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password2",
      });
    }
    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        message: "Invalid email or password3",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please check the email and verify your email",
      });
    }

    const token = jwt.sign({ id: user._id }, "shhhhh", {
      expiresIn: "24h",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      SameSite: "Strict",
    };

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      success: true,
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid email or password5",
    });
  }
};

export { registerUser, verifyUser, loginUser };
