$('#login').submit(function(e) {
  e.preventDefault();
  // Removes all visible errors from previous submit
  let errors = $('.error');
  for (let i = 0; i < errors.length; ++i) {
    errors[i].remove();
  }

  checkEmptyInputs();

  // Logs user in as session user (failure results in errors)
  if ($('.error').length === 0) {
    clearPleaseTryAgain();
    axios
      .post('/auth/login', {
        username: $('#username').val().trim(),
        password: $('#password').val().trim()
      })
      .then(function(response) {
        const { data } = response;
        if (data.redirect) {
          window.location.href = data.redirect;
        } else {
          // Add error messages
          let errorMessage = $('<label>', { class: 'error' });
          errorMessage.text(data.error);
          if (data.type === 'username') {
            $('#username').after(errorMessage);
          } else {
            $('#password').after(errorMessage);
          }
        }
      })
      .catch(function(err) {
        pleaseTryAgain();
      });
  }
});

const checkEmptyInputs = () => {
  // Check if empty inputs
  const inputIDs = ['password', 'username'];

  let errorMessage = $('<label>', { class: 'error' });

  inputIDs.forEach(function(id) {
    let input = $(`#${id}`);
    if (input.val() === '') {
      errorMessage.text('Field required');
      input.after(errorMessage);
    }
  });
};
