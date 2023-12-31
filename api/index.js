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

// ADD A TODO FOR A SPECIFIC USER
app.post('/todos/:userId', async (req, res) => {
  try {
    // EXTRACT USER ID, TITLE, AND CATEGORY FROM THE REQUEST PARAMETERS AND BODY
    const userId = req.params.userId
    const { title, category } = req.body

    // CREATE A NEW TODO WITH DEFAULT DUE DATE
    const newTodo = new Todo({
      title,
      category,
      dueDate: moment().format('YYYY-MM-DD')
    })

    // SAVE THE NEW TODO TO THE DATABASE
    await newTodo.save()

    // FIND THE USER BASED ON THE PROVIDED USER ID
    const user = await User.findById(userId)
    if (!user) {
      // HANDLE USER NOT FOUND ERROR
      res.status(404).json({ error: 'User not found' })
    }

    // ADD THE NEW TODO'S ID TO THE USER'S TODOS ARRAY
    user?.todos.push(newTodo._id)
    await user.save()

    // SEND SUCCESSFUL RESPONSE WITH THE ADDED TODO
    res.status(200).json({ message: 'Todo added successfully', todo: newTodo })
  } catch (error) {
    // HANDLE ERROR DURING TODO ADDITION
    res.status(200).json({ message: 'Todo not added' })
  }
})

// GET TODOS FOR A SPECIFIC USER
app.get('/users/:userId/todos', async (req, res) => {
  try {
    // EXTRACT USER ID FROM THE REQUEST PARAMETERS
    const userId = req.params.userId

    // FIND THE USER AND POPULATE THEIR TODOS
    const user = await User.findById(userId).populate('todos')
    if (!user) {
      // HANDLE USER NOT FOUND ERROR
      return res.status(404).json({ error: 'User not found' })
    }

    // SEND SUCCESSFUL RESPONSE WITH USER'S TODOS
    res.status(200).json({ todos: user.todos })
  } catch (error) {
    // HANDLE ERROR DURING TODO RETRIEVAL
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// MARK TODO AS COMPLETE
app.patch('/todos/:todoId/complete', async (req, res) => {
  try {
    // EXTRACT TODO ID FROM THE REQUEST PARAMETERS
    const todoId = req.params.todoId

    // UPDATE TODO STATUS TO "COMPLETED"
    const updatedTodo = await Todo.findByIdAndUpdate(
      todoId,
      {
        status: 'completed'
      },
      { new: true }
    )

    if (!updatedTodo) {
      // HANDLE TODO NOT FOUND ERROR
      return res.status(404).json({ error: 'Todo not found' })
    }

    // SEND SUCCESSFUL RESPONSE WITH THE UPDATED TODO
    res
      .status(200)
      .json({ message: 'Todo marked as complete', todo: updatedTodo })
  } catch (error) {
    // HANDLE ERROR DURING TODO COMPLETION
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// GET COMPLETED TODOS FOR A SPECIFIC DATE
app.get('/todos/completed/:date', async (req, res) => {
  try {
    // EXTRACT DATE FROM THE REQUEST PARAMETERS
    const date = req.params.date

    // FIND COMPLETED TODOS FOR THE SELECTED DATE
    const completedTodos = await Todo.find({
      status: 'completed',
      createdAt: {
        $gte: new Date(`${date}T00:00:00.000Z`), // Start of the selected date
        $lt: new Date(`${date}T23:59:59.999Z`) // End of the selected date
      }
    }).exec()

    // SEND SUCCESSFUL RESPONSE WITH COMPLETED TODOS
    res.status(200).json({ completedTodos })
  } catch (error) {
    // HANDLE ERROR DURING COMPLETED TODOS RETRIEVAL
    res.status(500).json({ error: 'Something went wrong' })
  }
})

// GET COUNT OF COMPLETED AND PENDING TODOS
app.get('/todos/count', async (req, res) => {
  try {
    // COUNT COMPLETED TODOS
    const totalCompletedTodos = await Todo.countDocuments({
      status: 'completed'
    }).exec()

    // COUNT PENDING TODOS
    const totalPendingTodos = await Todo.countDocuments({
      status: 'pending'
    }).exec()

    // SEND SUCCESSFUL RESPONSE WITH TOTAL COUNTS
    res.status(200).json({ totalCompletedTodos, totalPendingTodos })
  } catch (error) {
    // HANDLE ERROR DURING COUNT RETRIEVAL
    res.status(500).json({ error: 'Network error' })
  }
})
