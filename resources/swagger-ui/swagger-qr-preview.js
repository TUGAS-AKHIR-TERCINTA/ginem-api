/**
 * Loaded only on /api/v1/docs. Intercepts fetch so WhatsApp QR JSON responses
 * show a fixed preview (Swagger UI cannot render binary PNG or inline images in the body).
 */
;(function () {
  function extractQrDataUrl(payload) {
    if (payload == null || typeof payload !== 'object') return null
    var d = payload.data
    if (d == null || typeof d !== 'object') return null
    if (typeof d.image === 'string' && d.image.indexOf('data:image/') === 0)
      return d.image
    if (typeof d.base64 === 'string' && d.base64.indexOf('data:image/') === 0)
      return d.base64
    if (typeof d.qrDataUrl === 'string' && d.qrDataUrl.indexOf('data:image/') === 0)
      return d.qrDataUrl
    return null
  }

  function showQrPreview(src) {
    var wrap = document.getElementById('swagger-wa-qr-preview')
    if (!wrap) {
      wrap = document.createElement('div')
      wrap.id = 'swagger-wa-qr-preview'
      wrap.setAttribute(
        'style',
        'position:fixed;bottom:16px;right:16px;z-index:99999;padding:10px;background:#fff;border:1px solid #ccc;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.15);max-width:240px;'
      )
      document.body.appendChild(wrap)
    }
    wrap.replaceChildren()
    var label = document.createElement('div')
    label.textContent = 'WhatsApp QR (preview)'
    label.setAttribute(
      'style',
      'font:12px/1.4 system-ui,sans-serif;margin-bottom:8px;color:#333;'
    )
    var img = document.createElement('img')
    img.alt = 'WhatsApp QR'
    img.setAttribute('style', 'max-width:220px;height:auto;display:block;')
    img.src = src
    wrap.appendChild(label)
    wrap.appendChild(img)
  }

  var origFetch = window.fetch
  window.fetch = function () {
    var args = arguments
    return origFetch.apply(this, args).then(function (res) {
      try {
        var reqUrl = typeof args[0] === 'string' ? args[0] : args[0] && args[0].url
        if (!reqUrl || typeof reqUrl !== 'string') return res
        var u = reqUrl.toLowerCase()
        var isWaQr = u.indexOf('/whatsapp/qr') !== -1 && u.indexOf('format=png') === -1
        var isWaConnect = u.indexOf('/whatsapp/connect') !== -1
        if (!isWaQr && !isWaConnect) return res

        var ct = res.headers.get('content-type') || ''
        if (ct.indexOf('application/json') === -1) return res

        return res
          .clone()
          .json()
          .then(function (body) {
            var url = extractQrDataUrl(body)
            if (url) showQrPreview(url)
            return res
          })
          .catch(function () {
            return res
          })
      } catch (e) {
        return res
      }
    })
  }
})()
