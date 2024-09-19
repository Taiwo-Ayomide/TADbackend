const express = require("express");
const moongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require("body-parser");
const rateLimit = require('express-rate-limit') // Rate Limiting in Nodejs
const { createProxyMiddleware } = require('http-proxy-middleware')

const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const app = express();

const targetServer = "https://tadbackend.onrender.com"

const limiter = rateLimit({
    windowMS: 15*6*1000,
    max: 100,
    message: 'To many request at this time, Try again later'
});


app.use('/api', createProxyMiddleware({
    target: targetServer,
    changeOrigin: true,
    pathRewrite: {
        '^/api': ''
    }
}));

app.use(limiter);
dotenv.config();
app.use(express());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_API }), // Store sessions in MongoDB
    cookie: { secure: false, maxAge: 3600000 }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

moongoose
    .connect(process.env.MONGODB_API)
    .then((console.log("DBCOnnected Successfully")));

app.use('/user', authRoute);
app.use('/admission', userRoute);

app.listen(5000, () => {
    console.log("server is running")
});