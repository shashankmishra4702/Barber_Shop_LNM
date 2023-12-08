const barberModel = require('../models/barberModel')
const userModel = require('../models/userModels')

const getAllUsersController = async(req,res) => {
    try {
        const users = await userModel.find({})
        res.status(200).send({
            success:true,
            message:'users data list',
            data:users,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'Error while fetching users',
            error,
        })
    }
};

const getAllbarbersController = async(req,res) => {
    try {
        const barbers = await barberModel.find({});
        res.status(200).send({
            success:true,
            message:"Employees Data Lists",
            data: barbers,
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:'error while getting employees data',
            error,
        })
    }
};

//Employee Account Status

const changeAccountStatusController = async (req, res) => {
    try {
      const { barberId, status } = req.body;
      const barber = await barberModel.findByIdAndUpdate(barberId, { status });
      const user = await userModel.findOne({ _id: barber.userId });
      const notifcation = user.notifcation;
      notifcation.push({
        type: "barber-account-request-updated",
        message: `Your Employees Account Request Has ${status} `,
        onClickPath: "/notification",
      });
      user.isbarber = status === "approved" ? true : false;
      await user.save();
      res.status(201).send({
        success: true,
        message: "Account Status Updated",
        data: barber,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Eror in Account Status",
        error,
      });
    }
  };

module.exports = {getAllUsersController, getAllbarbersController, changeAccountStatusController};