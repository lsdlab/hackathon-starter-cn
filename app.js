const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')

const indexRouter = require('./routes/index')
const userRouter = require('./routes/user')

// dependencies
require('dotenv').config()
require('nodejs-dashboard')
const chalk = require('chalk')
const flash = require('express-flash')
const pg = require('pg')
const session = require('express-session')
const pgSession = require('connect-pg-simple')(session)
const expressValidator = require('express-validator')
const lusca = require('lusca')
const passport = require('passport')
const multer = require('multer')
const upload = multer({ dest: path.join(__dirname, 'uploads') })
require('nodejs-dashboard')

/**
 * Express configuration.
 */
var app = express()
app.set('port', process.env.PORT || 3000)

// log4js logger setup
// const log4js = require('log4js')
// log4js.configure({
//   appenders: [{
//     type: 'DateFile',
//     maxLogSize: 1024,
//     backups: 1,
//     filename: 'logs/access.log',
//     pattern: '-yyyy-MM-dd.log',
//     alwaysIncludePattern: true,
//     category: 'normal'
//   }]
// })
// var logger = log4js.getLogger('normal')
// logger.setLevel('INFO')
// app.use(log4js.connectLogger(logger, { level: log4js.levels.INFO, format:':method :url'}))

// nunjucks template settings
nunjucks.configure(path.join(__dirname, 'views'), {
  autoescape: true,
  watch: true,
  noCache: true,
  express: app
})
app.set('view engine', 'html')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/img/', 'favicon.png')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// third party plugin setup
app.use(flash())
app.use(session({
  store: new pgSession({
    pg: pg, // Use global pg-module
    conString: process.env.POSTGRESQL_URL, // Connect using something else than default DATABASE_URL env variable
    tableName : 'sessions' // Use another table-name than the default "session" one
  }),
  secret: process.env.POSTGRESQL_SECRET,
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}))
app.use(expressValidator())
app.use(lusca({
  xframe: 'SAMEORIGIN',
  xssProtection: true,
  nosniff: true
}))
app.use(function(req, res, next) {
  res.locals.user = req.user
  app.locals._ = require('underscore')
  next()
})
// passport initialize
app.use(passport.initialize())
app.use(passport.session())
app.use(function(req, res, next) {
  res.locals.user = req.user
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
