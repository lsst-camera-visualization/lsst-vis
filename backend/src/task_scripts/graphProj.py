import numpy as np
from util.image import Image
from util.region import Region
from util.histogram import NumpyToFireflyHist


def task(filename, taskParams):
    '''
    @author
    @param task_params -
    @return
    '''

    with Image(filename) as img:
        # Create the region object
        regionType, regionValue = taskParams["region"]["type"], taskParams["region"]["value"]
        region = Region(regionType, regionValue)
        rowStart = taskParams["region"]["value"]["y1"]
        rpb = taskParams["rowsperbin"]

        # Calculates projection for group of rows
        def calcGroupProj(data, start):
            end = start + rpb
            return np.mean(data[start:end,:])

        # High level function to calculate all projections
        def calcRegionProj(data):
            projs = []
            for i in range(0, data.shape[0], rpb):
                value = calcGroupProj(data, i)
                projs.append([
                    float(value),
                    rowStart + i,
                    rowStart + i + rpb
                ])
            return projs

        projs = region.execute(img, calcRegionProj)
        #projs[-1][2] = taskParams["region"]["value"]["y2"]

        return {"projs": projs}, None
