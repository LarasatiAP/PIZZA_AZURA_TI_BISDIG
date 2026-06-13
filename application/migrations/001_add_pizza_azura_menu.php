<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_Add_pizza_azura_menu extends CI_Migration {

    public function up()
    {
        // Pastikan tabel pizzas ada dengan struktur yang tepat
        if (!$this->db->table_exists('pizzas')) {
            $this->dbforge->add_field(array(
                'id' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'unsigned' => TRUE,
                    'auto_increment' => TRUE
                ),
                'nama_pizza' => array(
                    'type' => 'VARCHAR',
                    'constraint' => 100,
                ),
                'ukuran' => array(
                    'type' => 'VARCHAR',
                    'constraint' => 10,
                ),
                'harga' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                ),
                'extra_mozarela' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'null' => TRUE,
                ),
                'deskripsi' => array(
                    'type' => 'TEXT',
                    'null' => TRUE,
                ),
                'gambar' => array(
                    'type' => 'VARCHAR',
                    'constraint' => 100,
                    'default' => 'pizza-default.webp',
                ),
                'stok' => array(
                    'type' => 'INT',
                    'constraint' => 11,
                    'default' => 0,
                ),
                'created_at' => array(
                    'type' => 'TIMESTAMP',
                    'default' => 'CURRENT_TIMESTAMP',
                ),
                'updated_at' => array(
                    'type' => 'TIMESTAMP',
                    'default' => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
                ),
            ));
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->create_table('pizzas');
        }

        // Insert menu data
        $menu_items = [
            // Size 22
            ['nama_pizza' => 'Pizza Corn Cheese', 'ukuran' => '22', 'harga' => 25000, 'extra_mozarela' => 35000, 'deskripsi' => 'Corn dan keju mozarela', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Corn Sosis', 'ukuran' => '22', 'harga' => 25000, 'extra_mozarela' => 35000, 'deskripsi' => 'Jagung dan sosis', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Chicken Cheese', 'ukuran' => '22', 'harga' => 35000, 'extra_mozarela' => 45000, 'deskripsi' => 'Ayam dan keju mozarela', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Chicken Blackpepper', 'ukuran' => '22', 'harga' => 35000, 'extra_mozarela' => 45000, 'deskripsi' => 'Ayam dengan merica hitam', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Mushroom Corn', 'ukuran' => '22', 'harga' => 35000, 'extra_mozarela' => 45000, 'deskripsi' => 'Jamur dan jagung', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Chicken Corn Mayo', 'ukuran' => '22', 'harga' => 35000, 'extra_mozarela' => 45000, 'deskripsi' => 'Ayam, jagung dan mayo', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Tuna Corn Mayo', 'ukuran' => '22', 'harga' => 35000, 'extra_mozarela' => 45000, 'deskripsi' => 'Tuna, jagung dan mayo', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Beef Pepperoni', 'ukuran' => '22', 'harga' => 45000, 'extra_mozarela' => NULL, 'deskripsi' => 'Daging sapi dan pepperoni', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Beef Petties', 'ukuran' => '22', 'harga' => 45000, 'extra_mozarela' => NULL, 'deskripsi' => 'Daging sapi premium', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Super Supreme', 'ukuran' => '22', 'harga' => 55000, 'extra_mozarela' => NULL, 'deskripsi' => 'Kombinasi topping lengkap', 'gambar' => 'pizza-default.webp'],

            // Size 26
            ['nama_pizza' => 'Pizza Corn Cheese', 'ukuran' => '26', 'harga' => 40000, 'extra_mozarela' => 55000, 'deskripsi' => 'Corn dan keju mozarela', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Corn Sosis', 'ukuran' => '26', 'harga' => 40000, 'extra_mozarela' => 55000, 'deskripsi' => 'Jagung dan sosis', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Chicken Cheese', 'ukuran' => '26', 'harga' => 55000, 'extra_mozarela' => 65000, 'deskripsi' => 'Ayam dan keju mozarela', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Chicken Blackpepper', 'ukuran' => '26', 'harga' => 55000, 'extra_mozarela' => 65000, 'deskripsi' => 'Ayam dengan merica hitam', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Mushroom Corn', 'ukuran' => '26', 'harga' => 55000, 'extra_mozarela' => 65000, 'deskripsi' => 'Jamur dan jagung', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Chicken Corn Mayo', 'ukuran' => '26', 'harga' => 55000, 'extra_mozarela' => 65000, 'deskripsi' => 'Ayam, jagung dan mayo', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Tuna Corn Mayo', 'ukuran' => '26', 'harga' => 55000, 'extra_mozarela' => 65000, 'deskripsi' => 'Tuna, jagung dan mayo', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Beef Pepperoni', 'ukuran' => '26', 'harga' => 65000, 'extra_mozarela' => NULL, 'deskripsi' => 'Daging sapi dan pepperoni', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Beef Petties', 'ukuran' => '26', 'harga' => 65000, 'extra_mozarela' => NULL, 'deskripsi' => 'Daging sapi premium', 'gambar' => 'pizza-default.webp'],
            ['nama_pizza' => 'Pizza Super Supreme', 'ukuran' => '26', 'harga' => 75000, 'extra_mozarela' => NULL, 'deskripsi' => 'Kombinasi topping lengkap', 'gambar' => 'pizza-default.webp'],
        ];

        // Cek dan insert jika belum ada
        foreach ($menu_items as $item) {
            $check = $this->db->where('nama_pizza', $item['nama_pizza'])
                             ->where('ukuran', $item['ukuran'])
                             ->get('pizzas');
            
            if ($check->num_rows() == 0) {
                $this->db->insert('pizzas', $item);
            }
        }

        $this->db->where('stok IS NULL')->update('pizzas', ['stok' => 0]);
    }

    public function down()
    {
        // Optional: drop table jika rollback
        // $this->dbforge->drop_table('pizzas');
    }
}
?>
