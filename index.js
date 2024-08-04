const express = require('express')
const app = express()
const port = process.env.PORT || 3000

const router = require('./src/route/api.route')
const { InitWhatsAppClient } = require('./src/whatsappClient')
app.use(router)

InitWhatsAppClient();

app.listen(port, () => {
  console.log(`WhatsApp API Server listening at http://localhost:${port}`)
})


