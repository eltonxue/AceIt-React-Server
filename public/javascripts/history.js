axios.get('/users/history').then(history => {
  const historyContainer = $('#history-container');
  const allFeedbacks = history.data;
  allFeedbacks.reverse();

  allFeedbacks.forEach(function(feedback) {
    let blob = new Blob([new Uint8Array(feedback.audio.data)], {
      type: 'audio/wav'
    });

    let card = $('<div>', { class: 'feedback-card' });

    let question = $('<h1>');
    question.text(feedback.question);

    let canvas = $('<canvas>', {
      id: `feedback-chart-${feedback.id}`,
      width: '800',
      height: '400'
    });

    let article = $('<article>', { class: 'clip flex-center' });
    let audio = $('<audio controls></audio>');

    article.append(audio);

    let audioURL = window.URL.createObjectURL(blob);
    audio.attr('src', audioURL);

    let recordedOn = $('<p>', { class: 'last-updated mt-5 mb-0' });

    // Handle Date obj
    let date = new Date(feedback.updatedAt);
    let times = [date.getHours(), date.getMinutes(), date.getSeconds()];

    times = times.map(current => {
      const next = current < 10 ? `0${String(current)}` : String(current);
      return next;
    });

    const updated = `Recorded On: ${1 +
      date.getMonth()}/${date.getDate()}/${date.getFullYear()} @ ${times[0]}:${times[1]}:${times[2]}`;

    recordedOn.text(updated);

    card.append(question);
    card.append(canvas);
    card.append(article);
    card.append(recordedOn);

    historyContainer.append(card);

    // Parse data into tones object
    let tones = {};
    tones.Anger = feedback.anger;
    tones.Fear = feedback.fear;
    tones.Joy = feedback.joy;
    tones.Sadness = feedback.sadness;
    tones.Analytical = feedback.analytical;
    tones.Confident = feedback.confident;
    tones.Tentative = feedback.tentative;

    // Build chart
    Chart.defaults.global.defaultFontColor = 'white';
    var ctx = document.getElementById(`feedback-chart-${feedback.id}`).getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Anger', 'Fear', 'Joy', 'Sadness', 'Analytical', 'Confident', 'Tentative'],
        datasets: [
          {
            label: 'Feedback',
            data: Object.values(tones),
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
              'rgba(255,99,132,1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(255,99,132,1)'
            ],
            borderWidth: 2
          }
        ]
      },
      options: {
        legend: {
          display: false
        },
        responsive: false,
        scales: {
          xAxes: [
            {
              ticks: {
                fontSize: 20
              }
            }
          ],
          yAxes: [
            {
              ticks: {
                max: 1,
                fontSize: 20,
                min: 0
              }
            }
          ]
        }
      }
    });
  });
});

$('#clear').click(() => {
  $('#history-container').empty();

  // AJAX call to delete all Feedbacks
  clearPleaseTryAgain();
  axios.delete('/action/feedback/clear').catch(err => pleaseTryAgain());
});
