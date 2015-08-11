<?php
/*
session_start();
include_once 'mTextManagement.php';
include_once 'mDBManagement.php';

if (isset($_POST['answer']) || isset($_POST['sentenceNumber'])) {

    $answer = $_POST['answer'];
    $sentenceNumber = $_POST['sentenceNumber'];

    $originalSentence = getSingleOriginalSentence($sentenceNumber);
    $contextArray = getContextArray($sentenceNumber);
    $data = compareStrings($answer, $originalSentence, $contextArray);
    $errors = $data['errors'];
    $corrects = $data['corrects'];
    $userid = $_SESSION['userid'];
    foreach ($errors as $error) {
        recordError($userid, $error['correct'], $error['error'], $error['context']);
    }
    foreach ($corrects as $correct) {
        recordCorrect($userid, $correct['correct'], $correct['context']);
    }
    echo json_encode($data);
}

function compareStrings($answer, $original, $contextArray) {
    $errors = array();
    $corrects = array();
    $prepositions = getAllOnPrepositions();
    $definitions = getAllDefinitions();
    $answer = trim($answer);
    $original = trim($original);
    $answerArray = explode(' ', $answer);
    $originalArray = explode(' ', $original);
    if (count($answerArray) !== count($originalArray)) {
        return FALSE;
    }
    foreach ($answerArray as $key => $answerWord) {
        //if not a preposition then break
        if (!in_array(strtolower($answerWord), $prepositions)) {
            continue;
        }
        if (strcmp($answerWord, $originalArray[$key]) !== 0) {//not equal--store to error
            $error = [ 'correct' => strtolower($originalArray[$key]), 'error' => strtolower($answerWord), 'context' => $contextArray[$key], 'index' => $key];
            array_push($errors, $error);
        } else {//equal--store to correct
            $correct = [ 'correct' => strtolower($originalArray[$key]), 'context' => $contextArray[$key], 'index' => $key];
            array_push($corrects, $correct);
        }
    }
    $result = ['errors' => $errors, 'corrects' => $corrects, 'original' => $originalArray, 'definitions' => $definitions]; //changed this!!
    return $result;
}
*/