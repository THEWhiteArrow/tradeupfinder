const { mayReplaceSpace, getData, convertToPrice, convert, convertToPriceFloated, floatedPrices, floatedQualities } = require('../utils/functions');
const { qualities, rarities, avg_floats, shortcuts } = require('../utils/variables');
const ExpressError = require('../utils/ExpressError');
const fetch = require('node-fetch');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');


module.exports.useServers = async (req, res) => {
   const { server1, server2, server3 } = req.body;
   console.log(server1)
   console.log(server2)
   console.log(server3)
   // console.log(req.body)
   const server1Url = `https://steam-market-server1.herokuapp.com/skins/update/?updateStart=${server1.start}&updateEnd=${server1.end}`;
   const server2Url = `https://steam-market-server2.herokuapp.com/skins/update/?updateStart=${server2.start}&updateEnd=${server2.end}`;
   const server3Url = `https://steam-market-server2.herokuapp.com/skins/update/?updateStart=${server3.start}&updateEnd=${server3.end}`;

   const response2 = await fetch(server2Url, { method: 'GET' });
   const response3 = await fetch(server3Url, { method: 'GET' });
   res.redirect(server1Url)
}

module.exports.prepareTrades = async (req, res) => {
   const extremeSkinsPrices = await mapSkins();
   const probableProfit = findProfitableTrades(extremeSkinsPrices);
   const profit = await checkReallWorth(probableProfit);

   // const { map, nOfSkins } = await getMappedSkins();
   // const profit = await getTrades(map, nOfSkins);

   res.render('trades', { profit, shortcuts });
};

