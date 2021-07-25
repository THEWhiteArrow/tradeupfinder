const fetch = require('node-fetch');
const ExpressError = require('../utils/ExpressError');
const { qualities, rarities, avg_floats, shortcuts } = require('./variables');
const User = require('../models/userModel');

const normalizePrice = (p, currency) => {
   return Math.round(p / currency.multiplier * 100) / 100;
}

const cookBody = (body, currency, amount, arr) => {
   let inputPrice = 0;
   let newAvgFloat = 0;
   let newFirstSkinAvgFloat = 0;
   let newSecondSkinAvgFloat = 0;


   for (let i = 0; i < arr.length; ++i) {

      const float = body[`float:${arr[i].sn}`];
      let newPrice = body[`inputPrice:${arr[i].sn}`];
      newPrice = normalizePrice(newPrice, currency);
      inputPrice += newPrice;
      newAvgFloat += float;

      arr[i].price = newPrice;
      arr[i].float = float;
      arr[i].quality = checkQuality(float);

      i < amount.amount1 ? newFirstSkinAvgFloat += float : newSecondSkinAvgFloat += float;
   }

   newFirstSkinAvgFloat = Math.round(newFirstSkinAvgFloat / amount.amount1 * 10000) / 10000;
   newSecondSkinAvgFloat = Math.round(newSecondSkinAvgFloat / amount.amount2 * 10000) / 10000;
   newAvgFloat = Math.round(newAvgFloat / 10 * 10000) / 10000;

   return { inputPrice, newInputSkinsArr: arr, newAvgFloat, newFirstSkinAvgFloat, newSecondSkinAvgFloat };
}

