
// function clusterServer (app) {
//   const cluster = require('cluster')
//   const numCPUs = require('os').cpus().length

//   if (cluster.isMaster) {
//     console.log(`Master ${process.pid} is running`)

//     for (let i = 0; i < numCPUs; i += 1) {
//       cluster.fork()
//     }
//     cluster.on('exit', (worker, code, signal) => {
//       console.log(`worker ${worker.process.pid} died`)
//     })
//   } else {
//     app()
//   }
// }

const RateLimiter = require('limiter').RateLimiter
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

const limiter = new RateLimiter(60, 'second')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  console.log('hitting')
  limiter.removeTokens(1, (err, remaining) => {
    if (err || remaining < 1) {
      console.log('Too many requests')
      res.writeHead(429, {'Content-Type': 'text/plain;charset=UTF-8'})
      res.end('429 Too Many Requests - your IP is being rate limited')
    } else {
      res.status(200).json({
        msg: 'hello world'
      })
    }
  })
})

app.post('/', (req, res) => {
  if (req.body.name === 'john') {
    console.log('hitting john')
    res.status(200).json({
      name: req.body.name
    })
  } else {
    console.log('hitting others')
    res.status(200).json({
      name: req.body.name
    })
  }
})

app.get('/no-limit', async (req, res) => {
  // const start = preciseTime()
  // await delay(250)
  // const interval = preciseTime() - start
  // console.log(interval)
  res.status(200).json({
    msg: 'get hello world'
  })
})

app.post('/no-limit', (req, res) => {
  res.status(200).json({
    msg: req.body
  })
})

app.listen(3000, () => {
  console.log(`listening to port *:3000. press ctrl + c to cancel.`)
})

function preciseTime () {
  const [_, nanoseconds] = process.hrtime()
  return nanoseconds / 1e6
}

async function delay (durationInMs) {
  return new Promise((resolve) => {
    setTimeout(_ => resolve(), durationInMs)
  })
}
