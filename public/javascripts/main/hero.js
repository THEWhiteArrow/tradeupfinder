const parallax = (() => {
   "use strict";

   const img = document.querySelector('#parallax-img');
   const h1 = document.querySelector('#parallax-h1');
   const p = document.querySelector('#parallax-p');
   const btn1 = document.querySelector('#parallax-btn1');
   const btn2 = document.querySelector('#parallax-btn2');

   const breakpoints = {
      xs: 0,
      sm: 576,
      md: 768,
      lg: 992,
      xl: 1200,
      xxl: 1400,
   };


   const start = () => {
      checkResize();
      window.addEventListener('resize', checkResize)
   };
   const checkResize = () => {
      if (window.innerWidth >= breakpoints['lg']) {
         window.removeEventListener('scroll', calculateEffect);

         calculateEffect();
         window.addEventListener('scroll', calculateEffect);
      } else {
         window.removeEventListener('scroll', calculateEffect);
         img.style.transform = `none`;
         h1.style.transform = `none`;
         p.style.transform = `none`;
         btn1.style.transform = `none`;
         btn2.style.transform = `none`;
      }
   };
   const calculateEffect = () => {
      const { scrollY } = window;
      img.style.transform = `translate3d(${scrollY * 0.15}px,-${scrollY * 0.3}px,0)`;
      h1.style.transform = `translate3d(0,-${scrollY * 0.6}px,0)`;
      p.style.transform = `translate3d(0,-${scrollY * 0.4}px,0)`;
      btn1.style.transform = `translate3d(0,-${scrollY * 0.2}px,0)`;
      btn2.style.transform = `translate3d(0,-${scrollY * 0.15}px,0)`;
   };

   return { start };

})();


const glitching = (() => {
   "use strict";

   const morseCode = {
      timing: {
         '.': 350,
         '-': 1000,
         space: 300,
         sleep: 900,
      },
      alfabet: {
         'a': '.-',
         'b': '-...',
         'c': '-.-.',
         'd': '-..',
         'e': '.',
         'f': '..-.',
         'g': '--.',
         'h': '....',
         'i': '..',
         'j': '.---',
         'k': '-.-',
         'l': '.-..',
         'm': '--',
         'n': '-.',
         'o': '---',
         'p': '.--.',
         'q': '--.-',
         'r': '.-.',
         's': '...',
         't': '-',
         'u': '..-',
         'v': '...-',
         'w': '.--',
         'x': '-..-',
         'y': '-.--',
         'z': '--..',
         '1': '.----',
         '2': '..---',
         '3': '...--',
         '4': '....-',
         '5': '.....',
         '6': '-....',
         '7': '--...',
         '8': '---..',
         '9': '----.',
         '0': '-----',
         '_': '..--.-'
      }
   };

   const img = document.querySelector('#hero img');
   const src = { on: '/assets/undraw/undraw_hacker_mind_6y85.svg', off: '/assets/undraw/undraw_hacker_mind_6y85_muted.svg' };

   const sleep = (delay) => {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            resolve();
         }, delay);
      })
   };

   const changeSrc = (delay, state) => {
      return new Promise((resolve, reject) => {
         img.src = src.on;
         setTimeout(() => {
            img.src = src.off;
            resolve();
         }, delay)
      })
   };

   const convertToMorse = async (pharse) => {
      for (let letter of pharse) {
         const sequance = morseCode.alfabet[letter];

         for (let sign of sequance) {
            await changeSrc(morseCode.timing[sign]);
            await sleep(morseCode.timing.space);
         }
         await sleep(morseCode.timing.sleep);
      }
   };

   const start = async () => {
      await sleep(1000)
      await convertToMorse('mango')
      await sleep(1000)
      img.src = src.on;
   }

   return { start };

})();

parallax.start();
glitching.start();

