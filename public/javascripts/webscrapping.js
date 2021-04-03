const sendPrice = async (price) => {
   try {



      const url = `http://localhost:3000/value?price=${price}`;
      const res = await fetch(url);
      const data = await res.json();
      // let dataString = await String(data)
      console.log(data);
      window.location = 'http://localhost:3000/';

   } catch (e) {
      console.log(e)
   }

}

const price = document.querySelector('span.market_listing_price').innerText;
console.log(price);
// sendPrice(price);

