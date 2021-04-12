const buttons = document.querySelectorAll('button');
const form = document.querySelector('form#findFloat');
const formCollection = document.querySelector('form#formCollection');
const floatSpan = document.querySelector('#displayFloat');

for (let button of buttons) {
   let bg = button.innerText;
   if (bg === 'light_blue' && bg !== "Znajdź float'a") bg = 'light blue';
   button.style.backgroundColor = bg;
}

// form.addEventListener('submit', (e) => {
//    e.preventDefault();

//    if (form[0].value !== '' && form[1].value !== '' && form[2].value !== '') {

//       const min = Number(form[0].value);
//       const max = Number(form[1].value);
//       const avg = Number(form[2].value);

//       form[0].value = '';
//       form[1].value = '';
//       form[2].value = '';

//       console.log(min, max, avg)
//       const float = ((max - min) * avg + min);
//       floatSpan.innerText = float;
//    }
// })
