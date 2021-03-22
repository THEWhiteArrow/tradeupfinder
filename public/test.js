const res = document.body.innerText;
const key = '<span class="market_listing_price market_listing_price_without_fee">';
const index = res.indexOf(key);


const data = res.substr(key.length + index, 20);
const key2 = '<';
const index2 = data.indexOf(key2);

let price = data.substr(0, index2);
price = price.trim();

const sendPrice = async (price) => {
   try {
      const url = `http://localhost:3000/value?price=${price}`;
      const res = await fetch(url);
      const data = await res.json();
      // let dataString = await String(data)
      console.log(data);
      setTimeout(() => {
         window.location = 'http://localhost:3000/mapp';

      }, 3000);

   } catch (e) {
      console.log(e)
   }

}

console.log(index, price)
// sendPrice(price);