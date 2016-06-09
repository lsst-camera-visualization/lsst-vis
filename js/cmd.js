state = {
  boxes: {}, // this stores necessary command the box could do.
  // operations {select, clear}
  lsstviewers: { // this select firefly object of certain id
  },
  show_readouts: undefined,
  term: undefined, // this will be a terminal object
  updatetime: 5000, 
  latest_time: 0,
  updatelist: {ffview: true}
};


var readouts = function() {
  this.register = {};
  this.add = function(name, cb) {
    this.register[name] = cb;
  };
  this.remove = function(name) {
    this.register[name] = undefined;
  };
  firefly.appFlux.getActions('ExternalAccessActions').extensionAdd({
    plotId: 'ffview',
    extType: 'PLOT_MOUSE_READ_OUT',
    callback: function(data) {
      for (var name in this.register) {
        if (this.register[name]) {
          this.register[name](data);
        }
      }
    }.bind(this),
  });
};

var onFireflyLoaded = function() {
  var viewer = loadFirefly('ffview');
  state.lsstviewers['ffview'] = viewer;
  state.show_readouts = new readouts();
  // currently will update the image automatically 10 sec
  window.setTimeInterval(function(){
//   if (state.updatelist['ffview']){
//      cmds.update_viewer(state, ['', 'ffview'])
//    }
    cmds.update_viewer(state, ['', 'ffview'])
  }, state.updatetime)
}
jQuery(function($, undefined) {
  $("#cmd").terminal(function(cmd_str, term) {
    cmd_args = cmd_str.split(" ");
    state.term = term;
    var executed = false;
    for (var name in cmds) {
      cmd = cmds[name];
      if (name == cmd_args[0].toLowerCase()) {
        executed = true;
        cmd(state, cmd_args);
        break;
      }
    }
    if (!executed) {
      state.term.echo("Sorry, `" + cmd_str + "` is not recognisable.");
    }
  }, {
    greetings: 'Command Interface (Type help to see the full intention)',
    name: 'LSST Monitor shell',
    height: 200,
    prompt: '~>  '
  });
});

