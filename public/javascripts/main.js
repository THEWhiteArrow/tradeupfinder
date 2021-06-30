const buttons = document.querySelectorAll('button');
const form = document.querySelector('form#findFloat');
const formCollection = document.querySelector('form#formCollection');
const floatSpan = document.querySelector('#displayFloat');

const action = document.querySelector('#action');
const newResearch = document.querySelector('.new-research');
const displayResearch = document.querySelector('.display-research');
const checkStatsSelect = document.querySelector('.display-checkStats');
const priceCorrectionDiv = document.querySelector('.price-correction');

const manageResearchDisplayingInputs = () => {
   const state = action.value;
   if (state == 'nothing') {
      priceCorrectionDiv.classList.remove('hide')
      checkStatsSelect.classList.add('hide')
      newResearch.classList.add('hide')
      displayResearch.classList.add('hide')
   } else if (state == 'save') {
      priceCorrectionDiv.classList.remove('hide')
      newResearch.classList.remove('hide')
      displayResearch.classList.add('hide')
      checkStatsSelect.classList.add('hide')
   } else if (state == 'display') {
      checkStatsSelect.classList.remove('hide')
      priceCorrectionDiv.classList.add('hide')
      newResearch.classList.add('hide')
      displayResearch.classList.remove('hide')
   }
}

for (let button of buttons) {
   let bg = button.innerText;
   if (bg === 'light_blue' && bg !== "Znajdź float'a") bg = 'light blue';
   button.style.backgroundColor = bg;
}

manageResearchDisplayingInputs();
action.addEventListener('click', manageResearchDisplayingInputs)