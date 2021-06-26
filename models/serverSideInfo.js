const mongoose = require('mongoose');
const { Schema } = mongoose;

const serverSideInfoSchema = new Schema({
   skinsUpdateInfo: {
      type: String
   }

});

const ServerSideInfo = mongoose.model('ServerSideInfo', serverSideInfoSchema);
module.exports = ServerSideInfo;