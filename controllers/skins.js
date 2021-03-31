const { mayReplaceSpace, getData, convertToPrice, convertToPriceFloated, floatedPrices } = require('../utils/functions');
const { qualities, rarities, avg_floats, shortcuts } = require('../utils/variables');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');



module.exports.prepareTrades = async (req, res) => {
   const extremeSkinsPrices = await mapSkins();
   const probableProfit = findProfitableTrades(extremeSkinsPrices);

   const checkedProfit = await checkReallWorth(probableProfit);



   res.render('trades', { profit: checkedProfit, shortcuts });
};

module.exports.updatePrices = async (req, res) => {
   // const collections = await Case.find({}).populate('skins');
   const skins = await Skin.find({});

   for (let item of skins) {
      const updatedPrices = {};
      const { name, skin, prices, _id } = item;
      console.log(_id)

      const keys = Object.keys(prices);
      console.log(name);

      // const oldSkin = await Skin.findById({ _id });



      for (let q of keys) {
         if (q !== '$init') {


            const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
            const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;

            const data = await getData(url, 3000);
            updatedPrices[q] = data.lowest_price || 'none';

         }
      }

      item.prices = updatedPrices;
      const pricesFloated = floatedPrices(item);
      updatedPrices.floated = pricesFloated;

      const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });
      console.log(updatedSkin.prices);
   }

   res.redirect('/skins')
};

module.exports.updateTargetedPrices = async (req, res) => {
   const { fn, mw, ft, ww, bs, resetFloats } = req.query;
   if (fn && mw && ft && ww && bs) {
      const custom_floats = {
         'Factory New': fn,
         'Minimal Wear': mw,
         'Field-Tested': ft,
         'Well-Worn': ww,
         'Battle-Scarred': bs
      };

      const skins = await Skin.find({});
      for (let skin of skins) {
         let skinPrices = skin.prices;
         skinPrices.floated = floatedPrices(skin, custom_floats);
         const updatedSkin = await Skin.findByIdAndUpdate(skin._id, { prices: skinPrices }, { new: true });
      }
   } else if (resetFloats) {
      const skins = await Skin.find({});
      for (let skin of skins) {
         let skinPrices = skin.prices;
         skinPrices.floated = floatedPrices(skin);
         const updatedSkin = await Skin.findByIdAndUpdate(skin._id, { prices: skinPrices }, { new: true });
      }
   }

   res.redirect('/skins')

}

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

module.exports.test = async (req, res) => {
   const { map, nOfSkins } = await getMappedSkins();
   // console.log(map.PrismaCase.blue);
   const trades = await getTrades(map, nOfSkins);


   res.render('test');
}




const getMappedSkins = async () => {
   const map = {};
   let collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   const nOfSkins = {};
   for (let c of collections) {
      nOfSkins[c.name] = {
         grey: c.skins.grey.length,
         light_blue: c.skins.light_blue.length,
         blue: c.skins.blue.length,
         purple: c.skins.purple.length,
         pink: c.skins.pink.length,
         red: c.skins.red.length,
      }
   }

   for (let collection of collections) {
      let collectionName = collection.name;
      map[collectionName] = {};

      for (let rarity of rarities) {
         map[collectionName][rarity] = {};

         //FOR EVENTUALL FLOATED PRICES
         for (let skin of collection.skins[rarity]) {
            skin.prices.floated = floatedPrices(skin);
         }






         for (let quality of qualities) {
            let minId, maxId;
            let min = 1000, max = 0;
            let totalFloated = 0;

            //CHECKING LOWEST PRICED SKIN AND TARGETED PRICE FLOATED SKIN IN EACH QUALITY
            for (let skin of collection.skins[rarity]) {

               let price = convertToPrice(skin, quality);
               let priceFloated = convertToPriceFloated(skin, quality);

               if (price !== 'none' && price < min) {
                  min = price;
                  minId = skin._id;
               }
               if (priceFloated !== 'none' && price > max) {
                  max = priceFloated;
                  maxId = skin._id;
               }
               if (priceFloated !== 'none') totalFloated += priceFloated;
            }
            totalFloated = Math.round(totalFloated * 100) / 100;

            if (minId && maxId) {
               const lowestSkin = await Skin.findById({ _id: minId });
               const targetedSkin = await Skin.findById({ _id: maxId });

               map[collectionName][rarity][quality] = {
                  lowestSkin: {
                     _id: minId,
                     name: lowestSkin.name,
                     skin: lowestSkin.skin,
                     min_float: lowestSkin.min_float,
                     max_float: lowestSkin.max_float,
                     price: convertToPrice(lowestSkin, quality),
                     taxed: Math.round(convertToPrice(lowestSkin, quality) * 0.87 * 100) / 100
                  },
                  targetedSkin: {
                     _id: maxId,
                     name: targetedSkin.name,
                     skin: targetedSkin.skin,
                     min_float: targetedSkin.min_float,
                     max_float: targetedSkin.max_float,
                     price: convertToPriceFloated(targetedSkin, quality),
                     taxed: Math.round(convertToPriceFloated(targetedSkin, quality) * 0.87 * 100) / 100
                  },
                  total: totalFloated,

               }

               // console.log(map[collectionName][rarity][quality]);

            }

         }




      }
   }

   return { map, nOfSkins };
}

