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

   req.flash('info', 'Dla Twojej wygody wyświetlone zostało 100 możliwych kontraktów');
   console.log(req.session)
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
                  next(new ExpressError(`You requested too many times recently!`, 429, `Updated ${count} / ${length}`));
               }

               const price = data.median_price || data.lowest_price || -1;
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
   const server1Url = `https://steam-market-server1.herokuapp.com/skins/update?start=${server1.start}&end=${server1.end}`;
   const server2Url = `https://steam-market-server2.herokuapp.com/skins/update?start=${server2.start}&end=${server2.end}`;
   const server3Url = `https://steam-market-server3.herokuapp.com/skins/update?start=${server3.start}&end=${server3.end}`;
   const server4Url = `https://steam-market-server4.herokuapp.com/skins/update?start=${server4.start}&end=${server4.end}`;

   // const response2 = await fetch(server2Url, { method: 'GET' });
   // const response3 = await fetch(server3Url, { method: 'GET' });
   const response2 = fetch(server2Url, { method: 'GET' });
   const response3 = fetch(server3Url, { method: 'GET' });
   const response4 = fetch(server4Url, { method: 'GET' });
   res.redirect(server1Url)
};

//TO BE DELETED
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
   let counter = 0;
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
                     counter += 1;

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
   console.log(counter)
   res.render('trades/trades', { profit, shortcuts });
}



//MAPPING COLLECTIONS
let pages = [];
let collectionNameServer = '';
let skinsServer = [];
let showCollection = false;


module.exports.showMappingPage = async (req, res) => {
   if (showCollection) {
      showCollection = false;
      res.render('mapping/map', { collectionNameServer, skinsServer });
      collectionNameServer = '';
      skinsServer = [];
      pages = [];
   } else {
      res.render('mapping/map');
   }
}

