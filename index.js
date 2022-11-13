import express from 'express'
import {createProxyMiddleware} from 'http-proxy-middleware'
import { env } from 'process'
import * as https from 'https'
import { readFileSync } from 'fs'

const app = express()

const onProxyRes = (proxyRes, req) => {
  proxyRes.headers['Access-Control-Allow-Origin'] = req.headers['origin'] || req.headers['referer']
  proxyRes.headers['Access-Control-Allow-Credentials'] = 'true'
  proxyRes.headers['Access-Control-Allow-Headers'] = '*'
  proxyRes.headers['Access-Control-Expose-Headers'] = 'true'
}

const options = {
  target: 'http://elib.mpei.ru',
  changeOrigin: true,
  onProxyRes,
  followRedirects: false
}

app.use('/', createProxyMiddleware(options))

if (env.SSL_CERT_PATH && env.SSL_KEY_PATH) {
  https
    .createServer(
      {
        key: readFileSync(env.SSL_KEY_PATH).toString(),
        cert: readFileSync(env.SSL_CERT_PATH).toString(),
      },
      app
    )
    .listen(3000)
} else app.listen(3000)