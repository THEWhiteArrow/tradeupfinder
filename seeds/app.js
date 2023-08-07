if (process.env.NODE_ENV !== "production") {
   require('dotenv').config();
}

const mongoose = require('mongoose');
const data = require('./data.js')
const Case = require('../models/caseModel');
const Skin = require('../models/skinModel');
const ServerInfo = require('../models/serverInfoModel.js');
// MONGO DATABASE
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/steamApi';
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
   await ServerInfo.deleteMany({});

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
      });

      let nOfSkins = 0;
      for (let item of data[collectionName]) {
         nOfSkins += 1;
         const { skin, name, rarity, min_float, max_float, isInStattrak, icon } = item;

         // console.log(skin, name, rarity, min_float, max_float)
         const newSkin = new Skin({
            name,
            skin,
            case: collectionName,
            rarity,
            min_float,
            max_float,
            prices: {
               'Factory New': 0,
               'Minimal Wear': 0,
               'Field-Tested': 0,
               'Well-Worn': 0,
               'Battle-Scarred': 0,
               // floated: {},
            },
            isInStattrak,
            stattrakPrices: {
               'Factory New': 0,
               'Minimal Wear': 0,
               'Field-Tested': 0,
               'Well-Worn': 0,
               'Battle-Scarred': 0,
            },
            volumes: {
               'Factory New': 10000,
               'Minimal Wear': 10000,
               'Field-Tested': 10000,
               'Well-Worn': 10000,
               'Battle-Scarred': 10000,
            },
            stattrakVolumes: {
               'Factory New': 10000,
               'Minimal Wear': 10000,
               'Field-Tested': 10000,
               'Well-Worn': 10000,
               'Battle-Scarred': 10000,
            },
            icon,
         })

         if (min_float > 0.07) { newSkin.prices['Factory New'] = -1; newSkin.stattrakPrices['Factory New'] = -1; }
         if (min_float > 0.15) { newSkin.prices['Minimal Wear'] = -1; newSkin.stattrakPrices['Minimal Wear'] = -1; }
         if (min_float > 0.38) { newSkin.prices['Field-Tested'] = -1; newSkin.stattrakPrices['Field-Tested'] = -1; }
         if (min_float > 0.45) { newSkin.prices['Well-Worn'] = -1; newSkin.stattrakPrices['Well-Worn'] = -1; }

         if (max_float <= 0.07) { newSkin.prices['Minimal Wear'] = -1; newSkin.stattrakPrices['Minimal Wear'] = -1; }
         if (max_float <= 0.15) { newSkin.prices['Field-Tested'] = -1; newSkin.stattrakPrices['Field-Tested'] = -1; }
         if (max_float <= 0.38) { newSkin.prices['Well-Worn'] = -1; newSkin.stattrakPrices['Well-Worn'] = -1; }
         if (max_float <= 0.45) { newSkin.prices['Battle-Scarred'] = -1; newSkin.stattrakPrices['Battle-Scarred'] = -1; }


         // newSkin.prices.floated = floatedPrices(newSkin);
         // newSkin.floatedQualities = floatedQualities(newSkin);

         newCollection.skins[rarity].push(newSkin);
         await newSkin.save();

      }

      newCollection.nOfSkins = nOfSkins;
      await newCollection.save();

   }

   const serverInfo = new ServerInfo({
      updatingDaysSpan: 1,
      allVisitors: 0,
      maxShownTrades: 100,
      lastChanged: '',
      skinsUpdateInfo: '',
   })

   await serverInfo.save();

}


seedDB().then(() => {
   console.log('Seeded database successfully!')
   mongoose.connection.close();
});