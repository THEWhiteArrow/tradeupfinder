const { getData, convert } = require('../utils/functions');
const { checkQuality, findCheapestSkin, getPriceAndVolume } = require('../utils/functions');
const { qualities, rarities, avg_floats } = require('../utils/variables');
const ExpressError = require('../utils/ExpressError');
const fetch = require('node-fetch');

const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');
const Research = require('../models/researchModel');
const Name = require('../models/nameModel');
const Trade = require('../models/tradeModel');
const Favourite = require('../models/favouriteModel');
const User = require('../models/userModel');
const e = require('express');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const maxShownSkins = 200;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';
const updatingDaysSpan = 2;

module.exports.showIndex = async (req, res, next) => {
   // console.log(req.user)
   const researchesName = await Name.find({});
   // res.cookie('testtoken', 'lol');
   // res.cookie('testtoken', { amount1: 4, amount2: 6 });
   // console.log(JSON.parse(req.cookies.testtoken))
   // res.clearCookie("testtoken");
   // console.log(req.cookies.testtoken)

   req.flash('info', `Dla Twojej wygody wyświetlone zostało niewięcej niż ${maxShownSkins} możliwych kontraktów`);
   // console.log(req.session)
   res.render('index', { researchesName });
};

module.exports.showSkinsDb = async (req, res) => {
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   res.render('skins', { collections, qualities, rarities });
}

module.exports.checkEmptyPrices = async (req, res) => {
   const emptySkins = [];

   const skins = await Skin.find({ $or: [{ "prices.Factory New": 0 }, { "prices.Minimal Wear": 0 }, { "prices.Field-Tested": 0 }, { "prices.Well-Worn": 0 }, { "prices.Battle-Scarred": 0 }] })
   const stattrakSkins = await Skin.find({ isInStattrak: true, $or: [{ "stattrakPrices.Factory New": 0 }, { "stattrakPrices.Minimal Wear": 0 }, { "stattrakPrices.Field-Tested": 0 }, { "stattrakPrices.Well-Worn": 0 }, { "stattrakPrices.Battle-Scarred": 0 }] })

   for (let skin of skins) {
      emptySkins.push({ name: skin.name, skin: skin.skin, case: skin.case })
   }
   for (let skin of stattrakSkins) {
      emptySkins.push({ name: skin.name, skin: skin.skin, case: skin.case })
   }

   res.locals.emptySkins = emptySkins;
   const err = {
      message: 'Some of skins have invalid prices',
      statusCode: 500
   }

   res.render('error', { err, emptySkins })
}


module.exports.updatePrices = async (req, res, next) => {
   //does not supprot steam's volumes
   const { start = 0, end = length, variant = 'backpack', stattrak = '0' } = req.query;
   const skins = await Skin.find({});


   let count = 0, length = 0;
   let reqNumber = 0;

   for (let item of skins) {
      count += 1;

      if (count >= start && count <= end) {
         console.log(`${count} / ${end} - ${item.name} | ${item.skin} - ${reqNumber}`);

         const updatedPrices = {};
         const updatedStattrakPrices = {};

         const updatedVolumes = {};
         const updatedStattrakVolumes = {};


         const { name, skin, _id } = item;
         // const volume = [updatingDaysSpan];

         for (let quality of qualities) {

            if (item.prices[quality] !== -1) {

               let baseUrl;
               variant == 'steam' ? baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=' : baseUrl = `http://csgobackpack.net/api/GetItemPrice/?currency=PLN&time=${updatingDaysSpan}&id=`;
               const url = `${baseUrl}${name} | ${skin} (${quality})`;
               const encodedUrl = encodeURI(url);

               let data;
               variant == 'steam' ? data = await getData(encodedUrl, 3200) : data = await getData(encodedUrl, 500);
               reqNumber += 1;

               const { newPrice, newVolume } = await getPriceAndVolume(data, variant, url, convert, getData);

               updatedPrices[quality] = newPrice;
               updatedVolumes[quality] = Math.round(newVolume / updatingDaysSpan);

               if (updatedPrices[quality].statusCode && updatedPrices[quality].statusCode === 429) { return next(updatedPrices[quality]) }
            } else {
               updatedPrices[quality] = -1;
            }

            if (stattrak && item.isInStattrak) {
               if (item.stattrakPrices[quality] !== -1) {

                  let baseUrl;
                  variant == 'steam' ? baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=StatTrak™ ' : baseUrl = 'http://csgobackpack.net/api/GetItemPrice/?currency=PLN&time=2&id=StatTrak™ ';
                  const url = `${baseUrl}${name} | ${skin} (${quality})`;
                  const encodedUrl = encodeURI(url);

                  let data;
                  variant == 'steam' ? data = await getData(encodedUrl, 3200) : data = await getData(encodedUrl, 500);
                  reqNumber += 1;

                  const { newPrice, newVolume } = await getPriceAndVolume(data, variant, url, convert, getData);

                  updatedStattrakPrices[quality] = newPrice;
                  updatedStattrakVolumes[quality] = Math.round(newVolume / updatingDaysSpan);


                  if (updatedStattrakPrices[quality].statusCode && updatedStattrakPrices[quality].statusCode === 429) { return next(updatedStattrakPrices[quality]) }
                  console.log(`------------ StatTrak™ ${item.name} | ${item.skin} - ${quality}`);
               } else {
                  updatedStattrakPrices[quality] = -1;
               }
            }

         }



         if (stattrak) {
            const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, stattrakPrices: updatedStattrakPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes }, { new: true });
         } else {
            const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices, volumes: updatedVolumes, stattrakVolumes: updatedStattrakVolumes }, { new: true });
         }

      }


   }

   console.log('updating finished!')
   res.redirect('/skins');
};

