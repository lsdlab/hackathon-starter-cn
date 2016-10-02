const dotenv = require('dotenv')
dotenv.load({
  path: '.env.development'
})
const _ = require('lodash')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const GitHubStrategy = require('passport-github').Strategy

const User = require('../models/user')

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
        return done(err) }
      if (isMatch) {
        return done(null, user)
      }
      return done(null, false, { msg: 'Invalid email or password.' })
    })
  })
}))


/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user) {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) {
        return done(err)
      }
      if (existingUser) {
        req.flash('errors', { msg: 'There is already a Google account that belongs to you. Sign in with that account or delete it, then link it with your current account.' })
        done(err)
      } else {
        User.findById(req.user.id, (err, user) => {
          if (err) {
            return done(err)
          }
          user.google = profile.id
          user.tokens.push({ kind: 'google', accessToken })
          user.profile.name = user.profile.name || profile.displayName
          user.profile.avatar = user.profile.picture || profile._json.image.url
          console.log(profile._json)
          user.save((err) => {
            done(err, user)
          })
        })
      }
    })
  } else {
    User.findOne({ google: profile.id }, (err, existingUser) => {
      if (err) {
        return done(err)
      }
      if (existingUser) {
        return done(null, existingUser)
      }
      User.findOne({ email: profile.emails[0].value }, (err, existingEmailUser) => {
        if (err) {
          return done(err)
        }
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with Google manually from Account Settings.' })
          done(err)
        } else {
          const user = new User()
          user.email = profile.emails[0].value
          user.google = profile.id
          user.tokens.push({ kind: 'google', accessToken })
          user.profile.name = profile.displayName
          user.profile.avatar = profile._json.image.url
          console.log(profile._json)
          user.save((err) => {
            done(err, user)
          })
        }
      })
    })
  }
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
          user.save((err) => {
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
        return done(null, existingUser)
      }
      User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
        if (err) {
          return done(err)
        }
        if (existingEmailUser) {
          req.flash('errors', { msg: 'There is already an account using this email address. Sign in to that account and link it with GitHub manually from Account Settings.' })
          done(err)
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
          user.save((err) => {
            done(err, user)
          })
        }
      })
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
