
window.alert = function () { };
let collection = [];
let titles, rarity;
let collectionName = '';
let hrefs = [];
let ul;
let links;
setTimeout(async () => {
   collectionName = document.querySelector('#collectionName').innerText;
   titles = document.querySelectorAll('h3 ');
   rarity = document.querySelectorAll('a p.nomargin');
   links = document.querySelectorAll('div.price p.nomargin a.price-st')

   for (let i = 1; i < rarity.length; i++) {
      hrefs.push(links[i - 1].getAttribute('href'));
      const { name, skin } = convertNames(titles[i + 1]);
      let instance = {
         name,
         skin,
         rarity: convertRarity(rarity[i]),
         min_float: '',
         max_float: '',
      }

      collection.push(instance);
      // console.log(titles[i].innerText, titles[i * 2].innerText, rarity[i].innerText)
   }
   console.log('collection successfully mapped without floats');
   for (let i of document.body.children) {
      i.remove();
   }
   document.body.innerHTML += `<div class="container py-3"><a class="btn btn-primary mt-2" href="/skins">Index</a><a class="btn btn-success mt-2 mx-3" href="/skins/map-collection/floats">Zmapuj floaty</a>`;
   ul = document.createElement('ul');
   document.body.innerHTML += `<div>${collectionName}:</div>`
   ul.innerHTML += '[';
   for (let skin of collection) {
      ul.innerHTML += `<li>{<div>name:'${skin.name}',</div><div>skin:'${skin.skin}',</div><div>rarity:'${skin.rarity}',</div><div>min_float:'',</div><div>max_float:''</div>},</li>`;
   }
   ul.innerHTML += ']';
   document.body.append(ul);
   document.body.innerHTML += '</div>'
   console.log(collection)




   const res = await fetch('/skins/map-collection/floats', {
      method: "POST",
      headers: {
         'Content-type': 'application/json',
      },
      body: JSON.stringify({ collectionName, skins: collection, hrefs }),
   });

   // window.location.href = "/skins/map-collection/floats";


}, 5000)

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