var showPointCB = function(data){
    var imgpoint = data.ipt;
    var worldpoint = data.wpt;
    console.log(imgpoint.x+","+imgpoint.y);
    console.log(worldpoint.x+","+worldpoint.y);
}
var showRegionPointCB = function(data){
    console.log(data.ipt0.x+","+data.ipt0.y);
    console.log(data.ipt1.x+","+data.ipt1.y);
}

function loadFirefly(viewId){
    var primaryViewer = firefly.makeImageViewer(viewId);
    primaryViewer.plot({
        "URL" : document.location.origin+"/static/images/imageE2V_trimmed.fits",
        "Title" : "Some WISE image",
        "ZoomType" : "TO_WIDTH"
    });
    return primaryViewer;
}
