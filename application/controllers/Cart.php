<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Cart extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->library('cart');
    }

    public function add()
    {
        // Accept POST (from AJAX) or GET (for quick browser testing)
        $id = $this->input->post('id') ? $this->input->post('id') : $this->input->get('id');
        $name = $this->input->post('name') ? $this->input->post('name') : $this->input->get('name');
        $price = $this->input->post('price') ? $this->input->post('price') : $this->input->get('price');
        $qty = $this->input->post('qty') ? (int) $this->input->post('qty') : ($this->input->get('qty') ? (int) $this->input->get('qty') : 1);

        header('Content-Type: application/json');

        if (!$id || !$name || !$price) {
            echo json_encode(['success' => false, 'message' => 'Invalid data']);
            return;
        }

        $item = [
            'id' => $id,
            'qty' => $qty,
            'price' => (float) $price,
            'name' => $name
        ];

        $rowid = $this->cart->insert($item);

        if ($rowid) {
            echo json_encode(['success' => true, 'total_items' => $this->cart->total_items()]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Could not add to cart']);
        }
    }

    public function count()
    {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'total_items' => $this->cart->total_items()]);
    }
}
