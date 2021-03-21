const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
// const mongoose = require('mongoose');

// mongoose.connect(dbUrl, {
//    useNewUrlParser: true,
//    useCreateIndex: true,
//    useUnifiedTopology: true,
//    useFindAndModify: false
// });
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => {
//    console.log("Database connected");
// });


const app = express();
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

const skins = ['AWP BOOM', 'AK-47 Wasteland Rebel', 'Glock-18 Fade'];
let i = 0;









app.get('/', async (req, res) => {

   const data = await getSkinPage(`https://steamcommunity.com/market/listings/730/${toName(`${skins[i]}`, 'Factory New')}`);
   res.render('home', { data });
});

app.get('/value', async (req, res) => {
   const { price } = req.query;
   console.log(`${skins[i]} - ${price}`);
   i += 1;
   // if (i < skins.length - 1) i += 1;

   res.json('completely gatherd price')
});

app.get('/clear', (req, res) => {
   clearHistory();
   res.send('cleared history')
})




const toName = (name, status) => {
   name = name.replace(' ', '%20%7C%20');
   if (status.indexOf(' ') !== -1) status = status.replace(' ', '%20');
   if (name.indexOf(' ') !== -1) name = name.replace(' ', '%20');
   let output = `${name}%20%28${status}%29`;

   return output;
}

const getSkinPage = async (url) => {
   const res = await fetch(url);
   const data = await res.text();
   let dataString = await String(data);

   return dataString;
}

const clearHistory = () => {
   i = 0;
}










const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Serving on port ${port}`)
})