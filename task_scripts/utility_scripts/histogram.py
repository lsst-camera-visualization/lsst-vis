from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect, circle_mask
from scipy.ndimage.filters import generic_filter as gf
import numpy as np


def _histogram(fits_object, region_type, value, numBins):
	file_data = fits_object[1].data
	if (region_type=='rect'):
		region_slice = parseRegion_rect(value)
		ROI = file_data[region_slice]
		hist = np.histogram(ROI, bins = numBins)
	elif (region_type=='circ'):
		mask = circle_mask(file_data, value)
		hist = gf(file_data, np.histogram, footprint=mask)
	else:
		hist = None
	return hist


def get_data(hist):
	if hist is None:
		return None
	else:
		labels = hist[1]
		value = hist[0]
		ret = [[value[0], labels[0], labels[1]]]
		for i in range (1, len(hist[1])-1):
			_bin = [[value[i], labels[i], labels[i+1]]]
			ret = np.concatenate((ret, _bin),axis=0)
		return ret


def histogram(fits_object, region_type, value, numBins):
	return get_data(_histogram(fits_object, region_type, value, numBins))