var myChart;
var isSteamFeeApplied = true;
var range = 10;
const steamFeeMultiplier = 0.87;

const targetedSkinsArrAmount = getAddedNumbers(document.querySelectorAll('.targetedSkinsArr-amount'))
const targetedSkinsNumber = targetedSkinsArrAmount[targetedSkinsArrAmount.length - 1]




function getNumber(elements, property) {
   const arr = [];
   for (let el of elements) arr.push(Number(el[property]))
   return arr;
}

function getAddedNumbers(elements) {
   const arr = [];
   for (let i = 0; i < elements.length; ++i) {
      i == 0 ? arr.push(Number(elements[i].innerText)) : arr.push(Number(elements[i].innerText) + arr[i - 1]);
   }
   return arr;
}

const checkOutput = (index) => {
   for (let i = 0; i < targetedSkinsArrAmount.length; ++i) {
      if (index <= targetedSkinsArrAmount[i]) return i;
   }
}

const random = (range) => (Math.floor(Math.random() * range) + 1)

const getLabels = (range) => { const arr = []; for (let i = 0; i <= range; i++) { arr[i] = i; } return arr; }

const getResults = (range) => {
   const inputPrice = Number(document.querySelector('.input-price .content').innerText)
   const targetedSkinsArrPrices = getNumber(document.querySelectorAll('input.output-skin'), 'value')




   const arr = [0];
   for (let i = 0; i < range; ++i) {
      const randomIndex = random(targetedSkinsNumber);
      const outputIndex = checkOutput(randomIndex);

      isSteamFeeApplied ? arr.push(Math.round((arr[arr.length - 1] - inputPrice + targetedSkinsArrPrices[outputIndex]) * steamFeeMultiplier * 100) / 100) : arr.push(arr[arr.length - 1] - inputPrice + targetedSkinsArrPrices[outputIndex]);


   }
   return arr;
}

const manageClasses = (elements, classNameDelete, classNameAdd) => {
   for (let el of elements) { el.classList.remove(classNameDelete); el.classList.add(classNameAdd) }
}


const createChart = (range) => {
   const symbol = document.querySelector('.input-price .symbol').innerText;
   const labels = getLabels(range);
   const results = getResults(range);
   const data = {
      labels: labels,
      datasets: [{
         label: 'Trade Up Simulation',
         data: results,
         fill: true,
         borderColor: 'rgb(235, 64, 52)',
         tension: 0.01
      }]
   };
   const config = {
      type: 'line',
      data: data,
      options: {
         responsive: true,
         scales: {
            x: {
               display: true,
               title: {
                  display: true,
                  text: 'Number of attempts',
                  font: {
                     size: 17
                  }
               },
            },
            y: {
               display: true,
               title: {
                  display: true,
                  text: `Profit   [ ${symbol} ]`,
                  font: {
                     size: 17
                  }
               }
            }
         }
      }

   };
   var ctx = document.getElementById('myChart').getContext('2d');
   myChart = new Chart(ctx, config);
}

const destroyChart = () => {
   myChart.destroy();
}





const setUpSimulateAmountBtns = () => {
   const simulateAmountBtns = document.querySelectorAll('.btn-simulate-amount');

   for (let simulateAmountBtn of simulateAmountBtns) {
      simulateAmountBtn.addEventListener('click', () => {
         manageClasses(simulateAmountBtns, "btn-danger", "btn-outline-danger");
         simulateAmountBtn.classList.add('btn-danger');
         simulateAmountBtn.classList.remove('btn-outline-danger');

         range = Number(simulateAmountBtn.innerText);
         destroyChart()
         createChart(range)

      })
   }
}

const setUpSimulateSteamFeeBtn = () => {
   const simulateSteamFeeBtn = document.querySelector('.btn-simulate-steam-fee');

   simulateSteamFeeBtn.addEventListener('click', () => {
      simulateSteamFeeBtn.classList.toggle('btn-danger');
      simulateSteamFeeBtn.classList.toggle('btn-outline-danger');
      isSteamFeeApplied = !isSteamFeeApplied;

      destroyChart()
      createChart(range)
   })
}

const setUpReSimulateBtn = () => {
   const simulateBtn = document.querySelector('.btn-simulate');

   simulateBtn.addEventListener('click', () => {
      destroyChart()
      createChart(range)
   })
}


createChart(10)
setUpSimulateAmountBtns();
setUpSimulateSteamFeeBtn();
setUpReSimulateBtn();