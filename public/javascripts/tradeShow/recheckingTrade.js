const confettiContainer = document.querySelector('.confetti-container');

const checkOnPageFormValidity = form => {
   if (!form.checkValidity()) {
      e.preventDefault()
      e.stopPropagation()
      form.classList.add('is-invalid')
      form.classList.add('was-validated')
   } else {
      form.classList.remove('is-invalid')
      form.classList.add('was-validated')
   }
}

const animateConfetti = () => {

   //reset animation
   confettiContainer.classList.remove('animate');

   confettiContainer.classList.add('animate');
   setTimeout(function () {
      confettiContainer.classList.remove('animate');
   }, 500);
}

const setUpRecheckingTrade = async () => {
   const recheckForm = document.querySelector('#recheck-trade-form')

   const recheckInputElements = recheckForm.querySelectorAll('input');

   const isRecheckingBusy = [false];

   recheckInputElements.forEach((el) => {
      el.addEventListener('input', async (e) => {
         e.preventDefault();
         let recheckingInfo = {};
         isRecheckingBusy.push(true);


         checkOnPageFormValidity(recheckForm);


         if (!recheckForm.classList.contains('is-invalid')) {

            const newInfo = await getPricesAndFetchData(recheckForm, 'readonly', {})
            recheckingInfo = newInfo;

         }

         setTimeout(async () => {

            isRecheckingBusy.pop();
            if (isRecheckingBusy.length == 1) {
               const data = await getPricesAndFetchData(recheckForm, 'request', recheckingInfo);
               console.log(data)
               if (data.success) {
                  changeStats(data)
               }

               animateConfetti();
               destroyChart()
               createChart(range)
            }

         }, 750);



      });
   })
}

const changeStats = (data) => {
   // const inputSkinsEl = document.querySelectorAll('input.input-skin');
   // inputSkinsEl[0].value = data.firstPrice;
   // inputSkinsEl[1].value = data.secondPrice;

   const tradeUpAvgFloatEl = document.querySelector('.stats-item-value.avg-float .content');
   const tradeUpCostEl = document.querySelector('.stats-item-value.input-price .content');
   const tradeUpChancesEl = document.querySelector('.stats-item-value.chances .content');
   const tradeUpProfitabilityEl = document.querySelector('.stats-item-value.profitability .content');
   const tradeUpProfitPerTradeUpEl = document.querySelector('.stats-item-value.perTradeUp .content');

   tradeUpAvgFloatEl.innerText = (data.avgFloat + '00').slice(0, 6);
   tradeUpCostEl.innerText = data.inputPrice;
   tradeUpChancesEl.innerText = data.chances;
   tradeUpProfitabilityEl.innerText = data.returnPercentage;
   tradeUpProfitPerTradeUpEl.innerText = data.profitPerTradeUp;

   console.log('recalculated the trade-up successfully...')

}

const getPricesAndFetchData = async (form, action, info) => {
   const body = {};
   const url = form.getAttribute('action')

   const editGloballySwitch = document.querySelectorAll('input#editGloballySwitch');
   editGloballySwitch.length ? body.editGloballySwitch = editGloballySwitch[0].checked : null;

   const inputFloats = document.querySelectorAll('input.skin-card-float');
   const inputSkins = document.querySelectorAll('input.input-skin');
   const outputSkins = document.querySelectorAll('input.output-skin');

   for (let el of inputFloats) {
      const name = el.getAttribute('name');
      const value = el.value;
      body[name] = Number(value);
   }

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

   if (action == 'readonly') {
      return body;
   } else if (action == 'request') {

      try {
         const res = await axios.post(url, info);
         const data = res.data;
         return data;

      } catch (e) {
         console.error('Failed to recheck the trade-up')
         alert('Failed to recheck the trade. Check your internet connection and try again later or contact us if an error will keep occurring!')
         return { success: false }
      }
   }
}


setUpRecheckingTrade();