from astropy.io import fits
import re
import copy

class fitsHandler:
    '''A class for dealing with FITS images in python. It provides
    wrapper functions to get FITS header information and image data.

    Note 1: Always use `with` statement when declaring the object.

    Note 2: Only works with single-extension FITS file.

    Note 3: Here's an example of the data layout in general.
        Segment/amplifier coordinates in a CCD.
        Format: amplifier[Y][X] (origin at top left corner).
        +----+----+----+----+----+----+----+----+
        | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
        +----+----+----+----+----+----+----+----+
        | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
        +----+----+----+----+----+----+----+----+

    HDU stands for Header/Data Units (HDUs).
    @author - Wei Ren
    '''

    # Constants for the hardware configuration
    # LSST nomenclature (i.e RijSijAij)
    A_X_NUM = 8
    A_Y_NUM = 2
    S_X_NUM = 3
    S_Y_NUM = 3
    R_X_NUM = 5
    R_Y_NUM = 5

    def __init__(self, imageName):
        self.imageName = imageName
        self.hduList = None
        self.primaryHDU = None
        self.header = None
        self.overscan = False
        self.level = None
        self.__enter__()

    def __enter__(self):
        try:
            self.hduList = fits.open(self.imageName)
            self.primaryHDU = (self.hduList)[0]
            self.header = self.primaryHDU.header
            # TODO: THE FOLLOWING TWO HACKY TRY/CATCH SHOULD BE REMOVED.
            # CURRENT IMAGES DOES NOT HAVE THESE TWO KEYWORDS YET.
            try:
                self.overscan = self.header["OVERSCAN"]
            except Exception as e:
                self.overscan = False
            try:
                self.level = self.header["LEVEL"]
            except Exception as e:
                self.level = "RAFT"
        except Exception as e:
            print("Cannot open the FITS file or the header lacks necessary information.")
            raise
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.hduList.close()
        except AttributeError as e: # pass if there is no image
            pass
        except Exception as e:
            raise

    def close(self):
        self.hduList.close()

    def getHeader(self):
        ''' Return the header of the (single-extension) FITS file as an
        header object.
        @param None
        @return A HDU header object
        '''
        return self.header

    def getHeaderJSON(self):
        '''Retrive the header information in JSON compatible format
        (python dictionary). It is used in the communication of frontend
        and backend.
        @param - None
        @return - Python dictionary of header informations
        '''
        if self.level == "CCD":
            return self.getCCDHeaderJSON()
        elif self.level == "RAFT":
            return self.getRaftHeaderJSON()
        elif self.level == "FOCALPLANE":
            return self.getFocalPlaneHeaderJSON()
        else:
            raise NameError("Unknown level for this FITS: " + self.level)

    def getCCDHeaderJSON(self, R_YX="R99", S_YX="S99"):
        '''Retrive the header information on a CCD-level FITS.
        @param - None
        @return - Python dictionary of header informations
        '''
        tempSegYX = "00"
        prefix = "HIERARCH {} {} SEGMENT{} ".format(R_YX, S_YX, tempSegYX)
        header = self.header
        segDim = {"x": header[prefix + "NAXIS1"],
                    "y": header[prefix + "NAXIS2"]}

        ccdBoundary = []
        for ampX in range(self.A_X_NUM):
            for ampY in range(self.A_Y_NUM):
                segYX = str(self.A_Y_NUM - 1 - ampY)+str(ampX) # NOTE: Y is inverted
                prefix = "HIERARCH {} {} SEGMENT{} ".format(R_YX, S_YX, segYX)
                ampDetSec = self.__convertRange(header[prefix + "DETSEC"])
                ampInfo = {"name": "A{}".format(segYX)}
                if not self.overscan: # ccd without overscan
                    ccdType = "CCD"
                    ampInfo["data"] = self.__formatRect(ampDetSec)
                else: # ccd with overscan
                    ccdType = "CCD-OVERSCAN"
                    ampDataSec = self.__convertRange(header[prefix + "DATASEC"])
                    ampPostscan = self.__convertRange(header[prefix + "BIASSEC"])
                    ampPrescan = copy.deepcopy(ampDataSec)
                    ampPrescan["x1"] = 0
                    ampPrescan["x2"] = min(ampDataSec["x1"], ampDataSec["x2"]) - 1
                    ampOverscan = {"x1": 0, "x2": segDim["x"] - 1}
                    ampOverscan["y1"] = max(ampPrescan["y1"], ampPrescan["y2"]) + 1
                    ampOverscan["y2"] = segDim["y"] - 1

                    xStart, yStart = ampX * segDim["x"], ampY * segDim["y"]
                    ampAll = {"x1": xStart, "x2": xStart + segDim["x"] - 1,
                                "y1": yStart, "y2": yStart + segDim["y"] - 1}

                    xReverse = ampDetSec["x1"] > ampDetSec["x2"]
                    yReverse = ampDetSec["y1"] > ampDetSec["y2"]
                    ampPrescan = self.__rangeComplement(ampPrescan, segDim, x=xReverse, y=yReverse)
                    ampDataSec = self.__rangeComplement(ampDataSec, segDim, x=xReverse, y=yReverse)
                    ampPostscan = self.__rangeComplement(ampPostscan, segDim, x=xReverse, y=yReverse)
                    ampOverscan = self.__rangeComplement(ampOverscan, segDim, x=False, y=yReverse)

                    ampInfo["all"] = self.__formatRect(ampAll)
                    ampInfo["data"] = self.__formatRectOffset(ampDataSec, xStart, yStart)
                    ampInfo["pre"] = self.__formatRectOffset(ampPrescan, xStart, yStart)
                    ampInfo["post"] = self.__formatRectOffset(ampPostscan, xStart, yStart)
                    ampInfo["over"] = self.__formatRectOffset(ampOverscan, xStart, yStart)
                ccdBoundary.append(ampInfo)

        return {"type": ccdType, "value": ccdBoundary}

    def getRaftHeaderJSON(self):
        '''Retrive the header information on a raft-level FITS.
        @param - None
        @return - Python dictionary of header informations
        '''
        # HARD-CODED
        # TODO: HIERARCHICAL STRUCTURE!
        header = self.header
        boundaryArray = []
        for raftX in range(self.S_X_NUM):
            for raftY in range(self.S_Y_NUM):
                for ampX in range(self.A_X_NUM):
                    for ampY in range(self.A_Y_NUM):
                        prefix = "HIERARCH R{}{} S{}{} SEGMENT{}{} ".format(9, 9, raftY, raftX, ampY, ampX)
                        ampDataSec = self.__convertRange(header[prefix + "DETSEC"])
                        ampInfo = {}
                        ampInfo["name"] = "S{}{}A{}{}".format(raftY, raftX, ampY, ampX)
                        xStart, yStart = raftX * (4072 + 20), raftY * (4000 + 20)
                        ampInfo["data"] = self.__formatRectOffset(ampDataSec, xStart, yStart)
                        boundaryArray.append(ampInfo)
        return {"type": "CCD", "value": boundaryArray}

    def getFocalPlaneHeaderJSON(self):
        '''Retrive the header information on a focal plane level FITS.
        @param - None
        @return - Python dictionary of header informations
        '''
        return {"Error": "Not yet implemented for focal plane level FITS."}

    def __rangeToDim(self, region):
        ''' Private helper function for converting a range/slice into
        a dimenstion
        @param: region - region in 2D (dictionary with keys: x1, x2, y1, y2)
        @return: dimension - dictionary with keys: x, y
        '''
        return {"x": 1 + abs(region["x2"]-region["x1"]),
                "y": 1 + abs(region["y2"]-region["y1"])}

    def __addOffset(self, region, xOffset, yOffset):
        ''' Private helper function to add x and y offset to a region.
        @param: region - region in 2D (dictionary with keys: x1, x2, y1, y2)
        @param: xOffset - offset in x to add
        @param: yOffset - offset in y to add
        @return: the new range (with offset added)
        '''
        return {"x1": region["x1"] + xOffset,
                "x2": region["x2"] + xOffset,
                "y1": region["y1"] + yOffset,
                "y2": region["y2"] + yOffset}

    def __rangeComplement(self, region, segDim, x=False, y=False):
        ''' Private helper function to convert the region if the
        coordinates are reversed in the header.
        @param: region - region in 2D (dictionary with keys: x1, x2, y1, y2)
        @param: segDim - Dimension of the segment/amplifier
        @param: x - reversed in x direction or not
        @param: y - reversed in y direction or not
        @return: new region with the correct orientation
        '''
        newRegion = copy.deepcopy(region)
        if x:
            newRegion["x1"] = (segDim["x"] - 1 - newRegion["x1"])
            newRegion["x2"] = (segDim["x"] - 1 - newRegion["x2"])
        if y:
            newRegion["y1"] = (segDim["y"] - 1 - newRegion["y1"])
            newRegion["y2"] = (segDim["y"] - 1 - newRegion["y2"])
        return newRegion

    def __formatRect(self, region):
        ''' Private helper function to convert a region into Rect obejct.
        @param: region - range in 2D (dictionary with keys: x1, x2, y1, y2)
        @return: Rect
        '''
        return {"type": "rect", "value": region}

    def __formatRectOffset(self, region, xOffset, yOffset):
        ''' Private helper function to convert a region into Rect with offset.
        @param: region - range in 2D (dictionary with keys: x1, x2, y1, y2)
        @return: Rect
        '''
        region = self.__addOffset(region, xOffset, yOffset)
        return {"type": "rect", "value": region}

    def __convertRange(self, sliceString):
        '''Convert the boundary coordinates from string(as in the header) to values. It's assumed to be a rectangular region (2-dimensional).

        NOTE: slicing are inclusive in the header value.

        @author Wei Ren
        @param String of FITS header value representing boundary or dimension.
        @return Python dictionary containing X and Y boundaries.
        '''
        coord_list = re.split('[,:]', sliceString[1:-1]) # strip the square bracket before spliting.
        return {"x1" : int(coord_list[0])-1,
                "x2" : int(coord_list[1])-1,
                "y1" : int(coord_list[2])-1,
                "y2" : int(coord_list[3])-1}

    def getImageData(self):
        '''Retrive the image data as a two dimensional array.
        @param - None
        @return - A 2-D numpy array of pixel values.
        '''
        return self.primaryHDU.data
