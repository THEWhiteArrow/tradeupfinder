const { mayReplaceSpace, getData, getPageData, convertToPrice, convert, convertToPriceFloated, floatedPrices } = require('../utils/functions');
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

   // res.cookie('testtoken', '12345');
   // res.clearCookie("key");
   // console.log(req.cookies)
   res.render('index', { collections, qualities, rarities });
};

module.exports.updatePrices = async (req, res, next) => {
   // const collectionsToUpdate = ['FractureCase', 'PrismaCase', 'Dust2', 'Inferno', 'Inferno2018', 'Nuke2018', 'GloveCase', 'Havoc', 'Control'];
   // const collectionsToUpdate = ['FractureCase'];

   const skins = await Skin.find({});
   const collections = await Case.find({});

   let count = 0, length = 0;

   for (let c of collections) {
      length += c.nOfSkins;
   }


   const { start = 0, end = length } = req.query;
   for (let item of skins) {




      count += 1;
      if (count >= start && count <= end) {


         console.log(`${count} / ${end} - ${item.name} | ${item.skin}`);

         const updatedPrices = {};
         const { name, skin, prices, _id } = item;

         const keys = Object.keys(prices);


         for (let q of keys) {
            if (q !== '$init' && q !== 'floated' && item.prices[q] !== -1) {

               const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
               const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;
               const data = await getData(url, 3300);
               // console.log(data)
               if (data === null) {
                  return next(new ExpressError(`You requested too many times recently!`, 429, `Updated ${count} / ${length}`));
               }

               const price = data.median_price || data.lowest_price;
               updatedPrices[q] = convert(price) || -1;
            } else if (item.prices[q] === -1) {
               updatedPrices[q] = -1;
            }
         }



         const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });

      }


   }
   console.log('updating finished!')
   res.redirect('/skins');
};

module.exports.useServers = async (req, res) => {
   const { server1, server2, server3, server4 } = req.body;
   console.log(server1)
   console.log(server2)
   console.log(server3)
   // console.log(req.body)
   const server1Url = `https://steam-market-server1.herokuapp.com/skins/update?updateStart=${server1.start}&updateEnd=${server1.end}&useServers=true`;
   const server2Url = `https://steam-market-server2.herokuapp.com/skins/update?updateStart=${server2.start}&updateEnd=${server2.end}&useServers=true`;
   const server3Url = `https://steam-market-server3.herokuapp.com/skins/update?updateStart=${server3.start}&updateEnd=${server3.end}&useServers=true`;
   const server4Url = `https://steam-market-server4.herokuapp.com/skins/update?updateStart=${server4.start}&updateEnd=${server4.end}&useServers=true`;

   // const response2 = await fetch(server2Url, { method: 'GET' });
   // const response3 = await fetch(server3Url, { method: 'GET' });
   const response2 = fetch(server2Url, { method: 'GET' });
   const response3 = fetch(server3Url, { method: 'GET' });
   const response4 = fetch(server3Url, { method: 'GET' });
   res.redirect(server1Url)
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

};


// NEWEST
module.exports.prepareTrades = async (req, res) => {
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   const nOfSkins = {};
   for (let collection of collections) {
      nOfSkins[collection.name] = {
         grey: collection.skins.grey.length,
         light_blue: collection.skins.light_blue.length,
         blue: collection.skins.blue.length,
         purple: collection.skins.purple.length,
         pink: collection.skins.pink.length,
         red: collection.skins.red.length,
      }
   }

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
                  let tradesArr = [];
                  let trade = {};
                  let isProfitable = false;

                  for (let targetedSkin of targetedSkins) {
                     // SPRAWDZA CZY ŚREDNIA NIE WYKRACZA POZA MIN I MAX FLOAT SKINA DO TRADÓW
                     let avg = avg_floats[quality];
                     avg < skin.min_float ? avg = skin.min_float : null;
                     avg > skin.max_float ? avg = skin.max_float : null;

                     const float = (targetedSkin.max_float - targetedSkin.min_float) * avg + targetedSkin.min_float;
                     const targetedQuality = checkQuality(float);

                     const rawPrice = skin.prices[quality];
                     const price = Math.round(skin.prices[quality] * 10 * 100) / 100;
                     const targetedPrice = Math.round(targetedSkin.prices[targetedQuality] * steamTax * 100) / 100;
                     total += targetedPrice;

                     if (price < targetedPrice) {
                        isProfitable = true;
                        trade = {
                           skin,
                           quality,
                           targetedSkin,
                           targetedQuality,
                           rawPrice,
                           price,
                           targetedPrice,
                        };
                        tradesArr.push(trade);
                     }

                  }

                  if (isProfitable) {
                     let nOfTargetedSkins = nOfSkins[collection.name][rarities[r + 1]];
                     let instance = {
                        tradesArr,
                        total: Math.round(total * 100) / 100,
                        nOfTargetedSkins,
                        chance: Math.round(100 / nOfTargetedSkins),
                     }
                     profit.push(instance);
                  }

               }
            }

         }





      }
   }

   res.render('trades', { profit, shortcuts });
}



//MAPPING COLLECTIONS
let pages = [];
let collectionNameServer = '';
let skinsServer = [];
let showCollection = false;


module.exports.showMappingPage = async (req, res) => {
   if (showCollection) {
      showCollection = false;
      res.render('map', { collectionNameServer, skinsServer });
      collectionNameServer = '';
      skinsServer = [];
      pages = [];
   } else {
      res.render('map');
   }
}

module.exports.mapCollection = async (req, res) => {
   const { url, collectionName, floats = [] } = req.body;

   if (floats.length === 0) {
      const data = await getPageData(url, 100);
      res.render('mappingCollection', { data, collectionName })
   } else {
      for (let i = 0; i < skinsServer.length; i++) {
         skinsServer[i].min_float = floats[i].min_float;
         skinsServer[i].max_float = floats[i].max_float;
      }
      showCollection = true;
      console.log('kolekcja przygotowana!')
      res.send('kolekcja został przygotowana')


   }

}


module.exports.mapFloatsPost = async (req, res) => {
   const { collectionName, skins, hrefs } = req.body;
   collectionNameServer = collectionName;
   skinsServer = skins;


   for (let href of hrefs) {
      const data = await getPageData(href, 100);
      pages.push(data)
   }
   console.log('finished downloading pages data')

   const feedback = { success: true };
   res.json(feedback);
}
module.exports.mapFloatsGet = async (req, res) => {
   res.render('mappingFloats', { pages })
}