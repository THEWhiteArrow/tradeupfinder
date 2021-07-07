const labelCheckbox = document.querySelectorAll('label.btn.btn-checkbox')

for (let label of labelCheckbox) {
   label.addEventListener('click', () => {
      const checkbox = label.parentElement.querySelector('input[type=checkbox');
      const status = checkbox.checked;
      checkbox.checked = !status;
      label.classList.toggle('btn-outline-primary')
      label.classList.toggle('btn-primary')
   })
}