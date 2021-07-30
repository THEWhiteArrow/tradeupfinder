const confettiContainer = document.querySelector('.confetti-container');
const compactModeBtn = document.querySelector('#compact-mode-btn');
const inputSkinsContainer = document.querySelector('#inputs');
const outputSkinsContainer = document.querySelector('#outputs');

const checkOnPageFormValidity = (form, e) => {
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


         checkOnPageFormValidity(recheckForm, e);


         if (!recheckForm.classList.contains('is-invalid')) {

            const newInfo = await getPricesAndFetchData(recheckForm, 'readonly', {})
            recheckingInfo = newInfo;

            setTimeout(async () => {

               isRecheckingBusy.pop();
               if (isRecheckingBusy.length == 1) {
                  const data = await getPricesAndFetchData(recheckForm, 'request', recheckingInfo);
                  // console.log(data)
                  if (data.success) {
                     changeStats(data)
                  }

                  animateConfetti();
                  destroyChart()
                  createChart(range)
               }

            }, 750);
         } else {
            setTimeout(async () => {

               isRecheckingBusy.pop();

            }, 750);
         }




      });
   })
}

const changeStats = (data) => {
   // console.log(data);

   const tradeUpCostEl = document.querySelector('.stats-item-value.input-price .content')
   const tradeUpChancesEl = document.querySelector('.stats-item-value.chances .content')
   const tradeUpProfitabilityEl = document.querySelector('.stats-item-value.profitability .content')
   const tradeUpProfitPerTradeUpEl = document.querySelector('.stats-item-value.perTradeUp .content')

   tradeUpCostEl.innerText = data.tradeCost;
   tradeUpChancesEl.innerText = data.chances;
   tradeUpProfitabilityEl.innerText = data.returnPercentageTaxed + ' / ' + data.returnPercentage;
   tradeUpProfitPerTradeUpEl.innerText = data.profitPerTradeUpTaxed + ' / ' + data.profitPerTradeUp;

   if (data.isAvgFloatChanged) {
      console.log('...user changed floats...')

      const tradeUpAvgFloatEl = document.querySelector('.stats-item-value.avg-float .content')
      tradeUpAvgFloatEl.innerText = (data.avgFloat + '000').slice(0, 6);

      for (let info of data.outputSkinsNewData) {
         const outputSkinCard = document.getElementById(`skin-${info._id}`)
         const label = outputSkinCard.querySelector('label')
         const priceInput = outputSkinCard.querySelector('input.price-input')
         const float = outputSkinCard.querySelector('.skin-card-float')

         float.innerText = info.float;
         let qIndex = label.innerText.indexOf('(');

         // const oldQuality = label.innerText.slice(qIndex + 1, qIndex2)
         // if (oldQuality != info.quality) {


         outputSkinCard.style.opacity = '0';
         label.innerText = label.innerText.slice(0, qIndex) + `(${info.quality})`;
         priceInput.value = info.price;
         setTimeout(() => {
            outputSkinCard.style.opacity = 1;
         }, 1000)
         // }

      }

      for (let info of data.inputSkinsNewData) {
         const inputSkinCard = document.getElementById(`skin-${info.sn}`)
         const label = inputSkinCard.querySelector('label')

         let qIndex = label.innerText.indexOf('(');
         label.innerText = label.innerText.slice(0, qIndex) + `(${info.quality})`;

      }



   }

   console.log('...recalculated successfully...')

}

const getPricesAndFetchData = async (form, action, info) => {
   const body = {};
   const url = form.getAttribute('action')

   const editGloballySwitch = document.querySelectorAll('input#editGloballySwitch');
   editGloballySwitch.length ? body.editGloballySwitch = editGloballySwitch[0].checked : null;

   const inputFloats = document.querySelectorAll('input.skin-card-float');
   const inputSkins = document.querySelectorAll('.input-skin input.price-input');
   const outputSkins = document.querySelectorAll('.output-skin input.price-input');

   const tradeUpAvgFloatEl = document.querySelector('.stats-item-value.avg-float .content')
   const onPageAvgFloat = Number(tradeUpAvgFloatEl.innerText);
   let totalFloat = 0;

   for (let el of inputFloats) {
      const name = el.getAttribute('name');
      const value = el.value;
      totalFloat += Number(value);
      body[name] = Number(value);
   }
   totalFloat = Math.round(totalFloat / 10 * 10000) / 10000;
   // console.log(totalFloat)
   // console.log(onPageAvgFloat)
   totalFloat == onPageAvgFloat ? body.isAvgFloatChanged = false : body.isAvgFloatChanged = true;

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

const setUpCompactModeBtn = () => {
   compactModeBtn.addEventListener('click', () => {
      compactModeBtn.classList.toggle('btn-primary');
      compactModeBtn.classList.toggle('btn-outline-primary');


      inputSkinsContainer.classList.toggle('col-md-6');
      outputSkinsContainer.classList.toggle('col-md-6');

      !compactModeBtn.classList.contains('btn-outline-primary') ? compactModeBtn.innerText = 'Switch To Compact Calculator Mode' : compactModeBtn.innerText = "Switch To Normal Calculator Mode";
   })
}


setUpRecheckingTrade();
setUpCompactModeBtn();

