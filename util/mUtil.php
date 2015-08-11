<?php

session_start();
include_once 'PasswordHash.php';
include_once 'mDBManagement.php';
include_once 'mTextManagement.php';

if (isset($_POST['task'])) {

    switch ($_POST['task']) {
        case 'getDefinitions':
            $results = getAllDefinitions();
            echo json_encode($results);
            break;
        case 'writeSentence':
            writeSentence($_POST['sentence']);
            break;
        case 'updateSentence':
            updateSentence($_POST['id'], $_POST['sentence']);
            break;
        case 'getAllPrepositions':
            $prepositions = getAllPrepositionsFromDB();
            $results = [];
            foreach ($prepositions as $element) {
                $results[$element] = 'on';
            }
            echo json_encode($results);
            break;
        case 'recordResults':
            $results = $_POST['data'];
            $len = count($results);
            for ($i = 0; $i < $len; $i+=1) {
                $context = $results[$i]['context'];
                $correct = $results[$i]['correct'];
                $error = $results[$i]['selected'];
                $userid = $results[$i]['userid'];
                $sentenceid = $results[$i]['sentenceid'];
                if ($results[$i]['grade'] == 'correct') {
                    recordCorrect($userid, $correct, $context, $sentenceid);
                } else if ($results[$i]['grade'] == 'error') {
                    recordError($userid, $correct, $error, $context, $sentenceid);
                }
            }
            break;
        case 'getSentences':
            $definitions = 'null';
            if ($_POST['needDefinitions'] == 'true') {
                $definitions = getAllDefinitions();
            }
            $sentences = getSentences();
            $result = ['definitions' => $definitions, 'sentences' => $sentences];
            echo json_encode($result);
            break;
        case 'selectNewPassword':
            $id = $_POST['id'];
            $newPassword = $_POST['newPassword'];
            selectNewPassword($id, $newPassword);
            break;
        case 'resetPassword':
            $email = $_POST['email'];
            $result = resetPassword($email);
            echo $result;
            break;
        case 'getLanguages':
            echo json_encode(getLanguages());
            break;
        case 'getDefinition':
            echo getDefinitionFromContext($_POST['context']);
            break;
        case 'getErrorDetails':
            $preposition = $_POST['errorPreposition'];
            echo json_encode(getPerformanceByContext($_SESSION['userid'], $preposition));
            break;
        case 'randomizeSentences':
            $sentenceArray = randomizeSentences();
            echo json_encode($sentenceArray);
            break;
//        case 'setOnPrepositions':
//            setOnPrepositions();
//           break;
//        case 'getOnPrepositions':
//            echo json_encode(getOnPrepositions());
//            break;
        case 'togglePreposition':
            if (isset($_POST['toggleThisPreposition'])) {
                echo json_encode(toggleOnPreposition($_POST['toggleThisPreposition']));
            }
            break;
        case 'storeSentences':
            $sentenceString = fetchText('../text/myAnswers.txt'); //this is hardwired!!!
            $sentenceArray = explode(PHP_EOL, $sentenceString);
            recordSentence($sentenceArray);
            break;
        case 'refreshStatistics':
            $result = getPerformanceAcrossPrepositions($_SESSION['userid']);
            echo json_encode($result);
            break;
        case 'updateExistingSentences':
            echo json_encode(scanExistingSentences());
            break;
        case 'processRawText':
            echo json_encode(cleanRawText($_POST['text']));
            break;
        case 'submitUserData':
            if (isset($_POST['emailAddress']) && isset($_POST['password'])) {
                $results = checkExistingAccount($_POST['emailAddress']);
                $existingPasswordHashed = $results['password'];
                $userid = $results['id'];
                $passwordUpdate = $results['updateFlag'];
                if ($existingPasswordHashed !== NULL) {
                    //account exists, so check whether the password is correct
                    if (validate_password($_POST['password'], $existingPasswordHashed)) {
                        $_SESSION['loggedIn'] = TRUE;
                        $_SESSION['lastActivity'] = time();
                        $_SESSION['userid'] = $userid;
                        $_SESSION['email'] = $_POST['emailAddress'];
                        $sessionId = logInUser($userid);
                        $_SESSION['sessionId'] = $sessionId;
                        $result = ['loggedin' => 'true', 'emailAddress' => $_POST['emailAddress'], 'passwordUpdate' => $passwordUpdate, 'userId' => $userid, 'sessionId' => $sessionId];
                        $result = json_encode($result);
                        //randomize sentences
                        randomizeSentences();
                        echo $result;
                        ;
                    } else {
                        $result = ['loggedin' => 'false'];
                        $result = json_encode($result);
                        echo $result;
                    }
                } else {
                    //account doesn't exist because email is unique so register
                    $hashedPassword = create_hash($_POST['password']);
                    if (registerUser($_POST['emailAddress'], $hashedPassword)) {
                        $_SESSION['loggedIn'] = TRUE;
                        $_SESSION['lastActivity'] = time();
                        $userid = getUserID($_POST['emailAddress']);
                        $sessionId = logInUser($userid);
                        $_SESSION['sessionId'] = $sessionId;
                        $_SESSION['userid'] = $userid;
                        $_SESSION['email'] = $_POST['emailAddress'];
                        $result = ['loggedin' => 'true', 'emailAddress' => $_POST['emailAddress'], 'sessionId' => $sessionId, 'userId' => $userid];
                        $result = json_encode($result);
                        //randomize sentences
                        randomizeSentences();
                        echo $result;
                    } else {
                        $result = ['loggedin' => 'false'];
                        $result = json_encode($result);
                        echo $result;
                    }
                }
            } else
                echo 'no data submitted';
            break;
        case 'logOut':
            $sessionId = $_POST['sessionId'];
            logOutUser($sessionId);
            $_SESSION['loggedIn'] = FALSE;
            unset($_SESSION['loggedIn']);
            unset($_SESSION['onPrepositions']);
            session_unset();
            session_destroy();
            if (!isset($_SESSION['loggedIn'])) {
                echo 'true';
                break;
            } else if (isset($_SESSION['loggedIn'])) {
                echo 'false';
                break;
            } else
                break;
        case 'checkLoggedIn':
            if (isset($_SESSION['loggedIn']) && $_SESSION['loggedIn'] === TRUE) {
                $result = ['loggedIn' => 'true', 'sessionId' => $_SESSION['sessionId'], 'email' => $_SESSION['email'], 'userId' => $_SESSION['userid']];
                echo json_encode($result);
            } else {
                $result = ['loggedIn' => 'false'];
                echo json_encode($result);
            }
            break;
        default:
            echo FALSE;
            break;
    }
} else {
    echo FALSE;
}



