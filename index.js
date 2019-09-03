// NPM imports
const express = require('express')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')

// File Imports
const router = require('./routes/router');

// dotenv config
dotenv.config();

// DB config
mongoose.connect(process.env.MONGO_CONNECT,{useNewUrlParser:true});
mongoose.set('useCreateIndex', true);

const app = express();

app.set('view engine','ejs');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Authorization, Content-Type, Accept");
  next();
});
app.use(bodyParser.urlencoded({extended:false}));
app.use(cookieParser())
app.use(express.json());
app.use(methodOverride('_method'))

// global(application-level) variables
app.locals.msg = "";
app.locals.isLoggedIn = false;
app.locals.userInfo = null;
app.use(router);

const PORT = process.env.PORT || 5000;

app.listen(PORT);