const getTrades = async (map, nOfSkins) => {
   const profitGwarantowany = [];
   const profitStatystyczny = [];
   const keys = Object.keys(map);

   for (let key of keys) {

      const rarity = Object.keys(map[key]);

      for (let i = 0; i < rarity.length - 1; i++) {

         for (let q of qualities) {



            const instance = map[key][rarity[i]][q];
            const nextInstance = map[key][rarity[i + 1]][q];
            if (instance && nextInstance) {


               if ((Math.round(instance.lowestSkin.price * 10 * 100) / 100) < nextInstance.lowestSkin.taxed) {
                  const pom = {
                     rarity: rarity[i],
                     nextRarity: rarity[i + 1],
                     quality: q,
                     collection: key,
                     instance,
                     nextInstance,
                     chance: Math.round(1 / nOfSkins[key][rarity[i + 1]] * 1000) / 10
                  }
                  profitGwarantowany.push(pom);
               } else if ((Math.round(instance.lowestSkin.price * 10 * 100) / 100) < nextInstance.targetedSkin.taxed) {
                  const pom = {
                     rarity: rarity[i],
                     nextRarity: rarity[i + 1],
                     quality: q,
                     collection: key,
                     instance,
                     nextInstance,
                     chance: Math.round(1 / nOfSkins[key][rarity[i + 1]] * 1000) / 10
                  }
                  profitStatystyczny.push(pom);
               }

               // for (let quality of qualities) {
               //    const lowestSkin = map[key][rarity[i]][quality];
               //    const targetedSkin = map[key][rarity[i + 1]][quality];
               //    console.log(lowestSkin, targetedSkin);
               // }

            }
         }
      }
   }

   const profit = { profitGwarantowany, profitStatystyczny };

   return profit;
}





















