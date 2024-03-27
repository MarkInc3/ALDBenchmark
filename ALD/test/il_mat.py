import json
import matplotlib.pyplot as plt
import numpy as np

file_path = './il_ald.json'

# Read the JSON data from the file
with open(file_path, 'r') as file:
    data = json.load(file)

fig, axs = plt.subplots( figsize=(5, 5)) 

for pool in data:
    prices = [point['price'] for point in pool['data']]
    losses = [point['loss'] for point in pool['data']]
    if pool["id"] == 1 :
        axs.plot(prices, losses, label='10K')
    elif pool["id"] == 2 :
        axs.plot(prices, losses, label='1M')
    elif pool["id"] == 3 :
        axs.plot(prices, losses, label=f'1B')
        

axs.set_title('a. ALD')
axs.set_xlabel('Spot Price Change, ρ')
axs.set_ylabel('Divergence Loss, L (%)')
axs.legend()
axs.grid(True)

plt.tight_layout()
plt.show()