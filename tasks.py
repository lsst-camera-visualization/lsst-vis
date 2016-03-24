import numpy as np
import os
import six
from astropy.io import fits
from combine_fits_ccd import get_boundary
from helper_functions import valid_boundary

###
# Hardcoded filenames for tasks to use!
# TODO: incorporate with a file name management
image_original = "/www/algorithm/images/imageE2V.fits"
image_display = "/www/static/images/imageE2V_trimmed.fits"
###

# Return the parameter without any modification. For test and debug purpose.
def tasks_test(param):
    return ({"result": "Test function or wrong function call!"}, None)

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(boundary):
    filename = image_display
    x_start, x_end, y_start, y_end = valid_boundary(boundary)
    hdulist = fits.open(filename)
    region = hdulist[0].data[y_start:y_end, x_start:x_end]
    avg = str(np.mean(region))
    hdulist.close()
    return {"result":avg},None

# Return amplifier boundries of a FITS file based on its header information.
def boundary(filename):
    # Currently backend only have this particular FITS file "imageE2V" with valid header
    # Later on we should track which image is displaying based on client request
    filename = image_original
    json_str = get_boundary(filename)
    json_str['comment']='Note that We are only showing amplifier boundaries of a particular FITS (imageE2V.fits) on backend.'
    return json_str,None


# Return a hot pixel in the defined region
def hot_pixel(params):
    # Assume the arguments are passed in this format:
    # [region_of_interest, N(the threshold value)]
    # if ROI is 'all', then by default it will find all the hot pixels in the image.
    # NOTE: for test purpose we ignore [region file] for now.

    # CMD: hot_pixel ffview max rect 200 200 400 400
    # Example JSON:
    # {"filename":"default", "threshold":"max", "region":{"rect":[0,0,100,100]}}
    filename = params['filename']
    if (filename == 'default'):
        filename = image_display
    hdulist = fits.open(filename)


    threshold, roi = params['threshold'], params['region']
    # Region
    region = hdulist[0].data

    # NOTE: use six for cross compatibility!
    if ((not isinstance(roi, six.string_types)) and roi['rect']):
        # os.system("echo here > /www/algorithm/debug_file")
        x_start, x_end, y_start, y_end = valid_boundary(roi['rect'])
    elif (isinstance(roi, six.string_types) and roi=="all"):
        x_start, y_start = 0, 0
        y_end, x_end = region.shape # Total image size
    else:
        # error handling
        x_start, y_start = 0, 0
        y_end, x_end = region.shape # Total image size

    # os.system("echo %d %d %d %d > /www/algorithm/debug_file" % (x_start, x_end, y_start, y_end))
    region = region[y_start:y_end, x_start:x_end]
    # Threshold
    if (threshold == 'max'):
        threshold = np.max(region)
    rows, cols = np.where(region>=threshold)
    # l = [list(elem) for elem in zip(rows, cols)]
    l = [[elem[0]+y_start, elem[1]+x_start] for elem in list(zip(cols, rows))]
    num_points = 5000 # Set to 5000 so that at most it will return 10,000 points
    if (len(l)>=num_points):
        l = l[::len(l)//num_points]
    hdulist.close()
    return l, None

# Debug line
# print average_value([0,0,10,10])
# print hot_pixel(["../frontend/images/image.fits", 2200])
# print(hot_pixel({"filename":"../frontend/images/image.fits", "threshold":"max", "region":{"rect":['1000','1000','2000','2000']}}))
# print(hot_pixel({"filename":"default", "threshold":"max", "region":{'rect':[3000, 3000, 1000, 1000]}}))

### Debug line


# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
