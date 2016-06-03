
import task_def

import numpy as np
from astropy.io import fits
from utility_scripts.helper_functions import rect2slice

def task(task_params):
	'''
	Simple task calculating average value in a region. Boundary assumes the expected format being sent in.
	@author 
	@param task_params - 
	@return 
	'''

	filename = task_def.image_display
	# x_start, x_end, y_start, y_end = valid_boundary(boundary.get('rect'))
	region_slice = rect2slice(task_params)
	hdulist = fits.open(filename)
	region = hdulist[0].data[region_slice]
	avg = str(np.mean(region))
	hdulist.close()
	return {"result":avg},None
	
