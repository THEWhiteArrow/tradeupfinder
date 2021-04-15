const { mayReplaceSpace, getData, getPageData, convertToPrice, convert, convertToPriceFloated, floatedPrices } = require('../utils/functions');
const { checkQuality, combainToName, findCheapestSkin } = require('../utils/functions');
const { qualities, rarities, avg_floats, shortcuts } = require('../utils/variables');
const ExpressError = require('../utils/ExpressError');
const fetch = require('node-fetch');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');
const Research = require('../models/researchModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const maxShownSkins = 420;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';

module.exports.showIndex = async (req, res) => {
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });


   const researches = await Research.find({});
   // res.cookie('testtoken', 'lol');
   // res.cookie('testtoken', { amount1: 4, amount2: 6 });
   // console.log(JSON.parse(req.cookies.testtoken))
   // res.clearCookie("testtoken");
   // console.log(req.cookies.testtoken)

   req.flash('info', `Dla Twojej wygody wyświetlone zostało niewięcej niż ${maxShownSkins} możliwych kontraktów`);
   // console.log(req.session)
   res.render('index', { collections, qualities, rarities, researches });
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



   const { start = 0, end = length, variant = 'steam' } = req.query;
   for (let item of skins) {




      count += 1;
      if (count >= start && count <= end) {


         console.log(`${count} / ${end} - ${item.name} | ${item.skin}`);

         const updatedPrices = {};
         const { name, skin, prices, _id } = item;

         const keys = Object.keys(prices);


         for (let q of keys) {
            if (q !== '$init' && q !== 'floated' && item.prices[q] !== -1) {

               let baseUrl;
               variant == 'steam' ? baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=' : baseUrl = 'http://csgobackpack.net/api/GetItemPrice/?currency=PLN&time=2&id=';
               // const baseUrl = 'http://csgobackpack.net/api/GetItemPrice/?currency=PLN&id=';
               const url = `${baseUrl}${name} | ${skin} (${q})`;
               const encodedUrl = encodeURI(url);
               // const data = await getData(encodedUrl, 300);
               let data;
               variant == 'steam' ? data = await getData(encodedUrl, 3200) : data = await getData(encodedUrl, 500);
               if (data.success == true) {

                  // console.log(data, url)

                  let price;
                  if (variant == 'steam') {

                     if (data.median_price) {
                        price = data.median_price;
                        updatedPrices[q] = convert(price);
                     } else if (data.lowest_price) {
                        price = data.lowest_price;
                        updatedPrices[q] = convert(price);
                     } else {
                        updatedPrices[q] = 0;
                     }
                  } else {

                     if (data.average_price) {
                        price = data.average_price;
                        updatedPrices[q] = Number(price);
                     } else if (data.median_price) {
                        price = data.median_price;
                        updatedPrices[q] = Number(price);
                     } else {
                        updatedPrices[q] = 0;
                     }
                  }
               } else if (data.success == false || data == null) {
                  console.log(data, encodedUrl)

                  console.log(`You requested too many times recently!, Status: 429, Updated ${count} / ${length}`);
                  return next(new ExpressError(`You requested too many times recently or there is some other problem (data.success != true)`, 429, `Updated ${count} / ${length}`));
               }

            } else if (item.prices[q] === -1) {
               updatedPrices[q] = -1;
            }
         }

         // console.log(updatedPrices);
         const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });


      }


   }

   console.log('updating finished!')
   res.redirect('/skins');
};

module.exports.updatePricesInOneReq = async (req, res, next) => {
   const rawData = await fetch('http://csgobackpack.net/api/GetItemsList/v2/?currency=PLN', { method: "GET" });
   const data = await rawData.json()
   console.log(data.success)
   if (data.success) {
      const collections = await Case.find({})
         .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
         .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
         .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
         .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
         .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
         .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

      for (let collection of collections) {
         const keys = Object.keys(collection.skins);
         keys.shift()

         for (let rarity of keys) {
            if (rarity.length > 0) {
               for (let updatedSkin of collection.skins[rarity]) {
                  const qualities = Object.keys(updatedSkin.prices);
                  qualities.shift();
                  const { name, skin, _id } = updatedSkin;


                  const updatedPrices = {}
                  for (let quality of qualities) {
                     if (updatedSkin.prices[quality] === -1) {
                        updatedPrices[quality] === -1;
                     } else {
                        const indicator = combainToName(name, skin, quality);
                        console.log(indicator)
                        updatedPrices[quality] = data.items_list[`${indicator}`].price['7_days'].average || -1;
                     }
                  }
                  console.log(updatedPrices)
                  const updatedSkinDB = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });

               }

            }

         }

      }
      // console.log(data.items_list['Desert Eagle | Hand Cannon (Factory New)'].price['7_days'].average)


   }

   console.log('updating finished!')
   res.redirect('/skins');
}

