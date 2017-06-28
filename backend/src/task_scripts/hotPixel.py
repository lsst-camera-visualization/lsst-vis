import numpy as np
from util.image import Image
from util.region import Region


def task(filename, taskParams):
    ''' Return a hot pixel in the defined region.
    @author
    @param task_params -
    @return
    '''
    threshold = taskParams["threshold"]
    regionParam = taskParams["region"]
    region = Region(regionParam["type"], regionParam["value"])

    with Image(filename) as img:
        maxOfRegion = region.execute(img, np.max)
        threshold = maxOfRegion if threshold == "max" else float(threshold)

        # For a rectangular region
        def findHotPixelsRect(data):
            hotPixels = []
            max = 500
            x,y = regionParam["value"]["x1"], regionParam["value"]["y1"]
            for index, value in np.ndenumerate(data):
                # If it breaks the threshold, add it to the list, but offset the location
                #    to match the location
                if value >= threshold:
                    hotPixels.append({"x":index[1]+x, "y":index[0]+y})
                # Max number of hot pixels
                if len(hotPixels) > max-1:
                    break
            return { "hotPixels": hotPixels }, None

        # For a circular region
        def findHotPixelsCirc(data):
            pass

        return region.execute(img, findHotPixelsRect, findHotPixelsCirc)

    return {"error:", "Error reading image file"}




if __name__ == "__main__":
    threshold = 50
    filename = 'http://web.ipac.caltech.edu/staff/roby/demo/wise-m51-band1.fits'
    task_params = {"filename": filename, "threshold": threshold,
                   "region": {"rect": [150, 150, 200, 200]}}
    print(task(filename, task_params))
