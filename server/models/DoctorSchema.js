const mongoose = require('mongoose')

const DoctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email_id: {
    type: String,
    required: true,
    unique: true,
  },
  Hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
  },
})

module.exports = mongoose.model('Doctor', DoctorSchema)
