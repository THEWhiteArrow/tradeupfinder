const navSettingsHeight = document.querySelector('nav#settings').offsetHeight;
const navNavbar = document.querySelector('nav#navbar');
const navbarSpace = document.querySelector('.navbarSpace');

const manageNavNavbar = () => {
   if (window.scrollY > navSettingsHeight && !navNavbar.classList.contains('fixed-top')) { navNavbar.classList.add('fixed-top'); navbarSpace.classList.remove('d-none') }
   else if (window.scrollY <= navSettingsHeight && navNavbar.classList.contains('fixed-top')) { navNavbar.classList.remove('fixed-top'); navbarSpace.classList.add('d-none') }
}

window.addEventListener('scroll', manageNavNavbar);