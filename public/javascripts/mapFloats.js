window.alert = function () { };

var floatsDivs;
var floats = [];
setTimeout(async () => {

   manageFloats();

}, 30000)

const manageFloats = async () => {

   floatsDivs = document.querySelectorAll('div.marker-value.cursor-default');
   let floatCounter = 0;
   for (let i = 0; i < floatsDivs.length - 1; i += 2) {
      let pom = {
         min_float: Number(floatsDivs[floatCounter].innerText),
         max_float: Number(floatsDivs[floatCounter + 1].innerText)
      }
      console.log(Number(floatsDivs[floatCounter].innerText), Number(floatsDivs[floatCounter + 1].innerText), floatCounter)

      floatCounter += 2;
      floats.push(pom);
   }
   console.log('floaty zmapowane')
   axios.post('http://localhost:3000/skins/map-collection', {
      floats
   })

   document.body.innerHTML = `<div class="container"><h1 class="display-5 mt-5">Brawo! Twoja kolekcja jest już gotowa i czeka na Ciebie!</h1><a class="btn btn-success mt-3" href="/skins/map-collection">Kliknij by odebrać</a></div>`
}
