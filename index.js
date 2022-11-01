import * as http from 'http'
import * as https from 'https'
import fetch from 'node-fetch'
import * as utf8 from 'utf8'

const agent = new http.Agent()

const server = http.createServer(async (req, res) => {
  let body = ''
  let url
  try{
    url = new URL(req.url.slice(1, req.url.length))
  }
  catch (e) {
    res.end()
    return
  }
  req.on('data', chunk => {
    body += chunk.toString()
  })
  req.on('end', async () => {
    try {
      const proxy_res = await fetch(url.href, {
        method: req.method,
        body: req.method.toUpperCase() === 'GET' ? undefined : body,
        headers: {
          Hostname: url.host,
          'Content-Type': req.headers['content-type']
        },
        redirect: 'manual',
        agent
      })
      res.writeHead(200)
      const rawHeaders = {}
      Object.keys(proxy_res.headers.raw()).forEach(k => {
        rawHeaders[k] = proxy_res.headers.raw()[k][0]
      })
      res.end(JSON.stringify({
        status: proxy_res.status,
        statusText: proxy_res.statusText,
        headers: rawHeaders,
        url: proxy_res.url,
        text: await proxy_res.text(),
        setCookie: proxy_res.headers.get('set-cookie').split(',')
      }))
    } catch (e) {
      console.error(e)
    }

    const proxy_res1 = await fetch(url.href+'?cookieVerify=', {
      method: req.method,
      body: req.method.toUpperCase() === 'GET' ? undefined : body,
      headers: {
        Hostname: url.host,
        'Content-Type': req.headers['content-type']
      },
      redirect: 'manual',
      agent
    })
  })
})

server.listen(3000)