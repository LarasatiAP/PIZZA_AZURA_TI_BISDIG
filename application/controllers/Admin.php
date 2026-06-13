<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Admin extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Pizza_model');
        $this->load->helper(['url', 'form', 'text']);
    }

    public function index()
    {
        $this->load->view('admin/login');
    }

    public function dashboard()
    {
        $data['total_pizza'] = $this->Pizza_model->countAll();
        $data['pizza'] = $this->Pizza_model->getAllPizza();
        $this->load->view('admin/dashboard', $data);
    }

    public function login_process()
    {
        $this->load->library('form_validation');

        $this->form_validation->set_rules('username', 'Username', 'required|trim');
        $this->form_validation->set_rules('password', 'Password', 'required');

        if ($this->form_validation->run() === FALSE)
        {
            $data['error'] = validation_errors('', '');
            $this->load->view('admin/login', $data);
            return;
        }

        $username = $this->input->post('username', true);
        $password = $this->input->post('password', true);

        if ($username === 'admin' && $password === '12345')
        {
            redirect('admin/dashboard');
        }

        $data['error'] = 'Username atau password salah.';
        $this->load->view('admin/login', $data);
    }

    public function menu()
    {
        $data['pizza'] = $this->Pizza_model->getAllPizza();
        $this->load->view('admin/menu', $data);
    }

    public function add_menu()
    {
        $data['action'] = 'add';
        $this->load->view('admin/menu_form', $data);
    }

    public function save_menu()
    {
        $gambar = $this->upload_image();

        $data = [
            'nama_pizza' => $this->input->post('nama_pizza', true),
            'deskripsi' => $this->input->post('deskripsi', true),
            'harga' => (int) $this->input->post('harga', true),
            'stok' => (int) $this->input->post('stok', true),
            'gambar' => $gambar ?: ''
        ];

        $this->Pizza_model->insertPizza($data);
        redirect('admin/menu');
    }

    public function edit_menu($id)
    {
        $data['action'] = 'edit';
        $data['pizza'] = $this->Pizza_model->getPizzaById($id);

        if(!$data['pizza']) {
            show_404();
        }

        $this->load->view('admin/menu_form', $data);
    }

    public function update_menu($id)
    {
        $pizza = $this->Pizza_model->getPizzaById($id);
        if(!$pizza) {
            show_404();
        }

        $gambar = $this->upload_image();
        $data = [
            'nama_pizza' => $this->input->post('nama_pizza', true),
            'deskripsi' => $this->input->post('deskripsi', true),
            'harga' => (int) $this->input->post('harga', true),
            'stok' => (int) $this->input->post('stok', true),
        ];

        if($gambar) {
            $data['gambar'] = $gambar;
        }

        $this->Pizza_model->updatePizza($id, $data);
        redirect('admin/menu');
    }

    public function delete_menu($id)
    {
        $pizza = $this->Pizza_model->getPizzaById($id);
        if($pizza) {
            if($pizza->gambar && file_exists(FCPATH.'assets/images/'.$pizza->gambar)) {
                @unlink(FCPATH.'assets/images/'.$pizza->gambar);
            }
            $this->Pizza_model->deletePizza($id);
        }

        redirect('admin/menu');
    }

    public function orders()
    {
        $this->load->view('admin/orders');
    }

    public function transaksi()
    {
        $this->load->view('admin/transactions');
    }

    private function upload_image()
    {
        if(empty($_FILES['gambar']['name'])) {
            return false;
        }

        $config['upload_path'] = FCPATH.'assets/images/';
        $config['allowed_types'] = 'gif|jpg|png|jpeg';
        $config['max_size'] = 2048;
        $config['encrypt_name'] = true;

        $this->load->library('upload', $config);

        if($this->upload->do_upload('gambar')) {
            return $this->upload->data('file_name');
        }

        return false;
    }
}
