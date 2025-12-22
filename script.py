from PIL import Image
import numpy as np
img = Image.open('public/logo-azure-bay-transparent.png').convert('RGB')
arr = np.array(img)
top = arr[:128,:,:]
colors = {tuple(color.tolist()) for row in top for color in row}
print('unique colors top 128 rows', len(colors))
print(list(colors)[:10])
