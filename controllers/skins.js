const Skin = require('../models/skinModel');
const { toName, getSkinPage, clearHistory } = require('../utils/functions');
const { skins, qualities, prices } = require('../utils/variables');


let qualityIndex = 0;
let skinIndex = 0;
let mappingFinished = false;

for (let k in qualities) {
   prices[qualities[k]] = null;
}

module.exports.mapDatabase = async (req, res, next) => {
   if (qualityIndex === 5 && skinIndex === skins.length - 1) {
      res.send(`<h1>Successfully mapped <strong>${skins.length}</strong> skins</h1>`);
      mappingFinished = true;
   }

   if (qualityIndex === 5) {
      const skin = new Skin({
         name: skins[skinIndex],
         prices: prices
      })
      await skin.save();
      console.log(skin)

      qualityIndex = 0;
      skinIndex += 1;

   }

   if (!mappingFinished) {
      const data = await getSkinPage(`https://steamcommunity.com/market/listings/730/${toName(`${skins[skinIndex]}`, qualities[qualityIndex])}`);
      res.render('home', { data });
   }


};


module.exports.managePrice = async (req, res) => {
   const { price } = req.query;
   console.log(`${skins[skinIndex]} - ${qualities[qualityIndex]} - ${price}`);
   prices[qualities[qualityIndex]] = price;

   qualityIndex += 1;
   res.json('successfully gatherd price')
};


module.exports.deleteDatabase = async (req, res) => {
   await Skin.deleteMany({});
   res.send('cleared Database');
};

module.exports.clear = (req, res) => {
   clearHistory();
   res.send('cleared history')
};