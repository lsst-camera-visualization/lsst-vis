import numpy as np
from astropy.io import fits
from combine_fits_ccd import get_boundary
# import os

# filename = os.getcwd()+"../frontend/images/image.fits"

# Return the parameter without any modification. For test and debug purpose.
def tasks_test(param):
    return ({"result": "Test function or wrong function call!"}, None)

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(boundary):
    filename = "/www/static/images/image.fits"
    x_start, x_end = boundary[0], boundary[2]
    y_start, y_end = boundary[1], boundary[3]
    hdulist = fits.open(filename)
    region = hdulist[0].data[y_start:y_end, x_start:x_end]
    avg = str(np.mean(region))
    hdulist.close()
    return {"result":avg},None

# Return amplifier boundries of a FITS file based on its header information.
def boundary(filename):
    # Currently backend only have this particular FITS file "imageE2V" with valid header
    # Later on we should track which image is displaying based on client request
    filename = "/home/dyue2/algorithms/images/imageE2V.fits"
    json_str = get_boundary(filename)
    json_str['comment']='Note that We are only showing amplifier boundaries of a particular FITS (imageE2V.fits) on backend.'
    return json_str,None


# Return a hot pixel in the defined region
def hot_pixel(params):
    # Assume the arguments are passed in this format:
    # [filename, N(the threshold value), [region file]]
    # if [region file] is not provided, by default will find all the hot pixels in the image.
    # NOTE: for test purpose we ignore [region file] for now.

    filename, threshold = params[0], params[1]
    hdulist = fits.open(filename)
    ROI = hdulist[0].data
    rows, cols = np.where(ROI>=threshold)
    return [rows, cols] # TODO: add (circle?) boundary to the returned pixels. 

# Debug line
# print average_value([0,0,10,10])
### :sDebug line
# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
