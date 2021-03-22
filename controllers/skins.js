const { mayReplaceSpace, getData, toName, getSkinPage, clearHistory } = require('../utils/functions');
const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');


module.exports.checkTrades = async (req, res) => {



   res.redirect('/skins');
}

module.exports.updatePrices = async (req, res) => {
   const collections = await Case.find({}).populate('skins');
   const skins = await Skin.find({});

   for (let item of skins) {
      const { name, skin, prices, _id } = item;
      console.log(_id)
      const keys = Object.keys(prices);
      console.log(name);

      const updatedPrices = {};

      for (let q of keys) {
         if (q !== '$init') {


            const baseUrl = 'https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=';
            const url = `${baseUrl}${mayReplaceSpace(name)}%20|%20${mayReplaceSpace(skin)}%20(${mayReplaceSpace(q)})`;

            const data = await getData(url, 3000);
            updatedPrices[q] = data.lowest_price || 'none';

         }
      }

      const updatedSkin = await Skin.findByIdAndUpdate(_id, { prices: updatedPrices }, { new: true });
      console.log(updatedSkin.prices);
   }

   res.redirect('/skins')


}

module.exports.showIndex = async (req, res) => {
   const qualities = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred']
   const skins = await Skin.find({});
   res.render('index', { skins, qualities })
};
