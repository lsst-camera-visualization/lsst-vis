import numpy as np
from astropy.io import fits

def task(filename, task_params):
    try:
        with fits.open(filename) as fits_object:
            hdulist = fits_object[0]
            return np.histogram(hdulist.data, bins='auto')
    except Exception as e:
        return ['Error when computing histogram.']


# Testing
if __name__ == "__main__":
    filename = '~/lsst/lsst_firefly/frontend/images/imageE2V_trimmed.fits'
    task(filename, {})
