const { mayReplaceSpace, getData, convertToPrice, convert, convertToPriceFloated, floatedPrices } = require('../utils/functions');
const { checkQuality } = require('../utils/functions');
const { qualities, rarities, avg_floats, shortcuts } = require('../utils/variables');
const ExpressError = require('../utils/ExpressError');
const fetch = require('node-fetch');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;

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

module.exports.updatePrices = async (req, res, next) => {
   // const collectionsToUpdate = ['FractureCase', 'PrismaCase', 'Dust2', 'Inferno', 'Inferno2018', 'Nuke2018', 'GloveCase', 'Havoc', 'Control'];
   const collectionsToUpdate = ['FractureCase'];

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

   const { updateStart = 0, updateEnd = length, useServers = false } = req.query;
   // if (updateStart !== 0) {
   //    res.send('server woken up');
   // }


   for (let item of skins) {
      let isToBeUpdated = false;


      for (let collection of collectionsToUpdate) {
         item.case === collection ? isToBeUpdated = true : null;
      }

      if (isToBeUpdated) {


         count += 1;
         if (count >= updateStart && count <= updateEnd) {


            console.log(`${count} / ${length - updateStart}`);

            const updatedPrices = {};
            const { name, skin, prices, _id } = item;

            const keys = Object.keys(prices);


            for (let q of keys) {
               if (q !== '$init' && q !== 'floated') {

                  const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
                  const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;
                  let data;
                  data = await getData(url, 3100);
                  if (data === null) {
                     return next(new ExpressError(`You requested too many times recently!`, 429, `Updated ${count} / ${length}`));
                  }
                  updatedPrices[q] = convert(data.lowest_price) || -1;
               }
            }


            item.prices = updatedPrices;


            const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });
         }
      }


   }

   if (!useServers) {
      console.log('updating finished!')
      res.redirect('/skins');
   }
};

module.exports.useServers = async (req, res) => {
   const { server1, server2, server3 } = req.body;
   console.log(server1)
   console.log(server2)
   console.log(server3)
   // console.log(req.body)
   const server1Url = `https://steam-market-server1.herokuapp.com/skins/update/?updateStart=${server1.start}&updateEnd=${server1.end}&useServers=true`;
   const server2Url = `https://steam-market-server2.herokuapp.com/skins/update/?updateStart=${server2.start}&updateEnd=${server2.end}&useServers=true`;
   const server3Url = `https://steam-market-server3.herokuapp.com/skins/update/?updateStart=${server3.start}&updateEnd=${server3.end}&useServers=true`;

   const response2 = await fetch(server2Url, { method: 'GET' });
   const response3 = await fetch(server3Url, { method: 'GET' });
   res.redirect(server1Url)
}
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






// NEWEST
module.exports.prepareTrades = async (req, res) => {
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   let profit = [];

   for (let collection of collections) {

      for (let r = 0; r < rarities.length - 1; r++) {
         // SKINY Z OBECNEJ RZADKOŚCI
         let skins = collection.skins[rarities[r]];
         // SKINY Z KOLEJNEJ RZADKOŚCI
         let targetedSkins = collection.skins[rarities[r + 1]];

         for (let quality of qualities) {

            for (let skin of skins) {
               if (skin.prices[quality] !== -1) {
                  let total = 0;

                  for (let targetedSkin of targetedSkins) {
                     // SPRAWDZA CZY ŚREDNIA NIE WYKRACZA POZA MIN I MAX FLOAT SKINA DO TRADÓW
                     let avg = avg_floats[quality];
                     avg < skin.min_float ? avg = skin.min_float : null;
                     avg > skin.max_float ? avg = skin.max_float : null;

                     const float = (targetedSkin.max_float - targetedSkin.min_float) * avg + targetedSkin.min_float;
                     const targetedQuality = checkQuality(float);

                     const price = Math.round(skin.prices[quality] * 10 * 100) / 100;
                     const targetedPrice = Math.round(targetedSkin.prices[targetedQuality] * steamTax * 100) / 100;
                     total += targetedPrice;

                     if (price < targetedPrice) {

                     }

                  }

               }
            }

         }




      }
   }

   res.render('trades')
}





// NEW
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

            let allowAll = true;
            //CHECKING LOWEST PRICED SKIN AND TARGETED PRICE FLOATED SKIN IN EACH QUALITY
            for (let skin of collection.skins[rarity]) {

               let price = convertToPrice(skin, quality);
               let priceFloated = convertToPriceFloated(skin, quality);

               if (price !== 'none' && priceFloated !== 'none') {

                  if (price < min) {
                     min = price;
                     minId = skin._id;
                  } else if (priceFloated > max) {
                     max = priceFloated;
                     maxId = skin._id;
                  }
               } else {
                  allowAll = false;
               }
               totalFloated += priceFloated;

            }
            totalFloated = totalFloated * 0.87;

            if (minId && maxId && allowAll) {
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