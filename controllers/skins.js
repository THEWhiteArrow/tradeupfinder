const fetch = require('node-fetch');
const { toName, getSkinPage, clearHistory } = require('../utils/functions');
const { skins, skinsToUpdate, qualities, prices, collections } = require('../utils/variables');
const Skin = require('../models/skinModel');
const Case = require('../models/caseModel');


let qualityIndex = 0;
let skinIndex = 0;
let mappingFinished = false;

for (let k in qualities) {
   prices[qualities[k]] = null;
}



module.exports.updatePrices = async (req, res) => {
   // const collections = await Case.find({}).populate('skins');
   const skins = await Skin.find({});

   for (let item of skins) {
      const { name, skin, rarity, prices } = item;
      console.log(name, ' ', skin)
   }

   // const url = `https://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name=${toName(`${skinsToUpdate[skinIndex]}`, qualities[qualityIndex])}`;
   // const response = await fetch(url);
   // const data = await response.json();






}



module.exports.showIndex = async (req, res) => {
   const skins = await Skin.find({});
   // console.log(skins)
   res.render('index', { skins, qualities })
};










module.exports.update = async (req, res) => {
   if (qualityIndex === 5 && skinIndex === skinsToUpdate.length - 1) {
      res.send(`<h1>Successfully updated <strong>${skinsToUpdate.length}</strong> skins</h1>`);
      mappingFinished = true;
   }

   if (qualityIndex === 5) {
      let skin = await Skin.findOneAndUpdate({ name: `${skinsToUpdate[skinIndex]}` }, { prices: { ...prices } }, { new: true })
      console.log(skin)

      qualityIndex = 0;
      skinIndex += 1;
   }


   if (!mappingFinished) {
      const data = await getSkinPage(`https://steamcommunity.com/market/listings/730/${toName(`${skinsToUpdate[skinIndex]}`, qualities[qualityIndex])}`);
      res.render('update', { data });
   }
};

module.exports.mapDatabase = async (req, res) => {
   if (qualityIndex === 5 && skinIndex === skins.length - 1) {
      res.send(`<h1>Successfully mapped <strong>${skins.length}</strong> skins</h1>`);
      mappingFinished = true;
   }

   if (qualityIndex === 5) {
      const skin = new Skin({
         name: skins[skinIndex],
         prices: prices,
         case: collections[0]
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
   res.send('deleted Database');
};

module.exports.clear = (req, res) => {
   clearHistory();
   res.send('cleared History')
};

module.exports.test = async (req, res) => {
   const data = await getSkinPage(`https://steamcommunity.com/market/listings/730/Negev%20%7C%20Ultralight%20(Battle-Scarred)`);
   res.render('test', { data });
};