function read_boundary(data, cb) {
  firefly.getJsonFromTask('python', 'boundary', data).then(function(data) {
    var d = data.BOUNDARY;
    var regions = [];
    var color = 'red';
    for (var i = 0; i < d.length; i++) {
      var di = d[i];
      for (var j = 0; j < di.length; j++) {
        var dij = di[j];
        console.log(JSON.stringify(dij));
        var height = dij['height'];
        var width = dij['width'];
        var x = dij['x'];
        var y = dij['y'];

        // var height = Math.abs(dij[1][1] - dij[1][0]);
        // var width = Math.abs(dij[0][0] - dij[0][1]);
        // var x = Math.min(dij[0][0], dij[0][0]);
        // var y = Math.max(dij[1][1], dij[1][1]);
        var content = ['box', x, y, width, height, 0, '#color=' + color].join(' ');
        regions.push(content);
      }
    }
    console.log(regions);
    cb(regions);
  });
}

function read_hotpixels(data, cb) {
  console.log(data);
  firefly.getJsonFromTask('python', 'hot_pixel', data).then(function(data) {
    var regions = [];
    var color = 'red';
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var content = ['circle', 'point', d[0], d[1], '#color=' + color].join(' ');
      regions.push(content);
    }
    cb(regions);
  });
}

function shape2points(data, cb){

}

// take the cmd and consume the region
function parse_region(cmd) {
  if (cmd.length > 0){
    if (cmd[0] == 'rect') return parse_rect(cmd);
  }
  return null
}

function parse_rect(cmd) {
  cmd.shift();
  return {'top': parseInt(cmd.shift()), 'left': parseInt(cmd.shift()), 'bottom': parseInt(cmd.shift()), 'right': parseInt(cmd.shift())}
}
