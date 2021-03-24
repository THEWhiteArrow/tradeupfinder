const { mayReplaceSpace, getData, convertToPrice, toName, getSkinPage, clearHistory } = require('../utils/functions');
const { qualities, rarities } = require('../utils/variables');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');



module.exports.prepareTrades = async (req, res) => {
   const trades = await mapSkins();
   const profitable = findProfitableTrades(trades);
   // console.log(trades);

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

         for (let q of qualities) {

            // trades[collectionName][rarity][q] = {};

            for (let skin of collection.skins[rarity]) {


               let price = convertToPrice(skin, q);
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

               let lowest = `${collection.name} - ${lowestSkin.rarity} - ${lowestSkin.name} ${lowestSkin.skin} - ${lowestSkin.prices[q]} -- ${Math.round(convertToPrice(lowestSkin, q) * 10 * 100) / 100}`;
               let highest = `${collection.name} - ${highestSkin.rarity} - ${highestSkin.name} ${highestSkin.skin} - ${highestSkin.prices[q]}`;

               // console.log(lowest);
               // console.log(highest);

               trades[collectionName][rarity][q] = {
                  lowestData: {
                     name: lowestSkin.name,
                     skin: lowestSkin.skin,
                     price: convertToPrice(lowestSkin, q),
                     taxed: Math.round(convertToPrice(lowestSkin, q) * 0.87 * 100) / 100,
                  },
                  highestData: {
                     name: highestSkin.name,
                     skin: highestSkin.skin,
                     price: convertToPrice(highestSkin, q),
                     taxed: Math.round(convertToPrice(highestSkin, q) * 0.87 * 100) / 100,
                  },

               };


               // console.log(lowest);
               // console.log(highest);

            }
         }
         // console.log(' ');
      }
   }

   return trades;
}

const findProfitableTrades = (trades) => {

   const keys = Object.keys(trades);
   console.log(keys)

   for (let key of keys) {

      const rarity = Object.keys(trades[key]);


      rarity.forEach((el, i, arr) => {
         const quality = Object.keys(trades[key][el]);

         if (quality.length > 0) {

            console.log(key, el, trades[key][el]['Factory New'])
         }
      })

      // for (let r of rarity) {

      //    const quality = Object.keys(trades[key][r]);
      //    if (quality.length > 0) {

      //       console.log(key, r, trades[key][r]['Factory New'])
      //    }

      // }

   }


   return trades;
}