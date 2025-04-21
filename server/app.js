const path = require('path')
// const compression = require('compression')
const express = require('express')
const app = express()

/**
 * NOCTURNE MOCK SERVER
 * ==================================
 * Author: Vicco Wang
 * Date: 2019.04.20
 * ==================================
 *
 */
// cross origin
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization')
  res.header('Content-Type', 'application/json;charset=utf-8')
  next()
})
// use analysis json
app.use(express.json())
// use gzip
// app.use(compression())
// use static dict
app.use('/static', express.static(path.join(__dirname, 'static')))
// use routes
require('./routes')(app)

/**
 *
 */
app.listen(3000, function () {
  console.info('server is running, enjoy it!')
})
