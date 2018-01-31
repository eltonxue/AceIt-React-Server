function pleaseTryAgain() {
  let item = $('<li>', { class: 'nav-item', id: 'please-try-again' });
  let error = $(
    '<p class="nav-link error"><span class="fa fa-cogs mr-sm-3"></span>Please refresh and try again.</span></p>'
  );
  item.append(error);
  $('#settings').prepend(item);
}

function clearPleaseTryAgain() {
  $('#please-try-again').remove();
}
