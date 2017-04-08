import numpy as np
from astropy.io import fits
from util.region import Region

def task(filename, task_params):
    ''' Simple task calculating average value in a region. Boundary assumes the expected format being sent in.
    @author Wei Ren
    @param filename - file name of the FITS image
    @param task_params - Region to calculate mean value on. Currently support `rect` and `circle` regions.
    @return Mean value of the results or Error info.
    '''

    # Open the fits file
    hdulist = fits.open(filename)
    imageData = hdulist[0].data

    # Create the region object
    regionType, regionValue = taskParams["region"]["type"], taskParams["region"]["value"]
    region = Region(regionType, regionValue)

    # Call np.mean over the region in the image data
    averageValue = region.execute(imageData, np.mean)

    # Clean up
    hdulist.close()

    return { "result": averageValue }, None
