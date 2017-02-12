from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect, circle_mask
import scipy.stats as sp
import numpy as np

def task(filename, task_params):
	'''
	@author Yutong Wang
	@param task_params -{type : rect/circ, value : region}
	@return a double that represents the second moment of a regoin
	'''
	with fits.open(filename) as fits_object:
		region = task_params['region']
		region_type, value = region['type'], region['value']
		file_data = fits_object[0].data
		if (region_type=='rect'):
			region_slice = parseRegion_rect(value)
			ROI = file_data[region_slice].flatten()
			return np.sqrt(sp.moment(ROI, moment=2))
		elif (region_type=='circ'):
			mask = circle_mask(file_data, value).flatten()
			#gf(file_data, sp.moment, footprint=mask)
			return np.sqrt(sp.moment(mask, moment=2))

# Testing
if __name__ == "__main__":
	filename = "http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits"
	region = {'x1': 100, 'x2' : 200, 'y1' : 100, 'y2' : 200}
	print(task(filename, {'region':{'type': 'rect', 'value' : region}}))
