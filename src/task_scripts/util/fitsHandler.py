from astropy.io import fits
import re

def _convertHeaderRange(detsizeString):
    '''Convert the boundary coordincates from string(as in the header) to values. It's assumed to be a rectangular region (2-dimensional).

    NOTE: slicing are inclusive in the header value.

    @author Wei Ren
    @param String of FITS header value representing boundary or dimension.
    @return Dictionary containing X and Y boundaries.
    '''
    coord_list = re.split('[,:]', detsizeString[1:-1]) # strip the square bracket before spliting.
    coord_list = [[int(value) for value in elem] for elem in coord_list]
    return {"x1" : coord_list[0][0]-1,
            "x2" : coord_list[0][1]-1,
            "y1" : coord_list[1][0]-1,
            "y2" : coord_list[1][1]-1}

class fitsHandler:
    '''A class for dealing with FITS images in python. It provides
    wrapper functions to get FITS header information and image data.

    Always use `with` statement declaring the object.

    Note: currently CCD level FITS images are mostly used. Here's an
    example of the data layout in general.
        Segment/amplifier coordinates in a CCD.
        Format: amplifier[Y][X] (origin at top left corner).
        +----+----+----+----+----+----+----+----+
        | 00 | 01 | 02 | 03 | 04 | 05 | 06 | 07 |
        +----+----+----+----+----+----+----+----+
        | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 |
        +----+----+----+----+----+----+----+----+

    HDU stands for Header/Data Units (HDUs).
    '''

    def __init__(self, imageName):
        self.imageName = imageName
        self.hduList = None
        self.imageHDUs = None
        self.isMulti = None
        self.primaryHDU = None

    def __enter__(self):
        try:
            self.hduList = fits.open(self.imageName)
            self.primaryHDU = (self.hduList)[0]
            primaryHeader = (self.primaryHDU).header
            self.isMulti = ("EXTEND" in primaryHeader) and primaryHeader["EXTEND"]
            if (self.isMulti):
                self.imageHDUs = [elem for elem in self.hduList if type(elem).__name__ == 'ImageHDU']
            else:
                self.imageHDUs = (self.hduList)[0] # primary header
        except Exception as e:
            print("Cannot open the FITS file.")
            raise
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            self.hduList.close()
        except AttributeError as e: # Ignore if there is no image
            pass
        except Exception as e:
            raise

    def __getImageHDUFromHDUList(self, segPosition=""):
        ''' Helper function. Iterate through HDU list and return one particular
        image HDU.
        @author Wei Ren
        @param segPosition - see getImageData
        @return A pointer to imageHDU object. Return None if none found.
        '''
        for elem in self.imageHDUs:
            if (elem.header)["EXTNAME"] == "Segment" + segPosition:
                return elem
        return None

    def getHeader(self):
        '''Retrive the header information from FITS file. The information is
        stored as python dictionary.
        @author Wei Ren
        @param None
        @return A dictionary of FITS header keyword and values.
        '''
        def _convertRangeToDim(region):
            return {"x": 1 + abs(region["x2"]-region["x1"]),
                    "y": 1 + abs(region["y2"]-region["y1"])}

        def _addOffset(region, xOffset, yOffset):
            return {"x1": region["x1"] + xOffset,
                    "x2": region["x2"] + xOffset,
                    "y1": region["y1"] + yOffset,
                    "y2": region["y2"] + yOffset}

        # Use the first segment to determine the dimension
        tempHeader = ((self.imageHDUs)[0]).header
        segDim = {"x": tempHeader["NAXIS1"], "y": tempHeader["NAXIS2"]}
        imageDim = _convertRangeToDim(_convertHeaderRange(tempHeader["DETSIZE"]))
        ampDim = _convertRangeToDim(_convertHeaderRange(tempHeader["DETSEC"]))

        boundaryArray = []
        for amp in self.imageHDUs:
            header = amp.header
            ampDataSection = _convertHeaderRange(header["DATASEC"])
            ampPostscan = _convertHeaderRange(header["BIASSEC"])
            ampPrescan = _convertHeaderRange(header["DATASEC"])
            ampPrescan["x2"] = min(ampPrescan["x1"], ampPrescan["x2"]) - 1
            ampPrescan["x1"] = 0

            ampX = (ampDataSection["x1"] - 1) // ampDim["x"]
            ampY = (ampDataSection["y1"] - 1) // ampDim["y"]
            xStart, yStart = ampX*segDim["x"], ampY*segDim["y"]
            ampSection = {"x1": xStart, "x2": xStart + ampDim["x"] - 1,
                            "y1": yStart, "y2": yStart + ampDim["y"] - 1}
            ampOverscan = {"x1": xStart, "x2": xStart + ampDim["x"] - 1,
                            "y1": ampPrescan["y2"] + 1, "y2": yStart + ampDim["y"] - 1}
            ampInfo = {}
            ampInfo["name"] = header["EXTNAME"]
            ampInfo["data"] = _addOffset(ampDataSection, xStart, yStart)
            ampInfo["pre"] = _addOffset(ampPrescan, xStart, yStart)
            ampInfo["post"] = _addOffset(ampPostscan, xStart, yStart)
            ampInfo["over"] = _addOffset(ampOverscan, xStart, yStart)
            ampInfo["all"] = ampSection
            boundaryArray.append(ampInfo)

        return {"type": "CCD-OVERSCAN",
                "data": boundaryArray}

    def getHeaderJSON(self):
        '''Retrive the header information in JSON format. It is used in
        the communication of frontend and backend.
        @author Wei Ren
        @param
        @return JSON object of header information (including segments)
        '''
        pass

    def getImageData(self, segPosition=""):
        '''Retrive the image data as a two dimensional array. It retrives data
        of one segment if the FITS is in multi-extension format.
        @author Wei Ren
        @param segPosition - String (optional) speicify the "position" of
                                an extension if it is a multi-extension FITS.On
                                single-extension FITS this argument is ignored.
        @return A 2-D numpy array of pixel values.
        '''
        if self.isMulti:
            if not re.match(r"^\d{2}$", segPosition):
                raise ValueError("Wrong argument segPosition passed in. Expected to be string of two digits, e.g. '17'")
            hdu = self.__getImageHDUFromHDUList(segPosition)
            return hdu.data
        else:
            return self.primaryHDU.data

    def getSegmentHeader(self, segPosition=""):
        '''Retrive the header of one segment. It will return the primary header
        if the FITS image is single-extension.
        @author Wei Ren
        @param segPosition - see getImageData
        @return A pointer to the astropy.fits header object.
        '''
        if self.isMulti:
            if not re.match(r"^\d{2}$", segPosition):
                raise ValueError("Wrong argument segPosition passed in. Expected to be string of two digits, e.g. '17'")
            hdu = self.__getImageHDUFromHDUList(segPosition)
            return hdu.header
        else:
            return self.primaryHDU.header
