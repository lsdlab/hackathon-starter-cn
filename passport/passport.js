const dotenv = require('dotenv')

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GitHubStrategy = require('passport-github').Strategy

const User = require('../models/user')


dotenv.load({
  path: '.env.development'
})

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) {
      return done(err)
    }
    if (!user) {
      return done(null, false, { msg: `Email ${email} not found.` })
    }
    user.comparePassword(password, (err, isMatch) => {
      if (err) {
        return done(err)
      }
      if (isMatch) {
        return done(null, user)
      }
      return done(null, false, { msg: 'Invalid email or password.' })
    })
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
    User.findOne({ github: profile.id }, (err, existingUser) => {
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a GitHub account that belongs to you. Sign in with that account or delete it, then link it with your current account.' })
        done(err)
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err)
          }
          user.github = profile.id
          user.tokens.push({ kind: 'github', accessToken })
          user.profile.name = user.profile.name || profile.displayName
          user.profile.avatar = user.profile.avatar || profile._json.avatar_url
          user.profile.bio = user.profile.bio || profile._json.bio
          user.profile.url = user.profile.url || profile._json.blog
          user.profile.location = user.profile.location || profile._json.location
          user.provider = 'github'
          user.provider_username = profile._json.location || ''
          user.save((err) => {
            req.flash('info', { msg: 'GitHub account has been linked.' })
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({ github: profile.id }, (err, existingUser) => {
      if (err) {
        return done(err)
      }
      if (existingUser) {
        req.flash('success', { msg: 'Login successed!' })
        return done(null, existingUser)
      } else {
        const user = new User()
        user.email = profile._json.email
        user.github = profile.id
        user.tokens.push({ kind: 'github', accessToken })
        user.profile.name = profile.displayName
        user.profile.avatar = profile._json.avatar_url
        user.profile.location = profile._json.location
        user.profile.bio = profile._json.bio
        user.profile.url = profile._json.blog
        user.profile.location = profile._json.location
        user.provider = 'github'
        user.provider_username = profile._json.location || ''
        user.save((err) => {
          req.flash('info', { msg: 'GitHub account has been linked.' })
          done(err, user)
        })
      }
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
