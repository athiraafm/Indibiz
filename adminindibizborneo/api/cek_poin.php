<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

// Cek apakah ada parameter no_internet
if (!isset($_GET['no_internet']) || empty(trim($_GET['no_internet']))) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'no_internet is required']);
    exit;
}

$no_internet = trim($_GET['no_internet']);

try {
    // 1. Ambil data pelanggan utama (Nama, Kota)
    $stmt_pelanggan = $pdo->prepare("SELECT nama_pelanggan, kota FROM data_pelanggan WHERE no_internet = :no_internet");
    $stmt_pelanggan->execute([':no_internet' => $no_internet]);
    $pelanggan = $stmt_pelanggan->fetch(PDO::FETCH_ASSOC);

    if (!$pelanggan) {
        // Pelanggan tidak ditemukan
        echo json_encode(['status' => 'not_found', 'message' => 'Nomor Internet tidak terdaftar.']);
        exit;
    }

    // 2. Ambil total poin dan kupon
    $stmt_poin = $pdo->prepare("SELECT total_poin, total_kupon FROM poin_dan_kupon WHERE no_internet = :no_internet");
    $stmt_poin->execute([':no_internet' => $no_internet]);
    $poin = $stmt_poin->fetch(PDO::FETCH_ASSOC);

    // 3. Ambil riwayat informasi pembayaran (untuk rincian bulan April, Mei, Juni)
    $stmt_pembayaran = $pdo->prepare("
        SELECT * 
        FROM informasi_pembayaran 
        WHERE no_internet = :no_internet
    ");
    $stmt_pembayaran->execute([':no_internet' => $no_internet]);
    $pembayaran = $stmt_pembayaran->fetch(PDO::FETCH_ASSOC);

    // Kirimkan satu paket data JSON
    echo json_encode([
        'status' => 'success',
        'data' => [
            'pelanggan' => $pelanggan,
            'poin' => $poin ? $poin : ['total_poin' => 0, 'total_kupon' => 0],
            'pembayaran' => $pembayaran ? $pembayaran : null
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()
    ]);
}
?>
