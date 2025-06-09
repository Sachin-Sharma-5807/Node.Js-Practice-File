import Employee from "../model/employee.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import DeviceToken from "../model/device_token.js";
import AddSports from "../model/add_sports.js";
import UserProfile from "../model/basic_info.js";
import UserSports from "../model/user_sports.js";
import sendEmail from "../middleware/SendEmail.utils.js";
import UserActivity from "../model/user_activity.js";
import Joi from "joi";
import path from 'path'
import fs from 'fs';
import ActivityFlow from '../model/activity_flow.js'

dotenv.config();

const jwtSecret = process.env.JWT_SECRET_KEY;

//------------------------- Joi Schemas --------------------------------
const signupSchema = Joi.object({
  full_name: Joi.string().min(3).required(),
  email_address: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  device_token: Joi.string().optional(),
  fcm_token: Joi.string().optional(),
  device_type: Joi.string().valid("android", "ios", "web").optional(),
});

const signinSchema = Joi.object({
  email_address: Joi.string().email().required(),
  password: Joi.string().required(),
});

const addSportsSchema = Joi.object({
  name: Joi.string().min(2).required(),
});

const basicInfoSchema = Joi.object({
  dob: Joi.date().required(),
  gender: Joi.string().valid("male", "female", "other").required(),
  bio: Joi.string().max(500).optional(),
});

const userSportsSchema = Joi.object({
  sportsId: Joi.number().integer().required(),
  skill_level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
});

const forgotPasswordSchema = Joi.object({
  email_address: Joi.string().email().required(),
});

