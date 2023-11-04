import express from "express";
import UserController, {
  registerController,
  loginController,
  testController,
  forgotPasswordController,
  deleteUserController,
  updateUserController,
  getUserController,
  getMeController,
  singleUserController,
  getUserDepartmentController,
} from "../controllers/authControllers.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

//router object
const router = express.Router();

//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

//Forgot Password || POST
router.post("/forgot-password", forgotPasswordController);

//delete user
router.delete("/delete/:U_id", requireSignIn, isAdmin, deleteUserController);
//update user
router.put("/update/:U_id", updateUserController);

//get all users
router.get("/get-users", requireSignIn, isAdmin, getUserController);

router.get("/get-departments", requireSignIn, getUserDepartmentController);

//get Single User
router.get("/single-user/:id", requireSignIn, singleUserController);
router.get(
  "/users-managed/:userid",
  requireSignIn,
  UserController.getUsersByManagers
);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

router.get("/user/me", requireSignIn, getMeController);

export default router;