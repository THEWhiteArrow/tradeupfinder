const getURLParameter = (name) => {
   return decodeURI((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]);
}

const hideURLParams = () => {
   //Parameters to hide (ie ?success=value, ?error=value, etc)
   const hide = ['success', 'error'];
   for (let h in hide) {
      if (getURLParameter(h)) {
         history.replaceState(null, document.getElementsByTagName("title")[0].innerHTML, window.location.pathname);
      }
   }
}

window.onload = () => {
   hideURLParams();
}