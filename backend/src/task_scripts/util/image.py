from astropy.io import fits

class Image:
    def __init__(self, filename):
        self._hdulist = fits.open(filename)

    def __enter__(self):
        return self._hdulist[0].data

    def __exit__(self, exc_type, exc_value, traceback):
        self._hdulist.close()
