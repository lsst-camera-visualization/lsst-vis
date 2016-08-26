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
  firefly.getJsonFromTask('python', 'hot_pixel', data).then(function(data) {
    console.log(data);
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

	return {
		type : 'unknown',
		value : null
	};
}

// [ 'rect', x1, y1, x2, y2 ]
function parse_rect(region) {

	var rect;

	if (region && region.length == 5) {
		rect = {
			x1 : Math.min(Number(region[1]), Number(region[3])),
			y1 : Math.min(Number(region[2]), Number(region[4])),
			x2 : Math.max(Number(region[1]), Number(region[3])),
			y2 : Math.max(Number(region[2]), Number(region[4]))
		};
	}
	else {
		rect = {
			x1 : 0,
			y1 : 0,
			x2 : 1,
			y2 : 1
		};
	}

	return {
		type : 'rect',
		value : rect
	}
}

function region_to_overlay(region) {
	var parsed = parse_region(region);

	if (parsed.type == 'rect') {
		var rect = parsed.value;
		return ['box', rect.x1, rect.y2, rect.x2 - rect.x1, rect.y2 - rect.y1, 0, '#color=blue'].join(' ');
	}

	return null;
}


function region_to_boxtext(region) {

	if (!region)
		return 'Invalid Region';

	var parsed = parse_region(region);

	switch (parsed.type) {
		case 'rect':
			var first = new BoxText('(x1, y1)', '(' + parsed.value.x1 + ',' + parsed.value.y1 + ')', false);
			var second = new BoxText('(x2, y2)', '(' + parsed.value.x2 + ',' + parsed.value.y2 + ')', false);
			return [ first, ',',  second ];

		case 'circ':

			return '';
	}
}

// Expects the result of a parse_region call to be passed in
function region_to_string(region) {
	if (region.type == 'rect')
		return 'rect ' + region.value.x1 + ' ' + region.value.y1 + ' ' + region.value.x2 + ' ' + region.value.y2;
		
	return '';
}
