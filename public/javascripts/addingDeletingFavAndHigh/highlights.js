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
         const h3 = document.querySelectorAll('h3.card-title')
         h3.length != 0 ? highlight.parentElement.parentElement.parentElement.parentElement.remove() : null;
      }
      highlight.classList.toggle('filled')
   }
}


const manageHighlight = async (action, highlight) => {

   if (action == 'add') {

      const newSection = document.createElement('section');
      newSection.innerHTML = `
      <div class="card" style="width: 20rem; height: fit-content;">
      <div class="card-body">
      <form id="highlightNameForm" class="needs-validation" novalidate>
      
      <label for="highlightNameInput">
      <h5 class="card-title">Enter Highlighted Name</h5>
      </label>
      <input id="highlightNameInput" name="highlightName" type="text" class="form-control my-2 text-center"
      maxlength="20" minlength="5" >
      <div class="invalid-feedback my-3">
      Name must be longer than no shorter than 5 characters
      </div>
      <button id="highlightNameBtn" type="submit" class="btn btn-success w-100">Submit</button>
      </form>
      
      </div>
      </div>`;

      newSection.setAttribute('id', 'bg-blur')
      newSection.classList.add('d-flex', 'bg-blur', 'position-fixed', 'd-flex', 'w-100', 'h-100', 'justify-content-center', 'align-items-center')
      document.body.prepend(newSection)
      const input = document.querySelector('#highlightNameInput')
      // <script src="/javascripts/bootstrapJs/validateForms.js"></script>
      input.focus();
      // await sleep(1000);

      validateForms();



      const highlightNameForm = document.querySelector('#highlightNameForm');
      const highlightNameInput = document.querySelector('#highlightNameInput');
      const sectionBlur = document.querySelector('#bg-blur');

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

const validateForms = () => {
   // Fetch all the forms we want to apply custom Bootstrap validation styles to
   const forms = document.querySelectorAll('.needs-validation')

   // Loop over them and prevent submission
   Array.prototype.slice.call(forms)
      .forEach(function (form) {
         form.addEventListener('submit', function (event) {
            if (!form.checkValidity()) {
               event.preventDefault()
               event.stopPropagation()
            }
            form.classList.add('was-validated')
         }, false)
      })
}

setUpHighlightBtn();