const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const port = process.env.PORT || 3000
const cors = require('cors')
const router = require('./routes/patient.js')
app.use(cors())
app.use(express.static('public'))

app.use(express.json())

app.use(express.urlencoded({ extended: true }))

const MONGO_URL = `mongodb+srv://aaryanmantri29:${process.env.MONGO_PASS}@cluster0.7izxb7w.mongodb.net/`
// console.log(MONGO_URL)

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('connected to db')
  })
  .catch((err) => console.error(' could not connect to db' + err))

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.use('/', router)

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
