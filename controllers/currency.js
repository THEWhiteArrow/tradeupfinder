const fetch = require('node-fetch');
const ServerInfo = require('../models/serverInfo')


module.exports.updateCurrencyMultipliers = async (req, res) => {
   const baseUrl = 'https://free.currconv.com/api/v7/convert'
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

   try {


      for (let currencyCode in currenciesMultipliers) {

         const rez = await fetch(`${baseUrl}?q=PLN_${currencyCode}&compact=ultra&apiKey=${process.env.CURRENCY_API_KEY}`)
         const data = await rez.json()

         currenciesMultipliers[currencyCode] = data[`PLN_${currencyCode}`];
      }

      const updatedServerInfo = await ServerInfo.findOneAndUpdate({}, { currenciesMultipliers }, { new: true });

      console.log(currenciesMultipliers)
      res.json({ success: true, currenciesMultipliers })
   } catch (e) {
      console.log(e)
      res.json({ success: false, e })
   }

}

module.exports.setCurrency = async (req, res) => {
   const { code, symbol, currentPage } = req.query;
   const serverInfo = await ServerInfo.findOne({});
   const multiplier = serverInfo.currenciesMultipliers[code];

   req.session.currency = { code, symbol, multiplier }

   // console.log(req.query)
   // console.log(code, symbol)

   res.redirect(currentPage.replaceAll('"', '&'));
}