const mongoose = require('mongoose');
const data = require('./data.js')
const Case = require('../models/caseModel');
const Skin = require('../models/skinModel');
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


const dataKeys = Object.keys(data);

const seedDB = async () => {

   await Case.deleteMany({});
   await Skin.deleteMany({});

   for (let collection of dataKeys) {
      const newCollection = new Case({
         name: collection,
         skins: []
      })

      for (let item of data[collection]) {
         const { skin, name, rarity, prices } = item;
         const newItem = new Skin({
            name,
            prices,
            rarity,
            skin,
         });

         newCollection.skins.push(newItem);
         await newItem.save();
      }

      await newCollection.save();
   }
}


seedDB().then(() => {
   console.log('Seeded database successfully!')
   mongoose.connection.close();
});