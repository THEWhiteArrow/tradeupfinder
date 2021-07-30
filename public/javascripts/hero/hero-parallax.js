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
      parallax.img.style.transform = `translate3d(0,-${scrollY * 0.25}px,0)`;
      parallax.h1.style.transform = `translate3d(0,-${scrollY * 0.55}px,0)`;
      parallax.p.style.transform = `translate3d(0,-${scrollY * 0.35}px,0)`;
      parallax.btn1.style.transform = `translate3d(0,-${scrollY * 0.15}px,0)`;
      parallax.btn2.style.transform = `translate3d(0,-${scrollY * 0.1}px,0)`;
   },


}

const isMobile = () => {
   return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}
if (!isMobile()) { parallax.start(); }