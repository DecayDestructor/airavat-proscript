const express = require('express')
const router = express.Router()

const PatientHistory = require('../models/PatientHistory.js')
const Doctor = require('../models/DoctorSchema.js')
const Hospital = require('../models/HospitalSchema.js')
const Fuse = require('fuse.js')
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
      allergy,
      frequency,
    } = req.body
    // Combine medicines and dosages into medication array
    const medication = medicines.map((medicine, index) => ({
      medicine,
      dosage: Math.min(dosages[index], 100),
      frequency: frequency[index],
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
      allergy,
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
    const { note, side_effects, effectiveness } = req.body
    const boundedEffectiveness = Math.min(Math.max(effectiveness, 0), 10)
    const updatedPrescript = await PatientHistory.findByIdAndUpdate(
      id,
      {
        completed: true,
        notes: note || '',
        side_effects: side_effects || [],
        effectiveness: boundedEffectiveness,
      },
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
      completed: true,
    })
      .sort({ medication_end_date: -1 })
      .exec()
    res.status(200).json(prescripts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})
const { GoogleGenAI } = require('@google/genai')
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

const generatePrescriptionInsight = async (
  currentPrescription,
  pastPrescriptions
) => {
  const { symptoms, diagnosis, medication } = currentPrescription

  const currentMedText = medication
    .map((m) => `${m.medicine} (${m.dosage}mg)`)
    .join(', ')

  const pastText = pastPrescriptions
    .map(
      (record, i) => `
Record ${i + 1}:
Diagnosis: ${record.diagnosis}
Medications: ${record.medication
        .map((m) => `${m.medicine} (${m.dosage}mg)`)
        .join(', ')}
Effectiveness: ${record.effectiveness}/10
Side Effects: ${
        record.side_effects.length ? record.side_effects.join(', ') : 'None'
      }
`
    )
    .join('\n')

  const prompt = `
You are a medical AI assistant. Analyze the following patient's current prescription and past prescriptions.

Return ONLY one sentence like:
"A similar diagnosis/dose was given to the patient before and it resulted in xyz effectivenessand side effects of xyz."

Do not add any extra text or explanation.

--- CURRENT PRESCRIPTION ---
Diagnosis: ${diagnosis}
Medications: ${currentMedText}

--- PAST RECORDS ---
${pastText}
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })

    return response.text
  } catch (err) {
    console.error('Gemini AI insight error:', err)
    return 'Failed to generate insight.'
  }
}

// module.exports = generatePrescriptionInsight

// module.exports = generatePrescriptionInsight

// Express route implementation
router.post('/prescription-analysis/:email', async (req, res) => {
  const { currentPrescription, symptoms, diagnosis } = req.body
  const { email } = req.params

  if (!email || !currentPrescription || !symptoms || !diagnosis) {
    return res.status(400).json({
      error:
        'Patient email, current prescription, symptoms, and diagnosis are required',
    })
  }

  try {
    // Find this patient's own previous records with similar symptoms/diagnosis
    const similarRecords = await PatientHistory.find({
      patient_email: email,
      completed: true,
    })
      .sort({ effectiveness: -1 })
      .limit(3)

    if (!similarRecords.length) {
      return res.json({
        message: 'No similar historical prescriptions found for this patient',
        ai_insight: null,
        similar_cases: [],
      })
    }

    // Format the data for AI
    const formattedRecords = similarRecords.map((record) => ({
      symptoms: record.symptoms,
      diagnosis: record.diagnosis,
      medication: record.medication.map((med) => ({
        medicine: med.medicine,
        dosage: med.dosage,
      })),
      effectiveness: record.effectiveness,
      side_effects: record.side_effects || [],
      notes: record.notes || '',
    }))

    const formattedCurrentPrescription = {
      symptoms,
      diagnosis,
      medication: currentPrescription,
    }

    const insight = await generatePrescriptionInsight(
      formattedCurrentPrescription,
      formattedRecords
    )

    res.json({
      similar_cases: formattedRecords,
      ai_insight: insight,
    })
  } catch (err) {
    console.error('Error analyzing patient prescription:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

//find all prescriptions for one hospital
router.get('/get-prescripts-by-hospital/:id', async (req, res) => {
  const { id } = req.params
  try {
    const allDoctors = await Doctor.find({ Hospital: id })
    console.log(allDoctors)

    const allPrescripts = []
    for (let i = 0; i < allDoctors.length; i++) {
      const prescripts = await PatientHistory.find({
        doctor: allDoctors[i]._id,
        completed: false,
      })
        .sort({ medication_end_date: -1 })
        .exec()
      allPrescripts.push(...prescripts)
    }
    res.status(200).json(allPrescripts)
  } catch (e) {}
})

module.exports = router