module.exports.recheckTrade = async (req, res, steamTax, Instance, instanceName, Highlight) => {

   // EDITING GLOBALLY SETTING UP AND CHECKING PERMISSION
   const { editGloballySwitch = 'false', isAvgFloatChanged = 'false' } = req.body;
   const { user } = req;
   let userPermittedToEditGlobally = false;
   if (user && (user.role == 'admin' || user.role == 'moderator')) {
      userPermittedToEditGlobally = true;
   }


   const { currency } = req.session;
   const { tradeId, favouriteId } = req.params;
   console.log(tradeId, favouriteId)
   let instanceId = tradeId;
   instanceId == undefined ? instanceId = favouriteId : null;



   console.log(req.body)

   try {
      const foundTrade = await Instance.findById(instanceId);
      // const firstPrice = Math.round(req.body['1:' + foundTrade.instance.trade.firstSkin._id] / currency.multiplier * 100) / 100;
      // const secondPrice = Math.round(req.body['2:' + foundTrade.instance.trade.secondSkin._id] / currency.multiplier * 100) / 100;


      const { amount, instance, pricesType } = foundTrade;
      const { targetedSkinsNumber, trade } = instance;

      const { firstSkin, secondSkin, inputSkinsArr } = trade;
      const firstCollection = firstSkin.case;
      const secondCollection = secondSkin.case;

      const { inputPrice, newInputSkinsArr, newAvgFloat, newFirstSkinAvgFloat, newSecondSkinAvgFloat } = cookBody(req.body, currency, amount, inputSkinsArr);
      // const firstPricePart = sumUpBodyPart('1', amount.amount1, req.body, firstSkin._id, '')
      // const secondPricePart = sumUpBodyPart('2', amount.amount2, req.body, secondSkin._id, '')
      // const inputPrice = Math.round((firstPricePart + secondPricePart) / currency.multiplier * 100) / 100;

      let total = 0;
      let totalTaxed = 0;
      let newTargetedSkin = {}
      let newMaxPrice = 0;

      // const avgFloatFirstPart = Math.round(sumUpBodyPart('1', amount.amount1, req.body, firstSkin._id, 'float:') / amount.amount1 * 10000) / 10000;
      // const avgFloatSecondPart = Math.round(sumUpBodyPart('2', amount.amount2, req.body, secondSkin._id, 'float:') / amount.amount2 * 10000) / 10000;

      // const newFirstQuality = checkQuality(avgFloatFirstPart);
      // const newSecondQuality = checkQuality(avgFloatSecondPart);

      // const newAvgFloat = Math.round((sumUpBodyPart('1', amount.amount1, req.body, firstSkin._id, 'float:') + sumUpBodyPart('2', amount.amount2, req.body, secondSkin._id, 'float:')) / 10 * 10000) / 10000;

      // JUST FOR THE SAKE OF PEACE FLOATS WILL BE CHECKED EVERY TIME 

      let inputSkinsNewData;
      if (isAvgFloatChanged) {
         console.log(newAvgFloat)
         inputSkinsNewData = newInputSkinsArr.map(el => ({ quality: el.quality, sn: el.sn }))
         // CHANGE TARGETED SKINS PRICES RIGHT AWAY
         //chaniging inthe part below
         // AND LATER ON THOSE PRICES ARE NEEDED TO BE SENT BACK TO CHANGE ON PAGE PRICES BECAUSE IT WILL MAKE A DIFFERENCE
      }
      console.log('inputSkinsNewData : ', inputSkinsNewData)



      const outputSkinsNewData = [];
      const newTargetedSkinsQuality = [];
      for (let i = 0; i < trade.targetedSkinsArr.length; i++) {

         let newPriceSteamTaxed = Math.round(req.body['outputPrice:' + trade.targetedSkinsArr[i]._id] / currency.multiplier * steamTax * 100) / 100;
         let newPrice = Math.round(req.body['outputPrice:' + trade.targetedSkinsArr[i]._id] / currency.multiplier * 100) / 100;

         if (isAvgFloatChanged) {
            const newFloat = Math.round(((trade.targetedSkinsArr[i].max_float - trade.targetedSkinsArr[i].min_float) * newAvgFloat + trade.targetedSkinsArr[i].min_float) * 10000) / 10000;
            const newQuality = checkQuality(newFloat);
            // CHANGE TARGETED SKINS PRICES RIGHT AWAY

            //HERE THOSE OUTPUT SKINS SHOULD HAVE BEEN POPULATED AND THE PRICES CHECKED DIRECTLY FROM THE SKINS MODELS DB
            newPrice = trade.targetedSkinsArr[i].prices[newQuality]
            newPriceSteamTaxed = Math.round(newPrice * steamTax * 100) / 100;

            outputSkinsNewData.push({ _id: trade.targetedSkinsArr[i]._id, price: newPrice, float: newFloat, quality: newQuality })
            newTargetedSkinsQuality.push(newQuality);
         }



         if (newPriceSteamTaxed > newMaxPrice) {

            newTargetedSkin = {
               _id: trade.targetedSkinsArr[i]._id,
               name: trade.targetedSkinsArr[i].name,
               skin: trade.targetedSkinsArr[i].skin,
               case: trade.targetedSkinsArr[i].case,
               rarity: trade.targetedSkinsArr[i].rarity,
               min_float: trade.targetedSkinsArr[i].min_float,
               max_float: trade.targetedSkinsArr[i].max_float,
               float: trade.targetedSkinsArr[i].float,
               price: newPrice,
               priceSteamTaxed: newPriceSteamTaxed,
               targetedQuality: trade.targetedSkinsArr[i].quality,
               icon: trade.targetedSkinsArr[i].icon,
            }
            newMaxPrice = newPriceSteamTaxed;
         }


         trade.targetedSkinsArr[i].price = newPrice;
         trade.targetedSkinsArr[i].priceSteamTaxed = newPriceSteamTaxed;

         if (trade.targetedSkinsArr[i].case == firstCollection && trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * 10);
            totalTaxed += (newPriceSteamTaxed * 10);
         } else if (trade.targetedSkinsArr[i].case == firstCollection) {
            total += (newPrice * Number(amount.amount1));
            totalTaxed += (newPriceSteamTaxed * Number(amount.amount1));
         } else if (trade.targetedSkinsArr[i].case == secondCollection) {
            total += (newPrice * Number(amount.amount2));
            totalTaxed += (newPriceSteamTaxed * Number(amount.amount2));
         }



      }





      let wantedOutputChance = 0;
      // const inputPrice = Math.round((amount.amount1 * firstPrice + amount.amount2 * secondPrice) * 100) / 100;


      for (let outputSkin of trade.targetedSkinsArr) {
         if (inputPrice <= outputSkin.priceSteamTaxed) {
            wantedOutputChance += outputSkin.amount;
         }

      }

      const avgPrice = total / targetedSkinsNumber;
      const avgPriceTaxed = totalTaxed / targetedSkinsNumber;
      const profitPerTradeUp = Math.round((avgPrice - inputPrice) * 100) / 100;
      const profitPerTradeUpTaxed = Math.round((avgPriceTaxed - inputPrice) * 100) / 100;
      const returnPercentage = Math.round(((avgPrice) / inputPrice * 100) * 100) / 100;
      const returnPercentageTaxed = Math.round(((avgPriceTaxed) / inputPrice * 100) * 100) / 100;
      // inputPrice, newInputSkinsArr, newAvgFloat, newFirstSkinAvgFloat, newSecondSkinAvgFloat
      instance.avg = newAvgFloat;
      instance.total = total;
      instance.totalTaxed = totalTaxed;
      instance.wantedOutputChance = wantedOutputChance;
      instance.chances = Math.round(wantedOutputChance / targetedSkinsNumber * 10000) / 100;
      instance.trade.targetedSkin = newTargetedSkin

      // instance.trade.firstQuality = newFirstQuality;
      // instance.trade.secondQuality = newSecondQuality;
      instance.trade.firstSkinAvgFloat = newFirstSkinAvgFloat;
      instance.trade.secondSkinAvgFloat = newSecondSkinAvgFloat;

      // instance.trade.firstPrice = firstPricePart;
      // instance.trade.secondPrice = secondPricePart;
      // instance.trade.targetedPrice = newMaxPrice;
      instance.trade.inputPrice = inputPrice;
      instance.trade.profitPerTradeUp = profitPerTradeUp;
      instance.trade.returnPercentage = returnPercentage;
      instance.trade.profitPerTradeUpTaxed = profitPerTradeUpTaxed;
      instance.trade.returnPercentageTaxed = returnPercentageTaxed;

      instance.trade.targetedSkinsArr = trade.targetedSkinsArr;





      // UPDATING IF EDIT GLOBALLY SWITCH AND IF USER ALLOWED
      if (editGloballySwitch == true && userPermittedToEditGlobally && instanceName == 'Trade') {

         if (foundTrade.isHighlighted) {

            if (returnPercentage > 100) {
               const updatedTrade = await Instance.findByIdAndUpdate(foundTrade._id, { instance })
               const updatedHighlight = await Highlight.findByIdAndUpdate(foundTrade.highlightedTrade, { instance })
            } else {
               const updatedTrade = await Instance.findByIdAndUpdate(foundTrade._id, { instance, isHighlighted: false })
               // WTEDY USUŃ HIGHLIGHT BO JUZ NIE JEST OPŁACALNY
               await Highlight.findByIdAndDelete(foundTrade.highlightedTrade)
            }
         } else {
            const updatedTrade = await Instance.findByIdAndUpdate(foundTrade._id, { instance }, { new: true })
         }

      }
      else if (instanceName == 'Favourite') {
         const updatedFavourite = await Instance.findByIdAndUpdate(foundTrade._id, { instance }, { new: true });
      }


      const feedback = {
         success: true,
         inputPrice: Math.round(inputPrice * currency.multiplier * 100) / 100,
         profitPerTradeUp: Math.round(profitPerTradeUp * currency.multiplier * 100) / 100,
         profitPerTradeUpTaxed: Math.round(profitPerTradeUpTaxed * currency.multiplier * 100) / 100,
         returnPercentage,
         returnPercentageTaxed,
         wantedOutputChance,
         targetedSkinsNumber,
         avgFloat: newAvgFloat,
         // firstPrice: Math.round(firstPricePart * currency.multiplier * 100) / 100,
         // secondPrice: Math.round(secondPricePart * currency.multiplier * 100) / 100,
         // targetedPrice: Math.round(newMaxPrice * currency.multiplier * 100) / 100,
         symbol: currency.symbol,
         chances: Math.round(wantedOutputChance / targetedSkinsNumber * 100 * 100) / 100,
         editedGlobally: editGloballySwitch,
      };

      isAvgFloatChanged ? feedback.isAvgFloatChanged = true : feedback.isAvgFloatChanged = false;
      isAvgFloatChanged ? feedback.outputSkinsNewData = outputSkinsNewData : null;
      isAvgFloatChanged ? feedback.inputSkinsNewData = inputSkinsNewData : null;


      return feedback;
   } catch (e) {
      console.log(e)

      const feedback = { success: false };
      return feedback;
   }
}

