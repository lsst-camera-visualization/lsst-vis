from astropy.io import fits

class fitsHandler(object):
    '''A class for dealing with FITS images in python. It provides
    wrapper functions to get FITS header information and image data.
    '''

    def __init__(self, imageName):
        self.imageName = imageName;
        self.image = None

    def __enter__(self):
        try:
            self.image = fits.open(self.imageName)
        except Exception as e:
            print("Cannot open the FITS file.")
            raise

    def __exit__(self):
        try:
            self.image.close()
        except AttributeError as e: # Ignore if there is no image
            pass
        except Exception as e:
            raise

    def getHeader(self):
        '''Retrive the header information from FITS file
        @author Wei Ren
        @param None
        @return Dictionary of FITS header keyword and values.
        '''
        pass

    def getImageData(self, extensionPosition=""):
        '''Retrive the image data as a two dimensional array.
        @author Wei Ren
        @param index (optional) - speicify the "position" of an extension if
                                it's multi-extension FITS. On single-extension
                                FITS this argument is ignored.
        @return A 2-D numpy array of pixel values
        '''
        pass
