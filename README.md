# hackathon-starter-cn

![Language](https://img.shields.io/badge/language-Node.js-brightgreen.svg) ![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Deprecated

copycat of [sahat/hackathon-starter](https://github.com/sahat/hackathon-starter)，抄过来改改，本地邮箱登录、Google、Twitter、GitHub 登录这三个是需要的，其他的就不要了，把邮箱和短信服务对接上去，然后就留着自用。

## Changelog：
### 2016/5/31

模板引擎换成  `swig`，比 `Jade` 好用多了，本地邮箱登录注册功能完成。

### 2016/9/17

第三方邮件发送服务可以用 Postmark 和 Sendgrid，Mailchimp 没看懂怎么用，前面两个都有 Node.JS 的 API 用，可以加上，用户注册和修改密码需要发邮件，本地邮件发送用 Nodemailer，另外一个就是可以都写成 API 来用。

### 2016/10/9

GitHub 登录搞定了。

### 2016/10/23

Nodemailer 太麻烦就不搞了，就用 Postmark 和 Sendgrid 好了。第三方登录只加了 GitHub，Google 要报错，也不搞了。要做成 API 的话需要做 Oauth2，要研究下，还有个问题就是 Node.JS 用 PostgreSQL 也是可以的，要可以的话我就想给迁移过去，MongoDB 实在不好用。

截图：

![0](https://breakwire.me/images/hackathon-starter-cn/hackathon-starter-cn-0.png)

![1](https://breakwire.me/images/hackathon-starter-cn/hackathon-starter-cn-1.png)

![2](https://breakwire.me/images/hackathon-starter-cn/hackathon-starter-cn-2.png)

![3](https://breakwire.me/images/hackathon-starter-cn/hackathon-starter-cn-3.png)

![4](https://breakwire.me/images/hackathon-starter-cn/hackathon-starter-cn-4.png)


### 2016/11/24

不想写 Node.JS 了……专心用 Rails 和 Python……


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

