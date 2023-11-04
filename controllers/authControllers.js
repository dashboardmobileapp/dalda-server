import userModel from "../models/userModel.js";

import { comparePassword, hashPassword } from "./../helpers/authHelper.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const {
      userid,
      username,
      password,
      designation,
      department,
      firstLineManager,
      secondLineManager,
      lineDirector,
    } = req.body;
    //validations
    if (!userid) {
      return res.send({ error: "Name is Required" });
    }
    if (!username) {
      return res.send({ error: "Name is Required" });
    }
    if (!password) {
      return res.send({ message: "Password is Required" });
    }
    if (!designation) {
      return res.send({ message: "Password is Required" });
    }
    if (!department) {
      return res.send({ message: "Department is Required" });
    }
    if (!firstLineManager) {
      return res.send({ message: "First Line Manager is Required" });
    }
    if (!secondLineManager) {
      return res.send({ message: "Second Line Manager is Required" });
    }
    if (!lineDirector) {
      return res.send({ message: "Line Vice President is Required" });
    }

    // //check user
    // const exisitingUser = await userModel.findOne({ username });
    // //exisiting user
    // if (exisitingUser) {
    //   return res.status(200).send({
    //     success: false,
    //     message: "Already Register please login",
    //   });
    // }

    //register user
    const hashedPassword = await hashPassword(password);
    //save
    const user = await new userModel({
      userid,
      username,
      password: hashedPassword,
      designation,
      department,
      firstLineManager,
      secondLineManager,
      lineDirector,
    }).save();
    const userWithoutPassword = {
      _id: user._id,
      userid: user.userid,
      username: user.username,
      designation: user.designation,
      department: user.department,
      firstLineManager: user.firstLineManager,
      secondLineManager: user.secondLineManager,
      lineDirector: user.lineDirector,
    };
    const fLineManager = await userModel.findOne(
      { userid: user.firstLineManager },
      { password: 0 }
    );
    const sLineManager = await userModel.findOne(
      { userid: user.secondLineManager },
      { password: 0 }
    );
    const lineD = await userModel.findOne(
      { userid: user.lineDirector },
      { password: 0 }
    );
    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      userWithoutPassword,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Errro in Registeration",
      error,
    });
  }
};

//POST LOGIN
export const loginController = async (req, res) => {
  try {
    const { password, userid } = await req.body;
    console.log(req.body);

    //validation
    if (!userid || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await userModel.findOne({ userid });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User is not registerd",
      });
    }
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid Password",
      });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    const fLineManager = await userModel.findOne(
      { userid: user.firstLineManager },
      { password: 0 }
    );
    const sLineManager = await userModel.findOne(
      { userid: user.secondLineManager },
      { password: 0 }
    );
    const lineD = await userModel.findOne(
      { userid: user.lineDirector },
      { password: 0 }
    );
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        userid: user.userid,
        username: user.username,
        department: user.department,
        designation: user.designation,
        firstLineManager: user.firstLineManager,
        secondLineManager: user.secondLineManager,
        lineDirector: user.lineDirector,
        role: user.role,
        fcmToken: user.fcmToken
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};
//************************************************************************//
// export const usersManagedBy=async(req,res)=>{
//   try {
//     const users = await userModel.find({
//       $or: [
//         { firstLineManager: req.params.userid },
//         { secondLineManager: req.params.userid },
//         { lineDirector: req.params.userid },
//       ],
//     }).populate('firstLineManagerDetails', '-password') // Populate the firstLineManagerDetails
//     .populate('secondLineManagerDetails', '-password') // Populate the secondLineManagerDetails
//     .populate('lineDirectorDetails', '-password') // Populate the lineDirectorDetails
//     .exec();

//     res.status(200).send({
//       success: true,
//       message: "user gained successfully",
//       users,
//     });

//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }
/////////////**********************************************************///////////////////// */

// userController.js

export const UserController = {
  getUsersByManagers: async (req, res) => {
    try {
      const { userid } = req.params;

      // Find all users whose managers' IDs contain the provided ID
      const users = await userModel
        .find({
          $or: [
            { firstLineManager: userid },
            { secondLineManager: userid },
            { lineDirector: userid },
          ],
        })
        .exec();

      res.status(200).send({
        success: true,
        message: "All users Managed by the logged in user are: ",
        users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};

export default UserController;

//forgotPasswordController

export const forgotPasswordController = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username) {
      res.status(400).send({ message: "User is required" });
    }

    if (!newPassword) {
      res.status(400).send({ message: "New Password is required" });
    }
    //check
    const user = await userModel.findOne({ username });
    //validation
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Wrong UserName ",
      });
    }
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(200).send({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};
//delete
export const deleteUserController = async (req, res) => {
  try {
    await userModel.findByIdAndDelete(req.params.U_id);
    res.status(200).send({
      success: true,
      message: "user Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting Users",
      error,
    });
  }
};

//update user
export const updateUserController = async (req, res) => {
  try {
    const {
      userid,
      username,
      designation,
      department,
      firstLineManager,
      secondLineManager,
      lineDirector,
      fcmToken
    } = req.body;
    console.log(req.body);

    //alidation
    // switch (true) {
    //   case !userid:
    //     return res.status(500).send({ error: "Userid is Required" });
    //   case !username:
    //     return res.status(500).send({ error: "Username is Required" });
    //   case !designation:
    //     return res.status(500).send({ error: "Designation is Required" });
    //   case !department:
    //     return res.status(500).send({ error: "Department is Required" });
    //   case !firstLineManager:
    //     return res
    //       .status(500)
    //       .send({ error: "First Line Manager is Required" });
    //   case !secondLineManager:
    //     return res
    //       .status(500)
    //       .send({ error: "Second Line Manager is Required" });
    //   case !lineDirector:
    //     return res
    //       .status(500)
    //       .send({ error: "Line Vice President is Required" });
    // }

    const user = await userModel.findByIdAndUpdate(
      req.params.U_id,
      { ...req.body },
      { new: true },
      { password: 0 }
    );
    await user.save();
    console.log(req.params)
    res.status(201).send({
      success: true,
      message: "User Updated Successfully",
      body: req.params,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updating user",
    });
  }
};
//GETTING getting single user
export const singleUserController = async (req, res) => {
  try {
    //const fm="firstLineManager";
    const userid = req.params.id;
    const user = await userModel.findOne({ userid }, { password: 0 });

    const firstLineManager = await userModel.findOne(
      { userid: user.firstLineManager },
      { password: 0 }
    );
    const secondLineManager = await userModel.findOne(
      { userid: user.secondLineManager },
      { password: 0 }
    );
    const lineDirector = await userModel.findOne(
      { userid: user.lineDirector },
      { password: 0 }
    );
    res.status(200).send({
      success: true,
      message: "SINGLE USERS ",
      user,
      firstLineManager,
      secondLineManager,
      lineDirector,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting user",
      error: error.message,
    });
  }
};
//GETTING all USER
export const getUserController = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: 0 }, { password: 0 })
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      countTotal: users.length,
      message: "ALL USERS ",
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting users",
      error: error.message,
    });
  }
};

//get all users departments
export const getUserDepartmentController = async (req, res) => {
  try {
    const users = await userModel
      .find({ role: 0 }, { password: 0 })
      .sort({ createdAt: -1 });
    for (const user of users) {
      var department = user.department;

      console.log(department);
    }
    res.status(201).send("check console");
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting users",
      error: error.message,
    });
  }
};

//test controller
export const testController = (req, res) => {
  try {
    res.send("Protected Routes");
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
};

export const getMeController = (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    const user = decode._id;

    res.status(200).send({
      success: true,
      decode,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};