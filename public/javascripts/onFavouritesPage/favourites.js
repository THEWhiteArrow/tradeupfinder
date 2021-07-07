const setUpFavouriteBtn = async () => {
   const stars = document.querySelectorAll('.star')

   for (let i = 0; i < stars.length; i++) {
      stars[i].addEventListener('click', async (e) => {
         e.preventDefault();
         await manageFavourite('delete', stars[i]);


      });
   }
}
const manageFavourite = async (action, star) => {
   // const paramss = new URLSearchParams(window.location.search)
   // const researchName = paramss.get('researchName')
   const url = `/favourites/manage/${star.getAttribute('href')}/${star.getAttribute('id')}?action=delete`
   console.log(url);

   const res = await axios.get(url);
   const data = res.data;
   console.log(data)
   if (data.success) {

      if (data.action === 'delete') {
         star.parentElement.parentElement.parentElement.parentElement.remove()
      }

   }

}



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


const init = () => {
   setUpFavouriteBtn()
   setUpRecheckingBtn();
}

init()