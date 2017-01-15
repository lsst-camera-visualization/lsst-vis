function read_boundary(data, cb, viewer) {
    executeBackendFunction('boundary', viewer, data,
        function(data) {
        console.log(data);
        var d = data.BOUNDARY;
        if (viewer.overscan){
            d = data.BOUNDARY_OVERSCAN;
        }
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
                var content = ['box', x, y, width, height, 0, '#color=' + color].join(' ');
                regions.push(content);
            }
        }
        console.log(regions);
        cb({"header":data, "regions_ds9":regions});
        },
        function(data) {
            LSST.state.term.lsst_term('echo', 'There was a problem when fetching boundary information of FITS file.');
            LSST.state.term.lsst_term('echo', 'Please make sure all parameters were typed in correctly.');
        }
    );
}

function read_hotpixels(data, cb, viewer) {
    executeBackendFunction('hot_pixel', viewer, data,
        function(data) {
          var regions = [];
          var color = 'red';
          for (var i = 0; i < data.length; i++) {
            var d = data[i];
            var content = ['circle', 'point', d[0], d[1], '#color=' + color].join(' ');
            regions.push(content);
          }
          cb(regions);
        },
        function(data) {
            LSST.state.term.echo('There was a problem when fetching hot pixel information in the FITS file.');
            LSST.state.term.echo('Please make sure all parameters were typed in correctly.');
        }
    );
}

function shape2points(data, cb){

}
