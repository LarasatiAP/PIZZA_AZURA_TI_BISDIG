<?php
defined('BASEPATH') OR exit('No direct script access allowed');

/**
 * @property Pizza_model $Pizza_model
 */
class Home extends CI_Controller {

    public function __construct()
    {
        parent::__construct();
        $this->load->model('Pizza_model');
    }

    public function index()
    {
        $data['pizza'] = $this->Pizza_model->getAllPizza();

        $this->load->view('templates/header');
        $this->load->view('home', $data);
        $this->load->view('templates/footer');
    }

    public function order_status()
    {
        $this->load->view('templates/header');
        $this->load->view('order_status');
        $this->load->view('templates/footer');
    }
}