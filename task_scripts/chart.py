from astropy.io import fits
from utility_scripts.histogram import histogram

def task(filename, task_params):
	try:
	    with fits.open(filename) as fits_object:
	    	region_type, value, numBins = task_params['type'], task_params['value'], task_params['numBins']
	    	ret =  histogram(fits_object, region_type, value, numBins)
	    	if ret is None:
	    		ret = "Region type is not recognized."
	    	return {"data":ret}, None
	except Exception as e:
		return ['Error when computing histogram.']



#Testing
if __name__ == "__main__":
    filename = "/home/yutong/firefly/backend/images/imageE2V.fits"
    region = {'x1': 1, 'x2' : 5, 'y1' : 1, 'y2' : 5}
    print task(filename, {'type': 'rect', 'value' : region, 'numBins': 10})
