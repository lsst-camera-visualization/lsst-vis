import numpy as np
from util.image import Image
from util.region import Region

def task(filename, taskParams):
    ''' Simple task calculating average value in a region. Boundary assumes the expected format being sent in.
    @author Wei Ren
    @param filename - file name of the FITS image
    @param task_params - Region to calculate mean value on. Currently support `rect` and `circle` regions.
    @return Mean value of the results or Error info.
    '''
    with Image(filename) as img:
        # Create the region object
        regionType, regionValue = taskParams["region"]["type"], taskParams["region"]["value"]
        region = Region(regionType, regionValue)

        # Call np.mean over the region in the image data
        averageValue = region.execute(img, np.mean)

    return { "result": str(averageValue) }, None
