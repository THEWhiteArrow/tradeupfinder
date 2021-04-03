const spans = document.querySelectorAll('span.color');

for (let span of spans) {
   let bg = span.innerText;
   span.style.backgroundColor = bg;
   if (bg === 'blue ') span.style.backgroundColor = '#1E93FF';
   if (bg === 'light_blue ') span.style.backgroundColor = '#87CEEB';
}

const perTrades = document.querySelectorAll('.perTrade');
for (let t of perTrades) {
   if (Number(t.innerText) > 0) {
      console.log('yes')
      t.style.backgroundColor = "rgba(140,40,140,0.5)";
   }
}