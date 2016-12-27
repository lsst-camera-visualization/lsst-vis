from astropy.io import fits
import numpy as np

def task(filename, task_params):
	'''
	@author
	@param task_params -
	@return
	'''
	# try:
	# 	with fits.open(filename) as fits_object:
	# 		numBins = task_params['numBins']
	# 		header = fits_object[0]
	# 		seg_length = header['NAXIS1']-1 # 544 for default image
	# 		seg_width = header['NAXIS2']-1 # 2048 for default image
	# 		DATASEC = getCoord(header['DATASEC']) # Assume 'DETSIZE' is same for all segments/amplifiers.
	# 		prescan = [0, DATASEC[0], 0, seg_width] # from 1 to prescan, 1 to seg_width
