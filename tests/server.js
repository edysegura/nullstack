import Nullstack from 'nullstack'

import cors from 'cors'
import express from 'express'

import Application from './src/Application'
import CatchError from './src/CatchError'
import ContextProject from './src/ContextProject'
import ContextSecrets from './src/ContextSecrets'
import ContextSettings from './src/ContextSettings'
import ContextWorker from './src/ContextWorker'
import ExposedServerFunctions from './src/ExposedServerFunctions'
import vueable from './src/plugins/vueable'
import ReqRes from './src/ReqRes'

Nullstack.use(vueable)

const context = Nullstack.start(Application)

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT']

context.server.use(
  cors({
    origin: 'http://localhost:6969',
    optionsSuccessStatus: 200,
  }),
)
context.server.use(express.json())

context.worker.staleWhileRevalidate = [/[0-9]/]
context.worker.cacheFirst = [/[0-9]/]

context.server
  .get('/data/get/:param', ExposedServerFunctions.getData)
  .get('/chainable-server-function', (request, response) => {
    response.json({ chainable: true })
  })
  .get('/chainable-regular-function', (request, response) => {
    response.json({ chainable: true })
  })
context.server.get('/data/all/:param', ExposedServerFunctions.getData)
context.server.post('/data/post/:param', ExposedServerFunctions.getData)
context.server.put('/data/put/:param', ExposedServerFunctions.getData)
context.server.patch('/data/patch/:param', ExposedServerFunctions.getData)
context.server.delete('/data/delete/:param', ExposedServerFunctions.getData)

context.server.get('/exposed-server-function-url.json', ReqRes.exposedServerFunction)
context.server.get('/nested-exposed-server-function-url.json', ReqRes.nestedExposedServerFunction)

context.server.get('/custom-api-before-start', (request, response) => {
  response.json({ startValue: context.startValue })
})

context.server.use('/api', (request, response, next) => {
  request.status = 200
  if (!response.headersSent) {
    next()
  }
})

for (const method of methods) {
  context.server[method.toLowerCase()]('/api', (request, response) => {
    response.status(request.status).json({ method: request.method })
  })
}

context.server.get('/vaidamerdanaapi.json', (_request, response) => {
  response.vaidamerdanaapi()
})

context.startIncrementalValue = 0

context.start = async function () {
  await ContextProject.start(context)
  await ContextSecrets.start(context)
  await ContextSettings.start(context)
  await ContextWorker.start(context)
  context.startValue = true
  context.startIncrementalValue++
}

context.catch = async function (error) {
  CatchError.logError({ message: error.message })
  if (context.environment.development) {
    console.error(error)
  }
}

export default context
