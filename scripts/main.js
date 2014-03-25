require([
  '$api/search',
  '$api/models',
  'scripts/diacritics',
], function(search, models, diacritics) {
  'use strict';

  var charts = [{
    url: 'http://www.mtv.co.uk/music/charts/the-official-uk-dance-chart',
    songSelector: '.video-list-item',
    artistSelector: '.video-list-name',
    titleSelector: '.video-list-title'
  }, {
    url: 'http://los40.com/lista40/',
    songSelector: '.article.estirar',
    artistSelector: 'h4 a',
    titleSelector: 'p:first'
  }, {
    url: 'http://www.bbc.co.uk/radio1/chart/singles',
    songSelector: '.cht-entry-wrapper',
    artistSelector: '.cht-entry-artist',
    titleSelector: '.cht-entry-title'
  }];

  function cleanTitle(title) {
    return diacritics.remove(title)
             .replace(/\(.*\)/g, '')
             .replace(/[^a-z0-9 ]/gi,'');
  }

  function playSong(song) {
    var queryString = song.artist + ' ' + cleanTitle(song.title),
        query = search.Search.search(queryString),
        mostPopular = query.tracks.sort('popularity', 'desc').range(0, 1);

    mostPopular.snapshot().done(function(snapshot) {
      models.player.playTrack(snapshot.get(0));
    });
  }

  function processChart(chart) {
    queryChart(chart, function(songList) {
      var chartEl = $('<ul>');

      $.each(songList, function(i, song) {
        $('<li>')
          .html(song.title + ' - ' + song.artist)
          .click(function() {
            playSong(song);
          })
          .appendTo(chartEl);
      });

      $('#result').append(chartEl);
    });
  }

  function queryChart(chart, cb) {
      $.ajax({
          url: chart.url,
          success: function(resp) {
            var content = $(resp),
                songList = [];            

            content.find(chart.songSelector).each(function(i) {
              songList.push({
                position: i,
                title: $(this).find(chart.titleSelector).html(),
                artist: $(this).find(chart.artistSelector).html()
              });
            });

            cb(songList);
          }
      });
  }

  processChart(charts[1]);

});
