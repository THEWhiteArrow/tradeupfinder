const ServerInfo = require('../models/serverInfoModel');

module.exports.validOuterServerAction = async (req, res) => {
   const serverInfo = await ServerInfo.findOne({})
   if (serverInfo.outerServerInfo.valid == null) {
      req.flash('success', 'NOTHING happened since last time checking. You are just repeating validating !')
      res.redirect('/skins')
   }
   else if (serverInfo.outerServerInfo.valid) {
      await ServerInfo.findOneAndUpdate({}, { "outerServerInfo.valid": null })
      req.flash('success', 'Everything on the outside went correctly!')
      res.redirect('/skins')
   } else {
      req.flash('error', serverInfo.outerServerInfo.message)
      res.redirect('/skins')
   }
}