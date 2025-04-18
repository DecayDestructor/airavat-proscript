const mongoose = require('mongoose')

const PatientHistorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  patient_email: {
    type: String,
    required: true,
  },
  patient_phone: {
    type: String,
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
  },
  symptoms: {
    type: [String],
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
  medication: {
    type: [
      {
        medicine: {
          type: String,
          required: true,
        },
        dosage: {
          type: Number,
          required: true,
        },
        frequency: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  medication_start_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  medication_end_date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  notes: {
    type: String,
  },
  side_effects: {
    type: [String],
  },
  completed: {
    type: Boolean,
    default: false,
  },
  effectiveness: {
    type: Number,
    default: 0,
  },
  allergy: {
    type: [String],
  },
  pregnant: {
    type: Boolean,
    default: false,
  },
})

module.exports = mongoose.model('PatientHistory', PatientHistorySchema)