const checkQuality = (float) => {

   if (float < 0.07) {
      return 'Factory New';
   } else if (float < 0.15) {
      return 'Minimal Wear';
   } else if (float < 0.38) {
      return 'Field-Tested';
   } else if (float < 0.45) {
      return 'Well-Worn';
   } else {
      return 'Battle-Scarred'
   }

}

const getInputSkinsQuality = (amount, body, id1, id2) => {
   let arr = [];

   for (let i = 1; i <= amount.amount1; ++i) {
      let q = checkQuality(body[`1:${i}:float:${id1}`])
      arr.push(q)
   }
   for (let i = 1; i <= amount.amount2; ++i) {
      let q = checkQuality(body[`2:${i}:${id1}`])
      arr.push(q)
   }

   return arr;
}

const sumUpBodyPart = (n, amount, body, id, extraName = '') => {
   let sum = 0;

   for (let i = 1; i <= amount; ++i) {
      sum += body[`${n}:${i}:${extraName}${id}`]
   }

   return sum;
}

module.exports.getInputSkinsQuality = getInputSkinsQuality;
module.exports.checkQuality = checkQuality;
module.exports.sumUpBodyPart = sumUpBodyPart;
module.exports.cookBody = cookBody;



module.exports.isEmpty = (obj) => {
   for (var prop in obj) {
      if (obj.hasOwnProperty(prop)) {
         return false;
      }
   }

   return JSON.stringify(obj) === JSON.stringify({});
}





