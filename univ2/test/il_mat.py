import json
import numpy as np
import matplotlib.pyplot as plt

file_path = '../ILUNI.json'

# Read the JSON data from the file
with open(file_path, 'r') as file:
    data = json.load(file)

fig, axs = plt.subplots( figsize=(5, 5)) 

for pool in data:
    prices = [point['price'] for point in pool['data']]
    losses = [point['loss'] for point in pool['data']]
    axs.plot(prices, losses, label=f'Pool {pool["id"]}')

axs.set_title('a. Uniswap')
axs.set_xlabel('spot price change, ρ')
axs.set_ylabel('divergence loss, L')
axs.legend()
axs.grid(True)

plt.tight_layout()
plt.show()



# # file 입출력으로 데이터 get, low, mid , top
# # 손실률에 대한 price는 선형,  손실률
# def generate_divergence_loss(rho, param):
#     return -np.abs(rho - 1) ** param

# # price x 값의 범위 설정
# rho = np.linspace(0, 5, 100)

# # 각 AMM에 대한 임의의 IL 데이터 생성
# divergence_loss_uniswap = generate_divergence_loss(rho, 0.5)


# data = json.loads(data_json)


# print(rho)
# print(divergence_loss_uniswap)

# # divergence_loss_balancer = generate_divergence_loss(rho, 0.8)
# # divergence_loss_curve = generate_divergence_loss(rho, 1.1)
# # divergence_loss_dodo = np.zeros_like(rho)  # 평형 상태에서 loss가 0이라고 가정

# # 각 서브플롯 생성,플롯 사이즈 조정

# # Uniswap 그래프
# # x data , y data , label 
# # axs.plot(rho, divergence_loss_uniswap, label='1M')
# # axs.plot(rho, divergence_loss_uniswap, label='1B')
# axs.set_title('(a) Uniswap')

# # # Balancer 그래프
# # axs[1].plot(rho, divergence_loss_balancer, label='w1/w2')
# # axs[1].set_title('(b) Balancer, Eq. 43')

# # # Curve 그래프
# # axs[2].plot(rho, divergence_loss_curve, label='A')
# # axs[2].set_title('(c) Curve, Eq. 18')

# # # DODO 그래프
# # axs[3].plot(rho, divergence_loss_dodo, label='DODO, L = 0 at equilibrium')
# # axs[3].set_title('(d) DODO, L = 0 at equilibrium')

# # for ax in axs:
# axs.set_xlabel('spot price change, ρ')
# axs.set_ylabel('divergence loss, L')
# axs.legend()
# axs.grid(True)

# plt.tight_layout()
# plt.show()