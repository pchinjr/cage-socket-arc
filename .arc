@app
paulsocket

@ws
# no more config

@static
folder public

@http
get /

@tables
data
  scopeID *String
  dataID **String
  ttl TTL
