from astropy.io import fits
import json
import sys
import numpy as np
import scipy.stats as sp
from os.path import dirname
sys.path.append(dirname(__file__))
from os.path import splitext
import traceback

# Convert the boundary coordincates from string(as in the header) to values.
# Assume to be a rectangular region (2-dimensional)
# Return value: list containing X and Y boundaries(in list form).
# NOTE: slicing are inclusive here.
def getCoord(s):
    coord_list = s.split(',')
    coord_list[0] = coord_list[0].split('[')[1].split(':')
    coord_list[1] = coord_list[1].split(']')[0].split(':')
    coord_list = [[int(value) for value in elem] for elem in coord_list]
    return [coord_list[0][0]-1, coord_list[0][1]-1, coord_list[1][0]-1, coord_list[1][1]-1]


def get_region(imgHDUs):
	if not imgHDUs:
		raise RuntimeError('The given file is not a multi-extension FITS image.')
    # Get info from the first amplifier header.
	first_seg = imgHDUs[0]
	seg_length = first_seg['NAXIS1']-1 # 544 for default image
	seg_width = first_seg['NAXIS2']-1 # 2048 for default image
	DATASEC = getCoord(first_seg['DATASEC']) # Assume 'DETSIZE' is same for all segments/amplifiers.
	prescan = [0, DATASEC[0], 0, seg_width] # from 1 to prescan, 1 to seg_width 
	postscan = [DATASEC[1], seg_length, 0, seg_width] # from postscan to seg_length, 1 to seg_width
	upper = [DATASEC[0], DATASEC[1], DATASEC[3], seg_width] # upper overscan region, from prescan to postscan, upper to seg_width
	return DATASEC


def get_average(filename):
	with fits.open(filename) as fits_object:
		hdulist = [elem.header for elem in fits_object if elem.__class__.__name__ == 'ImageHDU']
		# Get info from the first amplifier header.
		first_seg = hdulist[0]
		seg_length = first_seg['NAXIS1']-1 # 544 for default image
		seg_width = first_seg['NAXIS2']-1 # 2048 for default image
		DATASEC = getCoord(first_seg['DATASEC']) # Assume 'DETSIZE' is same for all segments/amplifiers.

		# return an array of size 16 with noise of each extension
		noise = np.zeros(16)
		for r in range(1, 17): # 16 extensions, from 1 to 16
			pixel_sum = 0
			pixel_count = 0
			fitsdata = fits_object[r].data
			upper_region = fitsdata[DATASEC[3]:seg_width, DATASEC[0]:DATASEC[1]].flatten()
			pre_post = np.append(fitsdata[0:seg_width, 0:DATASEC[0]].flatten(), fitsdata[0:seg_length, DATASEC[1]:seg_length].flatten())
			overscan = np.append(pre_post, upper_region)
			noise[r-1] = sp.moment(overscan, 2)
			#for i in range(0, 10):
			#	for j in range(0, 2047):
			#		pixel_sum += fitsdata[j, i]
			#pixel_sum += sum(map(sum, fitsdata[0:seg_width, 0:DATASEC[0]])) #prescan region
			#pixel_sum += sum(map(sum, fitsdata[0:seg_length, DATASEC[1]:seg_length]))  # postscan region
			#pixel_sum += sum(map(sum, fitsdata[DATASEC[3]:seg_width, DATASEC[0]:DATASEC[1]]))  # upper region
			#pixel_count = (DATASEC[0] * DATASEC[3] + DATASEC[1] * DATASEC[3]) + (DATASEC[1] - DATASEC[0]) * (seg_width - DATASEC[3])
			#avg = np.float64(pixel_sum/pixel_count)
		return noise

if __name__ == "__main__":
    filename = "/home/yutong/firefly/backend/images/imageE2V.fits"
    header = get_average(filename)
    print header