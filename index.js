var rem = require('rem');
var skim = require('skim');

function steal (search, next) {
  rem.stream('http://lyrics.wikia.com/Special:Search', {
    search: "ben folds five narcolepsy"
  }).get().pipe(skim({
    results: {
      $query: 'article h1 a',
      $each: '(attr href)'
    }
  }, function (data) {
    var likelyurl = data.results.filter(function (url) {
      return url.substr(10).indexOf(':') > -1;
    })[0];

    rem.stream(likelyurl).get().pipe(skim({
      'lyrics': {
        $query: '.lyricbox',
        $value: '(html)',
      }
    }, function (data) {
      var html = data.lyrics;
      var lyrics = html.replace(/\n\n[\s\S]+$/, '').replace(/^[\s\S]+Ad/, '').replace(/<br>/g, '\n').replace(/<[^>]+>/g, ''))
      next(null, lyrics);
    }))
  }));
}

module.exports = steal;