cmds = {
  help: function(state, args) {
    state.term.echo('please check the <a href="https://github.com/lsst-camera-visualization/frontend/wiki" target =" blank">documentation</a>', {
      raw: true
    });
  },
  // user can change the frequency of updating images.
  fetch_freq: function(state, cmd_args){
    var time = cmd_args[1];
    if (time < 5000) {
      // lower bound for automatic update.
      time = 5000;
    }
    state.updatetime = time;
    // testing code.
    // state.term.echo(state.updatetime, {raw: true});  
  },
  update_viewer: function(state, cmd_args){
    if (state.updatelist['ffview']){
      var id = cmd_args[1];
      firefly.getJsonFromTask('python', 'fetch_latest', null).then(function(data){
        if (data.timestamp > latest_time) { // new image
          latest_time = data.timestamp;
          d3.select('#notification').text('There is a new image.');
          var url = data.uri; //should be data.uri not data.url
          state.lsstviewers[id].plot({url: url, Title: id, ZoomType: 'TO_WIDTH'});
          state.term.echo(data.timestamp, {raw: true});
        }
        else{
          d3.select('#notification').text('No new image.');
        }
      });
    }
  },
  resume: function(state, cmd_args){
    var id = cmd_args[1];
    var elem = document.getElementById("pause-resume"); 
    state.updatelist[id] = true;
    elem.value = "pause";
    //d3.select('#pause-resume').text('pause');
  },
  pause: function(state, cmd_args){
    var id = cmd_args[1];
    var elem = document.getElementById("pause-resume"); 
    state.updatelist[id] = false;
    elem.value = "resume";
    //d3.select('#pause-resume').text('resume');
  },
  hot_pixel: function(state, cmd_args) {
    var plotid = 'ffview';
    var region_id = plotid + '-hotpixel';
    var threshold = parseInt(cmd_args[2]);
    var region = parse_region(cmd_args.slice(3)) || "all";
    if (state.lsstviewers[region_id]) {
      firefly.removeRegionData(state.lsstviewers[region_id], region_id);
      state.lsstviewers[region_id] = undefined;
    }
    console.log(region);
    read_hotpixels({
        filename: "default",
        threshold: "max",
        "region": {"rect": region}
      },
      function(regions) {
        state.lsstviewers[region_id] = regions;
        firefly.overlayRegionData(regions, region_id, 'hotpixel', plotid);
      });
  },
  show_boundary: function(state, cmd_args) {
    var plotid = 'ffview'; // ffview as a default
    var region_id = plotid + '-boundary';
    if (state.lsstviewers[region_id]) {
      firefly.removeRegionData(state.lsstviewers[region_id], region_id);
      state.lsstviewers[region_id] = undefined;
    }
    read_boundary(plotid, function(regions) {
      state.lsstviewers[region_id] = regions;
      firefly.overlayRegionData(regions, region_id, 'Boundary', plotid);
    })
  },
  hide_boundary: function(state, cmd_args) {
    var plotid = 'ffview';
    var region_id = plotid + '-boundary';
    if (state.lsstviewers[region_id]) {
      firefly.removeRegionData(state.lsstviewers[region_id], region_id);
      state.lsstviewers[region_id] = undefined;
      state.term.echo("Boundary Removed");
    } else {
      state.term.echo("The boundary has not been drawn yet.");
    }
  },
  create_box: function(state, cmd_args) {
    var name = cmd_args[1];
    if (state.boxes[name]) {
      state.term.echo("the box " + name + " has already existed! choose another name\n");
    } else {
      var box = d3.select('#rightside').append('div').classed('box', true);
      var box_title = box.append('div').classed('box-bar', true).text(name);
      var box_content = box.append('div').classed('box-content', true);
      state.boxes[name] = {
        select: box,
      };
      state.term.echo("Success!\n");
    }
  },
  delete_box: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("the box " + name + " does not existed yet\n");
    } else {
      cmds.clear_box(state, [name]);
      state.boxes[name].select.remove();
      state.boxes[name] = undefined;
      state.term.echo("Success!");
    }
  },
  hide_box: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("the box " + name + " does not existed yet\n");
    } else {
      state.boxes[name].select.classed('box-hide', true);
    }
  },
  show_box: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("the box " + name + " does not existed yet\n");
    } else {
      state.boxes[name].select.classed('box-hide', false);
    }
  },
  clear_box: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("the box " + name + " does not existed yet\n");
    } else {
      if (state.boxes[name].clear) {
        state.boxes[name].clear();
        state.boxes[name].clear = undefined;
      }
      state.boxes[name].select.select('.box-content').attr("id", "").html("");
    }
  },
  viewer: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("The box " + name + " cannot be found\n");
    } else {
      view_id = "view-" + name;
      cmds.clear_box(state, ['', name]);
      var content = state.boxes[name].select.select('.box-content').attr('id', view_id);
      state.lsstviewers[view_id] = loadFirefly(view_id);
    }
  },

  chart: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("The box " + name + " cannot be found\n");
    } else {
      cmds.clear_box(state, [name]);
      var content = state.boxes[name].select.select('.box-content').attr('id', 'chart-' + name);
      nv.addGraph(function() {
        return draw_graph(content)
      });
    }
  },

  chart2: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("The box " + name + " cannot be found\n");
    } else {
      cmds.clear_box(state, ['', name]);
      var content = state.boxes[name].select.select('.box-content').attr('id', 'chart2-' + name);
      nv.addGraph(function() {
        return draw_graph2(content)
      })
    }
  },
  read_mouse: function(state, cmd_args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("The box " + name + " cannot be found\n");
    } else {
      var viewer = cmd_args[2] || 'ffview';
      cmds.clear_box(state, ['', name]);
      var content = state.boxes[name].select.select('.box-content').attr('id', 'readout-' + name);
      var first_line = content.append('p');
      first_line.append('span').text('point x:');
      var x_point = first_line.append('span').attr('id', 'readout-x-' + name);

      var second_line = content.append('p');
      second_line.append('span').text('point y:');
      var y_point = second_line.append('span').attr('id', 'readout-y-' + name);

      var third_line = content.append('p');
      third_line.append('span').text('region: ');
      var region_name = third_line.append('span').attr('id', 'readout-region-' + name);

      var height = 2000;
      var width = 502;

      var getRegion = function(pt) {
        var x = Math.floor(pt.x / width);
        var y = Math.floor(pt.y / height);
        return 'Region <' + x + ',' + y + '>';
      }
      state.show_readouts.add(name, function(data) {
        x_point.text(Math.floor(data.ipt.x));
        y_point.text(Math.floor(data.ipt.y));
        region_name.text(getRegion(data.ipt));
      });
      state.boxes[name].clear = function() {
        state.show_readouts.remove(name);
      };
    }
  },

  average_pixel: function(state, args) {
    var name = cmd_args[1];
    if (!state.boxes[name]) {
      state.term.echo("The box " + name + " cannot be found\n");
    } else {
      var viewer = cmd_args[2] || 'ffview';
      cmds.clear_box(state, ['', name]);
      var content = state.boxes[name].select.select('.box-content').attr('id', 'readout-' + name);
      var first_line = content.append('p');
      first_line.append('span').text('average pixel value around region');
      // var x_point = first_line.append('span').attr('id', 'read_about'+name);
      var region = parse_region(cmd_args.slice(3)) || {
        top: 0,
        left: 0,
        bottom: 1,
        right: 1
      };
      var second_line = content.append('p').text('top: ' + region.top + ' bottom: ' + region.bottom + ' left: ' + region.left + ' right: ' + region.right);
      var third_line = content.append('p').text('value: 0');
      var plotid = viewer;
      var region_id = plotid + '-boundary';
      if (state.lsstviewers[region_id]) {
        firefly.removeRegionData(state.lsstviewers[region_id], region_id);
        state.lsstviewers[region_id] = undefined;
      }
      var content = ['box', region.left, region.bottom, region.right - region.left, region.bottom - region.top, 0, '#color=red'].join(' ');
      console.log(content);
      state.lsstviewers[region_id] = [content];
      if (firefly.overlayRegionData) {
        firefly.overlayRegionData([content], region_id, "Boundary", plotid);
      }
      firefly.getJsonFromTask("python", "average", {'rect': region}).then(function(data) {
        console.log(data);
        console.log(third_line.text('value: ' + data["result"]));
        third_line.select('p').text('value: ' + data["result"]);
      });
    }
  }
}