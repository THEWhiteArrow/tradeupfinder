const setUpFavouriteBtn = async () => {
   const stars = document.querySelectorAll('.star')

   for (let i = 0; i < stars.length; i++) {
      stars[i].addEventListener('click', async (e) => {
         e.preventDefault();
         await manageFavourite('delete', stars[i]);
         stars[i].parentElement.parentElement.parentElement.remove()

      });
   }
}

const setUpRecheckingForms = async () => {
   const forms = document.querySelectorAll('.recheck-form')

   for (let i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', async (e) => {
         e.preventDefault();
         const data = await recheckFavouriteStats(forms[i]);
         console.log(data)
         changeStats(forms[i], data)
         // UPDATE ON PAGE STATS

      });
   }
}

const changeStats = (form, data) => {
   const row = form.parentElement.parentElement;
   const inputPriceEl = row.querySelector('.input-price')
   const firstPriceEl = row.querySelector('.first-price')
   const secondPriceEl = row.querySelector('.second-price')

   const profitPerTradeUpEl = row.querySelector('.profit-per-tradeup')
   const returnPercentageEl = row.querySelector('.return-percentage')
   const positiveChanceEl = row.querySelector('.positive-chance')

   inputPriceEl.innerText = `(${data.inputPrice}zł)`
   firstPriceEl.innerText = `(${data.firstPrice}zł)`
   secondPriceEl.innerText = `(${data.secondPrice}zł)`

   profitPerTradeUpEl.innerText = `${data.profitPerTradeUp}zł`
   returnPercentageEl.innerText = `${data.returnPercentage}%`
   positiveChanceEl.innerText = `${Math.round(data.wantedOutputChance / data.targetedSkinsNumber * 100 * 100) / 100} %`

}

const recheckFavouriteStats = async (form) => {
   const url = form.getAttribute('action')
   const firstPrice = Number(form[0].value);
   const secondPrice = Number(form[1].value);
   console.log(url)
   const res = await axios.post(url, { 'firstPrice': firstPrice, 'secondPrice': secondPrice });
   const data = res.data;
   return data;
}

const manageFavourite = async (action, star) => {
   // const paramss = new URLSearchParams(window.location.search)
   // const researchName = paramss.get('researchName')
   let url = star.getAttribute('href')
   console.log(`${url}/trade?action=${action}`)

   const res = await axios.get(`${url}/trade?action=${action}`);
   const data = res.data;
   console.log(data)
   if (data.success) {

      if (data.action === 'delete') {
         star.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16"> <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
         </svg>`;
      }
      star.classList.toggle('filled')
   }

}


const init = () => {
   setUpFavouriteBtn()
   setUpRecheckingForms();
}

init()