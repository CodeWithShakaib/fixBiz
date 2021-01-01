const app = require("./config/express")
const port = 3000

const http = require('http').createServer(app); // http server use for whole application

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})