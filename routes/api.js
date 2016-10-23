const express = require('express')
const router = express.Router()

const _ = require('underscore')
const Q = require('q')


const dotenv = require('dotenv')
dotenv.load({
  path: '.env.development'
})



module.exports = router
