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

// Function to generate prescription insights using Google's Generative AI
async function generatePrescriptionInsight(
  currentPrescription,
  historicalCases
) {
  // Initialize Google Gen AI with your API key
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  // Select the model
  const model = ai.models.generateContent

  // Create a detailed prompt
  const prompt = `
You are an AI medical assistant helping a doctor make informed decisions.

CURRENT PRESCRIPTION:
Symptoms: ${currentPrescription.symptoms.join(', ')}
Diagnosis: ${currentPrescription.diagnosis}
Medications: 
${currentPrescription.medication
  .map((m) => `- ${m.medicine} (${m.dosage}mg)`)
  .join('\n')}

HISTORICAL CASES WITH SIMILAR SYMPTOMS/DIAGNOSIS:
${historicalCases
  .map(
    (case_, i) => `
CASE ${i + 1}:
Patient: ${case_.patient_name}
Symptoms: ${case_.symptoms.join(', ')}
Diagnosis: ${case_.diagnosis}
Medications: 
${case_.medication.map((m) => `- ${m.medicine} (${m.dosage}mg)`).join('\n')}
Effectiveness (scale 1-10): ${case_.effectiveness}
Side Effects: ${
      case_.side_effects.length > 0
        ? case_.side_effects.join(', ')
        : 'None reported'
    }
Notes: ${case_.notes || 'None'}
`
  )
  .join('\n')}

Based on the above information, provide a concise, professional insight that follows this format:
"You have given similar medication to patients with similar symptoms in the past, and it had [summarize effectiveness and outcomes]. [Add any relevant observations about dosage differences or side effects]."

Be specific about medications, dosages, effectiveness, and side effects. If there are important differences, mention those too.
`

  try {
    // Generate content using the model
    const response = await model({
      model: 'gemini-2.0-flash',
      contents: prompt,
    })

    return response.text
  } catch (error) {
    console.error('Error calling Google Generative AI:', error)
    return 'Unable to analyze prescription history due to an AI service error.'
  }
}

// Express route implementation
router.post('/prescription-analysis', async (req, res) => {
  const { currentPrescription, symptoms, diagnosis } = req.body
  const doctorId = req.query.doctorId // Getting doctorId from query parameters

  if (!doctorId || !currentPrescription || !symptoms || !diagnosis) {
    return res.status(400).json({
      error:
        'Doctor ID, current prescription, symptoms, and diagnosis are required',
    })
  }

  try {
    // Find previous patient records with similar symptoms/diagnosis
    const similarRecords = await PatientHistory.find({
      doctor: doctorId,
      $or: [
        { symptoms: { $in: symptoms } },
        { diagnosis: { $regex: diagnosis, $options: 'i' } },
      ],
      completed: true,
      effectiveness: { $gte: 3 }, // Only consider somewhat effective treatments
    })
      .sort({ effectiveness: -1 })
      .limit(3)

    // If no similar records found
    if (similarRecords.length === 0) {
      return res.json({
        message: 'No similar historical prescriptions found for comparison',
        recommendation: null,
      })
    }

    // Format the data for the AI
    const formattedRecords = similarRecords.map((record) => ({
      patient_name: record.name,
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

    // Format current prescription
    const formattedCurrentPrescription = {
      symptoms: symptoms,
      diagnosis: diagnosis,
      medication: currentPrescription,
    }

    // Generate insight
    const insight = await generatePrescriptionInsight(
      formattedCurrentPrescription,
      formattedRecords
    )

    res.json({
      similar_cases: formattedRecords,
      ai_insight: insight,
    })
  } catch (err) {
    console.error('Error analyzing prescription:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
