$('#search').submit(function(e) {
  e.preventDefault();
  let input = $('#search-input').val().trim();
  if (input) {
    window.location.href = `search=${input}`;
  } else {
    window.location.href = `search`;
  }
});
