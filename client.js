const request = require('request')

function delay (duration) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(duration), duration)
  })
}

function callAPI () {
  return new Promise((resolve, reject) => {
    const options = {
      json: true
    }
    request('http://localhost:4000/', options, function (error, response, body) {
      // console.log(response && response.statusCode)
      console.log(response && response.headers, body, error)
      error ? reject(error) : resolve([body, response && response.statusCode])
    })
  })
}

async function call (iteration = 0, threshold = 0) {
  const arr = Array(100).fill(0)
  const promises = arr.map(() => {
    return callAPI()
  })

  try {
    const data = await Promise.all(promises)
    console.log('data:', data)
    const isRateLimited = data.map(([body, statusCode]) => statusCode).some(code => code === 429)
    const numErrors = data.map(([body, statusCode]) => statusCode).filter(code => code > 400 && code !== 429).length
    if (numErrors) {
      console.log('numErrors', numErrors)
      threshold += numErrors
      if (threshold > 10) {
        throw new Error(`Too many errors = ${threshold}. Exiting program.`)
      }
    }

    if (!isRateLimited) {
      iteration += 1
      console.log('done', iteration)
      if (iteration < 10) {
        call(iteration, threshold)
      }
    } else {
      console.log('Rate limited, waiting 1 second')
      await delay(1000)
      call(iteration)
    }
  } catch (error) {
    threshold += 1
    if (threshold > 10) {
      throw new Error(`Too many errors ${threshold}. Exiting program.`)
    }
    await delay(1000)
    call(iteration, threshold)
  }
}

call().catch(console.error)
