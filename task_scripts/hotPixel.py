import numpy as np
import six
from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect

def task(filename, task_params):
    ''' Return a hot pixel in the defined region.
    @author
    @param task_params -
    @return
    '''

    # Assume the arguments are passed in this format:
    # [region_of_interest, N(the threshold value)]
    # if ROI is 'all', then by default it will find all the hot pixels in the image.
    # NOTE: for test purpose we ignore [region file] for now.

    # CMD: hot_pixel ffview max rect 200 200 400 400
    # Example JSON:
    # {"filename":"default", "threshold":"max", "region":{"rect":[0,0,100,100]}}
    filename = task_params['filename']
    if (filename == 'default'):
        filename = taskDef.IMAGE_DISPLAY
    hdulist = fits.open(filename)
    threshold, roi = task_params['threshold'], task_params['region']
    # Region
    region = hdulist[0].data

    if (isinstance(roi, dict) and ('rect' in roi)):
        region_slice = parseRegion_rect(roi)
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
