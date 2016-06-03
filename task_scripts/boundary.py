
import task_def

from astropy.io import fits
from utility_scripts.combine_fits_ccd import get_boundary

def task(task_params):
	'''
	Return amplifier boundries of a FITS file based on its header information.
	@author 
	@param task_params - 
	@return 
	'''

	# Currently backend only have this particular FITS file "imageE2V" with valid header
	# Later on we should track which image is displaying based on client request
	filename = task_def.image_display
	json_str = get_boundary(filename)
	json_str['comment']='Note that We are only showing amplifier boundaries of a particular FITS (imageE2V.fits) on backend.'
	return json_str,None