module.exports.updateSkinPrice = async (req, res) => {
   const { id } = req.params;
   const { prices, stattrakPrices } = req.body;

   let updatedSkin;
   if (stattrakPrices != undefined) {
      updatedSkin = await Skin.findByIdAndUpdate(id, { prices, stattrakPrices }, { new: true });
   } else {
      updatedSkin = await Skin.findByIdAndUpdate(id, { prices }, { new: true });
   }

   req.flash('success', `${updatedSkin.name} ${updatedSkin.skin}'s prices successfully updated`);
   res.redirect('/skins/show-database');
}

module.exports.useServers = async (req, res) => {
   const { server1, server2, server3, server4, server5, server6, server7, server8, server9, server10, variant = 'backpack', stattrak = '0' } = req.body;
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
   console.log(variant)
   console.log(stattrak)

   const server1Url = `https://steam-market1.herokuapp.com/skins/update?start=${server1.start}&end=${server1.end}&variant=${variant}&stattrak=${stattrak}`;
   const server2Url = `https://steam-market2.herokuapp.com/skins/update?start=${server2.start}&end=${server2.end}&variant=${variant}&stattrak=${stattrak}`;
   const server3Url = `https://steam-market3.herokuapp.com/skins/update?start=${server3.start}&end=${server3.end}&variant=${variant}&stattrak=${stattrak}`;
   const server4Url = `https://steam-market4.herokuapp.com/skins/update?start=${server4.start}&end=${server4.end}&variant=${variant}&stattrak=${stattrak}`;
   const server5Url = `https://steam-market5.herokuapp.com/skins/update?start=${server5.start}&end=${server5.end}&variant=${variant}&stattrak=${stattrak}`;
   const server6Url = `https://steam-market6.herokuapp.com/skins/update?start=${server6.start}&end=${server6.end}&variant=${variant}&stattrak=${stattrak}`;
   const server7Url = `https://steam-market7.herokuapp.com/skins/update?start=${server7.start}&end=${server7.end}&variant=${variant}&stattrak=${stattrak}`;
   const server8Url = `https://steam-market8.herokuapp.com/skins/update?start=${server8.start}&end=${server8.end}&variant=${variant}&stattrak=${stattrak}`;
   const server9Url = `https://steam-market9.herokuapp.com/skins/update?start=${server9.start}&end=${server9.end}&variant=${variant}&stattrak=${stattrak}`;
   const server10Url = `https://steam-market10.herokuapp.com/skins/update?start=${server10.start}&end=${server10.end}&variant=${variant}&stattrak=${stattrak}`;

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



module.exports.deleteSavedTrades = async (req, res) => {
   // await Research.deleteMany({});

   await Name.deleteMany({});
   await Trade.deleteMany({})
   req.flash('success', 'Successfully deleted all trades');
   res.redirect('/skins');
}

// NOT CURRENTLY USED
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

module.exports.mixedAlgorithm = async (req, res) => {
   let { action = 'nothing', researchName = 'noname', newResearchName = 'noname', pairs = 2, checkStats = 'no', sort = 'returnPercentage', order = 'descending' } = req.query;
   if (action != 'nothing' && action != 'save' && action != 'display') {
      action = 'nothing';
   }
   console.log(req.query)

   if (action == 'display') {
      // const savedResearch = await Research.findOne({ name: researchName })
      // if (checkStats == 'yes') {
      //    const { profits, counterOpt, positiveResults, amount, priceCorrection } = await recheckResearchStats(savedResearch);
      //    res.render('trades/mixed', { profits, counterOpt, positiveResults, amount, maxShownSkins, steamBaseUrl, avg_floats, priceCorrection });
      // } else {
      //    const { profits, counterOpt, positiveResults, amount, priceCorrection } = savedResearch;
      //    res.render('trades/mixed', { profits, counterOpt, positiveResults, amount, maxShownSkins, steamBaseUrl, avg_floats, priceCorrection });
      // }

      const trades = await Trade.find({ name: researchName });

      const sortedTrades = sortingTrades(trades, sort, order).slice(0, maxShownSkins);
      res.render('trades/mixed', { profits: sortedTrades, maxShownSkins, steamBaseUrl, action })

   } else {

      const current = new Date();
      const hour = current.getHours();
      const minute = current.getMinutes();
      if (pairs == 2) {
         // const { profits, counterOpt, positiveResults, amount, priceCorrection } = await mixedTwoPairs(req);


         const trades = await mixedTwoPairs(req);
         // const trades = await Trade.find({});

         const sortedTrades = sortingTrades(trades, sort, order);



         checkTime(current, hour, minute);
         // action == 'save' ? saveResearch(Research, profits, counterOpt, positiveResults, amount, newResearchName, priceCorrection) : null;

         res.render('trades/mixed', { profits: sortedTrades, maxShownSkins, steamBaseUrl, action })

      } else if (pairs == 3) {
         // const { profits, counterOpt, positiveResults, amount, priceCorrection } = await mixedThreePairs(req);

         // checkTime(current, hour, minute);
         // action == 'save' ? saveResearch(Research, profits, counterOpt, positiveResults, amount, newResearchName, priceCorrection) : null;

         // res.render('trades/mixed', { profits, counterOpt, positiveResults, amount, maxShownSkins, steamBaseUrl, priceCorrection })
         res.redirect('/skins')
      }
   }
}

module.exports.displayFavouriteTrades = async (req, res) => {
   const { user } = req;

   const foundUser = await User.findById(user._id).populate('favourites')

   let favourites;
   // if (foundUser.role != 'admin') {
   favourites = foundUser.favourites;
   // } else {
   //    const Allfavourites = await Favourite.find({})
   //    favourites = Allfavourites;
   // }


   const sortedFavourites = sortingTrades(favourites, 'returnPercentage', 'descending');

   res.render('trades/favourites', { favourites: sortedFavourites, maxShownSkins, steamBaseUrl })
}

module.exports.recheckFavouriteStats = async (req, res) => {
   // console.log('checking')
   // console.log(req.body)
   const { firstPrice, secondPrice } = req.body;
   const { tradeId } = req.params;
   try {
      const favouriteTrade = await Favourite.findById(tradeId);
      const { amount, instance } = favouriteTrade;
      const { targetedSkinsNumber, trade } = instance;
      // console.log(favouriteTrade.instance.total)
      const { firstSkin, secondSkin, targetedSkin } = trade;
      const firstCollection = firstSkin.case;
      const secondCollection = secondSkin.case;

      let total = 0;
      let targetedPrice;



      for (let i = 0; i < trade.targetedSkinsArr.length; i++) {
         let newPrice = Math.round(req.body[trade.targetedSkinsArr[i]._id] * steamTax * 100) / 100;
         console.log(newPrice)
         trade.targetedSkinsArr[i].price = newPrice;

         if (targetedSkin.skin == trade.targetedSkinsArr[i].skin && targetedSkin.name == trade.targetedSkinsArr[i].name) {
            targetedPrice = newPrice;
         }


         if (trade.targetedSkinsArr[i].case == firstCollection && trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * 10);
         } else if (trade.targetedSkinsArr[i].case == firstCollection) {
            total += (newPrice * Number(amount.amount1));
         } else if (trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * Number(amount.amount2));
         }

      }

      console.log(targetedPrice)
      let wantedOutputChance = 0;
      const inputPrice = Math.round((amount.amount1 * firstPrice + amount.amount2 * secondPrice) * 100) / 100;


      for (let outputSkin of trade.targetedSkinsArr) {
         if (inputPrice <= outputSkin.price) {
            wantedOutputChance += outputSkin.amount;
         }
         // console.log(outputSkin.price, outputSkin.amount)
      }

      const avgPrice = total / targetedSkinsNumber;
      const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
      const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;
      // ALSO WE HAVE wantedOutputChance
      // console.log('-------checked')

      instance.total = total;
      instance.wantedOutputChance = wantedOutputChance;
      instance.trade.firstPrice = firstPrice;
      instance.trade.secondPrice = secondPrice;
      instance.trade.targetedPrice = targetedPrice;
      instance.trade.inputPrice = inputPrice;
      instance.trade.profitPerTradeUp = profitPerTradeUp;
      instance.trade.returnPercentage = returnPercentage;
      instance.trade.targetedSkinsArr = trade.targetedSkinsArr;

      const updatedFavourite = await Favourite.findByIdAndUpdate(tradeId, { instance }, { new: true });

      const feedback = {
         success: true,
         inputPrice,
         profitPerTradeUp,
         returnPercentage,
         wantedOutputChance,
         targetedSkinsNumber,
         firstPrice,
         secondPrice,
         targetedPrice
      };
      res.json(feedback);
   } catch (e) {
      // console.log('-------failed')
      console.log(e)

      const feedback = { success: false };
      res.json(feedback);
   }
}



