const fetch = require('node-fetch');

const { qualities, rarities, avg_floats, shortcuts } = require('./variables');



module.exports.floatedQualities = (skin, set_floats = avg_floats) => {
   let floatedQ = {
      'Factory New': '',
      'Minimal Wear': '',
      'Field-Tested': '',
      'Well-Worn': '',
      'Battle-Scarred': ''
   }
   for (let quality of qualities) {
      let avg;
      if (skin.min_float > set_floats[quality]) {
         avg = skin.min_float;
      } else {
         avg = set_floats[quality];
      }

      const float = Math.round(((skin.max_float - skin.min_float) * avg + skin.min_float) * 1000) / 1000;
      if (float < 0.07) {
         floatedQ[quality] = 'Factory New';
      } else if (float < 0.15) {
         floatedQ[quality] = 'Minimal Wear';
      } else if (float < 0.38) {
         floatedQ[quality] = 'Field-Tested';
      } else if (float < 0.45) {
         floatedQ[quality] = 'Well-Worn';
      } else {
         floatedQ[quality] = 'Battle-Scarred'
      }


   }

   return floatedQ;
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





module.exports.mayReplaceSpace = (n) => {
   if (n.indexOf(' ') !== -1) n = n.replace(' ', '%20');
   return n;

}

module.exports.getData = (url, delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(async () => {
         const res = await fetch(url);
         const data = await res.json();

         resolve(data);
      }, delay);
   });
}

module.exports.toName = (name, status) => {
   if (name.indexOf(' ') !== -1) name = name.replace(' ', '%20%7C%20');
   if (name.indexOf(' ') !== -1) name = name.replace(' ', '%20');
   if (status.indexOf(' ') !== -1) status = status.replace(' ', '%20');
   let output = `${name}%20%28${status}%29`;

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
