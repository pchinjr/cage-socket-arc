// public/index.mjs

// get the WebSocket url from the backend
let url = window.WS_URL

// all the DOM nodes this script will mutate
let main = document.getElementsByTagName('main')[0]
let msg = document.getElementById('message')

// setup the WebSocket
let ws = new WebSocket(url)
ws.onopen = open
ws.onclose = close
ws.onmessage = message
ws.onerror = console.log

// connect to the WebSocket
function open() {
  let ts = new Date(Date.now()).toISOString()
  main.innerHTML = `<p><b><code>${ts} - opened</code></b></p>`
}

// report a closed WebSocket connection
function close() {
  main.innerHTML = 'Closed <a href=/>reload</a>'
}

// write a message into main
function message(e) {
  let msg = JSON.parse(e.data)
  main.innerHTML += `<p><code>${msg.message.text}</code></p>`
}

// sends messages to the lambda
msg.addEventListener('keyup', function(e) {
  if (e.key == 'Enter') {
    let text = e.target.value // get the text
    e.target.value = ''       // clear the text
    ws.send(JSON.stringify({text}))
  }
})
