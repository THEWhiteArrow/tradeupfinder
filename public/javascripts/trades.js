const spans = document.querySelectorAll('span.rarity');

for (let span of spans) {
   let bg = span.innerText;
   if (bg === 'light_blue') bg = 'light blue';
   span.style.backgroundColor = bg;
   console.log(span.style.backgroundColor)
   span.style.padding = '3px'
}