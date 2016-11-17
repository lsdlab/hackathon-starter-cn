const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')
const db = require('../routes/db')


/**
 * Password hash middleware.
 */
userSchema.pre('save', function(next) {
  const user = this
  if (!user.isModified('password')) {
    return next()
  }
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err) }
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err) }
      user.password = hash
      next()
    })
  })
})

/**
 * Helper method for validating user's password.
 */
userSchema.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch)
  })
}


/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = (email, size) => {
  if (!size) {
    size = 200
  }

  if (email) {
    var emailNew = email
  }
  else if (!email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro'
  }
  var md5 = crypto.createHash('md5').update(emailNew).digest('hex')

  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro'
}

var User = mongoose.model('User', userSchema)
module.exports = User
