const { mayReplaceSpace, getData, getPageData, convertToPrice, convert, convertToPriceFloated, floatedPrices } = require('../utils/functions');
const { checkQuality, combainToName } = require('../utils/functions');
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
   // console.log(req.session)
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
               // const baseUrl = 'http://csgobackpack.net/api/GetItemPrice/?currency=PLN&id=';
               const url = `${baseUrl}${name} | ${skin} (${q})`;
               const encodedUrl = encodeURI(url);
               // const data = await getData(encodedUrl, 300);
               const data = await getData(encodedUrl, 3200);
               if (data.success == true) {

                  // console.log(data, url)

                  let price;
                  if (data.median_price) {
                     price = data.median_price;
                     updatedPrices[q] = convert(price);
                  } else if (data.lowest_price) {
                     price = data.lowest_price;
                     updatedPrices[q] = convert(price);
                  } else {
                     updatedPrices[q] = 0;
                  }
                  // if (data.average_price) {
                  //    price = data.average_price;
                  //    updatedPrices[q] = Number(price);
                  // } else if (data.median_price) {
                  //    price = data.median_price;
                  //    updatedPrices[q] = Number(price);
                  // } else {
                  //    updatedPrices[q] = 0;
                  // }
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
   const { server1, server2, server3, server4, server5, server6, server7, server8, server9, server10 } = req.body;
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
   const server1Url = `https://steam-market1.herokuapp.com/skins/update?start=${server1.start}&end=${server1.end}`;
   const server2Url = `https://steam-market2.herokuapp.com/skins/update?start=${server2.start}&end=${server2.end}`;
   const server3Url = `https://steam-market3.herokuapp.com/skins/update?start=${server3.start}&end=${server3.end}`;
   const server4Url = `https://steam-market4.herokuapp.com/skins/update?start=${server4.start}&end=${server4.end}`;
   const server5Url = `https://steam-market5.herokuapp.com/skins/update?start=${server5.start}&end=${server5.end}`;
   const server6Url = `https://steam-market6.herokuapp.com/skins/update?start=${server6.start}&end=${server6.end}`;
   const server7Url = `https://steam-market7.herokuapp.com/skins/update?start=${server7.start}&end=${server7.end}`;
   const server8Url = `https://steam-market8.herokuapp.com/skins/update?start=${server8.start}&end=${server8.end}`;
   const server9Url = `https://steam-market9.herokuapp.com/skins/update?start=${server9.start}&end=${server9.end}`;
   const server10Url = `https://steam-market10.herokuapp.com/skins/update?start=${server10.start}&end=${server10.end}`;

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
   const { ratio = '4-6' } = req.query;
   let amount1 = Number(ratio[0]);
   let amount2 = Number(ratio[2]);
   if (amount1 < 1 || amount1 > 9 || amount2 < 1 || amount2 > 9) {
      amount1 = 4;
      amount2 = 6;
   }
   // let x;

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

   // PRZESZUKIWANIE W STOSUNKU RATIO (SKINS COOPERATIVESKIN)
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
                                    const avg = Math.round(((amount1 * skinAvgFloat + amount2 * cooperativeSkinAvgFloat) / 10) * 1000) / 1000;
                                    const price = skin.prices[quality];
                                    const cooperativePrice = cooperativeSkin.prices[cooperativeQuality];

                                    let targetedSkinsArr = [];
                                    let targetedSkinsNumber = 0;
                                    let total = 0;
                                    let targetedSkinsQuality = []

                                    // SKIN Z ILOSCIĄ RÓWNĄ AMOUNT1
                                    let collName = skin.case;

                                    // COOPERATYWNY SKIN (DOPEŁNIENIOWY) Z ILOSCIĄ RÓWNĄ AMOUNT2
                                    let coopCollName = cooperativeSkin.case;


                                    for (let targetedCollection of collections) {
                                       if (targetedCollection.name == collName || targetedCollection.name == coopCollName) {
                                          for (let targetedSkin of targetedCollection.skins[rarities[r + 1]]) {

                                             const { min_float, max_float } = targetedSkin;
                                             const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                             const targetedQuality = checkQuality(float);

                                             const targetedPrice = Math.round((targetedSkin.prices[targetedQuality] * steamTax) * 100) / 100;
                                             targetedSkin.price = targetedPrice;

                                             if (targetedCollection.name == collName) {

                                                total += targetedPrice * amount1;
                                                targetedSkinsNumber += 1 * amount1;
                                             } else if (targetedCollection.name == coopCollName) {
                                                total += targetedPrice * amount2;
                                                targetedSkinsNumber += 1 * amount2;
                                             }

                                             targetedSkinsQuality.push(targetedQuality);
                                             targetedSkinsArr.push(targetedSkin);
                                             counter += 1;
                                          }
                                       }
                                    }





                                    let trades = [];
                                    let addToArr = false;

                                    for (let targetedSkin of targetedSkinsArr) {

                                       const inputPrice = Math.round((amount1 * price + amount2 * cooperativePrice) * 100) / 100;
                                       if (inputPrice < targetedSkin.price) {
                                          // const chance = Math.round(1 / targetedSkinsNumber * 100);
                                          const { min_float, max_float } = targetedSkin;
                                          const float = Math.round(((max_float - min_float) * avg + min_float) * 1000) / 1000;
                                          const targetedQuality = checkQuality(float);
                                          // const avgLossPrice = (total - targetedPrice) / (targetedSkinsArr - 1);
                                          // const profitability = Math.round(((inputPrice - targetedPrice) * chance / 100 - (inputPrice - avgLossPrice) * (100 - chance) / 100) * 100) / 100;
                                          // const profitability = Math.round((inputPrice - (total / targetedSkinsNumber)) * 100) / 100;
                                          const avgPrice = total / targetedSkinsNumber;
                                          const profitability = Math.round((avgPrice - inputPrice) * 100) / 100;
                                          const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;

                                          // if (skin.skin == 'Buddy' && cooperativeSkin.skin == 'Apocalypto' && quality == 'Factory New' && cooperativeQuality == 'Minimal Wear') {
                                          //    x = {
                                          //       skin,
                                          //       cooperativeSkin,
                                          //       targetedSkin,
                                          //       quality,
                                          //       cooperativeQuality,
                                          //       targetedQuality,
                                          //       price,
                                          //       cooperativePrice,
                                          //       inputPrice,
                                          //       targetedPrice: targetedSkin.price,
                                          //       rarity: rarities[r],
                                          //       targetedSkinsArr,
                                          //       targetedSkinsQuality,
                                          //       // chance,
                                          //       profitability,
                                          //       returnPercentage,
                                          //    }
                                          // }

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
                                                // chance,
                                                profitability,
                                                returnPercentage,
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

                                       if (profits.length <= 2) {
                                          profits.push(pom2);
                                       } else {
                                          let correctPosition = false;
                                          let i = 0;

                                          while (!correctPosition && i <= profits.length - 1) {

                                             if (pom2.trades[0].returnPercentage > profits[i].trades[0].returnPercentage) {
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

   // for (let profit of profits) {
   //    console.log(profit.trades[0].returnPercentage)
   // }
   // console.log(x)
   let counterOpt = counter.toLocaleString()
   let positiveResults = profits.length.toLocaleString();

   console.log(counter, positiveResults)
   res.render('trades/mixed', { profits, counterOpt, positiveResults, amount: { amount1, amount2 } })
}