// MAPPING LOWEST AND HIGHEST SKINS PRICES
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

               // let lowest = `${collection.name} - ${lowestSkin.rarity} - ${lowestSkin.name} ${lowestSkin.skin} - ${lowestSkin.prices[q]} -- ${Math.round(convertToPrice(lowestSkin, q) * 10 * 100) / 100}`;
               // let highest = `${collection.name} - ${highestSkin.rarity} - ${highestSkin.name} ${highestSkin.skin} - ${highestSkin.prices[q]}`;
               // console.log(lowest);
               // console.log(highest);

               trades[collectionName][rarity][q] = {
                  lowestData: {
                     _id: lowId,
                     name: lowestSkin.name,
                     skin: lowestSkin.skin,
                     min_float: lowestSkin.min_float,
                     max_float: lowestSkin.max_float,
                     price: convertToPrice(lowestSkin, q),
                     taxed: Math.round(convertToPrice(lowestSkin, q) * 0.87 * 100) / 100,
                  },
                  highestData: {
                     _id: highId,
                     name: highestSkin.name,
                     skin: highestSkin.skin,
                     min_float: highestSkin.min_float,
                     max_float: highestSkin.max_float,
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
   const profitGwarantowany = [];
   const profitStatystyczny = [];
   // const q = 'Minimal Wear';
   const keys = Object.keys(trades);
   // console.log(keys)

   for (let key of keys) {
      const rarity = Object.keys(trades[key]);

      for (let i = 0; i < rarity.length - 1; i++) {

         for (let q of qualities) {



            const instance = trades[key][rarity[i]][q];
            const nextInstance = trades[key][rarity[i + 1]][q];
            if (instance && nextInstance) {
               // console.log(q, rarity[i], instance.lowestData.name, instance.lowestData.skin, ' => ', nextInstance.highestData.name, nextInstance.highestData.skin)
               // console.log(`${instance.lowestData.price} (${Math.round(instance.lowestData.price * 10 * 100) / 100}) => ${nextInstance.lowestData.taxed} or ${nextInstance.highestData.taxed}`);
               // const newSkinFloat =n

               // console.log(q)
               // console.log(instance)
               // console.log(nextInstance)


               // const floatLowerSkin = (nextInstance.lowestData.max_float - nextInstance.lowestData.min_float) * avg_floats[q] - nextInstance.lowestData.min_float;
               // const floatHigherSkin = (nextInstance.highestData.max_float - nextInstance.highestData.min_float) * avg_floats[q] - nextInstance.highestData.min_float;
               // console.log(floatLowerSkin, ' - ', floatHigherSkin);


               if ((Math.round(instance.lowestData.price * 10 * 100) / 100) < nextInstance.lowestData.taxed) {
                  // console.log((Math.round(instance.lowestData.price * 10 * 100) / 100), nextInstance.lowestData.taxed);
                  const pom = {
                     rarity: rarity[i],
                     quality: q,
                     collection: key,
                     instance,
                     nextInstance,
                  }
                  profitGwarantowany.push(pom);
               } else if ((Math.round(instance.lowestData.price * 10 * 100) / 100) < nextInstance.highestData.taxed) {
                  const pom = {
                     rarity: rarity[i],
                     quality: q,
                     collection: key,
                     instance,
                     nextInstance,
                  }
                  profitStatystyczny.push(pom);
               }
            }



         }
      }
      // SPACJA POMIĘDZY KOLEKCJAMI
      // console.log(' ');
      // console.log(' ');
   }

   // console.log(profitGwarantowany[0].quality, profitGwarantowany[0].instance.lowestData.name, profitGwarantowany[0].instance.lowestData.skin);

   // console.log('profitGwarantowany', profitGwarantowany.length)
   // console.log('profitStatystyczny', profitStatystyczny.length)


   const profit = { profitGwarantowany, profitStatystyczny };
   return profit;
}

const checkReallWorth = async (o) => {
   const profitGwarantowany = [];
   const profitStatystyczny = [];

   // console.log(o)
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   const nOfSkins = {};
   for (let c of collections) {
      nOfSkins[c.name] = {
         grey: c.skins.grey.length,
         light_blue: c.skins.light_blue.length,
         blue: c.skins.blue.length,
         purple: c.skins.purple.length,
         pink: c.skins.pink.length,
         red: c.skins.red.length,
      }
   }


   const keys = Object.keys(o);
   let trades = {};
   for (let key of keys) {
      trades[key] = {};
      for (let pair of o[key]) {
         const { rarity, quality, collection, instance, nextInstance } = pair;
         // console.log(pair)
         // console.log(instance)
         // console.log(nextInstance.lowestD)

         let avg;
         if (instance.min_float > avg_floats[quality]) {
            avg = instance.min_float;
         } else {
            avg = avg_floats[quality];
         }

         const floatLowerSkin = Math.round(((nextInstance.lowestData.max_float - nextInstance.lowestData.min_float) * avg + nextInstance.lowestData.min_float) * 1000) / 1000;
         const floatHigherSkin = Math.round(((nextInstance.highestData.max_float - nextInstance.highestData.min_float) * avg + nextInstance.highestData.min_float) * 1000) / 1000;
         // console.log('lower', floatLowerSkin);
         // console.log('higher', floatHigherSkin);
         let nextRarity;
         switch (rarity) {
            case 'grey': nextRarity = 'light_blue'; break;
            case 'light_blue': nextRarity = 'blue'; break;
            case 'blue': nextRarity = 'purple'; break;
            case 'purple': nextRarity = 'pink'; break;
            case 'pink': nextRarity = 'red'; break;
         }

         let qualityL, qualityH;
         if (floatLowerSkin < 0.07) {
            qualityL = 'Factory New';
         } else if (floatLowerSkin < 0.15) {
            qualityL = 'Minimal Wear';
         } else if (floatLowerSkin < 0.38) {
            qualityL = 'Field-Tested';
         } else if (floatLowerSkin < 0.45) {
            qualityL = 'Well-Worn';
         } else {
            qualityL = 'Battle-Scarred'
         }
         if (floatHigherSkin < 0.07) {
            qualityH = 'Factory New';
         } else if (floatHigherSkin < 0.15) {
            qualityH = 'Minimal Wear';
         } else if (floatHigherSkin < 0.38) {
            qualityH = 'Field-Tested';
         } else if (floatHigherSkin < 0.45) {
            qualityH = 'Well-Worn';
         } else {
            qualityH = 'Battle-Scarred'
         }

         const skinL = await Skin.findById({ _id: nextInstance.lowestData._id });
         const skinH = await Skin.findById({ _id: nextInstance.highestData._id });
         const priceL = Math.round(convertToPrice(skinL, qualityL) * 0.87 * 100) / 100;
         const priceH = Math.round(convertToPrice(skinH, qualityH) * 0.87 * 100) / 100;
         // console.log(qualityL, qualityH)
         // console.log(priceL, priceH)

         // collections[key].skins

         if ((Math.round(instance.lowestData.price * 10 * 100) / 100) < priceL) {
            // console.log((Math.round(instance.lowestData.price * 10 * 100) / 100), nextInstance.lowestData.taxed);
            const pom = {
               rarity,
               quality,
               nextQuality: qualityL,
               nextPrice: priceL,
               collection,
               instance,
               nextInstance,
               chance: Math.round(1 / nOfSkins[collection][nextRarity] * 1000) / 10,
            }
            profitGwarantowany.push(pom);
            // console.log(pom.chance)
         } else if ((Math.round(instance.lowestData.price * 10 * 100) / 100) < priceH) {
            const pom = {
               rarity,
               quality,
               nextQuality: qualityH,
               nextPrice: priceH,
               collection,
               instance,
               nextInstance,
               chance: Math.round(1 / nOfSkins[collection][nextRarity] * 1000) / 10,
            }
            profitStatystyczny.push(pom);
            // console.log(pom.chance)
            // console.log(pom)
         }
      }

   }

   const profit = { profitGwarantowany, profitStatystyczny };
   // console.log(profit)
   return profit;
}