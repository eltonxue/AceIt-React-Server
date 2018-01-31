$('.username-card').click(function() {
  window.location.href = `username=${$(this).children().text()}`;
});
