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
            # TODO: The following two hacky try/catch should be removed.
            # Current images does not have these two keywords yet.
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
        prefix = "HIERARCH {} {} SEGMENT {} ".format(R_YX, S_YX, tempSegYX)
        header = self.header
        segDim = {"x": header[prefix + "NAXIS1"],
                    "y": header[prefix + "NAXIS2"]}
        ccdImageDim = self.__rangeToDim(self.__convertRange(header[prefix + "DETSIZE"]))
        ampDim = self.__rangeToDim(self.__convertRange(header[prefix + "DETSEC"]))

        ccdBoundary = []
        for ampX in range(self.A_X_NUM):
            for ampY in range(self.A_Y_NUM):
                segYX = str(ampX)+str(ampY)
                prefix = "HIERARCH {} {} SEGMENT {} ".format(R_YX, S_YX, segYX)
                ampDataSec = self.__convertRange(header[prefix + "DATASEC"])
                ampDetSec = self.__convertRange(header[prefix + "DETSEC"])
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

                ampInfo = {}
                ampInfo["name"] = header[prefix + "EXTNAME"]
                ampInfo["all"] = self.__formatRect(ampAll)
                ampInfo["data"] = self.__formatRectOffset(ampDataSec, xStart, yStart)
                ampInfo["pre"] = self.__formatRectOffset(ampPrescan, xStart, yStart)
                ampInfo["post"] = self.__formatRectOffset(ampPostscan, xStart, yStart)
                ampInfo["over"] = self.__formatRectOffset(ampOverscan, xStart, yStart)
                ccdBoundary.append(ampInfo)

        ccdType = "CCD-OVERSCAN" if self.overscan else "CCD"
        return {"type": ccdType, "data": ccdBoundary}

    def getRaftHeaderJSON(self):
        '''Retrive the header information on a raft-level FITS.
        @param - None
        @return - Python dictionary of header informations
        '''
        pass

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
            newRegion["x1"] -= (segDim["x"] - 1)
            newRegion["x2"] -= (segDim["x"] - 1)
        if y:
            newRegion["y1"] -= (segDim["y"] - 1)
            newRegion["y2"] -= (segDim["y"] - 1)
        return newRegion

    def __formatRect(self, region):
        ''' Private helper function to convert a region into Rect obejct.
        @param: region - range in 2D (dictionary with keys: x1, x2, y1, y2)
        @return: Rect
        '''
        return {"type": "rect", "data": region}

    def __formatRectOffset(self, region, xOffset, yOffset):
        ''' Private helper function to convert a region into Rect with offset.
        @param: region - range in 2D (dictionary with keys: x1, x2, y1, y2)
        @return: Rect
        '''
        region = self.__addOffset(region, xOffset, yOffset)
        return {"type": "rect", "data": region}

    def __convertRange(sliceString):
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
