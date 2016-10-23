const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')
const crypto = require('crypto')

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    lowercase: true,
    unique: true
  },
  password: String,
  quickLoginToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  accountStatus: {
    type: String,
    default: ''
  },

  client_id: String,
  client_secret: String,

  github: String,
  tokens: Array,

  profile: {
    name: {
      type: String,
      default: ''
    },
    bio: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    }
  },

  created: {
    type: Date,
    default: Date.now
  },
  updated: {
    type: Date,
    default: Date.now
  },

  provider: {
    type: String,
    default: 'local'
  }
})

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
