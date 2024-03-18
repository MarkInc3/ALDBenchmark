import matplotlib.pyplot as plt
import logging;

def simulate_swap(input_amount, reserve_in, reserve_out, fee=0.003):
    #fee
    input_amount_after_fee = input_amount * (1 - fee)
    output_amount = (input_amount_after_fee * reserve_out) / (reserve_in + input_amount_after_fee)
    return output_amount

input_amount = 100
reserve_in = 1000
reserve_out = 5000
output_amount = simulate_swap(input_amount, reserve_in, reserve_out)
print(input_amount)
print(reserve_in)
