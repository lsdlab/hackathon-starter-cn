const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const db = require('../routes/db')


/**
 * find existing user
 */
function existingUser(email) {
  var existingUserPromise = db.any('select * from users where email=$1', [email])
  return existingUserPromise
}

/**
 * Password hash middleware.
 */
function generateHashedPassword(password, next) {
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err)
    }
    bcrypt.hash(password, salt, null, (err, hash) => {
      if (err) {
        return next(err)
      }
      return hash
    })
  })
}

/**
 * Helper method for validating user's password.
 */
function comparePassword(candidatePassword,userPassword, cb) {
  bcrypt.compare(candidatePassword, userPassword, (err, isMatch) => {
    cb(err, isMatch)
  })
}


/**
 * Helper method for getting user's gravatar.
 */
function gravatar(email, size) {
  if (!size) {
    size = 200
  }

  if (email) {
    var emailNew = email
  } else if (!email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro'
  }
  var md5 = crypto.createHash('md5').update(emailNew).digest('hex')

  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'
}

module.exports.existingUser = existingUser
module.exports.generateHashedPassword = generateHashedPassword
module.exports.comparePassword = comparePassword
module.exports.gravatar = gravatar
