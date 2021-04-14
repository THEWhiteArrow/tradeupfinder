if (process.env.NODE_ENV !== "production") {
   require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const skinRoutes = require('./routes/skins');
const session = require('express-session');
const flash = require('connect-flash');
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/steamApi';
const server = process.env.SERVER || 'local';
// const mongoStore = require('connect-mongo')(new session);
const cookieParser = require('cookie-parser');

// MONGO DATABASE
mongoose.connect(dbUrl, {
   useNewUrlParser: true,
   useCreateIndex: true,
   useUnifiedTopology: true,
   useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
   console.log("Database connected");
});


// MIDDLEWARE
const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


const secret = process.env.SECRET || 'thisshoulbeabettersecret!';
// const store = new MongoStore({
//    url: dbUrl,
//    secret: secret,
//    touchAfter: 60 * 60 * 24
// })

// store.on('error', function (e) {
//    console.log('SESSION STORE ERROR', e)
// })
const sessionConfig = {
   // store,
   name: 'session',
   secret: secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}
app.use(session(sessionConfig));
app.use(flash());
app.use(cookieParser(secret));

app.use((req, res, next) => {
   res.locals.server = server;
   res.locals.url = req.originalUrl;
   res.locals.info = req.flash('info');
   next();
})



// CODE
app.get('/', (req, res) => {
   res.send('WELCOME TO CONTRACT BOT !')
})
app.use('/skins', skinRoutes)












app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
   res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Serving on port ${port}`)
})