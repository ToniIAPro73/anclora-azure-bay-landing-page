from PIL import Image, ImageFilter
from collections import Counter
import numpy as np

src_path = 'public/logo-azure-bay-transparent.png'
dst_path = 'public/logo-azure-bay.png'

src = Image.open(src_path).convert('RGBA')
rgb_image = src.convert('RGB')
pixels = list(rgb_image.getdata())
common_colors = [color for color, _ in Counter(pixels).most_common(16)]
threshold = 24
width, height = rgb_image.size
rgb_arr = np.array(rgb_image, dtype=np.int16)
mask = np.empty((height, width), dtype=np.uint8)
bg_colors = np.array(common_colors, dtype=np.int16)
for y in range(height):
    row = rgb_arr[y]
    diff = np.abs(row[None, :, :] - bg_colors[:, None, :]).sum(axis=2)
    min_dist = diff.min(axis=0)
    mask[y] = np.where(min_dist <= threshold, 0, 255)
mask_img = Image.fromarray(mask, mode='L').filter(ImageFilter.GaussianBlur(radius=0.8))
src.putalpha(mask_img)
src.save(dst_path)
