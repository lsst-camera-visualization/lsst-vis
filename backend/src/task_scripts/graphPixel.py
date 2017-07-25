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
        regionMin = float(region.execute(img, np.min))
        regionMax = float(region.execute(img, np.max))
        numBins, minValue, maxValue = taskParams["bins"], taskParams["min"], taskParams["max"]
        _rangeMin = regionMin if minValue == "auto" else float(minValue)
        _rangeMax = regionMax if maxValue == "auto" else float(maxValue)
        if (_rangeMin > _rangeMax):
            _rangeMin, _rangeMax = _rangeMax, _rangeMin

        # Largest floating point number
        maxFloat = np.finfo(float).max

        def histogram(a):
            # Good estimator for number of bins
            _numBins = numBins if numBins != "auto" else "doane"
            return np.histogram(a, bins=_numBins, range=(_rangeMin, _rangeMax))

        def underflow(a):
            # return False
            return np.histogram(a, bins=1, range=(-maxFloat, _rangeMin - np.finfo(float).eps))
            # if (not minValue=="auto" and not maxValue=="auto"):
            # else:
            #     return False

        def overflow(a):
            # return False
            return np.histogram(a, bins=1, range=(_rangeMax + np.finfo(float).eps, maxFloat))
            # if (not minValue=="auto" and not maxValue=="auto"):
            # else:
            #     return False

        # Gives us the histogram for the values in the range
        h = region.execute(img, histogram)
        u = region.execute(img, underflow)
        o = region.execute(img, overflow)

        fireflyHist = NumpyToFireflyHist(h)
        binWidth = float(h[1][1] - h[1][0])
        underflow = [ [ float(u[0]), _rangeMin - binWidth, _rangeMin ] ] if u else None
        overflow  = [ [ float(o[0]), _rangeMax, _rangeMax + binWidth ] ] if o else None
    return { "main": fireflyHist, "underflow": underflow, "overflow": overflow }, None
