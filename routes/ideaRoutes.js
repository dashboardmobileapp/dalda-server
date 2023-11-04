import express from "express";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";
import userModel from "../models/userModel.js";
import formidable from "express-formidable";
import {
  createIdeaController,
  deleteIdeaController,
  getIdeaController,
  getSingleIdeaController,
  ideaCountController,
  ideaFileController,
  ideaStatusCountController,
  ideaUserController,
  updateIdeaController,
  updateIdeaStatusController,
} from "../controllers/ideaController.js";

const router = express.Router();

//create-idea route
router.post("/create-idea", requireSignIn, formidable(), createIdeaController);


//update idea
router.put("/update-idea/:I_id", requireSignIn,formidable(), updateIdeaController);
//get ideas
router.get("/get-idea", requireSignIn, getIdeaController);

//update idea status
router.put("/update-status/:id", requireSignIn, updateIdeaStatusController);
//get single idea
router.get("/get-idea/:id", requireSignIn, getSingleIdeaController);
//get photo
router.get("/idea-file/:I_id", ideaFileController);
//delete idea
router.delete(
  "/delete-idea/:I_id",
  requireSignIn,
  isAdmin,
  deleteIdeaController
);

//delete draft
router.delete(
  "/delete-draft/:I_id",
  requireSignIn,
  deleteIdeaController
);
//User wise ideas
router.get("/idea-user/:userid", requireSignIn, ideaUserController);
//count user ideas
router.get("/idea-count/:userid", requireSignIn, ideaCountController);
//count ideas based on status of ideas for each user
router.get(
  "/idea-status-count/:userid",
  requireSignIn,
  ideaStatusCountController
);

export default router;