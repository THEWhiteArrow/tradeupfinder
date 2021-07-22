const navSettingsHeight = document.querySelector('nav#settings').offsetHeight;
const navNavbar = document.querySelector('nav#navbar');
const navbarSpace = document.querySelector('.navbarSpace');

const manageNavNavbar = () => {
   if (window.scrollY > navSettingsHeight && !navNavbar.classList.contains('fixed-top')) { navNavbar.classList.add('fixed-top'); navbarSpace.classList.remove('d-none') }
   else if (window.scrollY <= navSettingsHeight && navNavbar.classList.contains('fixed-top')) { navNavbar.classList.remove('fixed-top'); navbarSpace.classList.add('d-none') }
}

window.addEventListener('scroll', manageNavNavbar);


// SETTINGS NAVBAR
document.querySelector('.custom-select-wrapper').addEventListener('click', function () {
   this.querySelector('.custom-select').classList.toggle('open');
})

for (const option of document.querySelectorAll(".custom-option")) {
   option.addEventListener('click', function () {
      if (!this.classList.contains('selected')) {
         this.parentNode.querySelector('.custom-option.selected').classList.remove('selected');
         this.classList.add('selected');
         this.closest('.custom-select').querySelector('.custom-select__trigger span').textContent = this.textContent;
      }
   })
}

window.addEventListener('click', function (e) {
   const select = document.querySelector('.custom-select')
   if (!select.contains(e.target)) {
      select.classList.remove('open');
   }
});
window.addEventListener('scroll', function (e) {
   const select = document.querySelector('.custom-select')
   if (!select.contains(e.target)) {
      select.classList.remove('open');
   }
});