module.exports.useServers = async (req, res) => {
   const { server1, server2, server3, server4, server5, server6, server7, server8, server9, server10, variant = 'steam' } = req.body;
   console.log(variant)
   console.log(server1)
   console.log(server2)
   console.log(server3)
   console.log(server4)
   console.log(server5)
   console.log(server6)
   console.log(server7)
   console.log(server8)
   console.log(server9)
   console.log(server10)
   // console.log(req.body)
   const server1Url = `https://steam-market1.herokuapp.com/skins/update?start=${server1.start}&end=${server1.end}&variant=${variant}`;
   const server2Url = `https://steam-market2.herokuapp.com/skins/update?start=${server2.start}&end=${server2.end}&variant=${variant}`;
   const server3Url = `https://steam-market3.herokuapp.com/skins/update?start=${server3.start}&end=${server3.end}&variant=${variant}`;
   const server4Url = `https://steam-market4.herokuapp.com/skins/update?start=${server4.start}&end=${server4.end}&variant=${variant}`;
   const server5Url = `https://steam-market5.herokuapp.com/skins/update?start=${server5.start}&end=${server5.end}&variant=${variant}`;
   const server6Url = `https://steam-market6.herokuapp.com/skins/update?start=${server6.start}&end=${server6.end}&variant=${variant}`;
   const server7Url = `https://steam-market7.herokuapp.com/skins/update?start=${server7.start}&end=${server7.end}&variant=${variant}`;
   const server8Url = `https://steam-market8.herokuapp.com/skins/update?start=${server8.start}&end=${server8.end}&variant=${variant}`;
   const server9Url = `https://steam-market9.herokuapp.com/skins/update?start=${server9.start}&end=${server9.end}&variant=${variant}`;
   const server10Url = `https://steam-market10.herokuapp.com/skins/update?start=${server10.start}&end=${server10.end}&variant=${variant}`;

   // const response2 = await fetch(server2Url, { method: 'GET' });
   // const response3 = await fetch(server3Url, { method: 'GET' });
   const response2 = fetch(server2Url, { method: 'GET' });
   const response3 = fetch(server3Url, { method: 'GET' });
   const response4 = fetch(server4Url, { method: 'GET' });
   const response5 = fetch(server5Url, { method: 'GET' });
   const response6 = fetch(server6Url, { method: 'GET' });
   const response7 = fetch(server7Url, { method: 'GET' });
   const response8 = fetch(server8Url, { method: 'GET' });
   const response9 = fetch(server9Url, { method: 'GET' });
   const response10 = fetch(server10Url, { method: 'GET' });

   res.redirect(server1Url)
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
   let { action = 'nothing', researchName = '', pairs = 2 } = req.query;
   if (action != 'nothing' && action != 'save' && action != 'display') {
      action = 'nothing';
   }
   console.log(req.query)


   if (action == 'display') {
      const savedResearch = await Research.findOne({ name: researchName })
      const { profits, counterOpt, positiveResults, amount, avg_floats } = savedResearch;
      res.render('trades/mixed', { profits, counterOpt, positiveResults, amount, maxShownSkins, steamBaseUrl, avg_floats });

   } else {

      const current = new Date();
      const hour = current.getHours();
      const minute = current.getMinutes();
      if (pairs == 2) {
         const { profits, counterOpt, positiveResults, amount } = await mixedTwoPairs(req);

         checkTime(current, hour, minute);
         action == 'save' ? saveResearch(Research, profits, counterOpt, positiveResults, amount, researchName, avg_floats) : null;

         res.render('trades/mixed', { profits, counterOpt, positiveResults, amount, maxShownSkins, steamBaseUrl, avg_floats })

      } else if (pairs == 3) {
         const { profits, counterOpt, positiveResults, amount } = await mixedThreePairs(req);

         checkTime(current, hour, minute);
         action == 'save' ? saveResearch(Research, profits, counterOpt, positiveResults, amount, researchName, avg_floats) : null;

         res.render('trades/mixed', { profits, counterOpt, positiveResults, amount, maxShownSkins, steamBaseUrl, avg_floats })
      }
   }


}

