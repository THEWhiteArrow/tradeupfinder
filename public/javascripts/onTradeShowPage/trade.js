const setUpRecheckingForms = async () => {
   const forms = document.querySelectorAll('.recheck-form')

   for (let i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', async (e) => {
         e.preventDefault();
         const data = await recheckFavouriteStats(forms[i]);
         console.log(data)
         if (data.success) {
            changeStats(forms[i], data)
         }
         // UPDATE ON PAGE STATS

      });
   }
}

const changeStats = (form, data) => {
   const row = form.parentElement.parentElement;
   const inputPriceEl = row.querySelector('.input-price')
   const firstPriceEl = row.querySelector('.first-price')
   const secondPriceEl = row.querySelector('.second-price')
   const targetedPriceEl = row.querySelector('.targeted-price')

   const profitPerTradeUpEl = row.querySelector('.profit-per-tradeup')
   const returnPercentageEl = row.querySelector('.return-percentage')
   const positiveChanceEl = row.querySelector('.positive-chance')

   inputPriceEl.innerText = `(${data.inputPrice} ${data.symbol})`
   firstPriceEl.innerText = `(${data.firstPrice} ${data.symbol})`
   secondPriceEl.innerText = `(${data.secondPrice} ${data.symbol})`
   targetedPriceEl.innerText = `(${data.targetedPrice} ${data.symbol})`

   profitPerTradeUpEl.innerText = `${data.profitPerTradeUp} ${data.symbol}`
   returnPercentageEl.innerText = `${data.returnPercentage}%`
   positiveChanceEl.innerText = `${Math.round(data.wantedOutputChance / data.targetedSkinsNumber * 100 * 100) / 100} %`

}

const recheckFavouriteStats = async (form) => {
   const url = form.getAttribute('action')
   // const firstPrice = Number(form[0].value);
   // const secondPrice = Number(form[1].value);

   const body = {};

   for (let el of form) {
      const name = el.getAttribute('name');
      const value = el.value;

      body[name] = Number(value);
   }



   console.log(url)
   const res = await axios.post(url, body);
   const data = res.data;
   return data;
}

// const setUpRealLifeTradeUpChecking = async () => {
//    const steamApiLink = 'http://steamcommunity.com/market/priceoverview/?appid=730&currency=6&market_hash_name='
//    const body = {};
//    const form = document.querySelector('.recheck-form');
//    const inputs = form.querySelectorAll('input')
//    const magnifierBtn = document.querySelector('.magnifier');
//    const alts = [];
//    inputs.forEach((el, i) => { alts.push(el.alt) })
//    try {
//       magnifierBtn.addEventListener('click', async (e) => {
//          e.preventDefault();
//          for (let alt of alts) {
//             // const url = encodeURI(`${steamApiLink}${id}`)
//             const url = `${steamApiLink}${alt}`
//             const res = await axios.get(url, { headers: { 'Access-Control-Allow-Origin': '*' } })
//             // BEDZIE TRZEBA DODAC TIME OUT HANDLING
//             const data = res.data;
//             if (data.success) {
//                console.log(data)
//             }
//          }
//       })
//    } catch (e) {
//       console.log(e)
//    }
// }

setUpRecheckingForms();
// setUpRealLifeTradeUpChecking();