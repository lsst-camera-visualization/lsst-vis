import numpy as np
from astropy.io import fits


# filename = os.getcwd()+"../frontend/images/image.fits"

def tasks(param):
    return ({"result": param}, None)

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(boundary):
    filename = "/www/static/images/image.fits"
    hdulist = fits.open(filename)
    # return ({"result": hdulist}, None)
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    region = hdulist[0].data[y_start:y_end, x_start:x_end]
    avg = np.mean(region)
    hdulist.close()
    return {"result":avg},None
### Debug line
# print average_value([0,0,10,10])
### Debug line
# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
