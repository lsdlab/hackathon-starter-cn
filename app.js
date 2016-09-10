var express = require('express')
var path = require('path')
// var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var indexRouter = require('./routes/index')
var userRouter = require('./routes/user')

// dependencies
const dotenv = require('dotenv')
const chalk = require('chalk');
const flash = require('express-flash')
const lusca = require('lusca')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo/es5')(session)
const passport = require('passport')
const expressValidator = require('express-validator')
const multer = require('multer')
const upload = multer({ dest: path.join(__dirname, 'uploads') })


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({
    path: '.env.example'
})

/**
 * API keys and Passport configuration.
 */
var passportConfig = require('./passport/passport')

/**
 * mongoose connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', () => {
  console.log('%s MongoDB connection established!', chalk.green('✓'));
});
mongoose.connection.on('error', () => {
  console.log('%s MongoDB connection error. Please make sure MongoDB is running.', chalk.red('✗'));
  process.exit();
});

var app = express()

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3000);
// swig template engine setup
var swig = require('swig')
// This is where all the magic happens!
app.engine('html', swig.renderFile)

app.set('view engine', 'html')
app.set('views', __dirname + '/views')

// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false)
// To disable Swig's cache, do the following:
swig.setDefaults({
    cache: false
})
// NOTE: You should always cache templates in a production environment.
// Don't leave both of these to `false` in production!

// express status monitor
app.use(require('express-status-monitor')())

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public/img/', 'favicon.png')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use(expressValidator())
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.MONGODB_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true
    })
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use(lusca.xframe('SAMEORIGIN'))
app.use(lusca.xssProtection(true))
app.use(function(req, res, next) {
    res.locals.user = req.user
    next()
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

app.locals._ = require('underscore')

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
  console.log('%s Express server listening on port %d in %s mode.', chalk.green('✓'), app.get('port'), app.get('env'));
});

module.exports = app;
