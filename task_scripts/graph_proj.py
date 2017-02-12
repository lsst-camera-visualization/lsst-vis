import numpy as np
import scipy as sp
from astropy.io import fits
from utility_scripts.histogram import hist_proj

def task(filename, task_params):
	'''
	@author
	@param task_params -
	@return
	'''
	try:
		with fits.open(filename) as fits_object:
			region = task_params['region']
			numBins = task_params['numBins']
			ret =  hist_proj(fits_object, numBins)
			if ret is None:
				ret = "Region type is not recognized."
			return {"data":ret.tolist()}, None
	except Exception as e:
		return ["Error when computing histogram."], None

# Testing
if __name__ == "__main__":
	filename = "http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits"
	region = {'x1': 100, 'x2' : 200, 'y1' : 100, 'y2' : 200}
	print(task(filename, {'region':{'type': 'rect', 'value' : region}, 'numBins': 10, 'min':2, 'max':4}))

