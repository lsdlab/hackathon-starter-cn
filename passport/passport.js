require('dotenv').config()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const _ = require('underscore')

const db = require('../routes/db')
const User = require('../models/user')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findUserByID(id).then(function(user) {
    if (!_.isEmpty(user)) {
      done(null, user)
    } else {
      done(null, null)
    }
  })
  .catch(function(error) {
    done(null, error)
  })
})

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  db.one('select * from users where email=$1', [email.toLowerCase()])
    .then(function(user) {
      if (!user) {
        return done(null, false, { msg: `无此 ${email} 邮箱❌` })
      }

      User.comparePassword(password, user.password).then(function(isMatch) {
        if (isMatch) {
          return done(null, user)
        }
        return done(null, false, { msg: '密码错误，请重新输入❌' })
      }).catch(function(error) {
        return done(error)
      })
    })
    .catch(function(error) {
      return done(error)
    })
}))


/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}
