const express = require("express");
const {
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
} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//APply barber || POST
router.post("/apply-barber", authMiddleware, applybarberController);

//Notification barber || POST
router.post("/get-all-notification", authMiddleware, getAllNotificationController);

router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

//Get all Employees
router.get('/getAllEmp', authMiddleware, getAllEmpController)

//Book Appointment
router.post('/book-appointment', authMiddleware, bookAppointmentController)

//Booking Availablity
router.post('/booking-availbility',authMiddleware, bookingAvailabilityController)

//Appointments Lists
router.get('/user-appointments', authMiddleware, userAppointmentsController)

module.exports = router;