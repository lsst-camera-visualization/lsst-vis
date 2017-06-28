from astropy.io import fits
from utility_scripts.noise import get_average
import scipy.stats as sp
import numpy as np


def task(filename, task_params):
	'''
	@author Yutong Wang
	@param task_params - filename
	@return noise for each amplifier, 16 in totoal
	'''
	with fits.open(filename) as fits_object:
		return get_average(filename)
