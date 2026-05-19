<?php
class Pizza_model extends CI_Model {

    public function getAllPizza()
    {
        return $this->db->get('pizzas')->result();
    }

    public function getPizzaById($id)
    {
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