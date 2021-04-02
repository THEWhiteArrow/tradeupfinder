const mongoose = require('mongoose');
const data = require('./data.js')
const Case = require('../models/caseModel');
const Skin = require('../models/skinModel');
const { floatedPrices, floatedQualities } = require('../utils/functions.js');
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

   for (let collectionName of dataKeys) {
      const newCollection = new Case({
         name: collectionName,
         nOfSkins: 0,
         skins: {
            'light_blue': [],
            'blue': [],
            'purple': [],
            'pink': [],
            'red': [],
         }
      })

      let nOfSkins = 0;
      for (let item of data[collectionName]) {
         nOfSkins += 1;
         const { skin, name, rarity, min_float, max_float } = item;

         // console.log(skin, name, rarity, min_float, max_float)
         const newSkin = new Skin({
            name,
            skin,
            case: collectionName,
            rarity,
            min_float,
            max_float,
            prices: {
               'Factory New': '0zł',
               'Minimal Wear': '0zł',
               'Field-Tested': '0zł',
               'Well-Worn': '0zł',
               'Battle-Scarred': '0zł',
               floated: {},
            },
            floatedQualities: {}
         })

         newSkin.prices.floated = floatedPrices(newSkin);
         newSkin.floatedQualities = floatedQualities(newSkin);

         newCollection.skins[rarity].push(newSkin);
         await newSkin.save();

      }

      newCollection.nOfSkins = nOfSkins;
      await newCollection.save();

   }
}


seedDB().then(() => {
   console.log('Seeded database successfully!')
   mongoose.connection.close();
});