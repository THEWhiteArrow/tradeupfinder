const forms = document.querySelectorAll('.code-for-bot');

const setUpBotForms = () => {
   for (let form of forms) {
      form.addEventListener('submit', (e) => {
         e.preventDefault()
         const hrefs = [];
         const amounts = [];
         const maxFloat = [];
         const maxPrice = [];
         let firstAmount = 0, secondAmount = 0;


         for (let item of form) {
            if (item && item.checked == true) {
               let { value } = item;
               let dashIndex = 1;

               let a = value.slice(0, dashIndex);
               if (firstAmount == 0) firstAmount = a;
               else if (a != firstAmount) secondAmount = a;
               amounts.push(a);


               value = value.slice(dashIndex + 1);
               dashIndex = value.indexOf('_');

               maxFloat.push(value.slice(0, dashIndex));


               value = value.slice(dashIndex + 1);
               dashIndex = value.indexOf('_');

               maxPrice.push(value.slice(0, dashIndex));

               hrefs.push(value.slice(dashIndex + 1));

            }
         }

         const codeForBot = generateTextToCopy(hrefs, amounts, maxFloat, maxPrice, firstAmount, secondAmount);
         mountToClipboard(codeForBot, form);


      });
   }
}

const copiedToClipboard = (status, form) => {
   const btn = form.querySelector('button');

   btn.style.transition = 'all .25s ease-in-out';
   status == 'success' ? btn.style.backgroundColor = 'green' : btn.style.backgroundColor = 'red';
   status == 'success' ? btn.innerText = 'COPIED TO CLIPBOARD!' : btn.style.backgroundColor = 'FALIED TO COPY TO CLIPBOARD! TRY AGAIN!';
   setTimeout(() => {
      btn.style.backgroundColor = '#0D6EFD';
      btn.innerText = "Generate Bot's Code";
   }, 3000)

}

const mountToClipboard = (text, form) => {
   navigator.clipboard.writeText(text).then(() => {
      console.log('Async: Copying to clipboard was successful!');
      copiedToClipboard('success', form)
   },
      (err) => {
         console.error('Async: Could not copy text: ', err);
         copiedToClipboard('error', form)
      }
   )
}

const generateTextToCopy = (hrefs, amounts, maxFloat, maxPrice, firstAmount, secondAmount) => {
   let text = `href = [\n`

   //DODAWANIE HREFOW
   for (let href of hrefs) {
      text += `"${href}",\n`
   }
   //DODAWANIE FIRST & SECOND AMOUNT
   text += `]\nfirstAmount=${firstAmount}\nsecondAmount=${secondAmount}\n\namount=[`

   //DODAWANIE AMOUNT
   for (let amount of amounts) {
      if (amount == firstAmount)
         text += "'firstAmount',"
      else
         text += "'secondAmount',"
   }
   text += ']\nmaxFloat=['

   //DODAWNIE FLOATOW
   for (let float of maxFloat) {
      text += `${float},`
   }
   text += ']\nmaxPrice=['

   //DODAWNIE CEN
   for (let price of maxPrice) {
      text += `${price},`
   }
   text += ']'

   //ZWRACANIE ZMIENNEJ
   return text;
}

setUpBotForms();