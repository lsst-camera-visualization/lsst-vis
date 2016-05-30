import numpy as np
import os
import six
from astropy.io import fits
from utility_scripts.combine_fits_ccd import get_boundary
from utility_scripts.helper_functions import valid_boundary, rect2slice

###
# Hardcoded filenames for tasks to use!
# TODO: incorporate with a file name management
image_original = "/www/algorithm/images/imageE2V.fits"
image_display = "/www/static/images/image.fits"
# image_display = "/home/wei/lsst_firefly/frontend/images/image.fits"
# image_display = "/home/dyue2/apache-tomcat-7.0.63/webapps/static/images/image.fits"
###

# Return the parameter without any modification. For test and debug purpose.
def tasks_test(param):
    return ({"result": "Test function or wrong function call!"}, None)

# Simple task calculating average value in a region.
# Boundary assumes the expected format being sent in.
def average_value(boundary):
    filename = image_display
    # x_start, x_end, y_start, y_end = valid_boundary(boundary.get('rect'))
    region_slice = rect2slice(boundary)
    hdulist = fits.open(filename)
    region = hdulist[0].data[region_slice]
    avg = str(np.mean(region))
    hdulist.close()
    return {"result":avg},None

# Return amplifier boundries of a FITS file based on its header information.
def boundary(filename):
    # Currently backend only have this particular FITS file "imageE2V" with valid header
    # Later on we should track which image is displaying based on client request
    filename = image_display
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

    if (isinstance(roi, dict) and ('rect' in roi)):
        region_slice = rect2slice(roi)
    elif (isinstance(roi, six.string_types) and roi=="all"):
        region_slice = slice(None)
    else:
        # TODO: error handling
        region_slice = slice(None)
    # print(region_slice)
    region = region[region_slice]
    # os.system("echo %d %d %d %d > /www/algorithm/debug_file" % (x_start, x_end, y_start, y_end))
    # Threshold
    if (threshold == 'max'):
        threshold = float(np.max(region))
    else:
        threshold = float(threshold)

    cols, rows = np.where(region>=threshold)

    num_points = 500  # Set to 500 so that at most it will return 1000 points
    num_points = rows.size if num_points>rows.size else num_points

    rows = rows[::rows.size//num_points]
    cols = cols[::cols.size//num_points]
    l = np.zeros((rows.size, 2))
    l[:,0] = cols + region_slice[0].start
    l[:,1] = rows + region_slice[1].start

    hdulist.close()
    return l.tolist(), None

# Debug line
# print average_value([0,0,10,10])
# print hot_pixel(["../frontend/images/image.fits", 2200])
# print(hot_pixel({"filename":"../frontend/images/image.fits", "threshold":"max", "region":{"rect":['1000','1000','2000','2000']}}))
# print(hot_pixel({"filename":"default", "threshold":"max", "region":{'rect':['3000', '3000', '1000', '1000']}}))

### Debug line


# def histogram(boundary):
    # x_start, x_end = boundary[0][0], boundary[1][0]
    # y_start, y_end = boundary[0][1], boundary[1][1]
    # hdulist = fits.open(filename)
    # region = hdulist[0].data[y_start:y_end, x_start:x_end]
