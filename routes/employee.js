import express from "express";
import upload from "../middleware/UploadMiddleware.js";
import authenticate from "../middleware/auth.js";

import {
  signUp,
  signIn,
  addSports,
  getAllSports,
  basicInfo,
  userSports,
  forgotPassword,
  verifyOtp,
  userActivity,
  updateProfile,
  activityFlow,
  getProfile
 
} from "../controllers/employeeController.js";

const router = express.Router();

router.post("/signUp",signUp);
router.post("/signIn", signIn);
router.get('/getProfile', authenticate, getProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);


router.post("/addSports", upload.array("image", 3), addSports);
router.get("/getAllSports", authenticate,getAllSports);
router.post("/basicInfo",upload.fields([{ name: "image", maxCount: 1 },{ name: "additional_images", maxCount: 3 }]), basicInfo);
router.post('/user-sports',userSports);
router.post('/user-activity',userActivity);
router.patch("/updateProfile",upload.fields([{ name: "image", maxCount: 1 },{ name: "additional_img", maxCount: 3 }
  ]),
  updateProfile
);

router.post("/activitFlow",activityFlow);
export default router;
