import os
from astropy.io import fits
from utility_scripts.histogram import histogram

def task(filename, task_params):
	'''
	@author Yutong Wang
	@param task_params - {type : rect/circ, value : region, numBins : int, min/double : int, max: int/double}
	@return data for general histogram function
	'''
	try:
		with fits.open(filename) as fits_object:
			region = task_params['region']
			region_type, value, numBins, _min, _max = region['type'], region['value'], task_params['numBins'], task_params['min'], task_params['max']
			ret =  histogram(fits_object, region_type, value, numBins, _min, _max)
			if ret is None:
				ret = "Region type is not recognized."
			return {"data":ret.tolist()}, None
	except Exception as e:
		return ["Error when computing histogram."], e
# Testing
if __name__ == "__main__":
	filename = "http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits"
	region = {'x1': 100, 'x2' : 200, 'y1' : 100, 'y2' : 200}
	print(task(filename, {'region':{'type': 'rect', 'value' : region}, 'numBins': 10, 'min':2, 'max':4}))
