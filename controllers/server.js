const ServerInfo = require('../models/serverInfoModel');

module.exports.validOuterServerAction = async (req, res) => {
   const serverInfo = await ServerInfo.findOne({})
   if (serverInfo.outerServerInfo.valid == null) {
      req.flash('success', 'NOTHING happened since last time checking. You are just repeating your validation!')
      res.redirect('/explore')
   }
   else if (serverInfo.outerServerInfo.valid) {
      await ServerInfo.findOneAndUpdate({}, { "outerServerInfo.valid": null })
      req.flash('success', 'Everything on the outside went correctly!')
      res.redirect('/explore')
   } else {
      req.flash('error', serverInfo.outerServerInfo.message)
      res.redirect('/explore')
   }
}