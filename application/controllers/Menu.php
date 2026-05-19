<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Menu extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Pizza_model');
    }

    public function index()
    {
        $data['pizza'] = $this->Pizza_model->getAllPizza();

        $this->load->view('templates/header');
        $this->load->view('menu', $data);
        $this->load->view('templates/footer');
    }
}