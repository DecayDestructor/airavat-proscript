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
      sex,
      doctor,
      symptoms,
      diagnosis,
      medication,
      medication_end_date,
      notes,
      side_effects,
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

module.exports = router
