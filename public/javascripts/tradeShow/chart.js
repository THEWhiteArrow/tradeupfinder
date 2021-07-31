var myChart;
var isSteamFeeApplied = true;
var range = 10;
const steamFeeMultiplier = 0.87;

const targetedSkinsArrAmount = getAddedNumbers(document.querySelectorAll('.targetedSkinsArr-amount'))
const targetedSkinsNumber = targetedSkinsArrAmount[targetedSkinsArrAmount.length - 1]




function getNumber(elements, property) {
   const arr = [];
   for (let el of elements) arr.push(Math.abs(Number(el[property])))
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

const getDatasetsArr = (range) => {
   const isNotNegative = (v) => (v >= 0);
   let isPrevPositive = null;
   const setNullArr = (l) => {
      let nullArr = [];
      for (let i = 1; i <= l; ++i)nullArr.push(null);
      return nullArr;
   }
   const COLORS = {
      negative: '#d62828ff',
      positive: '#38b000ff',
      draw: '#ffffffaa',
   }


   const datasets = [];

   const inputSkins = document.querySelectorAll('.input-skin input.price-input')
   inputPrice = 0;
   for (let el of inputSkins) inputPrice += Math.abs(el.value)


   inputPrice = Math.round(inputPrice * 100) / 100;

   const targetedSkinsArrPrices = getNumber(document.querySelectorAll('.output-skin input.price-input'), 'value')





   const arr = [0];
   for (let i = 0; i < range; ++i) {
      const randomIndex = random(targetedSkinsNumber);
      const outputIndex = checkOutput(randomIndex);

      isSteamFeeApplied ? arr.push(arr[arr.length - 1] - inputPrice + Math.round(targetedSkinsArrPrices[outputIndex] * steamFeeMultiplier * 100) / 100) : arr.push(arr[arr.length - 1] - inputPrice + targetedSkinsArrPrices[outputIndex]);
   }



   for (let i = 0; i < range + 1; ++i) {

      if (isPrevPositive == null || isNotNegative(arr[i]) != isPrevPositive) {

         if (i > 0) {


            let localDataset = {
               tension: 0.04,
               fill: true,
               data: setNullArr(range + 1),

               pointHitRadius: 20,

               borderDash: [],
               borderColor: null,
               backgroundColor: 'rgba(230, 230, 230, 0.3)',
            };

            localDataset.data[i - 1] = arr[i - 1];
            localDataset.data[i] = arr[i];
            localDataset.borderDash = [5, 5];
            if (isNotNegative(arr[i])) localDataset.borderColor = COLORS.positive;
            else localDataset.borderColor = COLORS.negative;

            datasets.push(localDataset)


         }










         let localDataset = {
            tension: 0.04,
            fill: true,
            data: setNullArr(range + 1),

            pointHitRadius: 20,

            borderDash: [],
            borderColor: null,
            backgroundColor: 'rgba(230, 230, 230, 0.3)',
         };
         localDataset.data[i] = arr[i];
         if (isNotNegative(arr[i])) localDataset.borderColor = COLORS.positive;
         else localDataset.borderColor = COLORS.negative;

         datasets.push(localDataset)
         isPrevPositive = isNotNegative(arr[i]);

      } else {
         datasets[datasets.length - 1].data[i] = arr[i];
         if (isNotNegative(arr[i])) datasets[datasets.length - 1].borderColor = COLORS.positive;
         else datasets[datasets.length - 1].borderColor = COLORS.negative;
      }
   }
   // console.log(datasets)
   return datasets;
}

const manageClasses = (elements, classNameDelete, classNameAdd) => {
   for (let el of elements) { el.classList.remove(classNameDelete); el.classList.add(classNameAdd) }
}



const createChart = (range) => {

   const symbol = document.querySelector('.input-price .symbol').innerText;
   const labels = getLabels(range);
   const datasets = getDatasetsArr(range);
   const data = {
      labels: labels,
      datasets: datasets,
   };
   const config = {
      type: 'line',
      data: data,
      options: {
         plugins: {
            legend: {
               display: false
            },
            tooltip: {
               callbacks: {
                  title: (el) => {
                     return `Trade #${el[0].dataIndex}`;
                  },
                  label: (el) => {
                     if (el.dataset.borderDash.length != 0) {
                        return null;
                     } else {
                        return ` ${el.formattedValue} ${symbol}`;
                     }
                  }
               },
            },
         },
         responsive: true,
         color: 'rgba(255,255,255,0.85)',
         scales: {
            x: {
               title: {
                  color: 'rgba(255,255,255,0.85)',
                  display: true,
                  text: 'Number of attempts',
                  font: {
                     size: 17
                  }
               },
               ticks: {
                  color: 'rgba(255,255,255,0.85)',
               },
            },
            y: {
               grid: {
                  drawBorder: true,
                  color: 'rgba(255,255,255,0.1)',
               },
               title: {
                  color: 'rgba(255,255,255,0.85)',
                  display: true,
                  text: `Profit`,
                  font: {
                     size: 17
                  }
               },
               ticks: {
                  color: 'rgba(255,255,255,0.85)',
               },
            }
         }
      }

   };
   ctx = document.getElementById('myChart').getContext('2d');
   myChart = new Chart(ctx, config);
}

const destroyChart = () => {
   myChart.destroy();
}
var ctx;




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