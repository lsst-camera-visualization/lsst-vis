import numpy as np
from util.image import Image
from util.region import Region

def task(filename, taskParams):
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

        def secondMoment(data):
            return np.stats.moment(data, moment=2)
        noise = region.execute(img, secondMoment)

    return { "result": str(noise) }, None

if __name__ == "__main__":
	filename = "http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits"
	region = {'x1': 100, 'x2' : 200, 'y1' : 100, 'y2' : 200}
	print(task(filename, {'region':{'type': 'rect', 'value' : region}}))
