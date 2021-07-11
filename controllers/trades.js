const { checkQuality, findCheapestSkin, mergeSort } = require('../utils/functions');
const { qualities, rarities, avg_floats } = require('../utils/variables');
const fetch = require('node-fetch');

const Case = require('../models/caseModel');
const Name = require('../models/nameModel');
const Trade = require('../models/tradeModel');
const Highlight = require('../models/highlightModel');

// NUMBER BY WHICH YOU NEED TO MULTIPLY TO SIMULATE MONEY THAT YOU ARE LEFT WITH, AFTER STEAM TAXES YOUR SELLING
const steamTax = 0.87;
const maxShownSkins = 200;
const steamBaseUrl = 'https://steamcommunity.com/market/listings/730/';


module.exports.renderTrades = async (req, res) => {
   let { action = 'nothing', researchName = 'noname', pairs = 2, sort = 'returnPercentage', order = 'descending', q = null } = req.query;
   if (action != 'nothing' && action != 'save' && action != 'display') {
      action = 'nothing';
   }
   console.log(req.query)




   if (q == 'random') {
      const trades = await Trade.aggregate([{ $sample: { size: 1 } }])
      console.log(trades)

      req.flash('success', 'Enjoy your lucky trade!')
      return res.redirect(`/trades/${trades[0]._id}`);
   }



   if (action == 'display') {

      var startDate = new Date();
      // Do your operations
      const trades = await Trade.find({ name: researchName });
      // const sortedTrades = sortingTrades(trades, sort, order).slice(0, maxShownSkins);
      const sortedTrades = mergeSort(trades, sort, order).slice(0, maxShownSkins);

      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;
      console.log(seconds)

      res.render('trades/index', { profitableTrades: sortedTrades, maxShownSkins, steamBaseUrl, action })

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
            res.redirect('/')
         } else {


            const trades = await mixedTwoPairs(req);
            const sortedTrades = mergeSort(trades, sort, order).slice(0, maxShownSkins);

            res.render('trades/index', { profitableTrades: sortedTrades, maxShownSkins, steamBaseUrl, action })
         }

      } else if (pairs == 3) {
         req.flash('error', `Portójne wyszukiwanie obecnie niedostępne! Braki w zasobach ludzkich!`);
         res.redirect('/')
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
      res.redirect('/')
   } else {



      var startDate = new Date();

      for (let el of arr) {
         await mixedTwoPairs({ query: el })
      }

      var endDate = new Date();
      var seconds = (endDate.getTime() - startDate.getTime()) / 1000;

      console.log('Researched the whole array successfully!', seconds)

      req.flash('success', `The custom search conducted successfully! TIME : ${seconds} seconds`);
      res.redirect('/');
   }
}

module.exports.showTrade = async (req, res) => {
   const { tradeId } = req.params;
   const profit = await Trade.findOne({ _id: tradeId })
   res.render('trades/show', { profit })
}

module.exports.recheckStats = async (req, res) => {

   // EDITING GLOBALLY SETTING UP AND CHECKING PERMISSION
   const { editGloballySwitch = 'false' } = req.body;
   const { user } = req;
   let userPermittedToEditGlobally = false;
   if (user && (user.role == 'admin' || user.role == 'moderator')) {
      userPermittedToEditGlobally = true;
   }


   const { currency } = req.session;
   const { tradeId } = req.params;

   try {
      const foundTrade = await Trade.findById(tradeId);
      const firstPrice = Math.round(req.body[foundTrade.instance.trade.firstSkin._id] / currency.multiplier * 100) / 100;
      const secondPrice = Math.round(req.body[foundTrade.instance.trade.secondSkin._id] / currency.multiplier * 100) / 100;

      const { amount, instance, pricesType } = foundTrade;
      const { targetedSkinsNumber, trade } = instance;

      const { firstSkin, secondSkin } = trade;
      const firstCollection = firstSkin.case;
      const secondCollection = secondSkin.case;

      let total = 0;

      let newTargetedSkin = {}
      let newMaxPrice = 0;



      for (let i = 0; i < trade.targetedSkinsArr.length; i++) {
         let newPrice = Math.round(req.body[trade.targetedSkinsArr[i]._id] / currency.multiplier * steamTax * 100) / 100;

         if (newPrice > newMaxPrice) {
            newTargetedSkin = {
               _id: trade.targetedSkinsArr[i]._id,
               name: trade.targetedSkinsArr[i].name,
               skin: trade.targetedSkinsArr[i].skin,
               case: trade.targetedSkinsArr[i].case,
               rarity: trade.targetedSkinsArr[i].rarity,
               min_float: trade.targetedSkinsArr[i].min_float,
               max_float: trade.targetedSkinsArr[i].max_float,
               float: trade.targetedSkinsArr[i].float,
               price: trade.targetedSkinsArr[i][pricesType][trade.targetedSkinsArr[i].quality],
               targetedQuality: trade.targetedSkinsArr[i].quality,
               icon: trade.targetedSkinsArr[i].icon,
            }
            newMaxPrice = newPrice;
         }


         trade.targetedSkinsArr[i].price = newPrice;

         if (trade.targetedSkinsArr[i].case == firstCollection && trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * 10);
         } else if (trade.targetedSkinsArr[i].case == firstCollection) {
            total += (newPrice * Number(amount.amount1));
         } else if (trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * Number(amount.amount2));
         }

      }


      let wantedOutputChance = 0;
      const inputPrice = Math.round((amount.amount1 * firstPrice + amount.amount2 * secondPrice) * 100) / 100;


      for (let outputSkin of trade.targetedSkinsArr) {
         if (inputPrice <= outputSkin.price) {
            wantedOutputChance += outputSkin.amount;
         }

      }

      const avgPrice = total / targetedSkinsNumber;
      const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
      const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;


      instance.total = total;
      instance.wantedOutputChance = wantedOutputChance;
      instance.chances = Math.round(wantedOutputChance / targetedSkinsNumber * 10000) / 100;
      instance.trade.targetedSkin = newTargetedSkin
      instance.trade.firstPrice = firstPrice;
      instance.trade.secondPrice = secondPrice;
      instance.trade.targetedPrice = newMaxPrice;
      instance.trade.inputPrice = inputPrice;
      instance.trade.profitPerTradeUp = profitPerTradeUp;
      instance.trade.returnPercentage = returnPercentage;
      instance.trade.targetedSkinsArr = trade.targetedSkinsArr;


      // UPDATING IF EDIT GLOBALLY SWITCH AND IF USER ALLOWED
      if (editGloballySwitch && userPermittedToEditGlobally) {

         if (foundTrade.isHighlighted) {

            if (returnPercentage > 100) {
               const updatedTrade = await Trade.findByIdAndUpdate(foundTrade._id, { instance })
               const updatedHighlight = await Highlight.findByIdAndUpdate(foundTrade.highlightedTrade, { instance })
            } else {
               const updatedTrade = await Trade.findByIdAndUpdate(foundTrade._id, { instance, isHighlighted: false })
               // WTEDY USUŃ HIGHLIGHT BO JUZ NIE JEST OPŁACALNY
               await Highlight.findByIdAndDelete(foundTrade.highlightedTrade)
            }
         } else {
            const updatedTrade = await Trade.findByIdAndUpdate(foundTrade._id, { instance }, { new: true })
         }

      }


      const feedback = {
         success: true,
         inputPrice: Math.round(inputPrice * currency.multiplier * 100) / 100,
         profitPerTradeUp: Math.round(profitPerTradeUp * currency.multiplier * 100) / 100,
         returnPercentage,
         wantedOutputChance,
         targetedSkinsNumber,
         firstPrice: Math.round(firstPrice * currency.multiplier * 100) / 100,
         secondPrice: Math.round(secondPrice * currency.multiplier * 100) / 100,
         targetedPrice: Math.round(newMaxPrice * currency.multiplier * 100) / 100,
         symbol: currency.symbol,
         chances: Math.round(wantedOutputChance / targetedSkinsNumber * 10000) / 100,
         editedGlobally: editGloballySwitch,
      };
      res.json(feedback);
   } catch (e) {
      console.log(e)

      const feedback = { success: false };
      res.json(feedback);
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
   res.redirect('/skins')

}

