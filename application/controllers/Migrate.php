<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Migrate extends CI_Controller {

    public function index()
    {
        $this->load->library('migration');

        if ($this->migration->current() === FALSE) {
            show_error($this->migration->error_string());
        } else {
            echo "<h1>Migrasi Database Sukses!</h1>";
            echo "<p>Tabel 'pizzas' dan data menu berhasil di-import.</p>";
            echo "<p><a href='" . base_url() . "'>Kembali ke Halaman Utama</a></p>";
        }
    }
}
