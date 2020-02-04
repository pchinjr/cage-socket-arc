exports.handler = async function http(req) {
  return {
    headers: {
      'content-type': 'text/html; charset=utf8',
    },
    body: `<!doctype html>
<html>
<body>
<h1>WebSockets</h1>
<main>Loading...</main>
<input id=message type=text placeholder="Enter message" autofocus>
<script>
window.WS_URL = '${process.env.ARC_WSS_URL}'
</script>
<script type=module src=/_static/index.js></script>
</body>
</html>`
  }
}
