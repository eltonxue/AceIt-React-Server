$('#register').submit(function(e) {
  // Clear error messages
  e.preventDefault();
  let errors = $('.error');
  for (let i = 0; i < errors.length; ++i) {
    errors[i].remove();
  }

  checkEmptyInputs();

  // Registration
  if ($('.error').length === 0) {
    clearPleaseTryAgain();
    axios
      .post('/auth/register', {
        username: $('#username').val().trim(),
        email: $('#email').val().trim(),
        password: $('#password').val(),
        confirmPassword: $('#confirm-password').val()
      })
      .then(function(response) {
        const { data } = response;
        if (!data.error) {
          axios
            .post('/auth/login', {
              username: data.username,
              password: data.password
            })
            .then(function(response) {
              window.location.href = response.data.redirect;
            });
        } else {
          // Add error messages
          let errorMessage = $('<label>', { class: 'error' });
          errorMessage.text(data.error);
          if (data.type === 'username') {
            $('#username').after(errorMessage);
          } else if (data.type === 'email') {
            $('#email').after(errorMessage);
          } else if (data.type === 'password') {
            $('#confirm-password').after(errorMessage);
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
  const inputIDs = ['password', 'email', 'username'];

  let errorMessage = $('<label>', { class: 'error' });

  inputIDs.forEach(function(id) {
    let input = $(`#${id}`);
    if (input.val() === '') {
      errorMessage.text('Field required');
      input.after(errorMessage);
    }
  });
};
