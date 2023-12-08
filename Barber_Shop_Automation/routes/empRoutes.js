const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { getbarberInfoController, updateProfileController, getEmpByIdController, barberAppointmentController, updateStatusController } = require('../controllers/empCtrl')
const router = express.Router()

//Post Single Employee Information
router.post('/getbarberInfo', authMiddleware, getbarberInfoController)

//Post Update Profile
router.post('/updateProfile', authMiddleware, updateProfileController)

//Post Single Employee Info
router.post('/getEmpById', authMiddleware, getEmpByIdController)

//Get Appointments
router.get('/barber-appointments', authMiddleware , barberAppointmentController)

//Post Update Status
router.post('/update-status', authMiddleware, updateStatusController)

module.exports = router