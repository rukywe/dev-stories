const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const exphbs = require("express-handlebars");
const methodOverride = require('method-override')
const morgan = require('morgan')
const indexRoutes = require('./routes/index')
const authRoutes = require("./routes/auth");
const storyRoutes = require('./routes/stories')
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require('passport')

//load config
dotenv.config({ path: './config/config.env' })

//Confirgure passport
require('./config/passport')(passport)

//ConnectDB
connectDB()

const app = express()

//BodyParser
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);


//loggin
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

//handlebar Helpers

const {formatDate , truncate , stripTags, editIcon,select} = require('./helpers/hbs')

//handlebars
app.engine(".hbs", exphbs({ helpers: {formatDate, truncate,stripTags, editIcon, select}, defaultLayout:'main', extname: ".hbs" }));
app.set("view engine", ".hbs");


//Sessions
app.use(
  session({
    secret: "foo",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    // See below for details
  })
);


//Passport Middleware
app.use(passport.initialize())
app.use(passport.session())

//set Global variables 
app.use(function (req, res, next) {
  res.locals.user = req.user || null
  next()
})


app.use(express.static(path.join(__dirname,'public')))


//setting up routes
app.use('/', indexRoutes)
app.use('/auth', authRoutes);
app.use("/stories", storyRoutes);
const PORT = process.env.PORT || 3000; 

app.listen(PORT, console.log(`server running in ${process.env.NODE_ENV} on ${PORT}`))
