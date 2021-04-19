if (process.env.NODE_ENV !== "production") {
   require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const mongoSanitize = require('express-mongo-sanitize');
const passport = require('passport');
const LocalStrategy = require('passport-local');

const server = process.env.SERVER || 'local';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/steamApi';
const MongoStore = require('connect-mongo')(session);

const skinRoutes = require('./routes/skins');
const userRoutes = require('./routes/user');
const mappingRoutes = require('./routes/mapping');

const User = require('./models/userModel');

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
app.engine('ejs', ejsMate);
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({ replaceWith: '_' }));


const secret = process.env.SECRET || 'thisshoulbeabettersecret!';

const store = new MongoStore({
   url: dbUrl,
   secret: secret,
   touchAfter: 24 * 60 * 60
});

store.on('error', function () {
   console.log('SESSION STORE ERROR', e);
})

const sessionConfig = {
   store,
   name: 'session',
   secret: secret,
   resave: false,
   saveUninitialized: true,
   cookie: {
      httpOnly: true,
      // secure:true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   res.locals.server = server;
   res.locals.currentUser = req.user;
   res.locals.url = req.originalUrl;
   res.locals.info = req.flash('info');
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');

   next();
})



// ROUTES
app.use('/skins', skinRoutes)
app.use('/user', userRoutes)
app.use('/map', mappingRoutes)

app.get('/', (req, res) => {
   res.send('WELCOME TO CONTRACT BOT !')
})

app.all('*', (req, res, next) => {
   next(new ExpressError('Page Not Found', 404))
})










app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
   res.status(statusCode).render('error', { err });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Serving on port ${port}`)
})