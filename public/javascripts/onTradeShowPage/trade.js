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

   inputPriceEl.innerText = `(${data.inputPrice}zł)`
   firstPriceEl.innerText = `(${data.firstPrice}zł)`
   secondPriceEl.innerText = `(${data.secondPrice}zł)`
   targetedPriceEl.innerText = `(${data.targetedPrice}zł)`

   profitPerTradeUpEl.innerText = `${data.profitPerTradeUp}zł`
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



setUpRecheckingForms();