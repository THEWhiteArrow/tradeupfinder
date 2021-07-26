const setUpFavouriteBtn = async () => {
   const stars = document.querySelectorAll('.star')

   for (let i = 0; i < stars.length; i++) {
      stars[i].isBusy = false;
      stars[i].addEventListener('click', async (e) => {
         e.preventDefault();
         if (stars[i].isBusy == false) {
            stars[i].isBusy = true;
            if (stars[i].classList.contains('filled')) {
               await manageFavourite('delete', stars[i]);

            } else {
               await manageFavourite('add', stars[i]);
            }
            stars[i].isBusy = false;
         }

      });
   }
}

const manageFavourite = async (action, star) => {
   // const paramss = new URLSearchParams(window.location.search)
   // const researchName = paramss.get('researchName')

   const url = `${star.getAttribute('href')}?action=${action}`;
   // console.log(`${url}/trade?action=${action}`)



   const res = await axios.get(url);
   const data = res.data;
   console.log(data)
   if (data.success) {

      if (data.action == 'add') {
         star.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star-fill" viewBox="0 0 16 16"> <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
         </svg>`;


      } else if (data.action == 'delete') {
         star.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-star" viewBox="0 0 16 16"> <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 5.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z" />
         </svg>`;
      }
      star.classList.toggle('filled')
      window.location.pathname.slice(0, 11).indexOf('/favourites') != -1 ? star.parentElement.parentElement.parentElement.parentElement.remove() : null;
   } else if (data.success == false) {
      highlight.classList.add('shake');
      setTimeout(() => {
         highlight.classList.remove('shake');
      }, 1000)
   }


}

setUpFavouriteBtn();
