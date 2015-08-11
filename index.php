<?php

final class Init {

    const DEFAULT_PAGE = "home";
    const DEFAULT_DIRECTORY = 'pages/';

    public function init() {
    }
    public function run() {
        $this->runPage($this->getPage());
    }

    private function runPage($page) {
        include_once $page;
    }

    private function getPage() {
        return SELF::DEFAULT_DIRECTORY . SELF::DEFAULT_PAGE . '.php';
    }

}

$index = new Init();
$index->init();
$index->run();


