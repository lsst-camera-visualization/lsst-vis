from astropy.io import fits

class fitsHandler(object):
    '''A class for dealing with FITS images in python. It provides
    wrapper functions to get FITS header information and image data.
    '''

    def __init__(self, imageName):
        self.imageName = imageName;

    def __enter__(self):
        self.image = fits.open(self.imageName)

    def __exit__(self):
        self.image.close()

    def getHeader(self):
        '''Retrive the header information from FITS file
        @author Wei Ren
        @param None
        @return Dictionary of FITS header keyword and values.
        '''
        pass

    def getImageData(self):
        '''Retrive the image data as a two dimensional array
        @author Wei Ren
        @param None
        @return A 2-D array of pixel values
        '''
        pass
