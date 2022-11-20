import express from 'express'
import {createProxyMiddleware} from 'http-proxy-middleware'
import { env } from 'process'
import * as https from 'https'
import { readFileSync } from 'fs'

const PORT = 3000
const isSSL = env.SSL_CERT_PATH && env.SSL_KEY_PATH

const app = express()


const onProxyRes = (proxyRes, req) => {
  if (proxyRes.headers['set-cookie'])
    proxyRes.headers['set-cookie'] = proxyRes.headers['set-cookie'].map(header => header + '; SameSite=None; Secure')
  proxyRes.headers['Access-Control-Allow-Origin'] = req.headers['origin'] || req.headers['referer']
  proxyRes.headers['Access-Control-Allow-Credentials'] = 'true'
  proxyRes.headers['Access-Control-Allow-Headers'] = '*'
  proxyRes.headers['Access-Control-Expose-Headers'] = 'true'
  if (proxyRes.headers['location'])
    proxyRes.headers['location'] = proxyRes.headers['location'].replace('http://elib.mpei.ru', '')
}

let ssl = undefined
if (isSSL)
  ssl = {
    key: readFileSync(env.SSL_KEY_PATH).toString(),
    cert: readFileSync(env.SSL_CERT_PATH).toString(),
  }

const options = {
  target: 'http://elib.mpei.ru',
  changeOrigin: true,
  onProxyRes,
  followRedirects: false,
  ssl
}

app.use('/', createProxyMiddleware(options))

if (isSSL) {
  https
    .createServer(
      ssl,
      app
    )
    .listen(PORT)
} else app.listen(PORT)