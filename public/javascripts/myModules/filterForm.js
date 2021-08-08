

const filterForm = document.querySelector('#filter-form');


const findBest = (() => {
   'use strict';




   const getTradeInfo = (el, i) => {
      const costElText = el.querySelector('.trade-cost span:nth-of-type(2)').innerText;
      const cost = Number(costElText.slice(0, costElText.indexOf(' ')))

      const profitabilityElText = el.querySelector('h5.profitability span:nth-of-type(2)').innerText;
      const profitability = Number(profitabilityElText.slice(0, profitabilityElText.indexOf('%')))

      const profitElText = el.querySelector('.average-profit h5 span:nth-of-type(2)').innerText;
      const profit = Number(profitElText.slice(0, profitElText.indexOf(' ')))

      const chancesElText = el.querySelector('h5.chances span:nth-of-type(2)').innerText;
      const chances = Number(chancesElText.slice(0, chancesElText.indexOf(' ')))
      return { cost, profitability, profit, chances, index: i };

   }


   const find = (e) => {
      e.preventDefault();

      const trades = document.querySelectorAll('li.trade-tile')
      const errorBox = document.querySelector('#filter-form .error-box');
      errorBox.classList.add('d-none');

      const maxCost = Number(filterForm.querySelector('input#maxCost').value) || 1000;
      const minProfitability = Number(filterForm.querySelector('input#minProfitability').value) || 0;
      const minProfit = Number(filterForm.querySelector('input#minProfit').value) || 0;
      const minChances = Number(filterForm.querySelector('input#minChances').value) || 0;

      const tradesInfoArr = [];


      trades.forEach((el, i) => {
         tradesInfoArr.push(getTradeInfo(el, i))
      })
      console.log(tradesInfoArr)

      const filteredTradesArr = tradesInfoArr.filter(el => el.cost <= maxCost && el.profitability >= minProfitability && el.profit >= minProfit && el.chances >= minChances)

      let bestTrade;
      let maxProfitability = 0;
      filteredTradesArr.forEach(el => {
         if (el.profitability > maxProfitability) {
            maxProfitability = el.profitability;
            bestTrade = el;
         }
      })

      if (bestTrade !== undefined) {


         const bounds = trades[bestTrade.index].getBoundingClientRect();
         const scrollYCoords = window.scrollY + bounds.y - (window.innerHeight - bounds.height) / 2;
         window.scroll(0, scrollYCoords)
         return bestTrade.index;
      } else {

         errorBox.classList.add('shake');
         errorBox.classList.remove('d-none');
         setTimeout(() => {
            errorBox.classList.remove('shake');
         }, 1000)

      }
   }

   return { find }

})();

filterForm.addEventListener('submit', findBest.find);