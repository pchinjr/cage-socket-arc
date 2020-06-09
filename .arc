@app
cage-socket-arc

@cdn

@ws

@static
folder public
fingerprint true

@http
get /

@tables
data
  scopeID *String
  dataID **String
  ttl TTL

@aws
profile default
region us-east-1