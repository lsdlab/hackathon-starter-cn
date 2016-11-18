const express = require('express')
const router = express.Router()
const passport = require('passport')
const _ = require('underscore')
const shortid = require('shortid')

const User = require('../models/user')
const passportConfig = require('../passport/passport')
const db = require('./db')
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

  var email = req.body.email
  var password = req.body.password
  var accountStatus = 'verifying'
  var quickLoginToken = shortid.generate()
  var createdAt = new Date()
  var updatedAt = new Date()

  User.findUserByEmail(email).then(function(existingUser) {
    if (!_.isEmpty(existingUser)) {
      req.flash('errors', { msg: '此邮箱已经存在，请直接登录' })
      return res.redirect('/login')
    } else {
      User.generateHashedPassword(password).then(function(hashedPassowrd) {
        db.none('insert into users(email, password, account_status, quick_login_token, created_at, updated_at) values($1, $2, $3, $4, $5, $6)', [email, hashedPassowrd, accountStatus, quickLoginToken, createdAt, updatedAt])
          .then(function(data) {
            var target_email = req.body.email
            var name = req.body.email
            var username = req.body.email
            var action_url = 'https://' + req.headers.host + '/verifybyemail/' + quickLoginToken
            postmark.sendWelcomeEmail(target_email, name, username, action_url).then(function(error) {
              if (error) {
                req.flash('errors', { msg: '确认邮件发送失败，请稍后重试' })
                return res.redirect('/signup')
              } else {
                var string = encodeURIComponent('verifying')
                req.flash('success', { msg: '邮件发送成功，请检查收件箱' })
                return res.redirect('/verifying?valid=' + string)
              }
            })
          })
          .catch(function(error) {
            return next(error)
          })
      })
    }
  })
  .catch(function(error) {
    return next(error)
  })
})


/**
 * GET /verifying
 * Verifying page.
 */
router.get('/verifying', function(req, res) {
  var passedVariable = req.query.valid
  if (passedVariable == 'verifying') {
    res.render('user/verifying')
  } else {
    return res.redirect('/signup')
  }
})


/**
 * GET /verifybyemail
 * Verify by email page.
 */
router.get('/verifybyemail/:quicklogintoken', function(req, res, next) {
  User.findUserByQuickLoginToken(req.params.quicklogintoken).then(function(existingUser) {
    if (existingUser) {
      req.logIn(existingUser, function(err) {
        if (err) {
          return next(err)
        }
        db.none('update users set account_status=$1 where id=&2', ['verified', existingUser.id])
          .then(function(data) {
            req.flash('success', { msg: '登录成功' })
            return res.redirect('/')
          })
          .catch(function(error) {
            return next(error)
          })
      })
    } else {
      req.flash('errors', { msg: '' })
      return res.redirect('/signup')
    }
  })
  .catch(function(error) {
    return next(error)
  })
})

/**
 * GET /quicklogin
 * Quick login page.
 */
router.get('/quicklogin/:quicklogintoken', function(req, res, next) {
  User.findUserByQuickLoginToken(req.params.quicklogintoken).then(function(existingUser) {
    if (existingUser) {
      req.logIn(existingUser, function(err) {
        if (err) {
          return next(err)
        }
        return res.redirect('/signup')
      })
    } else {
      req.flash('errors', { msg: 'DATABASE ERROR' })
      return res.redirect('/signup')
    }
  })
  .catch(function(error) {
    return next(error)
  })
})


/**
 * GET /login
 * Login page.
 */