const verifyOtpSchema = Joi.object({
  email_address: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

const userActivitySchema = Joi.object({
  activity_name: Joi.string().required(),
  address: Joi.string().required(),
  latitude: Joi.number().required(),
  longitude: Joi.number().required(),
  date: Joi.date().required(),
  start_time: Joi.string().required(),
  duration: Joi.number().min(1).required(),
  skill_level: Joi.string()
    .valid("beginner", "intermediate", "advanced")
    .required(),
  required_equipment: Joi.string().optional(),
  participant_type: Joi.string().valid("individual", "team").required(),
  participant_number: Joi.number().min(1).required(),
});

const activityFlowSchema = Joi.object({
  select_activity: Joi.string().valid("Running", "surfing", "Basketball", "Swimming", "Cycling", "Racing", "Yoga").required(), 
  latitude: Joi.string().required(),
  address: Joi.string().required(),
  date: Joi.date().required(),
  start_time: Joi.string().required(),
  duration: Joi.string().required(), 
  skill_level: Joi.string().valid("Beginner", "Intermidiate", "Advanced") .required(),
  required_equipment:Joi.string().optional(),
  participant_type:Joi.string().valid("anyone can join unlimited","limited"),
  select_equipment: Joi.string().optional(), 
  people_count: Joi.number().required(),
  activity_name: Joi.string().required(),
});


//---------------------------------------------------------signUp--------------------------------------------------------------------------
export const signUp = async (req, res) => {
  const { error } = signupSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const {
    full_name,
    email_address,
    password,
    device_token,
    fcm_token,
    device_type,
  } = req.body;
  try {
    const existing = await Employee.findOne({ where: { email_address } });
    if (existing)
      return res.status(409).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCustomer = await Employee.create({
      full_name,
      email_address,
      password: hashedPassword,
      is_completed: false
    });

    const token = jwt.sign({ id: newCustomer.id, email_address }, jwtSecret, {
      expiresIn: "7d",
    });
    await DeviceToken.create({
      device_token,
      fcm_token,
      device_type,
      auth_token: token,
      user_id: newCustomer.id,
    });

    return res.status(201).json({
      status: true,
      message: "Signup successful",
      data: {
        token,
        id: newCustomer.id,
        full_name: newCustomer.full_name,
        email_address: newCustomer.email_address,
        is_completed: newCustomer.is_completed
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

//---------------------------------------------------------signIn--------------------------------------------------------------------------


export const signIn = async (req, res) => {
  const { error } = signinSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
      data: null,
    });
  }

  const { email_address, password } = req.body;

  try {
    const existingCustomer = await Employee.findOne({
      where: { email_address },
    });

    if (
      !existingCustomer ||
      !(await bcrypt.compare(password, existingCustomer.password))
    ) {
      return res.status(400).json({
        status: false,
        message: "Invalid email or password",
        data: null,
      });
    }

    const token = jwt.sign(
      { id: existingCustomer.id, email_address },
      jwtSecret,
      { expiresIn: "7d" }
    );


    const profile = await UserProfile.findOne({
      where: { userId: 1 },
    });

    const sportsRows = await AddSports.findAll({
      attributes: ["name", "image"],
    });

    const sports = sportsRows.map((row) => ({
      name: row.name,
      image: row.image,
    }));

    const {
      id,
      full_name,
      email_address: email,
      is_completed,
    } = existingCustomer.dataValues;

    let additional_img_path = null;
    if (profile?.additional_img_path) {
      if (typeof profile.additional_img_path === "string") {
        try {
          additional_img_path = JSON.parse(profile.additional_img_path);
        } catch (e) {
          additional_img_path = null;
        }
      } else {
        additional_img_path = profile.additional_img_path;
      }
    }

    const responseData = {
      token,
      id,
      full_name,
      email_address: email,
      is_completed,
      dob: profile?.dob || null,
      gender: profile?.gender || null,
      bio: profile?.bio || null,
      image: profile?.image || null,
      additional_img_path,
      sports,
    };

    return res.status(200).json({
      status: true,
      message: "Sign in successful",
      data: responseData,
    });
  } catch (err) {
    console.error("Error in signIn:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
      data: null,
    });
  }
};

//---------------------------------------------------------Get-profile--------------------------------------------------------------------------



export const getProfile = async (req, res) => {
  try {
    
    const user = await Employee.findByPk(1,{
      attributes: ['id', 'full_name', 'email_address']
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('Error getting profile:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};


//---------------------------------------------------------addSports--------------------------------------------------------------------------

export const addSports = async (req, res) => {
  const { error } = addSportsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const userId = 1; // keep as is

    const existingSports = await AddSports.count({ where: { user_id: userId } });
    if (existingSports >= 3) {
      return res.status(400).json({
        message: "You can add a maximum of 3 sports",
      });
    }

    const images = Array.isArray(req.files) ? req.files.map(file => file.filename) : [];

    if (images.length > 3) {
      return res.status(400).json({
        message: "You can upload a maximum of 3 images per sport",
      });
    }

    const imagePaths = images.join(',');

    const sport = await AddSports.create({
      user_id: userId,
      name: req.body.name,
      image: imagePaths,
    });

    return res.status(201).json({
      message: "Sport added successfully",
      sport,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};




//---------------------------------------------------------getAllSports--------------------------------------------------------------------------

export const getAllSports = async (req, res) => {
  try {
    const userId = 1;

    const sportsRows = await AddSports.findAll({
      where: { user_id: userId },
      attributes: ["name", "image"],
    });

    const sports = sportsRows.map((row) => {
      let imageData = [];

      try {
        imageData = JSON.parse(row.image);
        if (!Array.isArray(imageData)) {
          imageData = [imageData];
        }
      } catch (err) {
        imageData = [row.image];
      }

      return {
        name: row.name,
        image: imageData,
      };
    });

    return res.status(200).json({
      status: true,
      message: "Sports fetched successfully",
      data: sports,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//---------------------------------------------------------basicInfo--------------------------------------------------------------------------

export const basicInfo = async (req, res) => {
  const { error } = basicInfoSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: false,
      message: error.details[0].message,
      data: null,
    });
  }

  try {
  
    if (!req.files?.image || req.files.image.length === 0) {
      return res.status(400).json({
        status: false,
        message: "A single 'image' file is required.",
        data: null,
      });
    }

    const mainImageFilename = req.files.image[0].filename;


    const additionalImagesArray = (req.files.additional_images || []).map(
      (fileObj) => fileObj.filename
    );

    if (additionalImagesArray.length > 3) {
      return res.status(400).json({
        status: false,
        message: "You can upload at most 3 files under 'additional_images'.",
        data: null,
      });
    }


    const profile = await UserProfile.create({
      userId: 1, 
      image: mainImageFilename,
      additional_img_path: additionalImagesArray,
      dob: req.body.dob || null,
      gender: req.body.gender || null,
      bio: req.body.bio || null,
    });

    return res.status(201).json({
      status: true,
      message: "Profile created successfully",
      data: profile,
    });
  } catch (err) {
    console.error("Error in basicInfo:", err);
    return res.status(500).json({
      status: false,
      message: err.message || "Internal server error",
      data: null,
    });
  }
};
//---------------------------------------------------------userSports--------------------------------------------------------------------------

export const userSports = async (req, res) => {
  const { error } = userSportsSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const newUserSport = await UserSports.create({ userId: 1, ...req.body });
    return res
      .status(201)
      .json({ success: true, message: "User sport added", data: newUserSport });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

//---------------------------------------------------------forgotPassword--------------------------------------------------------------------------

export const forgotPassword = async (req, res) => {
  const { error } = forgotPasswordSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await Employee.findOne({
      where: { email_address: req.body.email_address },
    });
    if (!user)
      return res.status(404).json({ message: "No user found with this email" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    user.resetOTP = otp;
    user.resetOTPExpiry = expiry;
    await user.save();

    const message = `Your OTP for password reset is: ${otp}. It will expire in 5 minutes.`;
    await sendEmail(user.email_address, "Password Reset OTP", message);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//---------------------------------------------------------verifyOtp--------------------------------------------------------------------------

export const verifyOtp = async (req, res) => {
  const { error } = verifyOtpSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const user = await Employee.findOne({
      where: { email_address: req.body.email_address },
    });
    if (!user || user.resetOTP !== req.body.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (Date.now() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }
    return res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//---------------------------------------------------------User-Activity----------------------------------

export const userActivity = async (req, res) => {
  const { error } = userActivitySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const newActivity = await UserActivity.create({ ...req.body });
    return res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: newActivity,
    });
  } catch (error) {
    console.error("Create Activity Error:", error);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};


//---------------------------------------------------------update-profile----------------------------------

export const updateProfile = async (req, res) => {
  try {
    const userId = 1;

    const profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found for this user." });
    }


    if (req.files?.image?.length > 0) {
      if (profile.image) {
        const oldImagePath = path.join(process.cwd(), "uploads", "profile", profile.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      profile.image = req.files.image[0].filename;
    }

 
    if (req.files?.additional_img?.length > 0) {
      const indicesRaw = req.body.additional_img_index;
      const indices = Array.isArray(indicesRaw) ? indicesRaw : [indicesRaw];

      let arr = Array.isArray(profile.additional_img_path)
        ? profile.additional_img_path.slice()
        : [null, null, null];

      while (arr.length < 3) arr.push(null);

      for (let i = 0; i < req.files.additional_img.length; i++) {
        const file = req.files.additional_img[i];
        const idx = parseInt(indices[i], 10);

        if (isNaN(idx) || idx < 0 || idx > 2) {
          return res.status(400).json({ message: "additional_img_index entries must be 0, 1, or 2." });
        }

        if (arr[idx]) {
          const oldAdditionalPath = path.join(process.cwd(), "uploads", "profile", arr[idx]);
          if (fs.existsSync(oldAdditionalPath)) {
            fs.unlinkSync(oldAdditionalPath);
          }
        }

        arr[idx] = file.filename;
      }

      profile.additional_img_path = arr;
    }

 
    const { full_name, dob, gender, bio } = req.body;

    if (typeof full_name !== "undefined") {
 
      await Employee.update(
        { full_name },
        { where: { id: userId } }
      );
    }
    if (typeof dob !== "undefined") {
      profile.dob = dob;
    }
    if (typeof gender !== "undefined") {
      profile.gender = gender;
    }
    if (typeof bio !== "undefined") {
      profile.bio = bio;
    }

    await profile.save();

 
    const employee = await Employee.findOne({ where: { id: userId } });

   
    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
      data: {
        id: profile.id,
        userId: profile.userId,
        full_name: employee?.full_name || null,
        image: profile.image,
        additional_img_path: profile.additional_img_path,
        dob: profile.dob,
        gender: profile.gender,
        bio: profile.bio,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });

  } catch (err) {
    console.error("Error in updateProfile:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


//---------------------------------------------------------Activity-flow----------------------------------


export const activityFlow = async (req, res) => {
  try {
    const { error } = activityFlowSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: false,
        message: error.details[0].message,
        data: null,
      });
  }
    const {
      select_activity,
      latitude,
      address,
      date,
      start_time,
      duration,
      skill_level,
      select_equipment,
      people_count,
      activity_name
    } = req.body;

    const newActivity = await ActivityFlow.create({
      select_activity,
      latitude,
      address,
      date,
      start_time,
      duration,
      skill_level,
      select_equipment,
      people_count,
      activity_name
    });

    return res.status(201).json({
      status: true,
      message: "Activity created successfully",
      data: newActivity
    });

  } catch (error) {
    console.error("Add Activity Error:", error);
    return res.status(500).json({
      status: false,
      message: "Something went wrong",
      error: error.message
    });
  }
};

