import taskDef
from astropy.io import fits
from utility_scripts.histogram import histogram

def task(filename, task_params):
	''' 
	@author Yutong Wang
	@param task_params - {type : rect/circ, value : region, numBins : int} 
	@return data for general histogram function
	'''
	try:
		with fits.open(filename) as fits_object:
			region = task_params['region']
			region_type, value, numBins = region['type'], region['value'], task_params['numBins']
			ret =  histogram(fits_object, region_type, value, numBins)
			if ret is None:
				ret = "Region type is not recognized."
			return {"data":ret}, None
	except Exception as e:
		return ['Error when computing histogram.']


#Testing
if __name__ == "__main__":
    filename = "http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits"
    region = {'x1': 1, 'x2' : 5, 'y1' : 1, 'y2' : 5}
    print task(filename, {'region':{'type': 'rect', 'value' : region}, 'numBins': 10})
