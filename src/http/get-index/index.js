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
<script>
window.WS_URL = '${process.env.ARC_WSS_URL}'
window.STATE = {count: 'n/a'}
</script>
<script type=module src=/_static/index.js></script>
</body>
</html>`
  }
}
