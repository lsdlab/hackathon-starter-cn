# hackathon-starter-cn

![Language](https://img.shields.io/badge/language-Node.js-brightgreen.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)

copycat of [sahat/hackathon-starter](https://github.com/sahat/hackathon-starter)，抄过来改改，本地邮箱登录、Google、Twitter、GitHub 登录这三个是需要的，其他的就不要了，把邮箱和短信服务对接上去，然后就留着自用。

## Changelog：
### 2016/5/31

模板引擎换成  `swig`，比 `Jade` 好用多了，本地邮箱登录注册功能完成。

### 2016/9/17

第三方邮件发送服务可以用 Postmark 和 SendGrod，Mailchimp 没看懂怎么用，前面两个都有 Node.JS 的 API 用，可以加上，用户注册和修改密码需要发邮件，本地邮件发送用 nodemailer，另外一个就是可以都写成 API 来用。

## LICENSE

The MIT License (MIT)
Copyright (c) 2016 Chen Jian

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.

