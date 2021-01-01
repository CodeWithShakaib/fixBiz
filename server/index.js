const app = require("./config/express")
const port = process.env.PORT || 3000

const http = require('http').createServer(app); // http server use for whole application

app.get('/', function(req, res) {
    res.send("Welcome to fiz-biz");
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})