const mixedTwoPairs = async (req) => {
   const { ratio = '4-6', sliceStart = 0, sliceEnd = 10, sort = 'returnPercentage', newResearchName = 'noname', action = 'nothing', stattrak = 'no', minVolume = 100 } = req.query;

   // CONVERTS PRICE CORRECTION
   let { priceCorrection = 0 } = req.query;
   priceCorrection = Number(priceCorrection.replace(',', '.'));

   // SETS TYPE OF ALGORITHM - NORMAL AND STATTRAK
   let pricesType, volumesType;
   switch (stattrak) {
      case 'no':
         pricesType = 'prices';
         volumesType = 'volumes';
         break;
      case 'yes':
         pricesType = 'stattrakPrices';
         volumesType = 'stattrakVolumes';
         break;
      default:
         pricesType = 'prices';
         volumesType = 'volumes';
         break;
   }

   // SETS SKINS RATIO
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

                        const firstSkin = findCheapestSkin(firstCollection, rarities[r], firstQuality, pricesType, volumesType, minVolume);
                        const secondSkin = findCheapestSkin(secondCollection, rarities[r], secondQuality, pricesType, volumesType, minVolume);

                        if (firstSkin != null && secondSkin != null) {

                           let firstSkinAvgFloat = avg_floats[firstQuality];
                           let secondSkinAvgFloat = avg_floats[secondQuality];
                           if (firstSkinAvgFloat > firstSkin.max_float) firstSkinAvgFloat = firstSkin.max_float;
                           if (firstSkinAvgFloat < firstSkin.min_float) firstSkinAvgFloat = firstSkin.min_float;
                           if (secondSkinAvgFloat > secondSkin.max_float) secondSkinAvgFloat = secondSkin.max_float;
                           if (secondSkinAvgFloat < secondSkin.min_float) secondSkinAvgFloat = secondSkin.min_float;

                           // MANUAL FLOATS CORRECTION
                           // ######################################################################################################
                           if (firstSkin.skin == 'Bone Forged' && firstQuality == 'Factory New') firstSkinAvgFloat = 0.053;
                           if (secondSkin.skin == 'Bone Forged' && secondQuality == 'Factory New') secondSkinAvgFloat = 0.053;
                           if (firstSkin.skin == "Ol' Rusty" && firstQuality == "Factory New") firstSkinAvgFloat = 0.053;
                           if (secondSkin.skin == "Ol' Rusty" && secondQuality == "Factory New") secondSkinAvgFloat = 0.053;
                           if (firstSkin.skin == "Prototype" && firstQuality == "Factory New") firstSkinAvgFloat = 0.053;
                           if (secondSkin.skin == "Prototype" && secondQuality == "Factory New") secondSkinAvgFloat = 0.053;
                           // ######################################################################################################

                           const avg = Math.round(((amount1 * firstSkinAvgFloat + amount2 * secondSkinAvgFloat) / 10) * 1000) / 1000;
                           const firstPrice = firstSkin[pricesType][firstQuality] + priceCorrection;
                           const secondPrice = secondSkin[pricesType][secondQuality] + priceCorrection;
                           const inputPrice = Math.round((amount1 * firstPrice + amount2 * secondPrice) * 100) / 100;

                           let wantedOutputChance = 0;

                           let targetedSkinsArr = [];
                           let alternateInputSkins = [];
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

                                    const targetedPrice = Math.round((targetedSkin[pricesType][targetedQuality] * steamTax) * 100) / 100;

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

                                    const targetedSkinPom = {
                                       _id: targetedSkin._id,
                                       name: targetedSkin.name,
                                       skin: targetedSkin.skin,
                                       prices: targetedSkin[pricesType],
                                       min_float: targetedSkin.min_float,
                                       max_float: targetedSkin.max_float,
                                       rarity: targetedSkin.rarity,
                                       price: targetedPrice,
                                       float,
                                       case: targetedSkin.case,
                                       quality: targetedQuality,
                                    }
                                    if (pricesType == 'prices') {
                                       targetedSkinPom.url = encodeURI(`${steamBaseUrl}${targetedSkinPom.name} | ${targetedSkinPom.skin} (${targetedSkinPom.quality})`);
                                    } else if (pricesType == 'stattrakPrices') {
                                       targetedSkinPom.url = encodeURI(`${steamBaseUrl}StatTrak™ ${targetedSkinPom.name} | ${targetedSkinPom.skin} (${targetedSkinPom.quality})`);
                                    }



                                    if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case) {
                                       total += (targetedPrice * (amount1 + amount2));
                                       targetedSkinsNumber += (1 * (amount1 + amount2));
                                       inputPrice <= targetedPrice ? wantedOutputChance += (amount1 + amount2) : null;
                                       targetedSkinPom.amount = amount1 + amount2;

                                    } else if (targetedCollection.name == firstSkin.case) {
                                       total += (targetedPrice * amount1);
                                       targetedSkinsNumber += (1 * amount1);
                                       inputPrice <= targetedPrice ? wantedOutputChance += (amount1) : null;
                                       targetedSkinPom.amount = amount1;

                                    } else if (targetedCollection.name == secondSkin.case) {
                                       total += (targetedPrice * amount2);
                                       targetedSkinsNumber += (1 * amount2);
                                       inputPrice <= targetedPrice ? wantedOutputChance += (amount2) : null;
                                       targetedSkinPom.amount = amount2;
                                    }


                                    targetedSkinsQuality.push(targetedQuality);
                                    targetedSkinsArr.push(targetedSkinPom);
                                    counter += 1;
                                 }

                                 for (let alternateSkin of targetedCollection.skins[rarities[r]]) {

                                    if ((alternateSkin.case == firstSkin.case && alternateSkin.prices[firstQuality] > 0) || (alternateSkin.case == secondSkin.case && alternateSkin.prices[secondQuality] > 0)) {
                                       let alternateQuality;
                                       const alternate = {
                                          name: alternateSkin.name,
                                          skin: alternateSkin.skin,
                                          // url: encodeURI(`${alternateUrl}${alternateSkin.name}+${alternateSkin.skin}`),
                                          collectionName: alternateSkin.case
                                       }
                                       alternateSkin.case == firstSkin.case ? alternateQuality = firstQuality : alternateQuality = secondQuality;
                                       alternate.quality = alternateQuality;
                                       alternate.price = Math.round((alternateSkin[pricesType][alternateQuality] + priceCorrection) * 100) / 100;
                                       if (pricesType == 'prices') {
                                          alternate.url = encodeURI(`${steamBaseUrl}${alternate.name} | ${alternate.skin} (${alternateQuality})`);
                                       } else {
                                          alternate.url = encodeURI(`${steamBaseUrl}StatTrak™ ${alternate.name} | ${alternate.skin} (${alternateQuality})`);
                                       }

                                       alternateInputSkins.push(alternate);
                                    }
                                    counter += 1;
                                 }
                              }
                           }



                           const avgPrice = total / targetedSkinsNumber;
                           const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
                           const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;

                           if (profitPerTradeUp > 0 && inputPrice < 100) {
                              const trade = {
                                 firstSkin,
                                 secondSkin,
                                 targetedSkin: maxSkin,

                                 firstQuality,
                                 secondQuality,
                                 targetedQuality: maxSkin.targetedQuality,

                                 firstPrice,
                                 secondPrice,
                                 inputPrice,
                                 targetedPrice: maxSkin.price,

                                 firstSkinAvgFloat,
                                 secondSkinAvgFloat,
                                 targetedSkinFloat: maxSkin.float,

                                 rarity: rarities[r],
                                 targetedRarity: rarities[r + 1],

                                 targetedSkinsArr,
                                 targetedSkinsQuality,
                                 alternateInputSkins,
                                 // chance,
                                 profitPerTradeUp,
                                 returnPercentage,
                              }

                              if (pricesType === 'stattrakPrices') {
                                 trade.firstSkinUrl = encodeURI(`${steamBaseUrl}StatTrak™ ${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`);
                                 trade.secondSkinUrl = encodeURI(`${steamBaseUrl}StatTrak™ ${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`);
                                 trade.targetedSkinUrl = encodeURI(`${steamBaseUrl}StatTrak™ ${maxSkin.name} | ${maxSkin.skin} (${maxSkin.targetedQuality})`);
                              } else if (pricesType === 'prices') {
                                 trade.firstSkinUrl = encodeURI(`${steamBaseUrl}${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`);
                                 trade.secondSkinUrl = encodeURI(`${steamBaseUrl}${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`);
                                 trade.targetedSkinUrl = encodeURI(`${steamBaseUrl}${maxSkin.name} | ${maxSkin.skin} (${maxSkin.targetedQuality})`);
                              }

                              const pom2 = {
                                 trade,
                                 avg,
                                 total,
                                 targetedSkinsNumber,
                                 wantedOutputChance
                              }

                              const newTrade = new Trade({
                                 amount: { amount1, amount2 },
                                 priceCorrection,
                                 name: newResearchName,
                                 instance: pom2,
                                 pricesType,
                              })
                              if (action === 'save') {
                                 await newTrade.save();
                              }
                              profits.push(newTrade);

                              // profits = placeInCorrectOrder(profits, pom2, sort);
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
   if (action === 'save') {
      const newName = new Name({ name: newResearchName })
      await newName.save();
   }

   let counterOpt = counter.toLocaleString()
   let positiveResults = profits.length.toLocaleString();

   console.log(counter, positiveResults)
   return profits;
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
const sortingTrades = (trades, sort, order) => {

   if (order === 'descending') {

      for (let i = 0; i < trades.length; i++) {
         for (let j = 0; j < trades.length; j++) {
            if (trades[i].instance.trade[sort] > trades[j].instance.trade[sort]) {
               let temp = trades[i];
               trades[i] = trades[j];
               trades[j] = temp;
            }
         }
      }
   } else if (order === 'ascending') {
      for (let i = 0; i < trades.length; i++) {
         for (let j = 0; j < trades.length; j++) {
            if (trades[i].instance.trade[sort] < trades[j].instance.trade[sort]) {
               let temp = trades[i];
               trades[i] = trades[j];
               trades[j] = temp;
            }
         }
      }

   }
   return trades;
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

                                             if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case && targetedCollection.name == thirdSkin.case) {
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
   return { profits: profits.slice(0, 4250), counterOpt, positiveResults, amount: { amount1, amount2, amount3 } };
}
const recheckResearchStats = async (research) => {
   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

   const { counterOpt, positiveResults, amount, priceCorrection } = research;
   let { profits } = research;
   const { amount1, amount2, amount3 = -1 } = amount;

   for (let profit of profits) {
      // DEFINING OUTPUT HELPERS
      let firstPrice = 0, secondPrice = 0;
      let wantedOutputChance = 0;
      let total = 0;

      // DESTRUCTING VARIABLES
      const { targetedSkinsNumber } = profit;
      const { firstSkin, secondSkin, firstQuality, secondQuality, rarity, targetedRarity } = profit.trade;
      let { targetedSkinsArr, targetedSkinsQuality } = profit.trade;
      let checkedFirstSkin = false, checkedSecondSkin = false, checkedTargetedSkin = false;

      // MERGING NEW PRICES
      for (let collection of collections) {
         if (collection.name == firstSkin.case || collection.name == secondSkin.case) {

            // UPDATING INPUT SKINS
            for (let skin of collection.skins[rarity]) {
               if (firstSkin.name == skin.name && firstSkin.skin == skin.skin && collection.name == firstSkin.case && !checkedFirstSkin) {
                  firstPrice = skin.prices[firstQuality] + priceCorrection;
                  checkedFirstSkin = true;
               }
               if (secondSkin.name == skin.name && secondSkin.skin == skin.skin && collection.name == secondSkin.case && !checkedSecondSkin) {
                  secondPrice = skin.prices[secondQuality] + priceCorrection;
                  checkedSecondSkin = true;
               }
            }

            // UPDATING TARGETED SKINS
            for (let skin of collection.skins[targetedRarity]) {
               for (let i = 0; i < targetedSkinsArr.length; i++) {

                  if (skin.name == targetedSkinsArr[i].name && skin.skin == targetedSkinsArr[i].skin && targetedSkinsArr[i].checked == undefined) {
                     targetedSkinsArr[i].price = skin.prices[targetedSkinsQuality[i]];
                     targetedSkinsArr[i].checked = true;
                  }
               }

               // if (targetedSkin.name == skin.name && targetedSkin.skin == skin.skin && !checkedTargetedSkin) {
               //    targetedPrice = skin.prices[targetedQuality];
               //    checkedTargetedSkin = true;
               // }

            }

         }
      }

      const inputPrice = Math.round((amount1 * firstPrice + amount2 * secondPrice) * 100) / 100;
      let maxSkin = {};
      let max = 0;

      for (let output of targetedSkinsArr) {
         let outputPrice = Math.round(output.price * steamTax * 100) / 100;

         if (max < outputPrice) {
            max = outputPrice;
            maxSkin = {
               _id: output._id,
               name: output.name,
               skin: output.skin,
               case: output.case,
               rarity: output.rarity,
               min_float: output.min_float,
               max_float: output.max_float,
               float: output.float,
               price: outputPrice,
               targetedQuality: output.quality,
            }
         }

         if (output.case == firstSkin.case && output.case == secondSkin.case) {
            total += ((amount1 + amount2) * outputPrice);
            outputPrice > inputPrice ? wantedOutputChance += (amount1 + amount2) : null;

         } else if (output.case == firstSkin.case) {
            total += (amount1 * outputPrice);
            outputPrice > inputPrice ? wantedOutputChance += (amount1) : null;

         } else if (output.case == secondSkin.case) {
            total += (amount2 * outputPrice);
            outputPrice > inputPrice ? wantedOutputChance += (amount2) : null;
         }
      }

      const avgPrice = total / targetedSkinsNumber;
      const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 1000) / 1000;
      const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 1000) / 1000;



      profit.wantedOutputChance = wantedOutputChance;
      profit.total = total;

      profit.trade.targetedSkin = maxSkin;
      profit.trade.targetedSkinUrl = encodeURI(`${steamBaseUrl}${maxSkin.name} | ${maxSkin.skin} (${maxSkin.targetedQuality})`);
      profit.trade.targetedSkinFloat = maxSkin.float;
      profit.trade.targetedQuality = maxSkin.targetedQuality;

      profit.trade.firstPrice = firstPrice;
      profit.trade.secondPrice = secondPrice;
      profit.trade.targetedPrice = maxSkin.price;
      profit.trade.inputPrice = inputPrice;

      profit.trade.targetedSkinsArr = targetedSkinsArr;

      profit.trade.profitPerTradeUp = profitPerTradeUp;
      profit.trade.returnPercentage = returnPercentage;

   }

   return { profits, counterOpt, positiveResults, amount, priceCorrection }
}
const saveResearch = async (Research, profits, counterOpt, positiveResults, amount, newResearchName, priceCorrection) => {
   const newResearch = new Research({ profits, counterOpt, positiveResults, amount, name: newResearchName, priceCorrection });
   await newResearch.save();

   const newName = new Name({ name: newResearchName })
   await newName.save();

   console.log(`Research of "${newResearchName}" saved!!!`)
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