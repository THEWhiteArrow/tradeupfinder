const buttons = document.querySelectorAll('button');

for (let button of buttons) {
   let bg = button.innerText;
   if (bg === 'blue') bg = 'lightblue';
   button.style.backgroundColor = bg;
}