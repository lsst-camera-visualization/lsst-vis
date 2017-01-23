
jQuery(document).ready(function() {
    $(window).keydown(function(event) {
        key = event.keyCode || event.which;
        
        // Ctrl + S, select a region
        if (key == 83 && event.ctrlKey) {
            console.log(LSST.state.currAmp);
        
            event.preventDefault();
            return false;
        }
        
        return true;
    });
}); 
