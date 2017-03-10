var dlnacasts = require('dlnacasts')()

dlnacasts.on('update', function (player) {
  console.log('all players: ', dlnacasts.players)
  player.play('http://commondatastorage.googleapis.com/gtv-videos-bucket/big_buck_bunny_1080p.mp4', {title: 'my video', type: 'video/mp4'})
})

dlnacasts.update();
