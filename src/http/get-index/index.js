let arc = require('@architect/functions')
let static = arc.http.helpers.static
let getURL = require('./get-web-socket-url')

/**
 * renders the html app chrome
 */
exports.handler = async function http(req) {
  return {
    headers: {'content-type': 'text/html; charset=utf8'},
    body: `<!doctype html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
</head> 
<body>
<h1>#PraiseCage</h1>
<button id="leftButton">Left</button>
<button id="centerButton">Center</button>
<button id="rightButton">Right</button>
<main>Loading...</main>
<script>
window.WS_URL = '${getURL()}'
</script>
<script type=module src=${static('/index.mjs')}></script>
</body>
</html>`
  }
}