module.exports.mergeSort = (a, sortBy, orderBy) => {
   return _mergeSort(a, sortBy, orderBy)
}

const _mergeArrays = (a, b, sortBy, orderBy) => {
   const c = []

   if (orderBy == 'descending') {

      while (a.length && b.length) {
         c.push(a[0].instance.trade[sortBy] < b[0].instance.trade[sortBy] ? b.shift() : a.shift())
      }

   } else if (orderBy == 'ascending') {

      while (a.length && b.length) {
         c.push(a[0].instance.trade[sortBy] > b[0].instance.trade[sortBy] ? b.shift() : a.shift())
      }

   }

   //if we still have values, let's add them at the end of `c`
   while (a.length) {
      c.push(a.shift())
   }
   while (b.length) {
      c.push(b.shift())
   }

   return c
}

const _mergeSort = (a, sortBy, orderBy) => {
   if (a.length < 2) return a
   const middle = Math.floor(a.length / 2)
   const a_l = a.slice(0, middle)
   const a_r = a.slice(middle, a.length)
   const sorted_l = _mergeSort(a_l, sortBy, orderBy)
   const sorted_r = _mergeSort(a_r, sortBy, orderBy)
   return _mergeArrays(sorted_l, sorted_r, sortBy, orderBy)
}


module.exports.uniteCurrency = (obj, currency) => {
   for (let key in obj) {
      obj[key] = Math.round(obj[key] / currency.multiplier * 100) / 100;
   }
   return obj;
}

module.exports.createNewSteamUser = async (profile) => {
   const steam = {
      id: profile.id,
      avatar: profile.photos[2].value || null,
   }


   const newUser = new User({
      steam,
      premium: true,
      role: 'guest',
      favourites: [],
      email: profile.identifier,
      username: profile.displayName
   })

   await newUser.save();

   return newUser;
}

