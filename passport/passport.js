require('dotenv').config()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GitHubStrategy = require('passport-github').Strategy
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
        return done(null, false, { msg: `Email ${email} not found.` })
      }

      User.comparePassword(password, user.password).then(function(isMatch) {
        if (isMatch) {
          return done(null, user)
        }
        return done(null, false, { msg: 'Invalid email or password.' })
      }).catch(function(error) {
        return done(error)
      })
    })
    .catch(function(error) {
      return done(error)
    })
}))


/**
 * Sign in with GitHub.
 */
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/auth/github/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findUserByGitHub(profile.id).then(function(user) {
      if (user) {
        req.flash('errors', { msg: '已有账户此 GitHub 账户连接，请重新更换 GitHub 账户连接' })
        done(null)
      } else {
        var github = profile.id
        var tokens
        tokens.push({ kind: 'github', accessToken })
        var name = user.name || profile.displayName
        var bio = user.bio || profile._json.bio
        var url = user.url || profile._json.blog
        var location = user.location || profile._json.location
        var provider = 'github'

        User.updateGitHubProfile(github, tokens, name, bio, url, location, provider, req.user.id).then(function(data) {
          req.flash('info', { msg: 'GitHub 账户已被连接' })
          done(null, data)
        })
      }
    })
    .catch(function(error) {
      done(null, error)
    })
  } else {
    User.findUserByGitHub(profile.id).then(function(user) {
      if (user) {
        req.flash('success', { msg: '登录成功' })
        done(null, user)
      } else {
        var email = profile._json.email
        var github = profile.id
        var tokens
        tokens.push({ kind: 'github', accessToken })
        var name = user.name || profile.displayName
        var bio = user.bio || profile._json.bio
        var url = user.url || profile._json.blog
        var location = user.location || profile._json.location
        var provider = 'github'

        User.updateGitHubEmailProfile(email, github, tokens, name, bio, url, location, provider, req.user.id).then(function(data) {
          req.flash('info', { msg: 'GitHub 账户已被连接' })
          done(null, data)
        })
      }
    })
    .catch(function(error) {
      done(null, error)
    })
  }
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
