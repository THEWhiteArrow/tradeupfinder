window.alert = function () { };

var floatsDivs;
var floats = [];




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
   axios.post('/map/map-collection', { floats })

   document.body.innerHTML = `<div class="container"><h1 class="display-5 mt-5">Brawo! Twoja kolekcja jest już gotowa i czeka na Ciebie!</h1><a class="btn btn-success mt-3" href="/map/map-collection">Kliknij by odebrać</a></div>`


   // #################### AUTOMATICALLY REDIRECT ##########################
   window.location.href = '/map/map-collection'



}

function getCookie(c_name) {
   if (document.cookie.length > 0) {
      c_start = document.cookie.indexOf(c_name + "=");
      if (c_start != -1) {
         c_start = c_start + c_name.length + 1;
         c_end = document.cookie.indexOf(";", c_start);
         if (c_end == -1) {
            c_end = document.cookie.length;
         }
         return unescape(document.cookie.substring(c_start, c_end));
      }
   }
   return "";
}

window.addEventListener('load', async () => {
   console.log('loaded page!')
   setTimeout(() => {
      manageFloats();
   }, 1000)
});