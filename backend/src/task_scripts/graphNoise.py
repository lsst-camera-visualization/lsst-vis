import scipy.stats
from util.image import Image
from util.region import Region

def _calcNoise(img, region):
    region = Region(region["type"], region["value"])

    def secondMoment(data):
        return scipy.stats.moment(data, moment=2, axis=None)
    return (region.execute(img, secondMoment))**(0.5)

def task(filename, taskParams):
    '''
    @author
    @param task_params -
    @return
    '''
    data = ["Amplifier, Data, Pre, Post, Over"]

    with Image(filename) as img:
        for r in taskParams["regions"]:
            entry  = r["name"] + ","
            entry += str(_calcNoise(img, r["data"])) + ","
            entry += str(_calcNoise(img, r["pre"])) + ","
            entry += str(_calcNoise(img, r["post"])) + ","
            entry += str(_calcNoise(img, r["over"]))
            data.append(entry)

    return { "data": data }, None
