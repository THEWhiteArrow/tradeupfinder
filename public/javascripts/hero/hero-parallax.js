const isMobile = () => {
   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const parallax = {
   img: document.querySelector('#parallax-img'),
   h1: document.querySelector('#parallax-h1'),
   p: document.querySelector('#parallax-p'),
   btn1: document.querySelector('#parallax-btn1'),
   btn2: document.querySelector('#parallax-btn2'),

   start: () => {
      window.addEventListener('scroll', parallax.calculateEffect);
   },

   calculateEffect: () => {
      const { scrollY } = window;
      parallax.img.style.transform = `translate3d(${scrollY * 0.15}px,-${scrollY * 0.3}px,0)`;
      parallax.h1.style.transform = `translate3d(0,-${scrollY * 0.6}px,0)`;
      parallax.p.style.transform = `translate3d(0,-${scrollY * 0.4}px,0)`;
      parallax.btn1.style.transform = `translate3d(0,-${scrollY * 0.2}px,0)`;
      parallax.btn2.style.transform = `translate3d(0,-${scrollY * 0.15}px,0)`;
   },


}


const glitching = {
   morseCode: {
      timing: {
         '.': 250,
         '-': 1000,
         space: 250,
         sleep: 800,
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
   },


   img: document.querySelector('#hero img'),
   src: { on: '/assets/undraw/undraw_hacker_mind_6y85.svg', off: '/assets/undraw/undraw_hacker_mind_6y85_muted.svg' },

   sleep(delay) {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            resolve();
         }, delay);
      })
   },

   changeSrc(delay, state) {
      return new Promise((resolve, reject) => {
         glitching.img.src = glitching.src.on;
         setTimeout(() => {
            glitching.img.src = glitching.src.off;
            resolve();
         }, delay)
      })
   },

   async convertToMorse(pharse) {
      for (let letter of pharse) {
         const sequance = this.morseCode.alfabet[letter];

         for (let sign of sequance) {
            await this.changeSrc(this.morseCode.timing[sign]);
            await this.sleep(this.morseCode.timing.space);
         }
         await this.sleep(this.morseCode.timing.sleep);
      }
   },

   async start() {
      await this.sleep(1000)
      await this.convertToMorse('mango')
      await this.sleep(1000)
      glitching.img.src = glitching.src.on;

   }
}

if (!isMobile()) { parallax.start(); glitching.start(); }