const fetch = require('node-fetch');

const { qualities, rarities, avg_floats, shortcuts } = require('./variables');

module.exports.findCheapestSkin = (collection, rarity, quality, pricesType) => {
   let min = 100000;
   let minSkin = {};
   let foundSkin = false;



   for (let skin of collection.skins[rarity]) {
      if (skin[pricesType][quality] < min && skin[pricesType][quality] > 0) {
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
         };
         foundSkin = true;
      }
   }

   foundSkin === false ? minSkin = null : null;

   return minSkin;

}

module.exports.checkQuality = (float) => {

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



module.exports.combainToName = (name, skin, q) => {
   return `${name} | ${skin} (${q})`.replace("'", "&#39");
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
