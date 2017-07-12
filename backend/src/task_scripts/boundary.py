from astropy.io import fits
from util.fitsHandler import fitsHandler

def task(filename, task_params):
    ''' Return amplifier boundries of a FITS file based on its header information.
    @author Wei Ren
    @param task_params - task_params should specify the FITS file.
    @return A dictionary that contains relevant header and boundary information
    '''

    with fitsHandler(filename) as fitsImage:
        headerInfo = fitsImage.getHeaderJSON()

    return headerInfo, None

# Test/debug
if __name__ == '__main__':
    print(task("https://www.dropbox.com/s/3n571i6ak648gmy/default-untrimmed.fits?dl=1", {}))
    print()
    print(task("https://www.dropbox.com/s/e7g1rynikrqbxlc/default-trimmed.fits?dl=1", {}))
