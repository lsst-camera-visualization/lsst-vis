from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect, circle_mask
from scipy.ndimage.filters import generic_filter as gf
import numpy as np


underflow_bins = 0
overflow_bins = 0
min_value = 0
max_value = 0
def _histogram(fits_object, region_type, value, numBins, _min, _max):
	global underflow_bins
	global overflow_bins
	global min_value
	global max_value
	file_data = fits_object[0].data
	if (region_type=='rect'):
		region_slice = parseRegion_rect(value)
		ROI = file_data[region_slice]
		underflow_bins = (ROI < _min).sum()
		overflow_bins = (ROI > _max).sum()
		min_value = np.amin(ROI)
		max_value = np.amax(ROI)
		print(max_value)
		hist = np.histogram(ROI, bins = numBins, range=(_min, _max))
	elif (region_type=='circ'):
		mask = circle_mask(file_data, value)
		underflow_bins = (mask < _min).sum()
		overflow_bins = (mask > _max).sum()
		min_value = np.amin(mask)
		max_value = np.amax(mask)
		hist = gf(file_data, np.histogram, footprint=mask)
	else:
		hist = None
	return hist


def get_data(hist,_min, _max):
	if hist is None:
		return None
	else:
		labels = hist[1]
		value = hist[0]
		ret = [[underflow_bins, min_value, _min]]
		_bin = [[0,_min, _min]]
		ret = np.concatenate((ret, _bin),axis=0)
		for i in range (0, len(hist[1])-1):
			_bin = [[value[i], labels[i], labels[i+1]]]
			ret = np.concatenate((ret, _bin),axis=0)
		_bin = [[0, _max, _max]]
		ret = np.concatenate((ret, _bin),axis=0)
		_bin = [[overflow_bins, _max, max_value]]
		ret = np.concatenate((ret, _bin),axis=0)
		return ret


def histogram(fits_object, region_type, value, numBins, _min, _max):
	ret = get_data(_histogram(fits_object, region_type, value, numBins, _min, _max),_min, _max)
	return ret