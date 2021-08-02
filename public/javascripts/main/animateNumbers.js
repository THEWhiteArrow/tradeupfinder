const animateNumbers = {
   duration: null,
   smoothness: null,
   containers: document.querySelectorAll('.animateNumbersContainer'),

   animateConfetti: (el) => {
      el.classList.add('confetti-container');
      el.addEventListener('click', () => {
         //reset animation
         el.classList.remove('animate');

         el.classList.add('animate');
         setTimeout(function () {
            el.classList.remove('animate');
         }, 500);
      });
   },


   isMobile: () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
   },

   sleep: (delay) => {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            resolve();
         }, delay);
      })
   },

   start: (data = { isConfetti: false, duration: 5000, smoothness: 1, }) => {
      animateNumbers.duration = data.duration;
      animateNumbers.smoothness = data.smoothness;

      animateNumbers.checkScroll();
      window.addEventListener('scroll', animateNumbers.checkScroll)

      if (data.isConfetti == true) {
         for (let container of animateNumbers.containers) {
            const items = container.querySelectorAll('.animateItem');

            for (let item of items) {


               animateNumbers.animateConfetti(item);


            }
         }
      }
   },

   checkScroll: () => {

      for (let i = 0; i < animateNumbers.containers.length; ++i) {
         if (window.scrollY >= animateNumbers.containers[i].getBoundingClientRect().top && animateNumbers.containers[i].wasUsed == undefined) {
            animateNumbers.containers[i].wasUsed = true,
               animateNumbers.animateContainer(animateNumbers.containers[i]);


         }
      }

      let wereUsedContainers = 0;
      for (let container of animateNumbers.containers) {
         if (container.wasUsed == true) wereUsedContainers++;
      }
      if (wereUsedContainers == animateNumbers.containers.length) window.removeEventListener('scroll', animateNumbers.checkScroll)

   },

   animateContainer: (container) => {
      const elements = container.querySelectorAll('.animateNumbers');


      for (let el of elements) {
         animateNumbers.animateEl(el);
      }
   },

   animateEl: async (el) => {
      const number = Number(el.innerText);
      el.innerText = 0;
      const delay = Math.round(animateNumbers.duration / number * animateNumbers.smoothness * 100) / 100;

      for (let i = 1; i <= number; i += animateNumbers.smoothness) {
         await animateNumbers.sleep(delay);
         el.innerText = i;
      }

   }


}

if (!animateNumbers.isMobile()) { animateNumbers.start({ isConfetti: true, duration: 2000, smoothness: 6, }); }