module.exports.deleteSavedTrades = async (req, res) => {
   await Name.deleteMany({});
   await Trade.deleteMany({});

   req.flash('success', 'Successfully deleted all trades');
   res.redirect('/');
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


                           // MANUAL FLOATS CORRECTION
                           // ######################################################################################################
                           // if (firstSkin.skin == 'Bone Forged' && firstQuality == 'Factory New') firstSkinAvgFloat = 0.053;
                           // if (secondSkin.skin == 'Bone Forged' && secondQuality == 'Factory New') secondSkinAvgFloat = 0.053;
                           // if (firstSkin.skin == "Ol' Rusty" && firstQuality == "Factory New") firstSkinAvgFloat = 0.053;
                           // if (secondSkin.skin == "Ol' Rusty" && secondQuality == "Factory New") secondSkinAvgFloat = 0.053;
                           // if (firstSkin.skin == "Prototype" && firstQuality == "Factory New") firstSkinAvgFloat = 0.053;
                           // if (secondSkin.skin == "Prototype" && secondQuality == "Factory New") secondSkinAvgFloat = 0.053;
                           // ######################################################################################################


                           const avg = Math.round(((amount1 * firstSkinAvgFloat + amount2 * secondSkinAvgFloat) / 10) * 10000) / 10000;
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

                                 // for (let alternateSkin of targetedCollection.skins[rarities[r]]) {
                                 //    if ((alternateSkin.case == firstSkin.case && alternateSkin.prices[firstQuality] > 0) || (alternateSkin.case == secondSkin.case && alternateSkin.prices[secondQuality] > 0)) {
                                 //       let alternateQuality;
                                 //       const alternate = {
                                 //          name: alternateSkin.name,
                                 //          skin: alternateSkin.skin,
                                 //          icon: alternateSkin.icon,
                                 //          collectionName: alternateSkin.case }
                                 //       alternateSkin.case == firstSkin.case ? alternateQuality = firstQuality : alternateQuality = secondQuality;
                                 //       alternateSkin.case == firstSkin.case ? alternate.amount = amount1 : alternate.amount = amount2;
                                 //       alternateSkin.case == firstSkin.case ? alternate.float = firstSkinAvgFloat : alternate.float = secondSkinAvgFloat;
                                 //       alternateSkin.case == firstSkin.case ? alternate.botPrice = firstPrice : alternate.botPrice = secondPrice;
                                 //       alternate.quality = alternateQuality;
                                 //       alternate.price = Math.round((alternateSkin[pricesType][alternateQuality] + priceCorrection) * 100) / 100;
                                 //       if (pricesType == 'prices') {
                                 //          alternate.url = encodeURI(`${steamBaseUrl}${alternate.name} | ${alternate.skin} (${alternateQuality})`);
                                 //       } else {
                                 //          alternate.url = encodeURI(`${steamBaseUrl}StatTrak™ ${alternate.name} | ${alternate.skin} (${alternateQuality})`);
                                 //       } alternateInputSkins.push(alternate); } counter += 1; }

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