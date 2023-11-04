import ideasModel from "../models/ideasModel.js";
import userModel from "../models/userModel.js";
import { requireSignIn } from "../middlewares/authMiddleware.js";
import fs from "fs";
import { loginController } from "./authControllers.js";
import axios from "axios";

//create-ideas
export const createIdeaController = async (req, res) => {
  try {
    const {
      idea,
      implementation,
      resources,
      user,
      cost,
      planTime,
      department,
      location,
      ideaStatus
    } = req.fields;
    const { file } = req.files;

   const use = await userModel.findById(user);
   axios.post('http://localhost:8080/firebase/notification', {
    title: 'New Idea',
    body: `New Idea by ${use.username} is added`,
    userId: use._id,
   })

    



    //validation
    switch (true) {
      case !idea:
        return res.status(500).send({ error: "idea is Required" });
      case !implementation:
        return res.status(500).send({ error: "Implementation is Required" });
      case !resources:
        return res.status(500).send({ error: "resouce is Required" });
      case !user:
        return res.status(500).send({ error: "User is Required" });
      case !cost:
        return res.status(500).send({ error: "cost is Required" });
      case !planTime:
        return res.status(500).send({ error: "plantime is Required" });
      case !department:
        return res.status(500).send({ error: "department is Required" });
      case !location:
        return res.status(500).send({ error: "location is Required" });
      case file && file.size > 1000000:
        return res
          .status(500)
          .send({ error: "file is Required and should be less then 1mb" });
    }

    const ideas = new ideasModel({idea,implementation,resources,user,cost,planTime,department,location,ideaStatus});
    if (file) {
      ideas.file.data = fs.readFileSync(file.path);
      ideas.file.contentType = file.type;
      ideas.file.filename = file.name;
    }

    await ideas.save();
    res.status(201).send({
      success: true,
      message: "Idea Created Successfully",
      ideas,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in creating idea",
    });
  }
};
//update idea Controller
export const updateIdeaController = async (req, res) => {
  try {
    const { idea,implementation,resources,cost, planTime , reason} =req.fields;
    const { file } = req.files;
  

    const ideas = await ideasModel.findByIdAndUpdate(
      req.params.I_id,
      { ...req.fields },
      { new: true },{password:0}
    );
 
    if (file) {
      ideas.file.data = fs.readFileSync(file.path);
      ideas.file.contentType = file.type;
      ideas.file.filename = file.name;
    }
   
    await ideas.save();
    res.status(201).send({
      success: true,
      message: "idea Updated Successfully",
      ideas,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Updte idea",
    });
  }
};

// 
export const updateIdeaStatusController = async (req, res) => {
  try {
    const { status ,reason,rejectedBy,summary} = req.body;
    //alidation

    const idea = await ideasModel.findById(
      req.params.id
    )

    const user = await userModel.findById(idea.user)

    // const Ideas = await ideasModel.findByIdAndUpdate(
    //   req.params.id,
    //   { ...req.body },
    //   { new: true }
    // );
    // await Ideas.save();
    res.status(201).send({
      success: true,
      message: "Idea Updated Successfully",
      idea,
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
//get all ideas
export const getIdeaController = async (req, res) => {
  try {
    const ideas = await ideasModel
      .find({})
      .populate("user", "-password")
      .select("-file")
      .sort({ createdAt: 1 });
    res.status(200).send({
      success: true,
      countTotal: ideas.length,
      message: "ALL ideas ",
      ideas,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr in getting ideas",
      error: error.message,
    });
  }
};
// get single idea
export const getSingleIdeaController = async (req, res) => {
  try {
    const idea = await ideasModel
      .findOne({ _id: req.params.id })
      .populate("user", "-password");
    res.status(200).send({
      success: true,
      message: "Single Idea Fetched",
      idea,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Eror while getitng single Idea",
      error,
    });
  }
};

//get total idea count
export const ideaCountController = async (req, res) => {
  try {
    const user = await userModel.findOne(
      { userid: req.params.userid },
      { password: 0 }
    );
    const ideas = await ideasModel.find({ user }).populate("user");
    res.status(200).send({
      success: true,
      countTotal: ideas.length,
      ideas,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting Ideas",
    });
  }
};

//get ideas based on status of ideas for each user

export const ideaStatusCountController = async (req, res) => {
  try {
    const user = await userModel.findOne(
      { userid: req.params.userid },
      { password: 0 }
    );
    const i = await ideasModel.find({ user }).populate("user").find({ideaStatus: 'Published'});
    const ideas = await ideasModel
      .find({ user })
      .populate("user")
      .find({ status: "Approved", ideaStatus: "Published" });
    const ideas1 = await ideasModel
      .find({ user })
      .populate("user")
      .find({ status: "Work in progress", ideaStatus: "Published" });
    const ideas2 = await ideasModel
      .find({ user })
      .populate("user")
      .find({ status: "Rejected",ideaStatus: 'Published' });
    const ideas3 = await ideasModel
      .find({ user })
      .populate("user")
      .find({ status: "Implemented",ideaStatus: 'Published' });
    res.status(200).send({
      success: true,
      CountTotal: i.length,
      ApprovedTotal: ideas.length,
      WorkTotal: ideas1.length,
      RejectedTotal: ideas2.length,
      ImplementedTotal: ideas3.length,
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While number of ideas according to status",
    });
  }
};

// get idea
export const ideaFileController = async (req, res) => {
  try {
    const idea = await ideasModel.findById(req.params.I_id).select("file");
    if (idea.file.data) {
      res.set("Content-type", idea.file.contentType);
      return res.status(200).send(idea.file.data);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Erorr while getting file",
      error,
    });
  }
};

export const deleteIdeaController = async (req, res) => {
  try {
    await ideasModel.findByIdAndDelete(req.params.I_id).select("-file");
    res.status(200).send({
      success: true,
      message: "idea Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting ideas",
      error,
    });
  }
};
export const deleteDraftController = async (req, res) => {
  try {
    await ideasModel.findByIdAndDelete(req.params.I_id).select("-file");
    res.status(200).send({
      success: true,
      message: "draft Deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while deleting ideas",
      error,
    });
  }
};


// get idea by user
export const ideaUserController = async (req, res) => {
  try {
    const user = await userModel.findOne(
      { userid: req.params.userid },
      { password: 0 }
    );
    const ideas = await ideasModel
      .find({ user })
      .populate("user")
    res.status(200).send({
      success: true,
      countTotal: ideas.length,
      user,
      ideas,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({
      success: false,
      error,
      message: "Error While Getting Ideas",
    });
  }
};