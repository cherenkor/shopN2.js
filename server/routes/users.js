const bcrypt = require('bcrypt')
const { pick } = require('lodash')
const router = require('express').Router()
const auth = require('../middleware/auth')
const { User, validate } = require('../models/User')

router.get('/me', auth, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password')
  res.send(user)
})

router.post('/', async (req, res) => {
  const { error } = validate(req.body)
  if (error) return res.status(400).send(error.details[0].message)

  let user = await User.findOne({ email: req.body.email })
  if (user) return res.status(400).send('User already registered')

  user = new User(req.body)
  const salt = await bcrypt.genSalt(10)
  user.password = await bcrypt.hash(user.password, salt)
  await user.save()

  res
    .header('Authorization', `Bearer ${user.generateAuthToken()}`)
    .send(pick(user, ['_id', 'name', 'email', 'role']))
})

module.exports = router
