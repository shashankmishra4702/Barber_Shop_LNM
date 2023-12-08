const appointmentModel = require('../models/appointmentModel')
const barberModel = require('../models/barberModel')
const userModel = require("../models/userModels");
// const appointmentModel = require("../models/appointmentModel");
const getbarberInfoController = async(req,res) => {
    try {
        const barber = await barberModel.findOne({userId: req.body.userId})
        res.status(200).send({
            success:true,
            message:'Data Fetch Success',
            data: barber,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            error,
            message:'Error in Fetching Employees Details',
        })
    }
}

//Update Employee Profile
const updateProfileController = async (req, res) => {
    try {
      const barber = await barberModel.findOneAndUpdate(
        { userId: req.body.userId },
        req.body
      );
      res.status(201).send({
        success: true,
        message: "Employee Profile Updated",
        data: barber,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Employee Profile Update issue",
        error,
      });
    }
  };

//Get Single Employee
const getEmpByIdController = async(req,res) => {
  try {
    const barber = await barberModel.findOne({_id:req.body.barberId})
    res.status(200).send({
      success:true,
      message:'Employee Infromation Fetched',
      data:barber,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success:false,
      error,
      message:'Error in Employee Information'
    })
  }
}

const barberAppointmentController = async(req,res) => {
  try {
    const barber = await barberModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      barberId: barber._id,
    });
    res.status(200).send({
      success: true,
      message: "Barber Appointments fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Barber Appointments",
    });
  }
}

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModel.findOne({ _id: appointments.userId });
    const notifcation = user.notifcation;
    notifcation.push({
      type: "status-updated",
      message: `Your appointment has been updated ${status}`,
      onCLickPath: "/barber-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In the Update Status",
    });
  }
};

module.exports = {getbarberInfoController, updateProfileController, getEmpByIdController, barberAppointmentController, updateStatusController,};