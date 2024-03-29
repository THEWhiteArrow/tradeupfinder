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

module.exports.cookiesAccepted = async (req, res) => {
   console.log('Cookies Accepted')

   req.session.cookiesAcceptance = true;
   res.locals.cookiesAcceptance = true;

   //THERE SHOULD BE INCREMENTING VISITORS COUNT
   try {
      const info = await ServerInfo.findOne({});
      await ServerInfo.findOneAndUpdate({ _id: info._id }, { allVisitors: info.allVisitors + 1 })

   } catch (e) {
      console.log('Failed to add a new visitor count', e)
   }

   res.json({ success: true, message: 'Cookies Accepted' });
}

module.exports.changeVariables = async (req, res) => {
   const { body } = req;

   //SANITY CHECK
   for (let key in body) {
      if (body[key] === undefined || body[key] === null || body[key] === '') body[key] = 0;
   }

   await ServerInfo.findOneAndUpdate({}, { ...body });

   const bodyKeys = Object.keys(body);
   let flashData = '';
   bodyKeys.forEach(el => flashData += `${el} : ${body[el]}; `)

   req.flash('success', `Successfully changed server variables ${flashData}`)
   res.redirect('/user/account')
}