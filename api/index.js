const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const crypto = require('crypto')
const User = require('./models/user.model')
const Todo = require('./models/todo.model')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const moment = require('moment')

require('dotenv').config()

const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.log('Error connection to mongoDb', error)
  })

app.listen(port, () => {
  console.log('Server is running on port 3000')
})

app.post('/register', async (req, res) => {
  try {
    // EXTRACT USER DETAILS FROM REQUEST BODY
    const { name, email, password } = req.body

    /// CHECK IF EMAIL IS ALREADY REGISTERED
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log('Email already registered')
    }

    // CREATE A NEW USER OBJECT
    const newUser = new User({
      name,
      email,
      password
    })

    // SAVE THE NEW USER TO THE DATABASE
    await newUser.save()

    // SEND SUCCESSFUL REGISTRATION RESPONSE
    res.status(202).json({ message: 'User registered successfully' })
  } catch (error) {
    // HANDLE REGISTRATION ERROR
    console.log('Error registering the user', error)
    res.status(500).json({ message: 'Registration failed' })
  }
})

// GENERATE A SECRET KEY USING CRYPTO LIBRARY
const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString('hex')
  return secretKey
}

// GENERATE A SECRET KEY WHEN THE APPLICATION STARTS
const secretKey = generateSecretKey()

app.post('/login', async (req, res) => {
  try {
    // EXTRACT EMAIL AND PASSWORD FROM THE REQUEST BODY
    const { email, password } = req.body

    // FIND USER BASED ON THE PROVIDED EMAIL
    const user = await User.findOne({ email })
    if (!user) {
      // HANDLE INVALID EMAIL
      return res.status(401).json({ message: 'Invalid Email' })
    }

    // CHECK IF THE PROVIDED PASSWORD MATCHES THE STORED PASSWORD
    if (user.password !== password) {
      // HANDLE INVALID PASSWORD
      return res.status(401).json({ message: 'Invalid password' })
    }

    // GENERATE A JSON WEB TOKEN (JWT) USING THE SECRET KEY
    const token = jwt.sign({ userId: user._id }, secretKey)

    // SEND SUCCESSFUL LOGIN RESPONSE WITH THE GENERATED TOKEN
    res.status(200).json({ token })
  } catch (error) {
    // HANDLE LOGIN ERROR
    console.log('Login failed', error)
    res.status(500).json({ message: 'Login failed' })
  }
})
