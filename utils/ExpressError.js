class ExpressError extends Error {
   constructor(message, statusCode, info) {
      super();
      this.message = message;
      this.statusCode = statusCode;
      this.info = info;
   }
}

module.exports = ExpressError;