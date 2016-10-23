const express = require('express')
const router = express.Router()
const passport = require('passport')
const shortid = require('shortid')
const User = require('../models/user')
const passportConfig = require('../passport/passport')

const dotenv = require('dotenv')
dotenv.load({
  path: '.env.development'
})

const postmark = require('./postmark')


/**
 * GET /signup
 * Signup page.
 */
router.get('/signup', function(req, res) {
  if (req.user) {
    req.flash('success', { msg: '注册成功' })
    return res.redirect('/')
  }
  res.render('user/signup')
})


/**
 * POST /signup
 * Create a new local account.
 */
router.post('/signup', function(req, res, next) {
  req.assert('email', 'Email is not valid.').isEmail()
  req.assert('password', 'Password must be at least 8 characters long').len(8)
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

  var errors = req.validationErrors()

  if (errors) {
    req.flash('errors', errors)
    return res.redirect('/signup')
  }

  var user = new User({
    email: req.body.email,
    password: req.body.password,
    accountStatus: 'verifying',
    quickLoginToken: shortid.generate()
  })

  User.findOne({ email: req.body.email }, function(err, existingUser) {
    if (existingUser) {
      req.flash('errors', { msg: '此邮箱已经存在，请直接登录' })
      var string = encodeURIComponent('verifying')
      return res.redirect('/verifying?valid=' + string)
    }

    user.save(function(err) {
      if (err) {
        return next(err)
      }

      postmark.sendConfirmEmail(req.body.email, req.body.email, req.body.email,
        'http://' + req.headers.host + '/verifybyemail/' + user.quickLoginToken)


      var string = encodeURIComponent('verifying')
      var quicklogintoken = encodeURIComponent(user.quickLoginToken)
      return res.redirect('/verifying?valid=' + string + '&quicklogintoken=' + quicklogintoken)
    })
  })
})


/**
 * GET /verifying
 * Verifying page.
 */
router.get('/verifying', function(req, res) {
  var passedVariable = req.query.valid
  var quicklogintoken = req.query.quicklogintoken
  if (passedVariable == 'verifying') {
    res.render('user/verifying', { quicklogintoken: quicklogintoken })
  } else {
    return res.redirect('/signup')
  }
})


/**
 * GET /verifybyemail
 * Verify by email page.
 */
router.get('/verifybyemail/:quicklogintoken', function(req, res, next) {
  User.findOne({ quickLoginToken: req.params.quicklogintoken }, function(err, existingUser) {
    if (existingUser) {
      req.logIn(existingUser, function(err) {
        if (err) {
          return next(err)
        }
        return res.redirect('/signup')
      })
    } else {
      req.flash('errors', err)
      return res.redirect('/signup')
    }
  })
})


/**
 * GET /login
 * Login page.
 */
router.get('/login', function(req, res) {
  if (req.user) {
    return res.redirect('/')
  }
  res.render('user/login')
})


/**
 * POST /login
 * Sign in using email and password.
 */
router.post('/login', function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail()
  req.assert('password', 'Password cannot be blank').notEmpty()

  var errors = req.validationErrors()

  if (errors) {
    req.flash('errors', errors)
    return res.redirect('/login')
  }

  passport.authenticate('local', function(err, user, info) {
    if (err) {
      return next(err)
    }
    if (!user) {
      req.flash('errors', { msg: info.msg })
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) {
        return next(err)
      }
      req.flash('success', { msg: '登录成功' })
      return res.redirect(req.session.returnTo || '/')
    })
  })(req, res, next)
})


/**
 * GET /logout
 * Log out.
 */
router.get('/logout', function(req, res) {
  req.logout()
  return res.redirect('/')
})


/**
 * GET /account
 * Profile page.
 */
router.get('/account', passportConfig.isAuthenticated, function(req, res) {
  if (!req.user) {
    return res.redirect('/login')
  }
  res.render('user/profile', { title: 'profile' })
})


/**
 * POST /account/profile
 * Update profile information.
 */
router.post('/account/profile', passportConfig.isAuthenticated, function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      return next(err)
    }
    user.email = req.body.email || ''
    user.profile.name = req.body.name || ''
    user.profile.bio = req.body.bio || ''
    user.profile.url = req.body.url || ''
    user.profile.location = req.body.location || ''
    user.save(function(err) {
      if (err) {
        return next(err)
      }
      req.flash('success', { msg: '个人信息已更新' })
      return res.redirect('/account')
    })
  })
})


/**
 * POST /account/password
 * Update current password.
 */
router.post('/account/password', passportConfig.isAuthenticated, function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err) {
      return next(err)
    }

    user.comparePassword(req.body['old-password'], (err, isMatch) => {
      if (err) {
        return next(err)
      }
      if (isMatch === true) {
        req.assert('password', 'Password must be at least 8 characters long').len(8)
        req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password)

        var errors = req.validationErrors()

        if (errors) {
          req.flash('errors', errors)
          return res.redirect('/account')
        }

        user.password = req.body.password
        user.save(function(err) {
          if (err) {
            return next(err)
          }
          req.flash('success', { msg: '密码已更改' })
          res.redirect('/account')
        })
      } else {
        req.flash('errors', { msg: '旧密码错误' })
        return res.redirect('/account')
      }
    })
  })
})


/**
 * POST /account/delete
 * Delete user account.
 */
router.post('/account/delete', passportConfig.isAuthenticated, function(req, res, next) {
  User.remove({ _id: req.user.id }, function(err) {
    if (err) {
      return next(err)
    }
    req.logout()
    req.flash('info', { msg: '账户已被删除' })
    return res.redirect('/')
  })
})


/**
 * GET /account/unlink/:provider
 * Unlink third party account.
 */
router.get('/account/unlink/:provider', passportConfig.isAuthenticated, function(req, res, next) {
  const provider = req.params.provider
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return next(err)
    }
    user.provider = 'local'
    user.tokens = user.tokens.filter(token => token.kind !== provider)
    user.save((err) => {
      if (err) {
        return next(err)
      }
      if (provider == 'github') {
        var provider_name = 'GitHub'
      }
      req.flash('info', { msg: `${provider_name} 已被断开连接` })
      return res.redirect('/account')
    })
  })
})


/**
 * GET /GitHub auth
 */
router.get('/auth/github', passport.authenticate('github', { scope: 'profile email' }))


/**
 * GET /GitHub auth callback
 */
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), function(req, res) {
  return res.redirect(req.session.returnTo || '/')
})


module.exports = router
