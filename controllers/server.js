const ServerInfo = require('../models/serverInfoModel');

module.exports.validOuterServerAction = async (req, res) => {
   const serverInfo = await ServerInfo.findOne({})

   if (serverInfo.outerServerInfo.valid) {
      req.flash('success', 'Everything on the outside went correctly!')
      res.redirect('/skins')
   } else {
      req.flash('error', serverInfo.outerServerInfo.message)
      res.redirect('/skins')
   }
}