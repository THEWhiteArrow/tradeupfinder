const mongoose = require('mongoose');
const { Schema } = mongoose;

const serverInfoSchema = new Schema({
   lastChanged: { type: String },
   skinsUpdateInfo: {
      type: String
   },
   currenciesMultipliers: {

      USD: { type: Number },
      EUR: { type: Number },
      GBP: { type: Number },
      JPY: { type: Number },
      AUD: { type: Number },
      CAD: { type: Number },
      NZD: { type: Number },
      SGD: { type: Number },
      HKD: { type: Number },
      SEK: { type: Number },
      NOK: { type: Number },
      DKK: { type: Number },
      ISK: { type: Number },
      KRW: { type: Number },
      CNY: { type: Number },
      CHF: { type: Number },
      MXN: { type: Number },
      INR: { type: Number },
      ILS: { type: Number },
      RUB: { type: Number },
      ZAR: { type: Number },
      HRK: { type: Number },
      TRY: { type: Number },
      BRL: { type: Number },
      PLN: { type: Number },
      THB: { type: Number },
      IDR: { type: Number },
      HUF: { type: Number },
      CZK: { type: Number },
      PHP: { type: Number },
      BGN: { type: Number },
      MYR: { type: Number },
      RON: { type: Number },
      AED: { type: Number },
   }

});

const ServerInfo = mongoose.model('serverInfo', serverInfoSchema);
module.exports = ServerInfo;