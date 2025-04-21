
module.exports = function (app) {
  // user login
  app.post('/user/login', function (req, res) {
    const { userAccount, userPassword } = req.body
    if (userAccount && userPassword) {
      res.json({
        'head': {
          'success': 'true'
        },
        'data': {
          'token': 'A7D8SKLJZ87D-S8S8AS78DF6S787AS8D7FJCZ685C8DAA-ASD876XIZ'
        }
      })
    }
  })

  // user info
  app.post('/user/info', function (req, res) {
    if (req.headers.authorization) {
      res.json({
        'head': {
          'success': 'true'
        },
        'data': {
          'token': req.headers.authorization,
          'userAccount': 'Administrator',
          'userName': 'Admin',
          'userStatus': '0',
          'roles': [
            'admin',
            'user'
          ]
        }
      })
    }
  })

  // logout
  app.post('/user/logout', function (req, res) {
    if (req.headers.authorization) {
      res.json({
        'head': {
          'msg': '成功',
          'success': 'true',
          'code': '200'
        }
      })
    }
  })
}
