
// const baseUrl = 'https://steamcommunity.com/market/listings/730/'

const toName = (name, status) => {
   name = name.replace(' ', '%20%7C%20');
   if (status.indexOf(' ') !== -1) status = status.replace(' ', '%20');
   if (name.indexOf(' ') !== -1) name = name.replace(' ', '%20');
   let output = `${name}%20%28${status}%29`;

   return output;
}

const getSkinPage = async (name) => {
   try {

      const url = 'https://steamcommunity.com/market/listings/730/' + name;
      const res = await fetch(url);
      const data = await res.text();
      let dataString = await String(data)
      console.log(dataString);
      // dataString += 'lolololo';
      // console.log(dataString);

   } catch (e) {
      console.log(e)
   }
   // const index = dataString.indexOf('<span class="market_listing_price market_listing_price_with_fee">')

   // return index;
}
