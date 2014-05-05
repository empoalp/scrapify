require([
  '$api/search',
  '$api/models',
  'scripts/diacritics',
], function(search, models, diacritics) {
  'use strict';

  var charts = [{
    url: 'http://www.mtv.co.uk/music/charts/the-official-uk-dance-chart',
    imgUrl: 'http://www.mtv.co.uk/sites/default/files/styles/large/public/playlist/headers/logo_officialdancechart_0.png?itok=zJZJGS7A',
    chartName: 'MTV. The Official UK Dance Chart',
    songSelector: '.video-list-item',
    artistSelector: '.video-list-name',
    titleSelector: '.video-list-title'
  }, {
    url: 'http://los40.com/lista40/',
    imgUrl: 'http://mediablogs.los40.com/concursos/files/2013/12/logo-cabecera-los40.png',
    chartName: 'Los 40 principales',
    songSelector: '.article.estirar',
    artistSelector: 'h4 a',
    titleSelector: 'p:first'
  }, {
    url: 'http://www.bbc.co.uk/radio1/chart/singles',
    imgUrl: 'http://static.bbci.co.uk/radio/500/1.5.12/img/logos/masterbrands/bbc_radio_one.png',
    chartName: 'BBC Radio 1',
    songSelector: '.cht-entry-wrapper',
    artistSelector: '.cht-entry-artist',
    titleSelector: '.cht-entry-title'
  }];

  function cleanTitle(title) {
    return diacritics.remove(title)
             .toLowerCase()
             .replace('explicit', '')
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

    $('#result').empty();
    queryChart(chart, function(songList) {
      var chartEl = $('<ul>').addClass('song-list');

      $.each(songList, function(i, song) {
        $('<li>')
          .append($('<div class="song-position">').html(i+1+''))
          .append($('<div class="song-title">').html(song.title))
          .append($('<div class="song-artist">').html(song.artist))
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

  function selectChart(chart) {
    processChart(chart);
    $('#chart-name').html(chart.chartName);
    $('.chart-image').each(function() {
      if ($(this).data('chart') === chart) {
        $(this).addClass('selected');
      } else {
        $(this).removeClass('selected');
      }
    });
  }

  function renderChartMenu() {
    var chartsEl = $('#charts');
    $.each(charts, function(i, chart) {
       $('<img>')
         .attr('src', chart.imgUrl)
         .addClass('chart-image')
         .appendTo(chartsEl)
         .data('chart', chart)
         .click(function() {
           selectChart(chart);  
         });
    });
  }

  renderChartMenu();
  selectChart(charts[0]);

});
