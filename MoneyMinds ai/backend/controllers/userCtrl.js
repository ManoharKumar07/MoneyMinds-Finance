const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const roscaModel = require("../models/Roscamodel");

//register callback
const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};

// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    //comparing the user entered password with the real password through the user which we got above
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }

    //generating token if we get correct usename and password
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

//

// authController.js

const authController = async (req, res) => {
  try {
    // Retrieve user data based on userId from the middleware
    const user = await userModel.findById(req.userData.id);
    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    } else {
      // Omit sensitive information (e.g., password) before sending the response
      const { _id, username, email, name, fundbalance } = user;
      res.status(200).send({
        success: true,
        data: { _id, username, email, name, fundbalance },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Auth error",
      success: false,
      error,
    });
  }
};

const updatefund = async (req, res) => {
  try {
    const { amount } = req.body;

    if (isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const userId = req.userData.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update the fundbalance
    user.fundbalance += parseFloat(amount);

    // Save the updated user
    await user.save();

    res.status(200).json({
      success: true,
      message: "Fund balance updated successfully",
      newFundBalance: user.fundbalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: `Internal Server Error: ${error.message}`,
    });
  }
};

const createRosca = async (req, res) => {
  try {
    const { roscaName, size, amount, duration, aadharNo, members, bid } =
      req.body;

    // Validate required fields
    if (!roscaName || !size || !amount || !duration || !aadharNo) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    // Validate members array
    if (!members || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members array is required with at least one member.",
      });
    }

    // Validate each member
    for (const member of members) {
      if (!member.name) {
        return res.status(400).json({
          success: false,
          message: "Each member must have an id and name.",
        });
      }
    }

    // Create the new Rosca document
    const newRosca = new roscaModel({
      roscaName,
      size,
      amount,
      duration,
      aadharNo,
      members,
      bid,
    });

    // Save the Rosca to the database
    const savedRosca = await newRosca.save();

    res.status(201).json({
      success: true,
      message: "ROSCA created successfully",
      data: savedRosca,
    });
  } catch (error) {
    console.error("Error creating ROSCA:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ROSCA",
      error: error.message,
    });
  }
};

const getallRosca = async (req, res) => {
  try {
    // Fetch all roscas from the database
    const allRoscas = await roscaModel.find();

    // Check if there are no roscas
    if (allRoscas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No roscas found.",
      });
    }

    // Return the list of roscas
    res.status(200).json({
      success: true,
      roscas: allRoscas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const joinRosca = async (req, res) => {
  try {
    const { id: roscaId, username } = req.body; // Get the rosca ID and username from the request body

    // Fetch the specific Rosca by ID
    const rosca = await roscaModel.findById(roscaId);

    // Check if the Rosca exists
    if (!rosca) {
      return res.status(404).json({
        success: false,
        message: "Rosca not found.",
      });
    }

    // Check if the user has already joined the Rosca
    const userAlreadyJoined = rosca.members.some(
      (member) => member.name === username
    );
    if (userAlreadyJoined) {
      return res.status(400).json({
        success: false,
        message: "User already joined this Rosca.",
      });
    }

    // Add the user to the Rosca's members list
    rosca.members.push({
      name: username,
      payment: false,
    });

    // Save the updated Rosca
    await rosca.save();

    res.status(200).json({
      success: true,
      message: "User joined Rosca successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error.",
    });
  }
};

const getSpecific = async (req, res) => {
  try {
    const userId = req.userData.id;

    // Fetch only the Roscas in which the user has participated
    const userRoscas = await roscaModel.find({ "members.id": userId });

    // Check if the user has not participated in any Roscas
    if (userRoscas.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User has not participated in any Roscas.",
      });
    }

    res.status(200).json({
      success: true,
      userRoscas: userRoscas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const openRosca = async (req, res) => {
  try {
    const { id: roscaId } = req.params;

    const rosca = await roscaModel.findById(roscaId);

    // Check if the Rosca exists
    if (!rosca) {
      return res.status(404).json({
        success: false,
        message: "Rosca not found.",
      });
    }

    res.status(200).json({
      success: true,
      rosca,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getMem = async (req, res) => {
  try {
    const { memberIds } = req.body;

    // Fetch user details based on IDs
    const memberDetails = await userModel.find({ _id: { $in: memberIds } });

    // Create a mapping of user IDs to their names
    const memberDetailsMap = {};
    memberDetails.forEach((user) => {
      memberDetailsMap[user._id] = user.name;
    });

    res.status(200).json({
      success: true,
      memberDetails: memberDetailsMap,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const roscaPayment = async (req, res) => {
  try {
    const { id: roscaId } = req.body;
    const userId = req.userData.id;

    // Fetch the specific Rosca by ID
    const rosca = await roscaModel.findById(roscaId);

    // Check if the Rosca exists
    if (!rosca) {
      return res.status(404).json({
        success: false,
        message: "Rosca not found.",
      });
    }

    const userIndex = rosca.members.findIndex((member) => member.id === userId);

    if (userIndex !== -1) {
      rosca.members[userIndex].payment = true;
      // Save the updated Rosca
      await rosca.save();

      res.status(200).json({
        success: true,
        message: "Payment successful.",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "User not found in Rosca.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
module.exports = {
  loginController,
  registerController,
  authController,
  updatefund,
  createRosca,
  getallRosca,
  joinRosca,
  getSpecific,
  openRosca,
  getMem,
  roscaPayment,
};
