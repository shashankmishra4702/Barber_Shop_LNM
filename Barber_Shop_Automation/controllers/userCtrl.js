const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const barberModel = require("../models/barberModel");
const appointmentModel = require('../models/appointmentModel')
const moment = require('moment')

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
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};

const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply barber CTRL
const applybarberController = async (req,res) => {
  try {
    const newbarber = await barberModel({...req.body, status:'pending'})
    await newbarber.save()
    const adminUser = await userModel.findOne({isAdmin:true})
    const notifcation = adminUser.notifcation
    notifcation.push({
      type:'apply-barber-request',
      message: `${newbarber.firstName} ${newbarber.lastName} Has Applied for a Employees Account`,
      data:{
        barberId: newbarber._id,
        name: newbarber.firstName + newbarber.lastName,
        onClickPath: "/admin/docotrs",
      }
    })
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
      res.status(201).send({
      success: true,
      message: "Employee Account Applied Successfully",
    });

  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      error,
      message:'Error while applying for barber'
    })
  }
}

//Notification Controller
const getAllNotificationController = async (req,res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId});
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message:'Error in notification',
      success: false,
      error
    })
  }
}

//Delete Notifications
const deleteAllNotificationController = async(req,res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId })
    user.notifcation = []
    user.seennotification = []
    const updatedUser = await user.save()
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted Successfully",
      data: updatedUser,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      message:'unable to delete all notifications',
      error
    })
  }
};

//Get all employees

const getAllEmpController = async(req,res) =>{
  try {
    const barbers = await barberModel.find({status:'approved'})
    res.status(200).send({
      success:true,
      message:'Employees list Fetched Successfully',
      data:barbers,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      error,
      message:'Error while Fetching Employee',
    })
  }
}

//Book Appointment
const bookAppointmentController = async(req,res) => {

  try {
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toISOString();
    req.body.time = moment(req.body.time, "HH:mm").toISOString();
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.barberInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A new Appointment Request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Request sent",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }

}

//Booking Availablity Controller
const bookingAvailabilityController = async (req, res) => {
  try {
    const date = moment(req.body.date, "DD-MM-YY").toISOString();
    const fromTime = moment(req.body.time, "HH:mm")
      .subtract(1, "hours")
      .toISOString();
    const toTime = moment(req.body.time, "HH:mm").add(1, "hours").toISOString();
    const barberId = req.body.barberId;
    const appointments = await appointmentModel.find({
      barberId,
      date,
      time: {
        $gte: fromTime,    //Greater Than
        $lte: toTime,      //Equal to
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments are not Available at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointment are Available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};


const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};


module.exports = {
  loginController,
  registerController,
  authController,
  applybarberController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllEmpController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
};