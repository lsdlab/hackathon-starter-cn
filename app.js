const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')


const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')
const apiRouter = require('./routes/api')

// dependencies
require('dotenv').config()
const chalk = require('chalk')
const expressValidator = require('express-validator')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo/es5')(session)
const lusca = require('lusca')
const flash = require('express-flash')
const passport = require('passport')
const multer = require('multer')
const upload = multer({ dest: path.join(__dirname, 'uploads') })
require('nodejs-dashboard')


/**
 * mongoose connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI)
mongoose.connection.on('connected', () => {
  console.log('%s MongoDB connection established!', chalk.blue('✓'))
})
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'))
  process.exit()
})


/**
 * Express configuration.
 */
var app = express()
app.set('port', process.env.PORT || 3000)

// nunjucks template settings
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  watch: true,
  noCache: true,
  express: app
})
app.set('view engine', 'html')


// nodejs-dashboard
require('nodejs-dashboard')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/img/', 'favicon.png')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))


app.use(expressValidator())
app.use(session({
  secret: process.env.MONGODB_SECRET,
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    url: process.env.MONGODB_URI
  })
}))

app.use(lusca({
  xframe: 'SAMEORIGIN',
  xssProtection: true,
  nosniff: true
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use(function(req, res, next) {
  res.locals.user = req.user
  app.locals._ = require('underscore')
  next()
})

app.use(function(req, res, next) {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== '/login' &&
    req.path !== '/signup' &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path
  }
  next()
})
app.post('/profile/upload', upload.single('avatar'), function(req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
})

app.use('/', indexRouter)
app.use('/', userRouter)
app.use('/api', apiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s Express server listening on port %d in %s mode.', chalk.blue('✓'), app.get('port'), app.get('env'))
})

module.exports = app
