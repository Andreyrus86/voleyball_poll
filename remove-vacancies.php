<?php

$f = fopen('vacancies-input.txt','r');
$o = fopen('vacancies.txt', 'w');
$vacancies = [];
while($line = fgets($f, 1024)) {
    $vacancy = mb_strtolower(trim($line));
    if (preg_match("#[^0-9a-zA-Z\;\:\/\|\-\,\.\(\)\[\]\?\!\_\– ]+#uims", $vacancy, $matches) !== 0) {
        continue;
    }
    if (in_array($vacancy, $vacancies)) {
        continue;
    }
    $vacancies[] = $vacancy;
    fwrite($o, $vacancy . "\n");
}
fclose($f);
fclose($o);
