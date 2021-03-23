const { mayReplaceSpace, getData, convertToPrice, toName, getSkinPage, clearHistory } = require('../utils/functions');
const { qualities, rarities } = require('../utils/variables');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');

module.exports.showTradesPage = async (req, res) => {

   res.render('trades');
}

module.exports.checkTrades = async (req, res) => {
   const collections = await Case.find({}).populate({
      path: 'skins',
      populate: {
         path: 'blue',
         model: 'Skin'
      }
   });


   let collectionIndex = 0;
   let trade = {};
   for (let collection of collections) {

      for (let rarity of rarities) {
         let lowId, highId;
         let min = 1000, max = 0;

         for (let skin of collection.skins[rarity]) {
            let price = convertToPrice(skin, 'Minimal Wear');

            if (price < min) {
               min = price;
               lowId = skin._id;
            }
            if (price > max) {
               max = price;
               highId = skin._id;
            }
         }

         const lowestSkin = await Skin.findById({ _id: lowId });
         const highestSkin = await Skin.findById({ _id: highId });

         let lowest = `${collection.name} - ${lowestSkin.rarity} - ${lowestSkin.name} ${lowestSkin.skin} - ${lowestSkin.prices['Minimal Wear']} -- ${convertToPrice(lowestSkin, 'Minimal Wear') * 10}`;
         let highest = `${collection.name} - ${highestSkin.rarity} - ${highestSkin.name} ${highestSkin.skin} - ${highestSkin.prices['Minimal Wear']}`;

         let collectionName = collections[collectionIndex].name;
         trade[collectionName] = {
            [rarity]: {
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
            }

         }

         console.log(lowest);
         console.log(highest);

      }
      console.log(` `);
      collectionIndex += 1;
   }

   console.log(trade)

   // res.redirect('/skins');
   res.redirect('/skins/trades');
}

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
}

module.exports.showIndex = async (req, res) => {
   const collections = await Case.find({}).populate({
      path: 'skins',
      populate: {
         path: 'blue',
         model: 'Skin'
      }
   });


   res.render('index', { collections, qualities, rarities })
};