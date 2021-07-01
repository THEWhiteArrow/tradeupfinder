
window.alert = function () { };
let collection = [];
let titles, rarity;
let collectionName = '';
let hrefs = [];
let ul;
let links;
let res;

const convertNames = (s) => {
   let t = s.innerText;
   const i = t.indexOf('|')
   const name = t.slice(0, i).trim();
   const skin = t.slice(i + 1).trim();
   return { name, skin }
}

const convertRarity = (s) => {
   let t = s.innerText;
   let rarity;

   if (t.indexOf('Covert') !== -1) {
      rarity = 'red';
   } else if (t.indexOf('Classified') !== -1) {
      rarity = 'pink';
   } else if (t.indexOf('Restricted') !== -1) {
      rarity = 'purple';
   } else if (t.indexOf('Mil') !== -1) {
      rarity = 'blue';
   } else if (t.indexOf('Industrial') !== -1) {
      rarity = 'light_blue';
   } else if (t.indexOf('Consumer') !== -1) {
      rarity = 'grey';
   }


   return rarity;
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

const mapPage = async () => {
   collectionName = document.querySelector('#collectionName').innerText;
   titles = document.querySelectorAll('h3 ');
   rarity = document.querySelectorAll('a p.nomargin');
   links = document.querySelectorAll('div.price p.nomargin a.price-st')
   if (links.length === 0) {
      links = document.querySelectorAll('div.price p.nomargin a.price-souv');
      rarity = document.querySelectorAll('div.quality p.nomargin');
      if (links.length < 2) {
         links = document.querySelectorAll('div.price p.nomargin a');
      }

      console.log('souvenirs')
      for (let i = 0; i < rarity.length; i++) {
         hrefs.push(links[i].getAttribute('href'));
         const icon = links[i].parentElement.parentElement.parentElement.querySelector('img').getAttribute('src');
         const { name, skin } = convertNames(titles[i]);
         let instance = {
            name,
            skin,
            rarity: convertRarity(rarity[i]),
            min_float: '',
            max_float: '',
            isInStattrak: false,
            icon,
         }

         collection.push(instance);
      }
   } else {


      for (let i = 1; i < rarity.length; i++) {
         hrefs.push(links[i - 1].getAttribute('href'));
         const icon = links[i - 1].parentElement.parentElement.parentElement.querySelector('img').getAttribute('src');
         const { name, skin } = convertNames(titles[i + 1]);
         let instance = {
            name,
            skin,
            rarity: convertRarity(rarity[i]),
            min_float: '',
            max_float: '',
            isInStattrak: true,
            icon,
         }

         collection.push(instance);
      }
   }

   console.log('collection successfully mapped without floats');

   let content = '';
   const body = document.body;
   content += `<div class="container py-3"><a class="btn btn-primary mt-2 ms-4" href="/skins">Index</a>`;
   content += '<ul class="my-4">'
   content += `<div>${collectionName}:[</div>`
   for (let skin of collection) {
      content += `<li>{
         <div>name:"${skin.name}",</div>
         <div>skin:"${skin.skin}",</div>
         <div>rarity:"${skin.rarity}",</div>
         <div>min_float:"",</div>
         <div>max_float:"",</div>
         <div>isInStattrak:${skin.isInStattrak}</div>
         <div>icon:"${skin.icon}",</div>
      },</li>`;
   }
   content += '] </ul></div>';
   body.innerHTML = content;
   console.log(collection)




   // const res = await fetch('/skins/map-collection/floats', {
   //    method: "POST",
   //    headers: {
   //       'Content-type': 'application/json',
   //    },
   //    body: JSON.stringify({ collectionName, skins: collection, hrefs }),
   // });
   res = await axios.post('/map/map-collection/floats', {
      collectionName,
      skins: collection,
      hrefs
   })

   // <a class="btn btn-success mt-2 mx-3" href="/skins/map-collection/floats">Zmapuj floaty</a>
   const data = res.data;
   console.log(data)
   if (data.success) {
      let index = document.body.innerHTML.indexOf('</a>');
      let content = document.body.innerHTML.slice(0, index + 4) + '<a class="btn btn-success mt-2 mx-3" href="/map/map-collection/floats">Zmapuj floaty</a>' + document.body.innerHTML.slice(index + 4);
      document.body.innerHTML = content;


      // #################### AUTOMATICALLY REDIRECT ##########################
      window.location.href = '/map/map-collection/floats'
   }


}



window.addEventListener('load', async () => {
   console.log('loaded page!')
   mapPage();
});

