import express from 'express'
import {createProxyMiddleware} from 'http-proxy-middleware'

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

app.listen(3000)