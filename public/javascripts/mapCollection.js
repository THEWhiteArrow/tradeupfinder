const form = document.querySelector('#collectionUrlForm')

const getData = (url, delay) => {
   return new Promise((resolve, reject) => {
      setTimeout(async () => {

         const options = {
            method: 'GET',
            headers: new Headers({ 'content-type': 'text/plain' }),
            // mode: 'no-cors'
         };


         const res = await fetch(url, options);
         console.log(res)
         const data = await res.text();
         console.log(data)

         resolve(data);
      }, delay);
   });
}


form.addEventListener('submit', async (e) => {
   e.preventDefault();

   if (form.children.url.value !== '') {

      const url = form.children.url.value;
      form.children.url.value = '';

      const data = await getData(url, 100);
      console.log(data)


   }
})