module.exports.mapCollection = async (req, res) => {
   const { url, collectionName, floats = [] } = req.body;

   if (floats.length === 0) {
      const data = await getPageData(url, 100);
      res.render('mapping/mappingCollection', { data, collectionName })
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
   res.render('mapping/mappingFloats', { pages })
}



module.exports.mixedAlgorithm = async (req, res) => {

   let counter = 0;
   let profits = [];

   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   // const nOfSkins = {};
   // for (let collection of collections) {
   //    nOfSkins[collection.name] = {
   //       grey: collection.skins.grey.length,
   //       light_blue: collection.skins.light_blue.length,
   //       blue: collection.skins.blue.length,
   //       purple: collection.skins.purple.length,
   //       pink: collection.skins.pink.length,
   //       red: collection.skins.red.length,
   //    }
   // }

   // PRZESZUKIWANIE W STOSUNKU 4 DO 6 (SKINS COOPERATIVESKIN)
   for (let r = 0; r < rarities.length - 1; r++) {
      for (let collection of collections) {
         for (let skin of collection.skins[rarities[r]]) {
            if (collection.skins[rarities[r + 1]].length !== 0) {

               const skinId = skin._id;
               for (let quality of qualities) {
                  if (skin.prices[quality] !== -1) {
                     for (let cooperativeCollection of collections) {
                        for (let cooperativeSkin of cooperativeCollection.skins[rarities[r]]) {
                           if (cooperativeSkin._id !== skinId && cooperativeCollection.skins[rarities[r + 1]].length !== 0) {
                              for (let cooperativeQuality of qualities) {
                                 if (cooperativeSkin.prices[cooperativeQuality] !== -1) {

                                    let skinAvgFloat = avg_floats[quality];
                                    let cooperativeSkinAvgFloat = avg_floats[cooperativeQuality];
                                    if (skinAvgFloat > skin.max_float) skinAvgFloat = skin.max_float;
                                    if (skinAvgFloat < skin.min_float) skinAvgFloat = skin.min_float;
                                    if (cooperativeSkinAvgFloat > cooperativeSkin.max_float) cooperativeSkinAvgFloat = cooperativeSkin.max_float;
                                    if (cooperativeSkinAvgFloat < cooperativeSkin.min_float) cooperativeSkinAvgFloat = cooperativeSkin.min_float;
                                    const avg = Math.round(((4 * skinAvgFloat + 6 * cooperativeSkinAvgFloat) / 10) * 1000) / 1000;
                                    const price = skin.prices[quality];
                                    const cooperativePrice = cooperativeSkin.prices[cooperativeQuality];


                                    let targetedSkinsArr = [];
                                    let targetedSkinsNumber = 0;
                                    let total = 0;
                                    let targetedSkinsQuality = []

                                    let collName = skin.case;
                                    let coopCollName = cooperativeSkin.case;


                                    for (let targetedCollection of collections) {
                                       if (targetedCollection.name == collName || targetedCollection.name == coopCollName) {
                                          for (let targetedSkin of targetedCollection.skins[rarities[r + 1]]) {

                                             const { min_float, max_float } = targetedSkin;
                                             const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                             const targetedQuality = checkQuality(float);

                                             const targetedPrice = Math.round((targetedSkin.prices[targetedQuality] * steamTax) * 100) / 100;
                                             targetedSkin.price = targetedPrice;

                                             total += targetedPrice;
                                             targetedSkinsNumber += 1;

                                             targetedSkinsQuality.push(targetedQuality);
                                             targetedSkinsArr.push(targetedSkin);
                                             counter += 1;
                                          }
                                       }
                                    }





                                    let trades = [];
                                    let addToArr = false;

                                    for (let targetedSkin of targetedSkinsArr) {

                                       const inputPrice = Math.round((4 * price + 6 * cooperativePrice) * 100) / 100;
                                       if (inputPrice < targetedSkin.price) {
                                          const chance = Math.round(1 / targetedSkinsNumber * 100);
                                          const { min_float, max_float } = targetedSkin;
                                          const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                          const targetedQuality = checkQuality(float);
                                          // const avgLossPrice = (total - targetedPrice) / (targetedSkinsArr - 1);
                                          // const profitability = Math.round(((inputPrice - targetedPrice) * chance / 100 - (inputPrice - avgLossPrice) * (100 - chance) / 100) * 100) / 100;
                                          // const profitability = Math.round((inputPrice - (total / targetedSkinsNumber)) * 100) / 100;
                                          const profitability = Math.round((total / targetedSkinsNumber - inputPrice) * 100) / 100;
                                          const ratio = Math.round(((total / targetedSkinsNumber) / inputPrice * 100) * 100) / 100;
                                          if (profitability > 0) {
                                             addToArr = true;

                                             const pom = {
                                                skin,
                                                cooperativeSkin,
                                                targetedSkin,
                                                quality,
                                                cooperativeQuality,
                                                targetedQuality,
                                                price,
                                                cooperativePrice,
                                                inputPrice,
                                                targetedPrice: targetedSkin.price,
                                                rarity: rarities[r],
                                                targetedSkinsArr,
                                                targetedSkinsQuality,
                                                chance,
                                                profitability,
                                                ratio,
                                             }
                                             trades.push(pom);
                                          }
                                       }
                                       counter += 1;
                                    }


                                    if (addToArr) {
                                       const pom2 = {
                                          trades,
                                          avg,
                                          total,
                                          positiveCases: trades.length,
                                          targetedSkinsNumber
                                       }

                                       if (profits.length === 0) {
                                          profits.push(pom2);
                                       } else if (pom2.trades[0].ratio > profits[0].trades[0].ratio) {
                                          profits.unshift(pom2);
                                       } else {
                                          profits.push(pom2);
                                       }
                                    }

                                    // counter += 1;
                                 }
                              }
                           }
                        }
                     }
                  }
               }
            }
         }
      }
   }

   let counterOpt = counter.toLocaleString()
   let positiveResults = profits.length;

   console.log(counter, positiveResults)
   res.render('trades/mixed-4-6', { profits, counterOpt, positiveResults })
}