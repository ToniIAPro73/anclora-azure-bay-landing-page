from PIL import Image, ImageOps, ImageFilter, ImageChops
import numpy as np

source = Image.open('public/logo-azure-bay-transparent.png').convert('RGBA')
gray = ImageOps.grayscale(source)
blur = gray.filter(ImageFilter.GaussianBlur(radius=40))
diff = ImageChops.difference(gray, blur)
diff_arr = np.array(diff)
mask = (diff_arr > 8).astype(np.uint8) * 255
mask_img = Image.fromarray(mask, mode='L')
mask_img = mask_img.filter(ImageFilter.MaxFilter(5))
mask_img = mask_img.filter(ImageFilter.MedianFilter(5))
mask_img = mask_img.filter(ImageFilter.GaussianBlur(radius=1.2))
result = source.copy()
result.putalpha(mask_img)
result.save('public/logo-azure-bay.png')
