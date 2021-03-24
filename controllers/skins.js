const { mayReplaceSpace, getData, convertToPrice, toName, getSkinPage, clearHistory } = require('../utils/functions');
const { qualities, rarities } = require('../utils/variables');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');



module.exports.prepareTrades = async (req, res) => {
   const trades = await mapSkins();
   const profitable = findProfitableTrades(trades);
   console.log(trades);

   res.render('trades', { profitable });
};

module.exports.updatePrices = async (req, res) => {
   // const collections = await Case.find({}).populate('skins');
   const skins = await Skin.find({});

   for (let item of skins) {
      const { name, skin, prices, _id } = item;
      console.log(_id)
      const keys = Object.keys(prices);
      console.log(name);

      const updatedPrices = {};

      for (let q of keys) {
         if (q !== '$init') {


            const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
            const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;

            const data = await getData(url, 3000);
            updatedPrices[q] = data.lowest_price || 'none';

         }
      }

      const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });
      console.log(updatedSkin.prices);
   }

   res.redirect('/skins')
};

module.exports.showIndex = async (req, res) => {
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });


   res.render('index', { collections, qualities, rarities });
};

const mapSkins = async (req, res) => {

   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   const trades = {};

   for (let collection of collections) {
      let collectionName = collection.name;
      trades[collectionName] = {};

      for (let rarity of rarities) {
         trades[collectionName][rarity] = {};
         let lowId, highId;
         let min = 1000, max = 0;

         for (let skin of collection.skins[rarity]) {
            let price = convertToPrice(skin, 'Minimal Wear');
            if (price !== 'none') {

               if (price < min) {
                  min = price;
                  lowId = skin._id;
               }
               if (price > max) {
                  max = price;
                  highId = skin._id;
               }
            }
         }


         if (lowId && highId) {
            const lowestSkin = await Skin.findById({ _id: lowId });
            const highestSkin = await Skin.findById({ _id: highId });

            let lowest = `${collection.name} - ${lowestSkin.rarity} - ${lowestSkin.name} ${lowestSkin.skin} - ${lowestSkin.prices['Minimal Wear']} -- ${Math.round(convertToPrice(lowestSkin, 'Minimal Wear') * 10 * 100) / 100}`;
            let highest = `${collection.name} - ${highestSkin.rarity} - ${highestSkin.name} ${highestSkin.skin} - ${highestSkin.prices['Minimal Wear']}`;

            // console.log(lowest);
            // console.log(highest);

            trades[collectionName][rarity] = {
               lowestData: {
                  name: lowestSkin.name,
                  skin: lowestSkin.skin,
                  price: convertToPrice(lowestSkin, 'Minimal Wear')
               },
               highestData: {
                  name: highestSkin.name,
                  skin: highestSkin.skin,
                  price: convertToPrice(highestSkin, 'Minimal Wear')
               }
            };


            // console.log(lowest);
            // console.log(highest);

         }
         // console.log(' ');
      }
   }

   return trades;
}

const findProfitableTrades = (trades) => {

   return trades;
}