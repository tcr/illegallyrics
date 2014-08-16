var rem = require('rem');
var skim = require('skim');

function steal (search, next) {
  rem.stream('http://lyrics.wikia.com/Special:Search', {
    search: search,
    fulltext: 'Search',
    ns0: 1,
    ns220: 1,
  }).get().pipe(skim({
    results: {
      $query: 'article h1 a',
      $each: '(attr href)'
    }
  }, function (data) {
    var likelyurl = data.results.filter(function (url) {
      return url.substr(10).indexOf(':') > -1;
    })[0];

    if (!likelyurl) {
      return next(new Error('No pages found.'), 'No pages found.');
    }

    rem.stream(likelyurl).get().pipe(skim({
      'title': {
        $query: '#WikiaPageHeader h1',
        $value: '(text)',
      },
      'lyrics': {
        $query: '.lyricbox',
        $value: '(html)',
      }
    }, function (data) {
      var html = (data || {}).lyrics || 'No lyrics found.';
      var lyrics = html.replace(/\n\n[\s\S]+$/, '').replace(/^[\s\S]+Ad/, '').replace(/<br>/g, '\n').replace(/<[^>]+>/g, '');

      var artist = ((data || {}).title || '').replace(/:.*$/, '');
      var title = ((data || {}).title || '').replace(/^.*?:/, '').replace(/\s*Lyrics\s*$/i, '');
      next(null, {
        artist: artist,
        title: title,
        lyrics: lyrics
      });
    }))
  }));
}

exports.steal = steal;
