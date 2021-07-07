const setUpFavouriteBtn = async () => {
   const stars = document.querySelectorAll('.star')

   for (let i = 0; i < stars.length; i++) {
      stars[i].addEventListener('click', async (e) => {
         e.preventDefault();
         await manageFavourite('delete', stars[i]);


      });
   }
}
const manageFavourite = async (action, star) => {
   // const paramss = new URLSearchParams(window.location.search)
   // const researchName = paramss.get('researchName')
   const url = `/favourites/manage/${star.getAttribute('href')}/${star.getAttribute('id')}?action=delete`
   console.log(url);

   const res = await axios.get(url);
   const data = res.data;
   console.log(data)
   if (data.success) {

      if (data.action === 'delete') {
         star.parentElement.parentElement.parentElement.parentElement.remove()
      }

   }

}




setUpFavouriteBtn()
