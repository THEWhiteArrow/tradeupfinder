const codeForBotBtn = document.querySelector('#code-for-bot')
const checkboxes = document.querySelectorAll('input[type=checkbox].btn-check')
const setUpBotBtn = () => {

   codeForBotBtn.addEventListener('click', () => {

      // COS TRZEBA ZROBIC Z CENAMI BO W ZALEZNOSCI JAK SKINY SIE ULOZA TAK BEDZIE W TABELI A TAK BYC NIE MOZE, W PRZESZUKIWANIU TRZEBA SPRECYZOWAC NA KTOREGO SKINA WSKAZUJE TEN
      const firstSkinId = document.querySelectorAll('input.input-skin')[0].id;
      const secondSkinId = document.querySelectorAll('input.input-skin')[1].id;
      const hrefs = [];
      const amounts = [];
      const maxFloat = [];
      const maxPrice = [];
      let firstAmount = 0, secondAmount = 0;
      const firstPrice = Number(document.querySelectorAll('input.input-skin')[0].value)
      const secondPrice = Number(document.querySelectorAll('input.input-skin')[1].value)

      for (let item of checkboxes) {
         if (item && item.checked == true) {
            let { value } = item;
            value = value.replace(/ /g, '');
            console.log(value)
            let dashIndex;

            dashIndex = value.indexOf('_');
            const replacementId = value.slice(0, dashIndex);
            value = value.slice(dashIndex + 1);

            dashIndex = value.indexOf('_');

            const amount = value.slice(0, dashIndex);
            if (replacementId == firstSkinId) firstAmount = amount;
            else secondAmount = amount;
            amounts.push(amount);


            value = value.slice(dashIndex + 1);
            dashIndex = value.indexOf('_');

            maxFloat.push(value.slice(0, dashIndex));


            value = value.slice(dashIndex + 1);
            dashIndex = value.indexOf('_');

            // Z FAKTU ZE SPRAWDZANIE IDZIE PO KOLEJI WEDLUG KOLEJNOSCI (TAK JAK WIDAC ELEMENTY) TO DOPÓKI NIE DOSZLIŚMY JESZCZE DO SECONDAMOUNT CZYLI W/W JEST RÓWNE 0 
            // TO KORZYSTAMY CIAGLE Z FIRSTAMOUNT CZYLI Z FIRSTPRICE ITD
            if (replacementId == firstSkinId) maxPrice.push(firstPrice)
            else maxPrice.push(secondPrice)
            // maxPrice.push(value.slice(0, dashIndex));

            hrefs.push(value.slice(dashIndex + 1));

         }
      }

      const code = generateTextToCopy(hrefs, amounts, maxFloat, maxPrice, firstAmount, secondAmount);
      mountToClipboard(code, codeForBotBtn);



   })

}



const copiedToClipboard = (status, btn) => {

   btn.style.transition = 'all .2s ease-in-out';
   status == 'success' ? btn.style.backgroundColor = 'rgb(15, 161, 23)' : btn.style.backgroundColor = 'red';
   status == 'success' ? btn.innerText = 'COPIED TO CLIPBOARD!' : btn.style.backgroundColor = 'FALIED TO COPY TO CLIPBOARD! TRY AGAIN!';
   setTimeout(() => {
      btn.style.backgroundColor = '#198754';
      btn.innerText = "Generate Bot's Code";
   }, 2000)

}

const mountToClipboard = (text, btn) => {
   navigator.clipboard.writeText(text).then(() => {
      console.log('Async: Copying to clipboard was successful!');
      copiedToClipboard('success', btn)
   },
      (err) => {
         console.error('Async: Could not copy text: ', err);
         copiedToClipboard('error', btn)
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

setUpBotBtn();