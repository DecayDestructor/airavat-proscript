const express = require('express')
const router = express.Router()

const PatientHistory = require('../models/PatientHistory.js')
const Doctor = require('../models/DoctorSchema.js')
const Hospital = require('../models/HospitalSchema.js')

router.post('/create-hospital', async (req, res) => {
  try {
    const { name } = req.body
    const existingHospital = await Hospital.findOne({ name })
    if (existingHospital) {
      return res.status(400).json({ message: 'Hospital already exists' })
    }

    const newHospital = new Hospital({ name })
    await newHospital.save()

    res.status(201).json({ message: 'Hospital created successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

//get hospital by name
router.get('/get-hospital', async (req, res) => {
  try {
    const { name } = req.body
    const existingHospital = await Hospital.findOne({ name })
    if (existingHospital) {
      return res.status(200).json({ existingHospital })
    }
    return res.status(400).json({ message: 'Hospital not found' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/create-doctor', async (req, res) => {
  const { name, age, email, hospital_id } = req.body
  try {
    const existingDoctor = await Doctor.findOne({ email })
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor already exists' })
    }
    const newDoctor = new Doctor({
      name,
      age,
      email_id: email,
      Hospital: hospital_id,
    })
    await newDoctor.save()
    res.status(201).json({ message: 'Doctor created successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// const PatientHistory = require('../models/PatientHistory')

router.post('/create-prescript', async (req, res) => {
  try {
    const {
      name,
      age,
      sex,
      doctor,
      phone,
      email,
      symptoms,
      diagnosis,
      medicines,
      dosages,
      medication_end_date,
      notes,
      side_effects,
    } = req.body
    // Combine medicines and dosages into medication array
    const medication = medicines.map((medicine, index) => ({
      medicine,
      dosage: Math.min(dosages[index], 100),
    }))

    const newPrescript = new PatientHistory({
      name,
      age,
      sex: sex.toLowerCase(),
      doctor,
      symptoms,
      diagnosis,
      medication,
      medication_end_date,
      notes,
      side_effects: [],
      patient_email: email,
      patient_phone: phone,
    })

    await newPrescript.save()
    return res
      .status(201)
      .json({ message: 'Prescription created successfully' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// route to mark a prescription as completed
router.put('/complete-prescript/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { note, side_effects } = req.body
    const updatedPrescript = await PatientHistory.findByIdAndUpdate(
      id,
      { completed: true, notes: note || '', side_effects: side_effects || [] },
      { new: true }
    )
    res.status(200).json(updatedPrescript)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

//route to get all prescriptions for a particular patient
router.get('/get-prescripts/:email', async (req, res) => {
  try {
    const { email } = req.params
    const prescripts = await PatientHistory.find({
      patient_email: email,
    })
    res.status(200).json(prescripts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

//route to get all prescripts by one doctor
router.get('/get-prescripts-by-doctor/:email', async (req, res) => {
  try {
    const { email } = req.params
    // console.log(email)
    const doctor = await Doctor.findOne({ email_id: email })
    // console.log(doctor)
    const prescripts = await PatientHistory.find({ doctor: doctor._id })
    res.status(200).json(prescripts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

//route to get one prescript by id
router.get('/get-prescript/:id', async (req, res) => {
  try {
    const { id } = req.params
    const prescript = await PatientHistory.findById(id)
    res.status(200).json(prescript)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

//route to get prescripts not expired sorted by date by a doctor
router.get('/get-prescripts-not-expired-by-doctor/:email', async (req, res) => {
  try {
    const { email } = req.params
    // console.log(email)
    const doctor = await Doctor.findOne({ email_id: email })
    // console.log(doctor)

    const prescripts = await PatientHistory.find({
      doctor: doctor._id,
      completed: false,
    })
      .sort({ medication_end_date: 1 })
      .exec()
    res.status(200).json(prescripts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

//route to get expired by a doctor
router.get('/get-expired-prescripts-by-doctor/:email', async (req, res) => {
  try {
    const { email } = req.params
    const doctor = await Doctor.findOne({ email_id: email })
    const prescripts = await PatientHistory.find({
      doctor: doctor._id,
      completed: false,
    })
      .sort({ medication_end_date: -1 })
      .exec()
    res.status(200).json(prescripts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})
module.exports = router
