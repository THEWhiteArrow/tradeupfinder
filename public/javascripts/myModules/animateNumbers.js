const animateNumbers = (() => {
   "use strict";

   let duration = null;
   let smoothness = null;
   let smoothnessCorrection = null;

   const containers = document.querySelectorAll('.animateNumbersContainer');

   const animateConfetti = (el) => {
      el.classList.add('confetti-container');
      el.addEventListener('click', () => {
         //reset animation
         el.classList.remove('animate');

         el.classList.add('animate');
         setTimeout(function () {
            el.classList.remove('animate');
         }, 500);
      });
   };


   const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
   };

   const sleep = (delay) => {
      return new Promise((resolve, reject) => {
         setTimeout(() => {
            resolve();
         }, delay);
      })
   };

   const start = (data = { isConfetti: false, duration: 5000, smoothness: 1, smoothnessCorrection: 1 }) => {

      if (!isMobile()) {

         duration = data.duration;
         smoothness = data.smoothness;
         smoothnessCorrection = data.smoothnessCorrection;

         checkScroll();
         window.addEventListener('scroll', checkScroll)

         if (data.isConfetti == true) {

            for (let container of containers) {
               const items = container.querySelectorAll('.animateItem');

               for (let item of items) {
                  animateConfetti(item);
               }

            }

         }

      }

   };

   const checkScroll = () => {

      for (let i = 0; i < containers.length; ++i) {
         if (window.scrollY + window.innerHeight >= containers[i].getBoundingClientRect().top && containers[i].wasUsed == undefined) {
            containers[i].wasUsed = true,
               animateContainer(containers[i]);


         }
      }

      let wereUsedContainers = 0;
      for (let container of containers) {
         if (container.wasUsed == true) wereUsedContainers++;
      }
      if (wereUsedContainers == containers.length) window.removeEventListener('scroll', checkScroll)

   };

   const animateContainer = (container) => {
      const elements = container.querySelectorAll('.animateNumbers');

      for (let el of elements) {
         animateEl(el);
      }
   };

   const animateEl = async (el) => {
      const number = Number(el.innerText);
      el.innerText = 0;
      const delay = Math.round(duration / number * smoothness * 100) / 100;
      let localDelayMultiplier = 1;
      delay < 10 ? localDelayMultiplier = smoothnessCorrection : null;

      for (let i = 1; i <= number; i += smoothness * localDelayMultiplier) {
         await sleep(delay * localDelayMultiplier);
         el.innerText = i;
      }
      el.innerText = number;

   };

   return { start };

})()

animateNumbers.start({ isConfetti: true, duration: 2000, smoothness: 1, smoothnessCorrection: 11, });
