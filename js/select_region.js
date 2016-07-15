

var selectRegion = function(data) {

    if (data.type == 'AREA_SELECT') {
        var top = data.ipt0.y;
        var bottom = data.ipt1.y;
        var left = data.ipt0.x;
        var right = data.ipt1.x;
        
        state.term.setVariable('selected', '(rect ' + top + ' ' + left + ' ' + bottom + ' ' + right + ')');
    }

}
