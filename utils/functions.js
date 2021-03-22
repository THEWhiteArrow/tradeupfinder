const fetch = require('node-fetch');


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