router.get('/login', function(req, res) {
  if (req.user) {
    return res.redirect(req.session.returnTo || '/')
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
      return res.redirect('/')
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
  var email = req.body.email || ''
  var name = req.body.name || ''
  var bio = req.body.bio || ''
  var url = req.body.url || ''
  var location = req.body.location || ''

  var updateProfilePromise = User.updateProfile(email, name, bio, url, location, req.user.id)
  updateProfilePromise.then(function() {
    req.flash('success', { msg: '个人信息已更新' })
    return res.redirect('/account')
  })
  .catch(function(error) {
    return next(error)
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

          var target_email = user.email
          var action_url = 'https://' + req.headers.host + '/account'
          postmark.sendNotifyModifyPasswordEmail(target_email, name, action_url, '', '').then(function(error) {
            if (error) {
              return next(error)
            }
          })

          req.flash('success', { msg: '密码已更改' })
          res.redirect('/account')
        })
      } else {
        req.flash('errors', { msg: '旧密码错误，请重新输入' })
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

  User.deleteUser(req.user.id).then(function(data) {
    if (req.user.email) {
      var target_email = req.user.email
      var name = req.user.email
      var action_url = 'https://' + req.headers.host + '/signup'
      postmark.sendNotifyDeleteAccountEmail(target_email, name, action_url, '', '').then(function(error) {
        if (error) {
          return next(error)
        }
      })
    }

    req.logout()
    req.flash('info', { msg: '账户已被删除' })
    return res.redirect('/')
  })
  .catch(function(error) {
    return next(error)
  })
})


/**
 * GET /account/unlink/:provider
 * Unlink third party account.
 */
router.get('/account/unlink/:provider', passportConfig.isAuthenticated, function(req, res, next) {
  const provider = req.params.provider
  User.findUserByID(req.user.id).then(function(user) {
    if (!_.isEmpty(user)) {
      user.provider = 'local'
      user.tokens = user.tokens.filter(token => token.kind !== provider)
      user.save((err) => {
        if (err) {
          return next(err)
        }
        if (provider == 'github') {
          var provider_name = 'GitHub'
        }

        var target_email = user.email
        var action_url = 'https://' + req.headers.host + '/account'
        postmark.sendNotifyUnlinkPorviderEmail(target_email, provider_name, name, action_url, '', '').then(function(error) {
          if (error) {
            return next(error)
          }
        })

        req.flash('info', { msg: `${provider_name} 已被断开连接` })
        return res.redirect('/account')
      })
    } else {
      req.flash('errors', { msg: 'DATABASE ERROR' })
      return res.redirect('/account')
    }
  })
  .catch(function(error) {
    return next(error)
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


/**
 * GET /forgotpassword
 * Forgot password page.
 */
router.get('/forgotpassword', function(req, res) {
  res.render('user/forgotpassword.html')
})


/**
 * PSOT /forgotpassword
 * send email for get password back
 */
router.post('/forgotpassword', function(req, res, next) {
  req.assert('email', 'Email is not valid.').isEmail()

  var errors = req.validationErrors()

  if (errors) {
    req.flash('errors', errors)
    return res.redirect('/forgotpassword')
  }

  User.findUserByEmail(req.body.email).then(function(existingUser) {
    if (existingUser) {
      var target_email = req.body.email
      var name = req.body.email
      var action_url = 'https://' + req.headers.host + '/resetpasswordbyemail/' + existingUser.quickLoginToken
      postmark.sendResetPasswordEmail(target_email, name, action_url).then(function(error) {
        if (error) {
          req.flash('errors', { msg: '邮件发送失败，请稍后重试' })
          return res.redirect('/forgotpassword')
        } else {
          req.flash('success', { msg: '邮件发送成功，请检查收件箱' })
          return res.redirect('/forgotpassword')
        }
      })
    } else {
      req.flash('errors', { msg: 'DATABASE ERROR' })
      return res.redirect('/forgotpassword')
    }
  })
  .catch(function(error) {
    return next(error)
  })
})


/**
 * GET /resetpasswordbyemail
 * Reset password by email page.
 */
router.get('/resetpasswordbyemail/:quicklogintoken', function(req, res, next) {
  User.findUserByQuickLoginToken(req.params.quicklogintoken).then(function(existingUser) {
    if (existingUser) {
      res.render('user/forgotpassword')
    } else {
      req.flash('errors', { msg: 'DATABASE ERROR' })
      return res.redirect('/forgotpassword')
    }
  })
  .catch(function(error) {
    return next(error)
  })
})


module.exports = router
