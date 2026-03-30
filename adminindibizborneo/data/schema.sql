-- ==========================================================
-- SKEMA DATABASE: UNDIAN INDIBIZ BORNEO (POSTGRESQL / SUPABASE)
-- ==========================================================

-- 1. Tabel Data Pelanggan (Master Data)
-- Menyimpan data profil pelanggan. Nanti bisa ditambahkan kolom 'periode_billing'.
CREATE TABLE data_pelanggan (
    no_internet VARCHAR(20) PRIMARY KEY,
    nama_pelanggan VARCHAR(150) NOT NULL,
    layanan VARCHAR(100),
    kecepatan_internet VARCHAR(50),
    kota VARCHAR(100)
);

-- 2. Tabel Informasi Pembayaran
-- Menyimpan status pembayaran bulan berjalan. Nanti 'bln_4' dsb bisa diganti 'tanggal_bayar'.
CREATE TABLE informasi_pembayaran (
    no_internet VARCHAR(20) PRIMARY KEY REFERENCES data_pelanggan(no_internet) ON DELETE CASCADE,
    bln_4 BOOLEAN DEFAULT FALSE,
    bln_5 BOOLEAN DEFAULT FALSE,
    bln_6 BOOLEAN DEFAULT FALSE
);

-- 3. Tabel Poin dan Kupon
-- Menyimpan akumulasi perhitungan total poin dan kupon yang didapat pelanggan.
CREATE TABLE poin_dan_kupon (
    no_internet VARCHAR(20) PRIMARY KEY REFERENCES data_pelanggan(no_internet) ON DELETE CASCADE,
    total_poin INTEGER DEFAULT 0,
    total_kupon INTEGER DEFAULT 0
);

-- 4. Tabel Pemenang (Winner)
-- Menyimpan riwayat pelanggan yang berhasil mendapatkan hadiah dari Halaman Pengundian.
CREATE TABLE winner (
    id SERIAL PRIMARY KEY,
    no_internet VARCHAR(20) REFERENCES data_pelanggan(no_internet) ON DELETE SET NULL,
    nama_pemenang VARCHAR(150) NOT NULL,
    kota_pemenang VARCHAR(100),
    jenis_hadiah VARCHAR(100),
    tanggal_menang TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


