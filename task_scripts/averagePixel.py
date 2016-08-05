import numpy as np
from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect, circle_mask
from scipy.ndimage.filters import generic_filter as gf

def task(filename, task_params):
    ''' Simple task calculating average value in a region. Boundary assumes the expected format being sent in.
    @author Wei Ren
    @param filename - file name of the FITS image
    @param task_params - Region to calculate mean value on. Currently support `rect` and `circle` regions.
    @return Mean value of the results or Error info.
    '''

    hdulist = fits.open(filename)
    region = hdulist[0].data
    region_type, value = task_params['type'], task_params['value']

    if (region_type=='rect'):
        region_slice = parseRegion_rect(value)
        ROI = region[region_slice]
        avg = str(np.mean(ROI))
    elif (region_type=='circle'):
        mask = circle_mask(region, value)
        avg = str(gf(region, np.mean, footprint=mask))
    else:
        avg = "Region type is not recognized."

    hdulist.close()
    return {"result":avg},None
