<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';

try {
    // Ambil 10 data poin tetinggi
    // Join dengan tabel pelanggan untuk dapat rincian nama dan kota
    $query = "
        SELECT 
            pk.no_internet,
            pk.total_poin,
            pk.total_kupon,
            dp.nama_pelanggan,
            dp.kota
        FROM poin_dan_kupon pk
        JOIN data_pelanggan dp ON pk.no_internet = dp.no_internet
        ORDER BY pk.total_poin DESC
        LIMIT 10
    ";

    $stmt = $pdo->query($query);
    $topCustomers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'data' => $topCustomers
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Gagal mengambil data Top Customer: ' . $e->getMessage()
    ]);
}
?>
