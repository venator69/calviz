import numpy as np

# Bobot kriteria (priority vector hasil AHP)
#Harga, Kompleksitas, power, reliability, sustainibility
W = np.array([0.106, 0.157, 0.167, 0.515, 0.055])

# Matriks bobot alternatif terhadap kriteria
# Baris = alternatif, Kolom = kriteria
P = np.array([
    [0.3, 0.6, 0.8, 0.3, 0.7],  # robot
    [0.5, 0.5, 0.6, 1, 0.7],  # drone
])

# Hitung skor akhir (Skor = P × W)
S = np.dot(P, W)

# Daftar nama alternatif
alternatives = ["Robot", "Drone"]

# Cetak skor tiap alternatif
for i, score in enumerate(S):
    print(f"Alternatif {alternatives[i]}: {score:.4f}")

# Tentukan alternatif terbaik
best_index = np.argmax(S)
print(f"\n✅ Alternatif terbaik: {alternatives[best_index]} dengan skor {S[best_index]:.4f}")
