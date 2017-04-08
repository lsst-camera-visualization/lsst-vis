from astropy.io import fits

class Image:
    def __init__(filename):
        self._hdulist = fits.open(filename)

    def __enter__():
        return self._hdulist[0].data

    def __exit__():
        self._hdulist.close()
