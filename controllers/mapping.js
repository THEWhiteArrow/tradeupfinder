const { getPageData } = require('../utils/functions');
//MAPPING COLLECTIONS
let pages = [];
let collectionNameServer = '';
let skinsServer = [];
let showCollection = false;

module.exports.showMappingPage = async (req, res) => {
   if (showCollection === true) {
      res.render('mapping/map', { collectionNameServer, skinsServer, showCollection });
      showCollection = false;
      collectionNameServer = '';
      skinsServer = [];
      pages = [];
   } else {
      res.render('mapping/map', { showCollection });
   }
}

module.exports.mapCollection = async (req, res) => {
   const { url, collectionName, floats = [] } = req.body;

   if (floats.length === 0) {
      const data = await getPageData(url, 100);
      res.render('mapping/mappingCollection', { data, collectionName })
   } else {
      for (let i = 0; i < skinsServer.length; i++) {
         skinsServer[i].min_float = floats[i].min_float;
         skinsServer[i].max_float = floats[i].max_float;
      }
      showCollection = true;
      console.log('kolekcja przygotowana!')
      res.send('kolekcja został przygotowana')


   }

}

module.exports.mapFloatsPost = async (req, res) => {
   const { collectionName, skins, hrefs } = req.body;
   collectionNameServer = collectionName;
   skinsServer = skins;


   for (let href of hrefs) {
      const data = await getPageData(href, 100);
      pages.push(data)
   }
   console.log('finished downloading pages data')

   const feedback = { success: true };
   res.json(feedback);
}

module.exports.mapFloatsGet = async (req, res) => {
   res.render('mapping/mappingFloats', { pages })
}