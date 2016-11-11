import random
import pandas as pd
import numpy as np
import itertools

intensity = []
num_buckets = 100
num_rows = 10
num_cols = 10
additional_data = 11
for x in range(num_buckets):
	intensity.append(random.randint(1,300))

rows = []
cols = []
stuff = list(np.arange(1,additional_data,1))
for L in range(0, len(stuff)+1):
	for subset in itertools.permutations(stuff, L):
		if len(subset) == 2:
			rows.append(subset[0])
			cols.append(subset[1])

for i in range(1,additional_data):
	rows.append(i)
	cols.append(i)

df = pd.DataFrame()
df['row'] = rows
df['col'] = cols
df['intensity'] = intensity

df.to_csv('data/data2.tsv', index = False, sep = '\t')
