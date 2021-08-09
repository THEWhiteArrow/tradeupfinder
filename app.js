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
const helmet = require('helmet');

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
const hostRoutes = require('./routes/host');
const highlightRoutes = require('./routes/highlight');
const favouriteRoutes = require('./routes/favourite');
const tradeRoutes = require('./routes/trades');
const steamRoutes = require('./routes/steam');
const currencyRoutes = require('./routes/currency');
const serverRoutes = require('./routes/server');

const User = require('./models/userModel');
const ServerInfo = require('./models/serverInfoModel');

const maxShownTrades = process.env.MAX_SHOWN_TRADES || 150;



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

// app.use(helmet());
// app.use(mongoSanitize({ replaceWith: '_' }));



const scriptSrcUrls = [];
const styleSrcUrls = [];
const connectSrcUrls = [];
const imgSrcUrls = [
   "https://steamcdn-a.akamaihd.net/",
   "https://flagcdn.com",
];
const fontSrcUrls = [
   "https://fonts.gstatic.com/",
];

app.use(
   helmet.contentSecurityPolicy({
      directives: {
         defaultSrc: [],
         connectSrc: ["'self'", ...connectSrcUrls],
         scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
         styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
         workerSrc: ["'self'", "blob:"],
         objectSrc: [],
         imgSrc: [
            "'self'",
            "blob:",
            "data:",
            ...imgSrcUrls,
         ],
         fontSrc: [
            "'self'",
            "data:",
            ...fontSrcUrls
         ],
      },
   })
);



















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
   },
}
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());




// PASSPORT STRATEGIES

passport.serializeUser(function (user, done) {
   done(null, user);
});
passport.deserializeUser(function (obj, done) {
   done(null, obj);
});


passport.serializeUser(User.serializeUser());
passport.use('local', new LocalStrategy(User.authenticate()));
passport.deserializeUser(User.deserializeUser());



passport.use('steam', new SteamStrategy({
   returnURL: process.env.STEAM_RETURN_URL,
   realm: process.env.STEAM_REALM,
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
         const steamId = profile.id;

         try {

            const doesExist = await User.any({ "steam.id": steamId })
            console.log(`Is an existing steam user : ${doesExist}`);

            if (doesExist) {
               const user = await User.findOne({ "steam.id": steamId })
               console.log('Logged in an existing user!')
               console.log(user);
               return done(null, user);
            } else {
               const newUser = await createNewSteamUser(profile);
               console.log('Logged in a new user!')
               return done(null, newUser);
            }
         } catch (e) {
            console.log('Failed to login via steam', e)
            return done(null, false, { message: e })
         }
      });
   }
));








app.use(async (req, res, next) => {
   res.locals.server = server;
   res.locals.maxShownTrades = maxShownTrades;
   res.locals.currentUser = req.user;
   res.locals.url = req.originalUrl;
   res.locals.info = req.flash('info');
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   res.locals.cookiesAcceptance = req.session.cookiesAcceptance;

   // SETTING CURRENCY IF A NEW VISITOR AND INCREASING ALLVISITORS NUMBER
   if (req.session.currency == undefined) {
      req.session.currency = { code: 'PLN', symbol: 'zł', multiplier: 1 };

   }
   res.locals.currency = req.session.currency;

   // CHECKING UPDATES IN CURRENT USER EXCEPT OF LOGGING IN AND OUT!!!
   const exceptions = ['/auth', '/auth/steam', '/auth/steam/return', '/user/register', '/user/login', '/user/logout'];
   const index = exceptions.indexOf(req.originalUrl);
   if (index == -1) {
      try {

         if (req.user != null && req.user != undefined) {

            const user = await User.findById(req.user._id);
            res.locals.currentUser = user;
            req.user = user;
            // console.log('User is present : true')
            // console.log(res.locals.currentUser)
         }
         // } else { console.log('User is present : false') }
      } catch (e) {
         console.log(`Failed to update a user : ${req.user.username}`, e)
      }
   }


   // console.log(res.locals.currentUser)
   if (res.locals.url.indexOf('/auth/steam/return') == -1) { app.use(mongoSanitize({ replaceWith: '_' })); }

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
app.use('/currency', currencyRoutes)
app.use('/server', serverRoutes)
app.use('/', hostRoutes)



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