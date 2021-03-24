const buttons = document.querySelectorAll('button');

for (let button of buttons) {
   let bg = button.innerText;
   if (bg === 'light_blue') bg = 'light blue';
   button.style.backgroundColor = bg;
}