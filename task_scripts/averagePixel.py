import numpy as np
from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect, circle_mask

# a,b is the coordinate (X, Y) of the circle origin.
def _CreateCircularMask(region_orig, region_circ):
    # TODO: double check the order of row and column.
    a, b, radius = region_circ['center_x'], region_circ['center_y'], region_circ['radius']
    ny, nx = region_orig.shape
    y, x = np.ogrid[-b:ny-b, -a:nx-a]
    mask = y*y + x*x <= radius*radius
    circle = np.zeros((ny,nx))
    circle[mask] = 1
    return circle





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
