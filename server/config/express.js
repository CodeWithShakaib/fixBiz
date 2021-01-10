const express = require("express");
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
const userRoute = require("../shared/routes/user.router");
const fieldWorkerRoute = require("../shared/routes/fieldWorker.router")
const categoryRoute = require("../shared/routes/category.router")
const shopRoute = require("../shared/routes/shop.router")
const adRoute = require("../shared/routes/ad.router")
const reviewRoute = require("../shared/routes/review.router")
const serviceRoute = require("../shared/routes/service.router")
const galleryRoute = require("../shared/routes/gallery.router")
const cityRoute = require("../shared/routes/city.router")
const cors = require('cors');

const app = express()

app.use(cors());
app.use(fileUpload());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('server/public'))

// user management route
app.use("/api/user", userRoute);

//fieldWorker management route
app.use("/api/fieldWorker", fieldWorkerRoute)

//category management route
app.use("/api/category", categoryRoute)

//shop management route
app.use("/api/shop", shopRoute)

//Ad management route
app.use("/api/ad", adRoute)

//review management route
app.use("/api/review", reviewRoute)

//services management route
app.use("/api/service", serviceRoute)

//gallery management route
app.use("/api/gallery", galleryRoute)

//city management route
app.use("/api/city", cityRoute)

module.exports = app