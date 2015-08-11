<?php
/*
session_start();
include_once('Content.php');

$request = null;

if (isset($_POST['request'])) {
    $request = $_POST['request'];
}

//find out whether user is logged in
if (!isset($_SESSION['loggedIn']) || !$_SESSION['loggedIn']) {
    //here transmit the template for a user who is not logged in
    //this should be broken into parts--text and then buttons, etc.
    $content = getContent($request);
    $result = ['loggedIn' => 'false', 'data' => $content];
    echo json_encode($result);
} else if ($_SESSION['loggedIn']) {
    //here transmit the template with controls for a user who is logged in    

    $content = getContent($request);
    $result = ['loggedIn' => 'true', 'data' => $content];
    echo json_encode($result);
} else {
    echo 'ERROR with Content Template and LOGGED in POST variable';
}
?>
*/

