const https = require('https')
const http = require('http')
const { URL } = require('url')

// 1. Polyfill Web Streams
if (typeof globalThis.ReadableStream === 'undefined') {
  try {
    const streamWeb = require('stream/web')
    globalThis.ReadableStream = streamWeb.ReadableStream
    globalThis.WritableStream = streamWeb.WritableStream
    globalThis.TransformStream = streamWeb.TransformStream
  } catch (_) {}
}

// 2. Polyfill Headers
if (typeof globalThis.Headers === 'undefined') {
  class PolyfillHeaders {
    constructor(init) {
      this._map = new Map()
      if (init) {
        if (init instanceof PolyfillHeaders || (init && typeof init.entries === 'function')) {
          for (const [k, v] of init.entries()) {
            this.append(k, v)
          }
        } else if (Array.isArray(init)) {
          for (const [k, v] of init) {
            this.append(k, v)
          }
        } else if (typeof init === 'object') {
          for (const k of Object.keys(init)) {
            this.append(k, init[k])
          }
        }
      }
    }

    append(name, value) {
      const key = String(name).toLowerCase()
      const val = String(value)
      if (this._map.has(key)) {
        this._map.set(key, this._map.get(key) + ', ' + val)
      } else {
        this._map.set(key, val)
      }
    }

    set(name, value) {
      this._map.set(String(name).toLowerCase(), String(value))
    }

    get(name) {
      return this._map.get(String(name).toLowerCase()) || null
    }

    has(name) {
      return this._map.has(String(name).toLowerCase())
    }

    delete(name) {
      this._map.delete(String(name).toLowerCase())
    }

    forEach(callback, thisArg) {
      this._map.forEach((val, key) => callback.call(thisArg, val, key, this))
    }

    entries() {
      return this._map.entries()
    }

    keys() {
      return this._map.keys()
    }

    values() {
      return this._map.values()
    }

    [Symbol.iterator]() {
      return this._map.entries()
    }
  }

  globalThis.Headers = PolyfillHeaders
}

// 3. Polyfill Fetch
if (typeof globalThis.fetch === 'undefined') {
  const polyfillFetch = async (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url)
      const lib = parsedUrl.protocol === 'https:' ? https : http

      const headersObj = {}
      if (options.headers) {
        const h = new globalThis.Headers(options.headers)
        for (const [k, v] of h.entries()) {
          headersObj[k] = v
        }
      }

      const req = lib.request(
        url,
        {
          method: options.method || 'GET',
          headers: headersObj,
        },
        (res) => {
          const chunks = []
          res.on('data', (c) => chunks.push(c))
          res.on('end', () => {
            const bodyBuffer = Buffer.concat(chunks)
            const bodyText = bodyBuffer.toString('utf8')
            const resHeaders = new globalThis.Headers(res.headers)

            const responseObj = {
              ok: (res.statusCode ?? 200) >= 200 && (res.statusCode ?? 200) < 300,
              status: res.statusCode ?? 200,
              statusText: res.statusMessage ?? '',
              headers: resHeaders,
              text: async () => bodyText,
              json: async () => JSON.parse(bodyText),
              arrayBuffer: async () =>
                bodyBuffer.buffer.slice(
                  bodyBuffer.byteOffset,
                  bodyBuffer.byteOffset + bodyBuffer.byteLength
                ),
              blob: async () => bodyBuffer,
              body: res,
            }
            resolve(responseObj)
          })
        }
      )

      req.on('error', reject)

      if (options.body) {
        req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
      }
      req.end()
    })
  }

  globalThis.fetch = polyfillFetch
}

module.exports = {}
