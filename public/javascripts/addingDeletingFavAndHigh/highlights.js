const setUpHighlightBtn = async () => {
   const highlightBtns = document.querySelectorAll('.highlight-btn')



   for (let i = 0; i < highlightBtns.length; i++) {
      highlightBtns[i].isBusy = false;
      highlightBtns[i].addEventListener('click', async (e) => {
         e.preventDefault();
         if (highlightBtns[i].isBusy == false) {
            highlightBtns[i].isBusy = true;

            if (highlightBtns[i].classList.contains('filled')) {
               await manageHighlight('delete', highlightBtns[i]);

            } else {
               await manageHighlight('add', highlightBtns[i]);
            }
            highlightBtns[i].isBusy = false;
         }

      });
   }
}

const sendHighlightTrade = async (action, highlight, highlightName) => {


   let url = `/highlight/${highlight.getAttribute('href')}?action=${action}&highlightName=${highlightName}`;

   console.log(url);

   const res = await axios.get(url);
   const data = res.data;
   console.log(data)

   if (data.success) {

      if (data.action === 'add') {
         highlight.innerHTML = `<img src="/assets/svgs/bulbs/lightbulb-solid.svg" width="16" height="16"
         alt="">`;
         // highlight.setAttribute('id', data.newHighlightId);

      } else if (data.action === 'delete') {

         highlight.innerHTML = `<img src="/assets/svgs/bulbs/lightbulb-regular.svg" width="16" height="16"
         alt="">`;

         // SPRAWDZAM CZY TO JEST STRONA GŁÓWNA Z HIGHLIGHTSAMI
         const h4s = document.querySelectorAll('h4.card-title')
         h4s.length != 0 ? highlight.parentElement.parentElement.parentElement.parentElement.remove() : null;
      }
      highlight.classList.toggle('filled')
   } else if (data.success == false) {
      highlight.classList.add('shake');
      setTimeout(() => {
         highlight.classList.remove('shake');
      }, 1000)
   }
}


const manageHighlight = async (action, highlight) => {

   if (action == 'add') {

      const newSection = document.createElement('section');
      newSection.innerHTML = `
      <div class="card" style="width: 20rem; height: fit-content;">
      <div class="card-body">
      <form id="highlightNameForm" >
      
      <label for="highlightNameInput" class="w-100">
      <h5 class="d-flex flex-row justify-content-between card-title new-highlight"> <span>Enter Highlighted Name</span> <span id="btn-highlight-form-close" class="ms-auto pointer">&#10005;</span>   </h5>
      </label>
      <input id="highlightNameInput" name="highlightName" type="text" class="shadow-lg box-shadow-inset form-control my-2 text-center"
      maxlength="30" minlength="5" required>
      <div class="invalid-feedback my-3">
      Name must be longer than no shorter than 5 characters
      </div>
      <button id="highlightNameBtn" type="submit" class="btn btn-success w-100">Submit</button>
      </form>
      
      </div>
      </div> 
      
      `;

      newSection.setAttribute('id', 'bg-blur')
      newSection.classList.add('d-flex', 'bg-blur', 'position-fixed', 'd-flex', 'w-100', 'h-100', 'justify-content-center', 'align-items-center')
      document.body.prepend(newSection)
      const input = document.querySelector('#highlightNameInput')
      input.focus();
      await sleep(1000);


      const highlightNameForm = document.querySelector('#highlightNameForm');
      const highlightNameInput = document.querySelector('#highlightNameInput');
      const sectionBlur = document.querySelector('#bg-blur');
      const btnHighlightFormClose = document.querySelector('#btn-highlight-form-close');

      btnHighlightFormClose.addEventListener('click', () => {
         sectionBlur.remove();
      })

      highlightNameForm.addEventListener('submit', async (e) => {
         e.stopPropagation();
         e.preventDefault();

         const highlightName = highlightNameInput.value;
         sectionBlur.remove();

         await sendHighlightTrade(action, highlight, highlightName);
      })

   } else {

      await sendHighlightTrade(action, highlight);
   }

}

const sleep = (delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(() => {
         resolve();
      }, delay);
   })
}










setUpHighlightBtn();