const mixedTwoPairs = async (req) => {
   const { ratio = '4-6', sliceStart = 0, sliceEnd = 10, sort = 'returnPercentage' } = req.query;
   let amount1 = Number(ratio[0]);
   let amount2 = Number(ratio[2]);
   if (amount1 == undefined || amount2 == undefined || amount1 + amount2 != 10) {
      amount1 = 4;
      amount2 = 6;
   }
   let counter = 0;
   let profits = [];



   const sliceFrom = Number(sliceStart);
   const sliceTo = Number(sliceEnd);

   let collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   collections = collections.slice(sliceFrom, sliceTo);

   for (let r = 0; r < rarities.length - 1; r++) {

      for (let firstCollection of collections) {
         if (firstCollection.skins[rarities[r + 1]].length !== 0) {

            for (let secondCollection of collections) {
               if (secondCollection.skins[rarities[r + 1]].length !== 0) {

                  for (let firstQuality of qualities) {
                     for (let secondQuality of qualities) {

                        const firstSkin = findCheapestSkin(firstCollection, rarities[r], firstQuality);
                        const secondSkin = findCheapestSkin(secondCollection, rarities[r], secondQuality);

                        if (firstSkin != null && secondSkin != null) {

                           let firstSkinAvgFloat = avg_floats[firstQuality];
                           let secondSkinAvgFloat = avg_floats[secondQuality];
                           if (firstSkinAvgFloat > firstSkin.max_float) firstSkinAvgFloat = firstSkin.max_float;
                           if (firstSkinAvgFloat < firstSkin.min_float) firstSkinAvgFloat = firstSkin.min_float;
                           if (secondSkinAvgFloat > secondSkin.max_float) secondSkinAvgFloat = secondSkin.max_float;
                           if (secondSkinAvgFloat < secondSkin.min_float) secondSkinAvgFloat = secondSkin.min_float;

                           const avg = Math.round(((amount1 * firstSkinAvgFloat + amount2 * secondSkinAvgFloat) / 10) * 1000) / 1000;
                           const firstPrice = firstSkin.prices[firstQuality];
                           const secondPrice = secondSkin.prices[secondQuality];
                           const inputPrice = Math.round((amount1 * firstPrice + amount2 * secondPrice) * 100) / 100;

                           let wantedOutputChance = 0;

                           let targetedSkinsArr = [];
                           let targetedSkinsNumber = 0;
                           let total = 0;
                           let targetedSkinsQuality = []

                           let max = 0;
                           let maxSkin = {};


                           for (let targetedCollection of collections) {
                              if (targetedCollection.name == firstSkin.case || targetedCollection.name == secondSkin.case) {

                                 for (let targetedSkin of targetedCollection.skins[rarities[r + 1]]) {

                                    const { min_float, max_float } = targetedSkin;
                                    const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                    const targetedQuality = checkQuality(float);

                                    const targetedPrice = Math.round((targetedSkin.prices[targetedQuality] * steamTax) * 100) / 100;

                                    targetedSkin.price = targetedPrice;
                                    if (max < targetedPrice) {
                                       max = targetedPrice;
                                       maxSkin = {
                                          _id: targetedSkin._id,
                                          name: targetedSkin.name,
                                          skin: targetedSkin.skin,
                                          case: targetedSkin.case,
                                          rarity: targetedSkin.rarity,
                                          min_float: targetedSkin.min_float,
                                          max_float: targetedSkin.max_float,
                                          float,
                                          price: targetedPrice,
                                          targetedQuality,
                                       }
                                    }

                                    if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case) {
                                       total += (targetedPrice * (amount1 + amount2));
                                       targetedSkinsNumber += (1 * (amount1 + amount2));
                                       targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount2) : null;

                                    } else if (targetedCollection.name == firstSkin.case) {
                                       total += (targetedPrice * amount1);
                                       targetedSkinsNumber += (1 * amount1);
                                       targetedPrice > inputPrice ? wantedOutputChance += (amount2) : null;

                                    } else if (targetedCollection.name == secondSkin.case) {
                                       total += (targetedPrice * amount2);
                                       targetedSkinsNumber += (1 * amount2);
                                       targetedPrice > inputPrice ? wantedOutputChance += (amount1) : null;
                                    }

                                    const targetedSkinPom = {
                                       _id: targetedSkin._id,
                                       name: targetedSkin.name,
                                       skin: targetedSkin.skin,
                                       prices: targetedSkin.prices,
                                       min_float: targetedSkin.min_float,
                                       max_float: targetedSkin.max_float,
                                       rarity: targetedSkin.rarity,
                                       price: targetedPrice,
                                       float

                                    }
                                    targetedSkinsQuality.push(targetedQuality);
                                    targetedSkinsArr.push(targetedSkinPom);
                                    counter += 1;
                                 }
                              }
                           }


                           const avgPrice = total / targetedSkinsNumber;
                           const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 1000) / 1000;
                           const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 1000) / 1000;

                           if (profitPerTradeUp > 0) {
                              const trade = {
                                 skin: firstSkin,
                                 cooperativeSkin: secondSkin,
                                 targetedSkin: maxSkin,
                                 firstSkinUrl: encodeURI(`${steamBaseUrl}${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`),
                                 secondSkinUrl: encodeURI(`${steamBaseUrl}${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`),
                                 targetedSkinUrl: encodeURI(`${steamBaseUrl}${maxSkin.name} | ${maxSkin.skin} (${maxSkin.targetedQuality})`),
                                 quality: firstQuality,
                                 cooperativeQuality: secondQuality,
                                 targetedQuality: maxSkin.targetedQuality,
                                 price: firstPrice,
                                 cooperativePrice: secondPrice,
                                 inputPrice,
                                 targetedPrice: maxSkin.price,
                                 rarity: rarities[r],
                                 targetedSkinsArr,
                                 targetedSkinsQuality,
                                 // chance,
                                 profitPerTradeUp,
                                 returnPercentage,
                              }
                              const pom2 = {
                                 trade,
                                 avg,
                                 total,
                                 targetedSkinsNumber,
                                 wantedOutputChance
                              }
                              profits = placeInCorrectOrder(profits, pom2, sort);
                           }

                           counter += 1;
                        }
                     }
                  }
               }
            }
         }
      }
   }
   // for (let profit of profits) {
   //    console.log(profit.trades[0].returnPercentage)
   // }

   let counterOpt = counter.toLocaleString()
   let positiveResults = profits.length.toLocaleString();

   console.log(counter, positiveResults)
   return { profits, counterOpt, positiveResults, amount: { amount1, amount2 } };
}

