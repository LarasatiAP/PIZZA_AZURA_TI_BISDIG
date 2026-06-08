<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * Script untuk insert data menu Pizza Azura dari menu di PDF
 * Jalankan di controller untuk populate database
 */

$menu_items = [
    // Size 22
    [
        'nama_pizza' => 'Pizza Corn Cheese',
        'ukuran' => '22',
        'harga' => 25000,
        'extra_mozarela' => 35000,
        'deskripsi' => 'Corn dan keju mozarela',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Corn Sosis',
        'ukuran' => '22',
        'harga' => 25000,
        'extra_mozarela' => 35000,
        'deskripsi' => 'Jagung dan sosis',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Chicken Cheese',
        'ukuran' => '22',
        'harga' => 35000,
        'extra_mozarela' => 45000,
        'deskripsi' => 'Ayam dan keju mozarela',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Chicken Blackpepper',
        'ukuran' => '22',
        'harga' => 35000,
        'extra_mozarela' => 45000,
        'deskripsi' => 'Ayam dengan merica hitam',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Mushroom Corn',
        'ukuran' => '22',
        'harga' => 35000,
        'extra_mozarela' => 45000,
        'deskripsi' => 'Jamur dan jagung',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Chicken Corn Mayo',
        'ukuran' => '22',
        'harga' => 35000,
        'extra_mozarela' => 45000,
        'deskripsi' => 'Ayam, jagung dan mayo',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Tuna Corn Mayo',
        'ukuran' => '22',
        'harga' => 35000,
        'extra_mozarela' => 45000,
        'deskripsi' => 'Tuna, jagung dan mayo',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Beef Pepperoni',
        'ukuran' => '22',
        'harga' => 45000,
        'extra_mozarela' => null,
        'deskripsi' => 'Daging sapi dan pepperoni',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Beef Petties',
        'ukuran' => '22',
        'harga' => 45000,
        'extra_mozarela' => null,
        'deskripsi' => 'Daging sapi premium',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Super Supreme',
        'ukuran' => '22',
        'harga' => 55000,
        'extra_mozarela' => null,
        'deskripsi' => 'Kombinasi topping lengkap',
        'gambar' => 'pizza-default.webp'
    ],

    // Size 26
    [
        'nama_pizza' => 'Pizza Corn Cheese',
        'ukuran' => '26',
        'harga' => 40000,
        'extra_mozarela' => 55000,
        'deskripsi' => 'Corn dan keju mozarela',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Corn Sosis',
        'ukuran' => '26',
        'harga' => 40000,
        'extra_mozarela' => 55000,
        'deskripsi' => 'Jagung dan sosis',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Chicken Cheese',
        'ukuran' => '26',
        'harga' => 55000,
        'extra_mozarela' => 65000,
        'deskripsi' => 'Ayam dan keju mozarela',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Chicken Blackpepper',
        'ukuran' => '26',
        'harga' => 55000,
        'extra_mozarela' => 65000,
        'deskripsi' => 'Ayam dengan merica hitam',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Mushroom Corn',
        'ukuran' => '26',
        'harga' => 55000,
        'extra_mozarela' => 65000,
        'deskripsi' => 'Jamur dan jagung',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Chicken Corn Mayo',
        'ukuran' => '26',
        'harga' => 55000,
        'extra_mozarela' => 65000,
        'deskripsi' => 'Ayam, jagung dan mayo',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Tuna Corn Mayo',
        'ukuran' => '26',
        'harga' => 55000,
        'extra_mozarela' => 65000,
        'deskripsi' => 'Tuna, jagung dan mayo',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Beef Pepperoni',
        'ukuran' => '26',
        'harga' => 65000,
        'extra_mozarela' => null,
        'deskripsi' => 'Daging sapi dan pepperoni',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Beef Petties',
        'ukuran' => '26',
        'harga' => 65000,
        'extra_mozarela' => null,
        'deskripsi' => 'Daging sapi premium',
        'gambar' => 'pizza-default.webp'
    ],
    [
        'nama_pizza' => 'Pizza Super Supreme',
        'ukuran' => '26',
        'harga' => 75000,
        'extra_mozarela' => null,
        'deskripsi' => 'Kombinasi topping lengkap',
        'gambar' => 'pizza-default.webp'
    ],
];

// Untuk menggunakan script ini, panggil dari controller dengan:
// $this->load->helper('menu_data');
// Kemudian loop melalui $menu_items dan insert ke database
?>
