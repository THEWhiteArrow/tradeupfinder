const { checkQuality, findCheapestSkin, mergeSort, recheckTrade, isEmpty } = require('../utils/functions');
const { qualities, rarities, avg_floats } = require('../utils/variables');
const fetch = require('node-fetch');

const Case = require('../models/caseModel');
const Name = require('../models/nameModel');
const Trade = require('../models/tradeModel');
const Highlight = require('../models/highlightModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const maxShownTrades = 200;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';


module.exports.manageTrades = async (req, res) => {
   let { action = 'nothing', researchName = 'noname', pairs = 2, sort = 'returnPercentage', order = 'descending', q = null } = req.query;
   if (action != 'nothing' && action != 'save' && action != 'display') {
      action = 'nothing';
   }
   console.log(req.query)




   if (q == 'random') {
      const trades = await Trade.aggregate([{ $sample: { size: 1 } }])
      if (trades.length != 0) {

         console.log(trades)
         req.flash('success', 'Enjoy your lucky trade!');
         return res.redirect(`/trades/${trades[0]._id}`);

      } else {

         req.flash('error', 'Currently no trades avaible!');
         return res.redirect(`/explore`);
      }
   }



   if (action == 'display') {

      var startDate = new Date();
      // Do your operations
      const trades = await Trade.find({ name: researchName });
      // const sortedTrades = sortingTrades(trades, sort, order).slice(0, maxShownTrades:res.locals.maxShownTrades);
      const sortedTrades = mergeSort(trades, sort, order).slice(0, res.locals.maxShownTrades);

      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
      console.log(seconds)
      res.render('trades/index', { profitableTrades: sortedTrades, maxShownTrades: res.locals.maxShownTrades, steamBaseUrl, action })

   } else {


      if (pairs == 2) {

         // TUTAJ BEDZIE COS TRZEBA ZROBIC JESLI UZYTKOWNIK NA STRONIE WPROWADZI NOTHING JAKO ACTION
         if ((process.env.SERVER != 'local' && action == 'save')) {
            const { query } = req;
            console.log(query)
            const resposne = fetch('https://steam-market2.herokuapp.com/trades/mixed-algorithm', {
               method: 'POST',
               body: JSON.stringify(query),
               headers: {
                  'auth-token': process.env.HEADERS_TOKEN,
                  'content-type': 'application/json',
               }
            })

            req.flash('success', 'New Trades are being cooked for you! ESTIMATED TIME : 3 minutes')
            res.redirect('/explore')
         } else {


            const trades = await mixedTwoPairs(req);
            const sortedTrades = mergeSort(trades, sort, order).slice(0, res.locals.maxShownTrades);

            res.render('trades/index', { profitableTrades: sortedTrades, maxShownTrades: res.locals.maxShownTrades, steamBaseUrl, action })
         }

      } else if (pairs == 3) {
         req.flash('error', `Portójne wyszukiwanie obecnie niedostępne! Braki w zasobach ludzkich!`);
         res.redirect('/explore')
      }
   }
}

module.exports.customSearch = async (req, res) => {
   const arr = [
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '5-5',
         checkStattraks: 'no',
         newResearchName: 'd55-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '4-6',
         checkStattraks: 'no',
         newResearchName: 'd46-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '3-7',
         checkStattraks: 'no',
         newResearchName: 'd37-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '2-8',
         checkStattraks: 'no',
         newResearchName: 'd28-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '1-9',
         checkStattraks: 'no',
         newResearchName: 'd19-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },


      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '5-5',
         checkStattraks: 'yes',
         newResearchName: 'Stattrak_d55-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '4-6',
         checkStattraks: 'yes',
         newResearchName: 'Stattrak_d46-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '3-7',
         checkStattraks: 'yes',
         newResearchName: 'Stattrak_d37-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '2-8',
         checkStattraks: 'yes',
         newResearchName: 'Stattrak_d28-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
      {
         order: 'descending',
         sort: 'returnPercentage',
         action: 'save',
         ratio: '1-9',
         checkStattraks: 'yes',
         newResearchName: 'Stattrak_d19-v75-c0',
         priceCorrection: '0',
         minVolume: '75',
         pairs: '2',
         researchName: ''
      },
   ];

   if (process.env.SERVER != 'local') {
      const resposne = fetch('https://steam-market2.herokuapp.com/trades/custom-search', {
         method: 'POST',
         body: JSON.stringify({ arr }),
         headers: {
            'auth-token': process.env.HEADERS_TOKEN,
            'content-type': 'application/json',
         }
      })

      req.flash('success', `New Trades are being cooked for you! ESTIMATED TIME : ${2.5 * arr.length} minutes`)
      res.redirect('/explore')
   } else {



      var startDate = new Date();

      for (let el of arr) {
         await mixedTwoPairs({ query: el })
      }

      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

      console.log('Researched the whole array successfully!', seconds)

      req.flash('success', `The custom search conducted successfully! TIME : ${seconds} seconds`);
      res.redirect('/explore');
   }
}

module.exports.showTrade = async (req, res) => {
   const { tradeId } = req.params;
   const profit = await Trade.findOne({ _id: tradeId })
   res.render('trades/show', { profit })
}



module.exports.recheckStats = async (req, res) => {

   if (!isEmpty(req.body)) {
      const feedback = await recheckTrade(req, res, steamTax, Trade, 'Trade', Highlight)
      res.json(feedback);
   } else {
      res.json({ success: false });
   }

}

module.exports.updateCurrentTradesByOuterServer = async (req, res) => {

   // const response = fetch('http://localhost:8080/trades/update-current', {
   const response = fetch('https://steam-market2.herokuapp.com/trades/update-current', {
      method: 'GET',
      headers: {
         'auth-token': process.env.HEADERS_TOKEN
      }
   })

   const trades = await Trade.find({});
   const numberOfTrades = trades.length;
   const estimatedTime = Math.round(numberOfTrades / 5 * 100) / 100;

   req.flash('success', `Current trades are being refreshed! ESTIMATED TIME : ${estimatedTime} seconds`)
   res.redirect('/explore')

}

module.exports.deleteSavedTrades = async (req, res) => {
   await Name.deleteMany({});
   await Trade.deleteMany({ isHighlighted: false, favourites: [] });

   const newLegacyTrades = await Trade.find({ name: { $ne: 'legacy' } })
   for (let trade of newLegacyTrades) {
      await Trade.findByIdAndUpdate(trade._id, { name: 'legacy' })
   }

   req.flash('success', 'Successfully deleted all trades');
   res.redirect('/explore');
}



const mixedTwoPairs = async (req) => {
   const { ratio = '4-6', newResearchName = 'noname', action = 'nothing', checkStattraks = 'no', minVolume = 100 } = req.query;
   // CONVERTS PRICE CORRECTION
   let { priceCorrection } = req.query;
   priceCorrection = Number(priceCorrection.replace(',', '.'))

   // SETS TYPE OF ALGORITHM - NORMAL AND STATTRAK
   let pricesType, volumesType;
   switch (checkStattraks) {
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

   console.log(amount1, amount2)

   let counter = 0;
   const profits = [];


   const collections = await Case.find({})
      .populate({ path: 'skins', populate: { path: 'grey', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'light_blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'blue', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'purple', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'pink', model: 'Skin' } })
      .populate({ path: 'skins', populate: { path: 'red', model: 'Skin' } });

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

                           const avg = Math.round(((amount1 * firstSkinAvgFloat + amount2 * secondSkinAvgFloat) / 10) * 10000) / 10000;
                           const firstPrice = firstSkin[pricesType][firstQuality] + priceCorrection;
                           const secondPrice = secondSkin[pricesType][secondQuality] + priceCorrection;
                           const inputPrice = Math.round((amount1 * firstPrice + amount2 * secondPrice) * 100) / 100;

                           // MANUAL FLOATS CORRECTION
                           // ######################################################################################################
                           // if (firstSkin.skin == 'Bone Forged' && firstQuality == 'Factory New') firstSkinAvgFloat = 0.053;
                           // if (secondSkin.skin == 'Bone Forged' && secondQuality == 'Factory New') secondSkinAvgFloat = 0.053;
                           // if (firstSkin.skin == "Ol' Rusty" && firstQuality == "Factory New") firstSkinAvgFloat = 0.053;
                           // if (secondSkin.skin == "Ol' Rusty" && secondQuality == "Factory New") secondSkinAvgFloat = 0.053;
                           // if (firstSkin.skin == "Prototype" && firstQuality == "Factory New") firstSkinAvgFloat = 0.053;
                           // if (secondSkin.skin == "Prototype" && secondQuality == "Factory New") secondSkinAvgFloat = 0.053;
                           // ######################################################################################################
                           let firstSkinLink = '';
                           let secondSkinLink = '';

                           if (pricesType === 'stattrakPrices') {
                              firstSkinLink = encodeURI(`${steamBaseUrl}StatTrak™ ${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`);
                              secondSkinLink = encodeURI(`${steamBaseUrl}StatTrak™ ${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`);
                           } else if (pricesType === 'prices') {
                              firstSkinLink = encodeURI(`${steamBaseUrl}${firstSkin.name} | ${firstSkin.skin} (${firstQuality})`);
                              secondSkinLink = encodeURI(`${steamBaseUrl}${secondSkin.name} | ${secondSkin.skin} (${secondQuality})`);
                           }

                           const inputSkinsArr = [];
                           for (let i = 1; i <= amount1; ++i)inputSkinsArr.push({
                              _id: firstSkin._id,
                              name: firstSkin.name,
                              skin: firstSkin.skin,
                              case: firstSkin.case,
                              rarity: firstSkin.rarity,
                              min_float: firstSkin.min_float,
                              max_float: firstSkin.max_float,

                              icon: firstSkin.icon,

                              float: firstSkinAvgFloat,
                              link: firstSkinLink,
                              price: firstPrice,
                              quality: firstQuality,
                              sn: `1:${i}:${firstSkin._id}`,
                           })
                           for (let i = 1; i <= amount2; ++i)inputSkinsArr.push({
                              _id: secondSkin._id,
                              name: secondSkin.name,
                              skin: secondSkin.skin,
                              case: secondSkin.case,
                              rarity: secondSkin.rarity,
                              min_float: secondSkin.min_float,
                              max_float: secondSkin.max_float,

                              icon: secondSkin.icon,

                              float: secondSkinAvgFloat,
                              link: secondSkinLink,
                              price: secondPrice,
                              quality: secondQuality,
                              sn: `2:${i}:${secondSkin._id}`,
                           })


                           let wantedOutputChance = 0;

                           let targetedSkinsArr = [];
                           let alternateInputSkins = [];
                           let targetedSkinsNumber = 0;

                           let total = 0;
                           let totalTaxed = 0;

                           let targetedSkinsQuality = []

                           let max = 0;
                           let maxSkin = {};


                           for (let targetedCollection of collections) {
                              if (targetedCollection.name == firstSkin.case || targetedCollection.name == secondSkin.case) {

                                 for (let targetedSkin of targetedCollection.skins[rarities[r + 1]]) {

                                    const { min_float, max_float } = targetedSkin;
                                    const float = Math.round(((max_float - min_float) * avg + min_float) * 10000) / 10000;
                                    const targetedQuality = checkQuality(float);

                                    const targetedPriceSteamTaxed = Math.round((targetedSkin[pricesType][targetedQuality] * steamTax) * 100) / 100;
                                    const targetedPrice = Math.round((targetedSkin[pricesType][targetedQuality]) * 100) / 100;

                                    // targetedSkin.price = targetedPrice;
                                    if (max < targetedPriceSteamTaxed) {
                                       max = targetedPriceSteamTaxed;
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
                                          priceSteamTaxed: targetedPriceSteamTaxed,
                                          targetedQuality,
                                          icon: targetedSkin.icon,
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
                                       priceSteamTaxed: targetedPriceSteamTaxed,
                                       float,
                                       case: targetedSkin.case,
                                       quality: targetedQuality,
                                       icon: targetedSkin.icon,
                                    }
                                    if (pricesType == 'prices') {
                                       targetedSkinPom.url = encodeURI(`${steamBaseUrl}${targetedSkinPom.name} | ${targetedSkinPom.skin} (${targetedSkinPom.quality})`);
                                    } else if (pricesType == 'stattrakPrices') {
                                       targetedSkinPom.url = encodeURI(`${steamBaseUrl}StatTrak™ ${targetedSkinPom.name} | ${targetedSkinPom.skin} (${targetedSkinPom.quality})`);
                                    }



                                    if (targetedCollection.name == firstSkin.case && targetedCollection.name == secondSkin.case) {
                                       total += (targetedPrice * (amount1 + amount2));
                                       totalTaxed += (targetedPriceSteamTaxed * (amount1 + amount2));
                                       targetedSkinsNumber += (1 * (amount1 + amount2));
                                       inputPrice <= targetedPriceSteamTaxed ? wantedOutputChance += (amount1 + amount2) : null;
                                       targetedSkinPom.amount = amount1 + amount2;

                                    } else if (targetedCollection.name == firstSkin.case) {
                                       total += (targetedPrice * amount1);
                                       totalTaxed += (targetedPriceSteamTaxed * amount1);
                                       targetedSkinsNumber += (1 * amount1);
                                       inputPrice <= targetedPriceSteamTaxed ? wantedOutputChance += (amount1) : null;
                                       targetedSkinPom.amount = amount1;

                                    } else if (targetedCollection.name == secondSkin.case) {
                                       total += (targetedPrice * amount2);
                                       totalTaxed += (targetedPriceSteamTaxed * amount2);
                                       targetedSkinsNumber += (1 * amount2);
                                       inputPrice <= targetedPriceSteamTaxed ? wantedOutputChance += (amount2) : null;
                                       targetedSkinPom.amount = amount2;
                                    }


                                    targetedSkinsQuality.push(targetedQuality);
                                    targetedSkinsArr.push(targetedSkinPom);
                                    counter += 1;
                                 }

                                 for (let alternateSkin of targetedCollection.skins[rarities[r]]) {
                                    if (alternateSkin.case == firstSkin.case && alternateSkin.prices[firstQuality] > 0) {

                                       const alternate = {
                                          _id: alternateSkin._id,
                                          replacement: firstSkin._id,
                                          name: alternateSkin.name,
                                          skin: alternateSkin.skin,
                                          icon: alternateSkin.icon,
                                          collectionName: alternateSkin.case,

                                          quality: firstQuality,
                                          amount: amount1,
                                          float: firstSkinAvgFloat,
                                          botPrice: firstPrice,
                                          price: Math.round((alternateSkin[pricesType][firstQuality] + priceCorrection) * 100) / 100,
                                       }

                                       if (pricesType == 'prices') {
                                          alternate.url = encodeURI(`${steamBaseUrl}${alternate.name} | ${alternate.skin} (${firstQuality})`);
                                       } else {
                                          alternate.url = encodeURI(`${steamBaseUrl}StatTrak™ ${alternate.name} | ${alternate.skin} (${firstQuality})`);
                                       }

                                       alternateInputSkins.push(alternate);
                                    }

                                    if ((alternateSkin.case == secondSkin.case && alternateSkin.prices[secondQuality] > 0) && (firstSkin.name != secondSkin.name || firstSkin.skin != secondSkin.skin || firstQuality != secondQuality)) {

                                       const alternate = {
                                          replacement: secondSkin._id,
                                          name: alternateSkin.name,
                                          skin: alternateSkin.skin,
                                          icon: alternateSkin.icon,
                                          collectionName: alternateSkin.case,

                                          quality: secondQuality,
                                          amount: amount2,
                                          float: secondSkinAvgFloat,
                                          botPrice: secondPrice,
                                          price: Math.round((alternateSkin[pricesType][secondQuality] + priceCorrection) * 100) / 100,
                                       }

                                       if (pricesType == 'prices') {
                                          alternate.url = encodeURI(`${steamBaseUrl}${alternate.name} | ${alternate.skin} (${secondQuality})`);
                                       } else {
                                          alternate.url = encodeURI(`${steamBaseUrl}StatTrak™ ${alternate.name} | ${alternate.skin} (${secondQuality})`);
                                       }

                                       alternateInputSkins.push(alternate);
                                    }
                                    counter += 1;
                                 }
                              }
                           }



                           const avgPrice = total / targetedSkinsNumber;
                           const avgPriceTaxed = totalTaxed / targetedSkinsNumber;
                           const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
                           const profitPerTradeUpTaxed = Math.round((avgPriceTaxed - inputPrice) * 100) / 100;
                           const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;
                           const returnPercentageTaxed = Math.round(((avgPriceTaxed) / inputPrice * 100) * 100) / 100;

                           if (profitPerTradeUpTaxed > 0) {
                              const trade = {
                                 inputSkinsArr,

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
                                 targetedPriceSteamTaxed: maxSkin.priceSteamTaxed,

                                 firstSkinAvgFloat,
                                 secondSkinAvgFloat,
                                 targetedSkinFloat: maxSkin.float,

                                 rarity: rarities[r],
                                 targetedRarity: rarities[r + 1],

                                 targetedSkinsArr,
                                 targetedSkinsQuality,
                                 alternateInputSkins,

                                 profitPerTradeUp,
                                 profitPerTradeUpTaxed,
                                 returnPercentage,
                                 returnPercentageTaxed,
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
                                 totalTaxed,
                                 targetedSkinsNumber,
                                 wantedOutputChance,
                                 chances: Math.round(wantedOutputChance / targetedSkinsNumber * 10000) / 100,
                              }

                              const newTrade = new Trade({
                                 amount: { amount1, amount2 },
                                 priceCorrection,
                                 name: newResearchName,
                                 instance: pom2,
                                 pricesType,
                                 isHighlighted: false,

                              })
                              if (action === 'save') {
                                 await newTrade.save();
                              }
                              profits.push(newTrade);

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