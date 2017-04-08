import os

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

        def histogram(a):
            return np.histogram(a, bins=numBins, (minValue, maxValue))
        h = region.execute(img, histogram)

    return { "result":  }, None
