var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');

var dotenv = require('dotenv');
var lusca = require('lusca');
var flash = require('express-flash');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo/es5')(session);
var passport = require('passport');
var expressValidator = require('express-validator');
var multer = require('multer');
var upload = multer({ dest: path.join(__dirname, 'uploads') });


/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env.example' });

/**
 * API keys and Passport configuration.
 */
var passportConfig = require('./passport/passport');

var app = express();

/**
 * Connect to MongoDB.
 */
var connection = mongoose.connect('mongodb://localhost/hackathon-starter-cn');
mongoose.connection.on('error', function() {
    console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
    process.exit(1);
});

// view engine setup
var swig = require('swig');
// This is where all the magic happens!
app.engine('html', swig.renderFile);

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

// Swig will cache templates for you, but you can disable
// that and use Express's caching instead, if you like:
app.set('view cache', false);
// To disable Swig's cache, do the following:
swig.setDefaults({
    cache: false
});
// NOTE: You should always cache templates in a production environment.
// Don't leave both of these to `false` in production!


// uncomment after placing your favicon in /static
// app.use(favicon(path.join(__dirname, 'static/img/', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'static')));

app.use(expressValidator());
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.MONGODB_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true
    })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use(function(req, res, next) {
    res.locals.user = req.user;
    next();
});

app.use('/', indexRouter);
app.use('/', userRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.locals._ = require('underscore');

module.exports = app;
