(function(window) {
  "use strict";

  var interval = 3000,
      max = 20;

  var messages = [],
      socket = io('http://127.0.0.1:8080'),
      storage = window.sessionStorage,
      container = document.querySelector('#tweets'),
      indicator = document.querySelector('.twtcst_indicator'),
      saved = storage.getItem('twtcst'),
      template = document.querySelector('#tweet-template').innerHTML;

  function mustache(a, b) {
    return (a + '').replace(/\{([^{}]+)\}/g, function(c, d) {
      return d in (b || {}) ? (/^f/.test(typeof b[d]) ? b[d]() : b[d]) : c;
    });
  }

  function parse(tweet) {
    var li = document.createElement('li');
    li.setAttribute('id', 'tweet_' + tweet.id);
    li.classList.add('tweet');
    li.innerHTML = mustache(template, tweet);
    return li;
  }

  function update () {
    if (messages.length > 0) {
      var tweet = messages.pop();
      tweet = parse(tweet);
      container.insertBefore(tweet, container.firstElementChild);

      while (container.children.length > max) {
        container.removeChild(container.lastElementChild);
      }

      storage.setItem('twtcst', container.innerHTML);
    }
  }

  if (saved) {
    container.innerHTML = saved;
    update();
  }

  socket.on('connect', function() {
    indicator.classList.add('online');
    socket.emit('search');
  });

  socket.on('message', function(result) {
    result = JSON.parse(result);
    messages.push(result);
  });

  socket.on('disconnect', function() {
    indicator.classList.remove('online');
  });

  setInterval(update, interval);

  window.messages = messages;

  window.onbeforeunload = function() {
    socket.disconnect();
  };
})(window);
