$('.add-bank').click(function(event) {
  const card = $(this).parent().parent();

  const title = card.find('h1').text();
  const questions = card.find('.list-group-item');
  let questionsArr = [];
  for (let i = 0; i < questions.length; ++i) {
    const question = questions[i];
    questionsArr.push($(question).text());
  }

  clearPleaseTryAgain();

  axios
    .post('/action/bank', { title, questions: questionsArr })
    .then(response => {
      $(this).css('background-color', '#979797');
      $(this).text('Added');
      $(this).off();
    })
    .catch(err => {
      pleaseTryAgain();
    });
});
