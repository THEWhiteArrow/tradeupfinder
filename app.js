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
const LocalStrategy = require('passport-local').Strategy;
const SteamStrategy = require('passport-steam').Strategy;
const { createNewSteamUser } = require('./utils/functions');

const server = process.env.SERVER || 'local';
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/steamApi';
const MongoStore = require('connect-mongo')(session);

const skinRoutes = require('./routes/skins');
const userRoutes = require('./routes/user');
const mappingRoutes = require('./routes/mapping');
const homeRoutes = require('./routes/home');
const highlightRoutes = require('./routes/highlight');
const favouriteRoutes = require('./routes/favourite');
const tradeRoutes = require('./routes/trades');
const steamRoutes = require('./routes/steam');

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
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(mongoSanitize({ replaceWith: '_' }));


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
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
   }
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());



















// PASSPORT 

passport.serializeUser(function (user, done) {
   done(null, user);
});
passport.deserializeUser(function (obj, done) {
   done(null, obj);
});


passport.use('local', new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


passport.use('steam', new SteamStrategy({
   returnURL: 'http://localhost:3000/auth/steam/return',
   realm: 'http://localhost:3000/',
   apiKey: process.env.STEAM_KEY,
},
   async function (identifier, profile, done) {
      // asynchronous verification, for effect...
      await process.nextTick(async function () {

         // To keep the example simple, the user's Steam profile is returned to
         // represent the logged-in user.  In a typical application, you would want
         // to associate the Steam account with a user record in your database,
         // and return that user instead.
         profile.identifier = identifier;

         try {
            const user = await User.findOne({ "steam.id": profile.id })
            console.log('steam user doesExist :', user)


            if (user != null) {
               console.log('Logged in an existing user!')
               return done(null, user);

            } else {
               const newUser = await createNewSteamUser(profile);
               console.log(newUser)
               console.log('Logged in a new user!')
               return done(null, newUser);
            }


         } catch (e) {
            console.log('Failed to login via steam')
            return done(null, false, { message: e });
         }
      });
   }
));



















app.use(async (req, res, next) => {
   res.locals.server = server;
   res.locals.currentUser = req.user;
   res.locals.url = req.originalUrl;
   res.locals.info = req.flash('info');
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');


   // CHECKING UPDATES IN CURRENT USER !!!
   console.log('User is present : ')
   if (req.user != null && req.user != undefined) {

      const user = await User.findById(req.user._id);
      res.locals.currentUser = user;
      req.user = user;
      console.log(true)
      // console.log(res.locals.currentUser)
   } else { console.log(false) }



   if (server != 'local') return next(new ExpressError("Service Unavaible. We're currently improving our page for you. Please stay patient :)", 503))
   next();
})



// ROUTES
app.use('/skins', skinRoutes)
app.use('/user', userRoutes)
app.use('/map', mappingRoutes)
app.use('/highlight', highlightRoutes)
app.use('/favourites', favouriteRoutes)
app.use('/trades', tradeRoutes)
app.use('/auth', steamRoutes)
app.use('/', homeRoutes)



app.all('*', (req, res, next) => {
   next(new ExpressError('Page Not Found', 404))
});






app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Oh No, Something Went Wrong!';
   res.status(statusCode).render('error', { err });
})


app.listen(port, () => {
   console.log(`Serving on port ${port}`)
})