module.exports.sortingTrades = (trades, sort, order) => {

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


module.exports.getPriceAndVolume = async (data, variant, url, convert, getData) => {

   if (data.success === true) {

      if (variant == 'steam') {
         if (data.median_price) { return { statusCode: 200, newPrice: convert(data.median_price), newVolume: data.volume } }
         else if (data.lowest_price) { return { statusCode: 200, newPrice: convert(data.lowest_price), newVolume: data.volume } }
         else { return { statusCode: 200, newPrice: 0, newVolume: 0 }; }

      } else {
         if (data.average_price) { return { statusCode: 200, newPrice: Number(data.average_price), newVolume: Number(data.amount_sold), icon: data.icon } }
         else if (data.median_price) { return { statusCode: 200, newPrice: Number(data.median_price), newVolume: Number(data.amount_sold), icon: data.icon } }
         else if (data.lowest_price) { return { statusCode: 200, newPrice: Number(data.lowest_price), newVolume: Number(data.amount_sold), icon: data.icon } }
         else if (data.highest_price) { return { statusCode: 200, newPrice: Number(data.highest_price), newVolume: Number(data.amount_sold), icon: data.icon } }
         else { return { statusCode: 200, newPrice: 0, newVolume: 0, icon: 'none' }; }
      }



   } else if (data.success == 'false' && data.reason == undefined) {
      const newUrl = url.replace('time=3', 'time=30')
      const encodedUrl = encodeURI(newUrl);

      let newData;
      variant == 'steam' ? newData = await getData(encodedUrl, 3200) : newData = await getData(encodedUrl, 700);

      if (newData.success === true) {
         if (variant == 'steam') {
            if (newData.median_price) { return { statusCode: 200, newPrice: convert(newData.median_price), newVolume: data.volume } }
            else if (newData.lowest_price) { return { statusCode: 200, newPrice: convert(newData.lowest_price), newVolume: data.volume } }
            else { return { statusCode: 200, newPrice: 0, newVolume: 0 }; }

         } else {
            if (newData.average_price) { return { statusCode: 200, newPrice: Number(newData.average_price), newVolume: Number(data.amount_sold), icon: newData.icon } }
            else if (newData.median_price) { return { statusCode: 200, newPrice: Number(newData.median_price), newVolume: Number(data.amount_sold), icon: newData.icon } }
            else if (newData.lowest_price) { return { statusCode: 200, newPrice: Number(newData.lowest_price), newVolume: Number(data.amount_sold), icon: newData.icon } }
            else if (newData.highest_price) { return { statusCode: 200, newPrice: Number(newData.highest_price), newVolume: Number(data.amount_sold), icon: newData.icon } }
            else { return { statusCode: 200, newPrice: 0, newVolume: 0 }; }
         }

      } else if (newData.success == 'false' && newData.reason == undefined) {
         return { newPrice: 0, newVolume: 0, statusCode: 200 }
      }

      else if (newData.reason) {
         console.log(`You requested too many times recently!, Status: 429`);
         return new ExpressError(`You requested too many times recently. ${newData.reason}`, 429);
      } else {
         console.log(`You requested too many times recently!, Status: 429`);
         return new ExpressError(`You requested too many times recently.`, 429);
      }



   } else if (data.reason) {
      console.log(`You requested too many times recently!. ${data.reason}, Status: 429`);
      return new ExpressError(`You requested too many times recently. ${data.reason}`, 429);

   } else {
      console.log(`You requested too many times recently!, Status: 429`);
      return new ExpressError(`You requested too many times recently.`, 429);
   }
}

module.exports.findCheapestSkin = (collection, rarity, quality, pricesType, volumesType, minVolume) => {
   let min = 100000;
   let minSkin = {};
   let foundSkin = false;



   for (let skin of collection.skins[rarity]) {
      if (skin[pricesType][quality] < min && skin[pricesType][quality] > 0 && skin[volumesType][quality] > minVolume) {
         min = skin[pricesType][quality];
         minSkin = {
            _id: skin._id,
            name: skin.name,
            skin: skin.skin,
            min_float: skin.min_float,
            max_float: skin.max_float,
            case: skin.case,
            prices: skin.prices,
            stattrakPrices: skin.stattrakPrices,
            icon: skin.icon
         };
         foundSkin = true;
      }
   }

   foundSkin === false ? minSkin = null : null;

   return minSkin;

}





module.exports.floatedPrices = (skin, set_floats = avg_floats) => {
   let prices = {};

   for (let quality of qualities) {
      let avg;
      if (skin.min_float > set_floats[quality]) {
         avg = skin.min_float;
      } else if (skin.max_float < set_floats[quality]) {
         avg = skin.max_float;
      } else {
         avg = set_floats[quality];
      }

      const float = Math.round(((skin.max_float - skin.min_float) * avg + skin.min_float) * 1000) / 1000;
      let floatedQuality = '';
      if (float < 0.07) {
         floatedQuality = 'Factory New';
      } else if (float < 0.15) {
         floatedQuality = 'Minimal Wear';
      } else if (float < 0.38) {
         floatedQuality = 'Field-Tested';
      } else if (float < 0.45) {
         floatedQuality = 'Well-Worn';
      } else {
         floatedQuality = 'Battle-Scarred'
      }


      prices[quality] = skin.prices[floatedQuality];

   }
   return prices;
}

module.exports.convertToPriceFloated = (n, q) => {
   if (n.prices.floated[q] === 'none') {
      return 'none';
      // let p = qualities.indexOf(q);
      // for (let i = p; i < qualities.length; i++) {
      //    if (qualities[i] !== 'none') {
      //       let shiftedPrice = n.prices.floated[qualities[i]];
      //       return shiftedPrice;
      //    }
      // }
   }
   let index = n.prices.floated[q].indexOf('z');
   let price = Number(n.prices.floated[q].substr(0, index).replace(',', '.'));

   return price;
}

module.exports.convertToPrice = (n, q) => {
   if (n.prices[q] === 'none') {
      return 'none';
   }
   let index = n.prices[`${q}`].indexOf('z');
   let price = Number(n.prices[`${q}`].substr(0, index).replace(',', '.'));

   return price;
}

module.exports.convert = (s) => {
   const stringPrice = s.slice(0, s.length - 2).replace(',', '.');
   return Number(stringPrice);
}

// const convert = (s) => {
//    const stringPrice = s.slice(0, s.length - 2).replace(',', '.');
//    return Number(stringPrice);
// }

module.exports.combainToName = (name, skin, q) => {
   return `${name} | ${skin} (${q})`;
}

module.exports.mayReplaceSpace = (n) => {
   if (n.indexOf(' ') !== -1) n = n.replace(' ', '%20');
   return n;

}

async function safeParseJSON(response) {
   const body = await response.text();
   try {
      return JSON.parse(body);
   } catch (err) {
      console.error("Error:", err);
      console.error("Response body:", body);
      // throw err;
      return ReE(response, err.message, 500)
   }
}

module.exports.getData = (url, delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(async () => {
         const res = await fetch(url, { method: "GET", headers: { 'Content-type': 'application/json' } });
         // console.log(res.body)
         let data = await res.json();



         // resolve(res);
         resolve(data);
      }, delay);
   });
}

module.exports.getPageData = (url, delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(async () => {
         const res = await fetch(url);
         const data = await res.text();

         resolve(data);
      }, delay);
   });
}

module.exports.toName = (name, status) => {
   if (name.indexOf(' ') !== -1) name = name.replace(' ', '%20%7C%20');
   if (name.indexOf(' ') !== -1) name = name.replace(' ', '%20');
   if (status.indexOf(' ') !== -1) status = status.replace(' ', '%20');
   let output = `${name} % 20 % 28${status} % 29`;

   return output;
}

module.exports.getSkinPage = async (url) => {
   const res = await fetch(url);
   const data = await res.text();
   let dataString = await String(data);

   return dataString;
}

module.exports.clearHistory = () => {
   skinIndex = 0;
   qualityIndex = 0;
}
