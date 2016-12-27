from astropy.io import fits
import numpy as np
from operator import truediv
from operator import add

def image_difference(filename_1, filename_2):
	hdulist_1 = fits.open(filename_1)
	hdulist_2 = fits.open(filename_2)
	file_data_1 = hdulist_1[0].data
	file_data_2 = hdulist_2[0].data
	return np.subtract(file_data_1, file_data_2)


def image_ratio(filename_1, filename_2):
	hdulist_1 = fits.open(filename_1)
	hdulist_2 = fits.open(filename_2)
	file_data_1 = hdulist_1[0].data
	file_data_2 = hdulist_2[0].data
	return map(truediv, file_data_1, file_data_2)


def image_sum(filename_1, filename_2):
	hdulist_1 = fits.open(filename_1)
	hdulist_2 = fits.open(filename_2)
	file_data_1 = hdulist_1[0].data
	file_data_2 = hdulist_2[0].data
	return map(add, file_data_1, file_data_2)