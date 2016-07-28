function read_boundary(data, cb) {
  firefly.getJsonFromTask('python', 'boundary', data).then(function(data) {
    var d = data.BOUNDARY;
    var regions = [];
    var color = 'red';
    for (var i = 0; i < d.length; i++) {
      var di = d[i];
      for (var j = 0; j < di.length; j++) {
        var dij = di[j];
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
    cb({"header":data, "regions_ds9":regions});
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

function parse_region(region) {

	if (region[0] == 'rect') {
		return parse_rect(region);
	}

	return null;
}

function parse_rect(region) {

	var rect;

	if (region) {
		rect = {
			'top' : Number(region[1]),
			'left' : Number(region[2]),
			'bottom' : Number(region[3]),
			'right' : Number(region[4])
		};
	}
	else {
		rect = {
			'top' : 0,
			'left' : 0,
			'bottom' : 1,
			'right' : 1
		};
	}

	return { 'rect' : rect };
}

function region_to_overlay(region) {
	var type = region[0];

	if (type == 'rect') {
		var rect = parse_rect(region)['rect'];
		return ['box', rect.left, rect.bottom, rect.right - rect.left, rect.bottom - rect.top, 0, '#color=blue'].join(' ');
	}

	return null;
}


function region_to_boxtext(region) {

	if (!region)
		return 'Invalid Region';

	switch (region[0]) {
		case 'rect':
			var top = new BoxText('top', region[1]);
			var left = new BoxText('left', region[2]);
			var bottom = new BoxText('bottom', region[3]);
			var right = new BoxText('right', region[4]);
			return [ top, left, bottom, right ];

		case 'circ':

			return '';
	}
}