const mixedThreePairs = async (req) => {
   const { ratio = '4-4-2', sliceStart = 0, sliceEnd = 10, sort = 'returnPercentage' } = req.query;
   let amount1 = Number(ratio[0]);
   let amount2 = Number(ratio[2]);
   let amount3 = Number(ratio[4]);
   if (amount1 == undefined || amount2 == undefined || amount3 == undefined || amount1 + amount2 + amount3 != 10) {
      amount1 = 4;
      amount2 = 4;
      amount3 = 2;
   }

   const sliceFrom = Number(sliceStart);
   const sliceTo = Number(sliceEnd);
   let counter = 0;
   let profits = [];

   let collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   collections = collections.slice(sliceFrom, sliceTo);
   // collections = [...collections.slice(0, 7), ...collections.slice(46, 51)]

   for (let r = 0; r < rarities.length - 1; r++) {

      for (let firstCollection of collections) {
         if (firstCollection.skins[rarities[r + 1]].length !== 0) {

            for (let secondCollection of collections) {
               if (secondCollection.skins[rarities[r + 1]].length !== 0) {
                  for (let thirdCollection of collections) {
                     if (thirdCollection.skins[rarities[r + 1]].length !== 0) {

                        for (let firstQuality of qualities) {
                           for (let secondQuality of qualities) {
                              for (let thirdQuality of qualities) {



                                 const firstSkin = findCheapestSkin(firstCollection, rarities[r], firstQuality);
                                 const secondSkin = findCheapestSkin(secondCollection, rarities[r], secondQuality);
                                 const thirdSkin = findCheapestSkin(thirdCollection, rarities[r], thirdQuality);

                                 if (firstSkin != null && secondSkin != null && thirdSkin != null) {

                                    let firstSkinAvgFloat = avg_floats[firstQuality];
                                    let secondSkinAvgFloat = avg_floats[secondQuality];
                                    let thirdSkinAvgFloat = avg_floats[thirdQuality];
                                    if (firstSkinAvgFloat > firstSkin.max_float) firstSkinAvgFloat = firstSkin.max_float;
                                    if (firstSkinAvgFloat < firstSkin.min_float) firstSkinAvgFloat = firstSkin.min_float;
                                    if (secondSkinAvgFloat > secondSkin.max_float) secondSkinAvgFloat = secondSkin.max_float;
                                    if (secondSkinAvgFloat < secondSkin.min_float) secondSkinAvgFloat = secondSkin.min_float;
                                    if (thirdSkinAvgFloat > thirdSkin.max_float) thirdSkinAvgFloat = thirdSkin.max_float;
                                    if (thirdSkinAvgFloat < thirdSkin.min_float) thirdSkinAvgFloat = thirdSkin.min_float;

                                    const avg = Math.round(((amount1 * firstSkinAvgFloat + amount2 * secondSkinAvgFloat + amount3 * thirdSkinAvgFloat) / 10) * 1000) / 1000;
                                    const firstPrice = firstSkin.prices[firstQuality];
                                    const secondPrice = secondSkin.prices[secondQuality];
                                    const thirdPrice = thirdSkin.prices[thirdQuality];
                                    const inputPrice = Math.round((amount1 * firstPrice + amount2 * secondPrice + amount3 * thirdPrice) * 100) / 100;

                                    let wantedOutputChance = 0;

                                    let targetedSkinsArr = [];
                                    let targetedSkinsNumber = 0;
                                    let total = 0;
                                    let targetedSkinsQuality = []

                                    let max = 0;
                                    let maxSkin = {};


                                    for (let targetedCollection of collections) {
                                       if (targetedCollection.name == firstSkin.case || targetedCollection.name == secondSkin.case || targetedCollection.name == thirdSkin.case) {

                                          for (let targetedSkin of targetedCollection.skins[rarities[r + 1]]) {

                                             const { min_float, max_float } = targetedSkin;
                                             const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                             const targetedQuality = checkQuality(float);

                                             const targetedPrice = Math.round((targetedSkin.prices[targetedQuality] * steamTax) * 100) / 100;
                                             targetedSkin.price = targetedPrice;
                                             if (max < targetedPrice) {
                                                max = targetedPrice;
                                                maxSkin = {
                                                   _id: targetedSkin._id,
                                                   name: targetedSkin.name,
                                                   skin: targetedSkin.skin,
                                                   case: targetedSkin.case,
                                                   rarity: targetedSkin.rarity,
                                                   min_float: targetedSkin.min_float,
                                                   max_float: targetedSkin.max_float,
                                                   price: targetedPrice,
                                                   targetedQuality
                                                }
                                             }

                                             if (targetedCollection.name == firstSkin.ace && targetedCollection.name == secondSkin.case && targetedCollection.name == thirdSkin.case) {
                                                total += (targetedPrice * (amount1 + amount2 + amount3));
                                                targetedSkinsNumber += (1 * (amount1 + amount2 + amount3));
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount2 + amount3) : null;

                                             } else if (targetedCollection.name == secondSkin.case && targetedCollection.name == thirdSkin.case) {
                                                total += (targetedPrice * (amount2 + amount3));
                                                targetedSkinsNumber += (1 * (amount2 + amount3));
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount2 + amount3) : null;

                                             } else if (targetedCollection.name == firstSkin.case && targetedCollection.name == thirdSkin.case) {
                                                total += (targetedPrice * (amount1 + amount3));
                                                targetedSkinsNumber += (1 * (amount1 + amount3));
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount3) : null;

                                             } else if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case) {
                                                total += (targetedPrice * (amount1 + amount2));
                                                targetedSkinsNumber += (1 * (amount1 + amount2));
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1 + amount2) : null;

                                             } else if (targetedCollection.name == firstSkin.case) {
                                                total += (targetedPrice * amount1);
                                                targetedSkinsNumber += (1 * amount1);
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount1) : null;

                                             } else if (targetedCollection.name == secondSkin.case) {
                                                total += (targetedPrice * amount2);
                                                targetedSkinsNumber += (1 * amount2);
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount2) : null;

                                             } else if (targetedCollection.name == thirdSkin.case) {
                                                total += (targetedPrice * amount3);
                                                targetedSkinsNumber += (1 * amount3);
                                                targetedPrice > inputPrice ? wantedOutputChance += (amount3) : null;
                                             }

                                             const targetedSkinPom = {
                                                _id: targetedSkin._id,
                                                name: targetedSkin.name,
                                                skin: targetedSkin.skin,
                                                prices: targetedSkin.prices,
                                                min_float: targetedSkin.min_float,
                                                max_float: targetedSkin.max_float,
                                                rarity: targetedSkin.rarity,
                                                price: targetedPrice,
                                                float

                                             }
                                             targetedSkinsQuality.push(targetedQuality);
                                             targetedSkinsArr.push(targetedSkinPom);
                                             counter += 1;
                                          }
                                       }
                                    }






                                    const avgPrice = total / targetedSkinsNumber;
                                    const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
                                    const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;

                                    if (profitPerTradeUp > 0) {

                                       const trade = {
                                          skin: firstSkin,
                                          cooperativeSkin: secondSkin,
                                          cooperativeSkin: secondSkin,
                                          thirdSkin,
                                          targetedSkin: maxSkin,
                                          quality: firstQuality,
                                          cooperativeQuality: secondQuality,
                                          thirdQuality,
                                          targetedQuality: maxSkin.targetedQuality,
                                          firstSkinUrl: encodeURI(`${steamBaseUrl}${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`),
                                          secondSkinUrl: encodeURI(`${steamBaseUrl}${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`),
                                          thirdSkinUrl: encodeURI(`${steamBaseUrl}${thirdSkin.name} | ${thirdSkin.skin} (${thirdQuality})`),
                                          targetedSkinUrl: encodeURI(`${steamBaseUrl}${maxSkin.name} | ${maxSkin.skin} (${maxSkin.targetedQuality})`),
                                          price: firstPrice,
                                          cooperativePrice: secondPrice,
                                          thirdPrice,
                                          inputPrice,
                                          targetedPrice: maxSkin.price,
                                          rarity: rarities[r],
                                          targetedSkinsArr,
                                          targetedSkinsQuality,
                                          // chance,
                                          profitPerTradeUp,
                                          returnPercentage,
                                       }

                                       const pom2 = {
                                          trade,
                                          avg,
                                          total,
                                          targetedSkinsNumber,
                                          wantedOutputChance
                                       }

                                       profits = placeInCorrectOrder(profits, pom2, sort);
                                    }

                                    counter += 1;
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
   // for (let profit of profits) {
   //    console.log(profit.trades[0].returnPercentage)
   // }

   let counterOpt = counter.toLocaleString()
   let positiveResults = profits.length.toLocaleString();

   console.log(counter, positiveResults)
   return { profits: profits.slice(0, 750), counterOpt, positiveResults, amount: { amount1, amount2, amount3 } };
}



const checkTime = (current, hour, minute) => {
   const currentFinish = new Date();
   const finishHour = currentFinish.getHours();
   const finishMinute = currentFinish.getMinutes();
   if (hour == finishHour) {
      console.log(`${current.getHours()}:${current.getMinutes()}`);
      console.log(`${currentFinish.getHours()}:${currentFinish.getMinutes()}`);
      console.log(`time : ${finishMinute - minute}`);
   }
   if (hour != finishHour) {
      console.log(`${current.getHours()}:${current.getMinutes()}`);
      console.log(`${currentFinish.getHours()}:${currentFinish.getMinutes()}`);
      console.log(`time : ${finishHour - hour} : ${finishMinute - minute}`);
   }
}
const saveResearch = async (Research, profits, counterOpt, positiveResults, amount, researchName, avg_floats) => {
   const newResearch = new Research({ profits, counterOpt, positiveResults, amount, name: researchName, avg_floats });
   await newResearch.save();
   console.log(`Research of "${researchName}" saved!!!`)

}
const placeInCorrectOrder = (profits, pom2, sort) => {
   if (profits.length <= 2) {
      profits.push(pom2);
   } else {
      let correctPosition = false;
      let i = 0;
      while (!correctPosition && i <= profits.length - 1) {

         if (pom2.trade[sort] > profits[i].trade[sort]) {
            let firstHalf = profits.slice(0, i);
            let secondHalf = profits.slice(i);
            profits = [...firstHalf, pom2, ...secondHalf];
            correctPosition = true;
         }
         i += 1;
      }
      if (!correctPosition) {
         profits.push(pom2);
         correctPosition = true;
      }
   }
   return profits;
}