module.exports.updatePrices = async (req, res, next) => {
   // const collections = await Case.find({}).populate('skins');

   const collectionsToUpdate = ['FractureCase', 'PrismaCase', 'Dust2', 'Inferno', 'Inferno2018', 'Nuke2018', 'GloveCase', 'Havoc', 'Control'];

   const skins = await Skin.find({});
   const collections = await Case.find({});

   let count = 0, length = 0;

   for (let collection of collections) {
      for (let updatingCollection of collectionsToUpdate) {
         if (collection.name === updatingCollection) {
            length += collection.nOfSkins;
         }
      }
   }

   const { updateStart = 0, updateEnd = length } = req.query;

   if (updateStart !== 0) {
      res.send('server woke up')
   }


   for (let item of skins) {
      let isToBeUpdated = false;


      for (let collection of collectionsToUpdate) {
         item.case === collection ? isToBeUpdated = true : null;
      }

      if (isToBeUpdated) {


         count += 1;
         if (count >= updateStart && count <= updateEnd) {


            console.log(`${count} / ${length - updateStart + 1}`);

            const updatedPrices = {};
            const { name, skin, prices, _id } = item;
            // console.log(_id)
            // console.log(name);

            const keys = Object.keys(prices);

            // const oldSkin = await Skin.findById({ _id });

            for (let q of keys) {
               if (q !== '$init' && q !== 'floated') {
                  // console.log(q)

                  const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
                  const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;
                  let data;
                  if (count % 50 === 0) {
                     console.log(`${count % 50}min break out of 5min`)
                     data = await getData(url, 1000 * 60);
                  } else {
                     data = await getData(url, 3100);
                  }
                  if (data === null) {
                     return next(new ExpressError(`You requested too many times recently!`, 429, `Updated ${count} / ${length}`));
                  }
                  updatedPrices[q] = data.lowest_price || 'none';
               }
            }

            // for (let q of keys) {
            //    if (q !== '$init') {


            //       const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
            //       const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;

            //       const data = await getData(url, 3000);
            //       updatedPrices[q] = data.lowest_price || 'none';

            //    }
            // }

            // WYPEŁNIA LUKI W CENACH SKINÓW (DLA KTÓRYCH CENY NIE ISTNIEJĄ BO NIEISTNIEJĄ ODPOWIEDNIE JAKOŚCI)
            // updatedPrices[keys[1]] === 'none' ? updatedPrices[keys[1]] = updatedPrices[keys[2]] : null;
            // updatedPrices[keys[0]] === 'none' ? updatedPrices[keys[0]] = updatedPrices[keys[1]] : null;
            // updatedPrices[keys[3]] === 'none' ? updatedPrices[keys[3]] = updatedPrices[keys[2]] : null;
            // updatedPrices[keys[4]] === 'none' ? updatedPrices[keys[4]] = updatedPrices[keys[3]] : null;

            let p1 = updatedPrices[keys[0]];
            let p2 = updatedPrices[keys[1]];
            let p3 = updatedPrices[keys[2]];
            let p4 = updatedPrices[keys[3]];
            let p5 = updatedPrices[keys[4]];

            if (updatedPrices[keys[2]] !== 'none') {
               if (updatedPrices[keys[1]] === 'none') updatedPrices[keys[1]] = updatedPrices[keys[2]];
               if (updatedPrices[keys[3]] === 'none') updatedPrices[keys[3]] = updatedPrices[keys[2]];
               if (updatedPrices[keys[4]] === 'none') updatedPrices[keys[4]] = updatedPrices[keys[3]];
               if (updatedPrices[keys[0]] === 'none') updatedPrices[keys[0]] = updatedPrices[keys[1]];
            }
            if (updatedPrices[keys[1]] !== 'none') {
               if (updatedPrices[keys[0]] === 'none') updatedPrices[keys[0]] = updatedPrices[keys[1]];
               if (updatedPrices[keys[2]] === 'none') updatedPrices[keys[2]] = updatedPrices[keys[1]];
               if (updatedPrices[keys[3]] === 'none') updatedPrices[keys[3]] = updatedPrices[keys[2]];
               if (updatedPrices[keys[4]] === 'none') updatedPrices[keys[4]] = updatedPrices[keys[3]];
            }
            if (updatedPrices[keys[3]] !== 'none') {
               if (updatedPrices[keys[4]] === 'none') updatedPrices[keys[4]] = updatedPrices[keys[3]];
               if (updatedPrices[keys[2]] === 'none') updatedPrices[keys[2]] = updatedPrices[keys[3]];
               if (updatedPrices[keys[1]] === 'none') updatedPrices[keys[1]] = updatedPrices[keys[2]];
               if (updatedPrices[keys[0]] === 'none') updatedPrices[keys[0]] = updatedPrices[keys[1]];
            }


            //item to dany skin
            item.prices = updatedPrices;
            const pricesFloated = floatedPrices(item);
            updatedPrices.floated = pricesFloated;


            const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });
            // console.log(updatedSkin.prices);
         }
      }


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
         const qualitiesFloated = floatedQualities(skin, custom_floats);
         const updatedSkin = await Skin.findByIdAndUpdate(skin._id, { prices: skinPrices, floatedQualities: qualitiesFloated }, { new: true });
      }
   } else if (resetFloats) {
      const skins = await Skin.find({});
      for (let skin of skins) {
         let skinPrices = skin.prices;
         skinPrices.floated = floatedPrices(skin);
         const qualitiesFloated = floatedQualities(skin);
         const updatedSkin = await Skin.findByIdAndUpdate(skin._id, { prices: skinPrices, floatedQualities: qualitiesFloated }, { new: true });
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
   const profit = await getTrades(map, nOfSkins);
   res.render('test', { profit, shortcuts });
}

module.exports.webscrapping = async (req, res) => {
   const data = await getSkinPage(`https://steamcommunity.com/market/listings/730/AK-47 | Safari Mesh (Minimal Wear)`);
   // const data = await getSkinPage(`https://steamcommunity.com/login/home/?goto=market%2Flistings%2F730%2FAK-47+%7C+Safari+Mesh+%28Minimal+Wear%29`);
   res.render('webscrapping', { data })
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
         // for (let skin of collection.skins[rarity]) {
         //    skin.prices.floated = floatedPrices(skin);
         // }

         for (let quality of qualities) {
            let minId = null, maxId = null;
            let min = 1000, max = 0;
            let totalFloated = 0;

            //CHECKING LOWEST PRICED SKIN AND TARGETED PRICE FLOATED SKIN IN EACH QUALITY
            for (let skin of collection.skins[rarity]) {

               let price = convertToPrice(skin, quality);
               let priceFloated = convertToPriceFloated(skin, quality);


               if (price < min) {
                  min = price;
                  minId = skin._id;
               } else if (priceFloated > max) {
                  max = priceFloated;
                  maxId = skin._id;
               }
               totalFloated += priceFloated;

            }
            totalFloated = totalFloated * 0.87;

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
                     floatedQualities: lowestSkin.floatedQualities,
                     prices: lowestSkin.prices,
                     price: min,
                     taxed: Math.round(min * 0.87 * 100) / 100
                  },
                  targetedSkin: {
                     _id: maxId,
                     name: targetedSkin.name,
                     skin: targetedSkin.skin,
                     min_float: targetedSkin.min_float,
                     max_float: targetedSkin.max_float,
                     floatedQualities: targetedSkin.floatedQualities,
                     prices: targetedSkin.prices,
                     price: max,
                     taxed: Math.round(max * 0.87 * 100) / 100
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
   const Gwarantowany = [];
   const Statystyczny = [];

   const keys = Object.keys(map);
   for (let key of keys) {

      const rarity = Object.keys(map[key]);
      for (let i = 0; i < rarity.length - 1; i++) {

         for (let q of qualities) {


            //instance = skins from this rarity - lowest and targeted (which is not important, tho)
            //nextInstance = skin from next rarity and lowest skin is for profitGwarantowany and targeted skin is for profitStatystyczny
            const instance = map[key][rarity[i]][q];
            const nextInstance = map[key][rarity[i + 1]][q];

            if (instance && nextInstance) {


               // console.log(convert(nextInstance.lowestSkin.prices.floated[q]) * 0.87)

               // if ((Math.round(instance.lowestSkin.price * 10 * 100) / 100) < Math.round(convert(nextInstance.lowestSkin.prices.floated[q]) * 0.87 * 100) / 100) {
               //    const pom = {
               //       rarity: rarity[i],
               //       nextRarity: rarity[i + 1],
               //       quality: q,
               //       nextQuality: nextInstance.targetedSkin.floatedQualities[q],
               //       collection: key,
               //       instance,
               //       nextInstance,
               //       nOfSkins: nOfSkins[key][rarity[i + 1]],
               //       chance: Math.round(1 / nOfSkins[key][rarity[i + 1]] * 1000) / 10
               //    }
               //    Gwarantowany.push(pom);

               // } else 
               if ((Math.round(instance.lowestSkin.price * 10 * 100) / 100) < Math.round(convert(nextInstance.targetedSkin.prices.floated[q]) * 0.87 * 100) / 100) {
                  const pom = {
                     rarity: rarity[i],
                     nextRarity: rarity[i + 1],
                     quality: q,
                     nextQuality: nextInstance.targetedSkin.floatedQualities[q],
                     collection: key,
                     instance,
                     nextInstance,
                     nOfSkins: nOfSkins[key][rarity[i + 1]],
                     chance: Math.round(1 / nOfSkins[key][rarity[i + 1]] * 1000) / 10
                  }
                  Statystyczny.push(pom);
               }



            }
         }
      }
   }

   const profit = { Gwarantowany, Statystyczny };
   return profit;
}

const getSkinPage = async (url) => {
   const res = await fetch(url);
   const data = await res.text();
   let dataString = await String(data);

   return dataString;
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