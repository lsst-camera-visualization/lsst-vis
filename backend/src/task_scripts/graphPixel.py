import numpy as np
from util.image import Image
from util.region import Region
from util.histogram import NumpyToFireflyHist

def task(filename, taskParams):
    '''
    @author Joe Pagliuco
    @modified Wei Ren
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
            if (minValue=="auto" or maxValue=="auto"):
                _range = (a.min(), a.max())
            else:
                _range = (minValue, maxValue)
            # Good estimator for number of bins
            _numBins = numBins if numBins != "auto" else "doane"
            return np.histogram(a, bins=_numBins, range=_range)

        def underflow(a):
            if (not minValue=="auto" and not maxValue=="auto"):
                return np.histogram(a, bins=1, range=(-maxFloat, minValue - np.finfo(float).eps))
            else:
                return False

        def overflow(a):
            if (not minValue=="auto" and not maxValue=="auto"):
                return np.histogram(a, bins=1, range=(maxValue + np.finfo(float).eps, maxFloat))
            else:
                return False

        # Gives us the histogram for the values in the range
        h = region.execute(img, histogram)
        u = region.execute(img, underflow)
        o = region.execute(img, overflow)

        fireflyHist = NumpyToFireflyHist(h)
        underflow = [ [ float(u[0]), minValue - float(h[1][1] - h[1][0]) , minValue ] ] if u else None
        overflow  = [ [ float(o[0]), maxValue, maxValue + float(h[1][1] - h[1][0]) ] ] if o else None
    return { "main": fireflyHist, "underflow": underflow, "overflow": overflow }, None
