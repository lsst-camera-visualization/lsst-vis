import numpy as np
from util.image import Image
from util.region import Region

def task(filename, task_params):
    ''' Calculates the noise over the region.
    @author Joe Pagliuco
    @param filename - file name of the FITS image
    @param task_params - { "region": {"type","value"} }
    @return Mean value of the results or Error info.
    '''
    with Image(filename) as img:
        # Create the region object
        regionType, regionValue = taskParams["region"]["type"], taskParams["region"]["value"]
        region = Region(regionType, regionValue)

        # Call np.mean over the region in the image data
        averageValue = region.execute(img, np.mean)

    return { "result": averageValue }, None
