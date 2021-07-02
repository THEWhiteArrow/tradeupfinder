const currencyMenu = document.querySelector('#currency-menu');

currencyMenu.addEventListener('change', async () => {
   const jsonValue = currencyMenu.value.replaceAll("'", '"');
   const obj = JSON.parse(jsonValue)

   const res = await axios.post('/currency', obj);
   const data = res.data;

   if (data.success) {
      location.reload();
   } else {
      console.error('Unable to change the currency! Try again later!')
   }
})