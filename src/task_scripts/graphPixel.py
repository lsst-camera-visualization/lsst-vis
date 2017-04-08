import numpy as np
from util.image import Image
from util.region import Region
from util.histogram import NumpyToFireflyHist

def task(filename, taskParams):
    '''
    @author Joe Pagliuco
    @param taskParams
    @return data for general histogram function
    '''

    with Image(filename) as img:
        # Create the region object
        regionType, regionValue = taskParams["region"]["type"], taskParams["region"]["value"]
        region = Region(regionType, regionValue)
        numBins, minValue, maxValue = taskParams["bins"], taskParams["min"], taskParams["max"]

        # Largest floating point number
        maxFloat = np.finfo(float).max
        def histogram(a):
            return np.histogram(a, bins=numBins, range=(minValue, maxValue))
        def underflow(a):
            return np.histogram(a, bins=1, range=(-maxFloat, minValue - np.finfo(float).eps))
        def overflow(a):
            return np.histogram(a, bins=1, range=(maxValue + np.finfo(float).eps, maxFloat))

        # Gives us the histogram for the values in the range
        h = region.execute(img, histogram)
        u = region.execute(img, underflow)
        o = region.execute(img, overflow)

        fireflyHist = NumpyToFireflyHist(h)
        underflow = [ [ float(u[0]), minValue - float(h[1][1] - h[1][0]) , minValue ] ]
        overflow  = [ [ float(o[0]), maxValue, maxValue + float(h[1][1] - h[1][0]) ] ]

    return { "main": fireflyHist, "underflow": underflow, "overflow": overflow }, None
