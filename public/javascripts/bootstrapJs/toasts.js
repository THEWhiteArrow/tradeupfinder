var option = { animation: true, autohide: true, delay: 8000 }
var toastElList = [].slice.call(document.querySelectorAll('.toast'))
var toastList = toastElList.map(function (toastEl) {
   return new bootstrap.Toast(toastEl, option)
})

toastList.forEach((el, i, arr) => { el.show() })