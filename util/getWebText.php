<?php

include_once 'mTextManagement.php';
include_once 'mDBManagement.php';

$address = $_POST['address'];

$prepositions = getAllPrepositions(); //is there any reason for keeping this??it'ss not used..

//this is to read economist articles
returnSentences($address);
//this is to store data from web
//storeSentences($address);

function returnSentences($address) {
    libxml_use_internal_errors(true);

    $page = file_get_contents($address);
    $result = '';
    $dom = new DOMDocument;

    if (!$dom->loadHTML($page)) {
        foreach (libxml_get_errors() as $error) {
            // handle errors here
        }
        libxml_clear_errors();
    }
    $xpath = new DOMXPath($dom);

    $tags = $xpath->query("//div[@class='main-content']/p");
    $text = '';
    foreach ($tags as $tag) {
        $text.=$tag->nodeValue . PHP_EOL;
    }
    echo $text;
}

function storeSentences($address) {

    $path = '../text/myAnswers.txt';
    libxml_use_internal_errors(true);

    $page = file_get_contents($address);
    $result = '';
    $dom = new DOMDocument;

    if (!$dom->loadHTML($page)) {
        foreach (libxml_get_errors() as $error) {
            // handle errors here
        }
        libxml_clear_errors();
    }

    $xpath = new DOMXPath($dom);

    $tags = $xpath->query("//div[@class='main-content']/p");
    $text = '';
    foreach ($tags as $tag) {
        $text.=$tag->nodeValue . ' ';
    }

    $string = getprepositionInstances($text);
    writeText($string, $path);
}
