# pip install stadata pandas
import stadata, pandas as pd

client = stadata.Client("a9476b71ab1185dec8762960f1653257")

# 1) List domain (nasional/provinsi/kab/kota) → ambil id domain yang kamu mau
domains = client.list_domain()  # berisi id domain bps.go.id daerah
# 2) Cari tabel dinamis yang relevan (mis. kata kunci "pengeluaran", "buah", "sayur")
dyn = client.list_dynamictable(all=True)
df_dyn = pd.DataFrame(dyn)
df_dyn[df_dyn["title"].str.contains("pengeluaran|buah|sayur", case=False)]

# 3) View data dari satu tabel dinamis (pakai var_id dari hasil list_dynamictable)
var_id = df_dyn.loc[df_dyn["title"].str.contains("buah", case=False), "var_id"].iloc[0]
data_buah = client.view_dynamictable(var_id=var_id)  # return DataFrame siap pakai

# 4) (Opsional) Filter per wilayah/tahun sesuai kolom yang disediakan
