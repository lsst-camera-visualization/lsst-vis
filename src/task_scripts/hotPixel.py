import numpy as np
import six
from astropy.io import fits
from utility_scripts.helper_functions import parseRegion_rect

from util.image import Image
from util.region import Region


def task(filename, taskParams):
    ''' Return a hot pixel in the defined region.
    @author
    @param task_params -
    @return
    '''
    threshold = taskParams["threshold"]
    region = Region(taskParams["region"]["type"], taskParams["region"]["value"])

    with Image(filename) as img:
        threshold = np.max(img) if threshold == "max" else float(threshold)
        cols, rows = np.where(img >= threshold)
        numPoints = min(500, rows.size)

        ## Fix this, use new region class
        rows = rows[::rows.size // numPoints]
        cols = cols[::cols.size // numPoints]
        l = np.zeros((rows.size, 2))
        l[:, 1] = cols + region._rectSlice[0].start
        l[:, 0] = rows + region._rectSlice[1].start
        return l.tolist(), None

    return {"error:", "Error reading image file"}




if __name__ == "__main__":
    threshold = 50
    filename = 'http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits'
    task_params = {"filename": filename, "threshold": threshold,
                   "region": {"rect": [150, 150, 200, 200]}}
    print(task(filename, task_params))
