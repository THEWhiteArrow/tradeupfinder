const setUpRecheckingBtn = async () => {
   const recheckBtn = document.querySelector('.btn-recheck-trade')


   recheckBtn.addEventListener('click', async (e) => {

      try {

         const data = await getPricesAndFetchData(recheckBtn);
         console.log(data)
         if (data.success) {
            changeStats(data)
         }
      } catch (e) {
         console.warning('Failed to recheck the trade-up')
         console.error(e)
      }


   });
}


const changeStats = (data) => {
   console.log('changing stats...')
   const inputSkinsEl = document.querySelectorAll('input.input-skin');
   inputSkinsEl[0].value = data.firstPrice;
   inputSkinsEl[1].value = data.secondPrice;

   const tradeUpCostEl = document.querySelector('.stats-item-value.input-price .content');
   const tradeUpChancesEl = document.querySelector('.stats-item-value.chances .content');
   const tradeUpProfitabilityEl = document.querySelector('.stats-item-value.profitability .content');

   tradeUpCostEl.innerText = data.inputPrice;
   tradeUpChancesEl.innerText = data.chances;
   tradeUpProfitabilityEl.innerText = data.returnPercentage;

   console.log('stats changed successfully...')
   // const row = form.parentElement.parentElement;
   // const inputPriceEl = row.querySelector('.input-price')
   // const firstPriceEl = row.querySelector('.first-price')
   // const secondPriceEl = row.querySelector('.second-price')
   // const targetedPriceEl = row.querySelector('.targeted-price')

   // const profitPerTradeUpEl = row.querySelector('.profit-per-tradeup')
   // const returnPercentageEl = row.querySelector('.return-percentage')
   // const positiveChanceEl = row.querySelector('.positive-chance')

   // inputPriceEl.innerText = `(${data.inputPrice} ${data.symbol})`
   // firstPriceEl.innerText = `(${data.firstPrice} ${data.symbol})`
   // secondPriceEl.innerText = `(${data.secondPrice} ${data.symbol})`
   // targetedPriceEl.innerText = `(${data.targetedPrice} ${data.symbol})`

   // profitPerTradeUpEl.innerText = `${data.profitPerTradeUp} ${data.symbol}`
   // returnPercentageEl.innerText = `${data.returnPercentage}%`
   // positiveChanceEl.innerText = `${Math.round(data.wantedOutputChance / data.targetedSkinsNumber * 100 * 100) / 100} %`

}

const getPricesAndFetchData = async (btn) => {
   const url = btn.getAttribute('id')
   const inputSkins = document.querySelectorAll('input.input-skin');
   const outputSkins = document.querySelectorAll('input.output-skin');

   const body = {};

   for (let el of inputSkins) {
      const name = el.getAttribute('name');
      const value = el.value;

      body[name] = Number(value);
   }

   for (let el of outputSkins) {
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

setUpRecheckingBtn();
// setUpRealLifeTradeUpChecking();