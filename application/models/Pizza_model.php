<?php
class Pizza_model extends CI_Model {

    public function ensure_table_and_stock()
    {
        $this->load->dbforge();

        if (!$this->db->table_exists('pizzas')) {
            $this->dbforge->add_field([
                'id' => ['type' => 'INT', 'constraint' => 11, 'unsigned' => TRUE, 'auto_increment' => TRUE],
                'nama_pizza' => ['type' => 'VARCHAR', 'constraint' => 100],
                'ukuran' => ['type' => 'VARCHAR', 'constraint' => 10],
                'harga' => ['type' => 'INT', 'constraint' => 11],
                'extra_mozarela' => ['type' => 'INT', 'constraint' => 11, 'null' => TRUE],
                'deskripsi' => ['type' => 'TEXT', 'null' => TRUE],
                'gambar' => ['type' => 'VARCHAR', 'constraint' => 100, 'default' => 'pizza-default.webp'],
                'stok' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
                'created_at' => ['type' => 'TIMESTAMP', 'default' => 'CURRENT_TIMESTAMP'],
                'updated_at' => ['type' => 'TIMESTAMP', 'default' => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
            ]);
            $this->dbforge->add_key('id', TRUE);
            $this->dbforge->create_table('pizzas');
        }

        if (!$this->db->field_exists('stok', 'pizzas')) {
            $this->dbforge->add_column('pizzas', [
                'stok' => ['type' => 'INT', 'constraint' => 11, 'default' => 0],
            ]);
        }

        $this->db->where('stok IS NULL')->update('pizzas', ['stok' => 0]);
    }

    public function getAllPizza()
    {
        $this->ensure_stock_column();
        return $this->db->order_by('id', 'ASC')->get('pizzas')->result();
    }

    public function getPizzaById($id)
    {
        $this->ensure_stock_column();
        return $this->db->get_where('pizzas', ['id' => $id])->row();
    }

    public function insertPizza($data)
    {
        return $this->db->insert('pizzas', $data);
    }

    public function updatePizza($id, $data)
    {
        return $this->db->where('id', $id)->update('pizzas', $data);
    }

    public function deletePizza($id)
    {
        return $this->db->delete('pizzas', ['id' => $id]);
    }

    public function countAll()
    {
        return $this->db->count_all('pizzas');
    }
}