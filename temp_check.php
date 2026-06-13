<?php
$m = new mysqli('localhost','root','','pizza_azura');
if ($m->connect_errno){ echo 'ERR:' . $m->connect_error; exit(1); }
$res = $m->query('DESCRIBE menu');
echo "COLUMNS\n";
while($row=$res->fetch_assoc()){ echo $row['Field'] . '|' . $row['Type'] . "\n"; }
$res2 = $m->query('SELECT id, name, description, image, category, price_s, price_m, price_l, is_bestseller FROM menu LIMIT 10');
echo "\nSAMPLES\n";
while($row=$res2->fetch_assoc()){ echo json_encode($row) . "\n"; }
