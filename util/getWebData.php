<?php

libxml_use_internal_errors(true);


$baseAddress = 'http://www.economist.com/printedition/2015-05-16';
$page = file_get_contents($baseAddress);
$result = '';
$dom = new DOMDocument;

if (!$dom->loadHTML($page)) {
    foreach (libxml_get_errors() as $error) {
        // handle errors here
    }

    libxml_clear_errors();
}

$xpath = new DOMXPath($dom);
$tags = $xpath->query("//div[@class='article']/a[1]/@href");
$result = [];
foreach ($tags as $key => $tag) {
    $base = 'http://www.economist.com';
    $address = $base . $tag->nodeValue;
    $tempArray = ['address' => $address];
    array_push($result, $tempArray);
}
$results = ['data' => $result];
echo json_encode($results);
