const modal = document.getElementById("modal");
const button = document.getElementById('modal-open');
const close = document.getElementById('close');

button.addEventListener('mouseover', function(){
  button.innerHTML = 'Help!';
});

button.addEventListener('mouseleave', function(){
  button.innerHTML = 'Help';
});


button.addEventListener('click', function() {
  modal.style.display = "block";
});


close.addEventListener('click', function() {
  modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});
