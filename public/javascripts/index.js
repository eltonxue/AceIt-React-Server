$('#learn-more').click(function(event) {
  var bottom = $(document).height() - $(window).height();
  $('html, body').animate({ scrollTop: bottom }, 1000);
});

var socket;
if (socket) {
  socket.on('new question', (username, question) => {
    let popularQuestions = $('#popular-questions');
    let card = $('<li>', { class: 'question-card flex-center row' });
    let usernameText = $(
      `<a class="col-md-3 username username-logged-in" href="/username=${username}"><span class="fa fa-user mr-2"></span>${username} </a>`
    );

    let questionText = $('<div>', { class: 'col-md-9 question' });
    questionText.append(question);

    card.append(usernameText);
    card.append(questionText);

    let questionCards = popularQuestions.children();
    let lastQuestionCard = questionCards[questionCards.length - 1];

    lastQuestionCard.remove(); // Removes last question card
    popularQuestions.prepend(card);
  });
}
