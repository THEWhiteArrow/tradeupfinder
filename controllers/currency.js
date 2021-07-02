const ServerInfo = require('../models/serverInfo')

module.exports.updateCurrencyMultipliers = async (req, res) => {
   const currenciesMultipliers = {
      USD: 1,
      EUR: 1,
      GBP: 1,
      JPY: 1,
      AUD: 1,
      CAD: 1,
      NZD: 1,
      SGD: 1,
      HKD: 1,
      SEK: 1,
      NOK: 1,
      DKK: 1,
      ISK: 1,
      KRW: 1,
      CNY: 1,
      CHF: 1,
      MXN: 1,
      INR: 1,
      ILS: 1,
      RUB: 1,
      ZAR: 1,
      HRK: 1,
      TRY: 1,
      BRL: 1,
      PLN: 1,
      THB: 1,
      IDR: 1,
      HUF: 1,
      CZK: 1,
      PHP: 1,
      BGN: 1,
      MYR: 1,
      RON: 1,
      AED: 1,
   }


   const updatedServerInfo = await ServerInfo.findOneAndUpdate({}, { currenciesMultipliers }, { new: true });
   req.flash('success', "Successfully updated currencies' multipliers")
   res.redirect('/skins');
}

module.exports.setCurrency = async (req, res) => {
   const { body } = req;
   const { code, symbol } = body;
   const serverInfo = await ServerInfo.findOne({});
   const multiplier = serverInfo.currenciesMultipliers[code];

   req.session.currency = { code, symbol, multiplier }
   // console.log(code, symbol)

   res.json({ success: true })
}