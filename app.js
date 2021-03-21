const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const skinRoutes = require('./routes/skins');

// MONGO DATABASE
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/steamApi';
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






// CODE

app.use('/', skinRoutes)








// console.log(toName(`USP-S Lead Conduit`, `${qualities[3]}`))





app.use((err, req, res, next) => {
   const { statusCode = 500 } = err;
   if (!err.message) err.message = 'Oh No, Something Went Wrong!'
   console.log(err.message, statusCode)
   res.status(statusCode).send(err);
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Serving on port ${port}`)
})