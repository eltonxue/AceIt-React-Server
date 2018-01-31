const addBank = $('#add-bank');
const questionBanks = $('#main-container');

// Search question banks
const onSearch = (event, scope) => {
  let searchInput = $('#search-banks').val().trim();
  clearPleaseTryAgain();
  if (searchInput) {
    axios
      .get(`/users/banks/search=${searchInput}`)
      .then(response => {
        // Handle bank creations
        const banks = response.data;
        questionBanks.empty();
        banks.forEach(bank => {
          createQuestionBank(bank.id, bank.title, bank.questions, bank.updatedAt);
        });
      })
      .catch(err => pleaseTryAgain());
  } else {
    axios
      .get('/users/banks')
      .then(response => {
        // Handle bank creations
        const banks = response.data;
        questionBanks.empty();
        banks.forEach(bank => {
          createQuestionBank(bank.id, bank.title, bank.questions, bank.updatedAt);
        });
      })
      .catch(err => pleaseTryAgain());
  }
};

// Edits title
const onTitleChange = (event, scope) => {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    // Edit title
    editTitle($(scope));
  }
};

// Add question on enter
const onAdd = (event, scope) => {
  let code = event.keyCode ? event.keyCode : event.which;
  if (code == 13) {
    createQuestion($(scope).next());
  }
};

const updateTime = lastUpdated => {
  // Given the "lastUpdated" label element, update the time
  const date = new Date();

  let times = [date.getHours(), date.getMinutes(), date.getSeconds()];

  times = times.map(current => {
    const next = current < 10 ? `0${String(current)}` : String(current);
    return next;
  });

  const updated = `Last Updated: ${1 +
    date.getMonth()}/${date.getDate()}/${date.getFullYear()} @ ${times[0]}:${times[1]}:${times[2]}`;

  lastUpdated.text(updated);
  // Call when creating question bank, editting title, adding questions, removing questions
};

const createQuestionBank = (bankId, bankTitle, bankQuestions, date) => {
  // Convert string into Date object
  date = new Date(date);

  let card = $('<li>', { class: 'question-bank-card' });

  // Create label container
  let label = $('<div>', { class: 'question-bank-label' });
  let icon = $('<span>', { class: 'fa fa-question-circle-o fa-4x' });
  let title = $('<h1>');
  title.text(bankTitle);

  let remove = $('<div>', { class: 'btn btn-3 remove-question-bank' });
  remove.text('Remove');

  label.append(icon);
  label.append(title);
  label.append(remove);

  // Create questions container
  let questions = $('<ul>', { class: 'list-group question-bank-questions' });

  bankQuestions.forEach(text => {
    let question = $('<li>', { class: 'list-group-item' });
    question.text(text);

    let close = $('<span>', { class: 'fa fa-close ml-auto' });

    question.append(close);
    questions.append(question);
  });

  let questionInput = $('<input>', {
    class: 'list-group-item list-group-item-info mt-2',
    maxlength: '250',
    onKeyPress: 'onAdd(event, this)'
  });
  let add = $('<div>', { class: 'btn btn-2 mt-2 add-question' });
  add.text('Add Question');

  let update = $('<span>', { class: 'last-updated' });

  let d = [1 + date.getMonth(), date.getDate(), date.getFullYear()];
  let t = [date.getHours(), date.getMinutes(), date.getSeconds()];
  t = t.map(current => {
    const next = current < 10 ? `0${String(current)}` : String(current);
    return next;
  });

  update.text(`Last Updated: ${d[0]}/${d[1]}/${d[2]} @ ${t[0]}:${t[1]}:${t[2]}`);

  questions.append(questionInput);
  questions.append(add);
  questions.append(update);

  card.append(label);
  card.append(questions);

  card.attr('data-id', bankId);

  questionBanks.prepend(card);
};

const editTitle = scope => {
  let title = scope;
  let card = title.parent().parent();
  let value = title.val().trim();
  if (value) {
    let newTitle = $('<h1>', { class: 'title' });
    newTitle.text(value);
    title.replaceWith(newTitle);

    // Prevent multiple patch calls
    card.off('click');

    let update = card.find('.last-updated');
    updateTime(update);

    const bankId = card.data('id');
    clearPleaseTryAgain();
    axios
      .patch('/action/bank/update-title', {
        bankId,
        newTitle: value
      })
      .catch(err => pleaseTryAgain());
  }
};

const createQuestion = scope => {
  let questionInput = scope.prev();
  let update = scope.next();
  let question = $('<li>', { class: 'list-group-item' });
  let remove = $('<span>', { class: 'fa fa-close ml-auto' });

  let text = questionInput.val().trim();
  if (text) {
    question.text(text);
    question.append(remove);
    question.insertBefore(questionInput);
    questionInput.val('');

    updateTime(update);

    const bankId = scope.parent().parent().data('id');
    clearPleaseTryAgain();
    axios.patch('/action/bank/add-question', { bankId, question: text }).catch(err => pleaseTryAgain());
  }
};

// Add new question bank
addBank.click(() => {
  clearPleaseTryAgain();
  axios
    .post('/action/bank', { title: 'New Bank', questions: [] })
    .then(response => {
      const bank = response.data;
      createQuestionBank(bank.id, bank.title, bank.questions, bank.updatedAt);
    })
    .catch(err => pleaseTryAgain());
});

// Remove question bank
questionBanks.on('click', '.remove-question-bank', function(event) {
  let card = $(this).parent().parent();
  let bankId = card.data('id');
  clearPleaseTryAgain();
  axios
    .delete('/action/bank', { params: { bankId } })
    .then(response => {
      card.remove();
    })
    .catch(err => pleaseTryAgain());
});

// Edit title
questionBanks.on('click', 'h1', function(event) {
  let title = $('<input>', { class: 'title', maxlength: '25', onKeyPress: 'onTitleChange(event, this)' });
  title.val($(this).text());

  title.click(function(event) {
    event.stopPropagation();
  });

  let card = $(this).parent().parent();
  card.click(function() {
    editTitle($(title));
  });

  $(this).replaceWith(title);
});

// Remove question
questionBanks.on('click', '.fa-close', function(event) {
  let questionElement = $(this).parent();
  const question = questionElement.text();
  const bankId = questionElement.parent().parent().data('id');

  let update = questionElement.parent().children().last();

  updateTime(update);
  clearPleaseTryAgain();
  axios
    .patch('/action/bank/remove-question', { bankId, question })
    .then(response => {
      questionElement.remove();
    })
    .catch(err => pleaseTryAgain());
});

// Add question
questionBanks.on('click', '.add-question', function(event) {
  createQuestion($(this));
});
