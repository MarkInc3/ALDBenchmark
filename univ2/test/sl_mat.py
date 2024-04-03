<<<<<<< HEAD
import json
import matplotlib.pyplot as plt
import numpy as np

file_path = './il_univ2.json'

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
        

axs.set_title('a. Uniswap')
axs.set_xlabel('Reserve a,b ratio, ρ')
axs.set_ylabel('Slippage - (%)')
axs.legend()
axs.grid(True)

plt.tight_layout()
=======
import numpy as np
import matplotlib.pyplot as plt

# Uniswap의 슬리피지 그래프를 재현하기 위한 임시 데이터 생성
# Uniswap의 슬리피지는 x = (y*y_d)/(x_d + y_d) - y 로 계산됩니다.
# 여기서 x_d는 거래 전 토큰 X의 리저브, y_d는 거래될 토큰 Y의 양, y는 거래 후 토큰 Y의 리저브입니다.
# 거래 크기에 대한 슬리피지를 계산하기 위해서는, 특정 trade size to reserve의 비율을 사용합니다.

# Uniswap의 트레이드 크기 대비 리저브의 비율 설정
trade_size_to_reserve_ratios = np.linspace(0, 2, 100)
A_values = [1.01, 5, 1000, 10000]  # A 값은 슬리피지를 결정하는 상수

# 슬리피지 계산 함수
def calculate_uniswap_slippage(trade_size_to_reserve_ratio, A):
    # 편의상 y/y_d = 1로 가정하고 계산
    y_d = 1
    y = 1
    x_d = A * y_d  # A는 거래량에 따른 리저브의 상수 배율
    x = (y*y_d)/(x_d + trade_size_to_reserve_ratio*y_d) - y
    return x

# 슬리피지 데이터 생성
slippages = {A: calculate_uniswap_slippage(trade_size_to_reserve_ratios, A) for A in A_values}

# 그래프 생성
plt.figure(figsize=(12, 6))

for A, slippage in slippages.items():
    plt.plot(trade_size_to_reserve_ratios, slippage, label=f'A = {A}')

plt.title('Uniswap Slippage')
plt.xlabel('trade size to reserve, x1/r1')
plt.ylabel('slippage, S')
plt.legend()
plt.grid(True)
>>>>>>> e2722e8 (test : il fix)
plt.show()
