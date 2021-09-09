$(document).ready(function () {

$('#myModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus')
});

// Pause / play btn funtionality
var carouselState = false;

$(document).on('click','.carousel-button',function () {
  if(!carouselState){
    $('#home-carousel').carousel('pause');
    $('.pause-button').toggleClass('d-none');
    $('.play-button').toggleClass('d-none');
  } else {
    $('.play-button').toggleClass('d-none');
    $('#home-carousel').carousel('cycle');
    $('.pause-button').toggleClass('d-none');
  }
  carouselState = !carouselState;
});

// Fallback for browsers that don't support the HTML5 Picture element
document.createElement("picture");

} );