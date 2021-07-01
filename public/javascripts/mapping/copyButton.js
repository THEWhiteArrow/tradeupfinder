const copyBtn = document.querySelector('#copyBtn');
const ul = document.querySelector('#collectionDisplay');

const mountToClipboard = async (text) => {
   navigator.clipboard.writeText(text).then(() => {
      console.log('Async: Copying to clipboard was successful!');
      copiedToClipboard('success')
   },
      (err) => {
         console.error('Async: Could not copy text: ', err);
         copiedToClipboard('error')
      }
   )
}

const copiedToClipboard = (status) => {


   copyBtn.style.transition = 'all 0.15s ease-in-out';
   status == 'success' ? copyBtn.style.backgroundColor = '#20a768' : copyBtn.style.backgroundColor = 'red';
   status == 'success' ? copyBtn.innerText = 'COPIED TO CLIPBOARD!' : copyBtn.style.backgroundColor = 'FALIED TO COPY TO CLIPBOARD! TRY AGAIN!';
   setTimeout(() => {
      copyBtn.style.backgroundColor = '#198754';
      copyBtn.innerText = "COPY COLLECTION";
   }, 2000)

}

copyBtn.addEventListener('click', async () => {
   const text = ul.innerText + '\n';
   await mountToClipboard(text);
})
