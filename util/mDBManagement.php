<?php

include_once 'PasswordHash.php';

$HOST = 'localhost';
$USER = 'hhgks';
//$USER = 'practji9_hhgks';//web only
//$DB = 'practji9_mainOne';//web only
$DB = 'users';
$USERTABLE = 'users';
$ERRORTABLE = 'errors';
$CORRECTTABLE = 'correct';
$LANGUAGETABLE = 'languages';
$DEFINITIONTABLE = 'definitions';
$PREPOSITIONSTABLE = 'prepositions';
$USERTABLE_ID = 'id';
$USERTABLE_EMAIL = 'email';
$USERTABLE_PASSWORD = 'password';
$USERTABLE_PASSWORDUPDATEFLAG = 'passwordupdateflag';
$USERTABLE_CREATED = 'created';
$ACTIVITYTABLE = 'activity';
$ACTIVITYTABLE_ID = 'id';
$ACTIVITYTABLE_USERID = 'userid';
$ACTIVITYTABLE_LOGGEDIN = 'loggedin';
$ACTIVITYTABLE_LOGGEDOUT = 'loggedout';
$ERRORTABLE_ID = 'id';
$ERRORTABLE_USERID = 'userid';
$ERRORTABLE_CORRECT = 'correct';
$ERRORTABLE_ERROR = 'error';
$ERRORTABLE_CONTEXT = 'context';
$ERRORTABLE_SENTENCEID = 'sentenceid';
$CORRECTTABLE_ID = 'id';
$CORRECTTABLE_USERID = 'userid';
$CORRECTTABLE_CORRECT = 'correct';
$CORRECTTABLE_CONTEXT = 'context';
$CORRECTTABLE_SENTENCEID = 'sentenceid';
$DBUSERPASSWORD = 'LYneXc6EbS6KqRds';
//$DBUSERPASSWORD = 'aGLh6Ps0c@H^';//web only
$SENTENCETABLE = 'sentences';
$SENTENCETABLE_ID = 'id';
$SENTENCETABLE_SENTENCE = 'sentence';
$LANGUAGETABLE_ID = 'id';
$LANGUAGETABLE_LANGUAGE = 'language';
$DEFINITIONTABLE_ID = 'id';
$DEFINITIONTABLE_CONTEXT = 'context';
$DEFINITIONTABLE_DEFINITION = 'definition';
$PREPOSITIONSTABLE_ID = 'id';
$PREPOSITIONSTABLE_PREPOSITION = 'preposition';

function writeSentence($sentence) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("INSERT INTO " . $SENTENCETABLE . " (" . $SENTENCETABLE_SENTENCE . ") VALUES (?)");
    $stmt->bind_param("s", $sentence);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
}

function updateSentence($id, $sentence) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE, $SENTENCETABLE_ID;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("UPDATE " . $SENTENCETABLE . " SET " . $SENTENCETABLE_SENTENCE . "=? WHERE " . $SENTENCETABLE_ID . "=?");
    $stmt->bind_param("si", $sentence, $id);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
}

function registerUser($emailAddress, $password) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $USERTABLE, $USERTABLE_EMAIL, $USERTABLE_PASSWORD, $USERTABLE_CREATED;

    date_default_timezone_set('America/Los_Angeles');
    $created = date('Y-m-d H:i:s');
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("INSERT INTO " . $USERTABLE . " (" . $USERTABLE_EMAIL . ", " . $USERTABLE_PASSWORD . "," . $USERTABLE_CREATED . ") VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $emailAddress, $password, $created);
    $finished = $stmt->execute();
    $stmt->close();
    $mysqli->close();
    return $finished;
}

function checkExistingAccount($emailAddress) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $USERTABLE_ID, $USERTABLE, $USERTABLE_EMAIL, $USERTABLE_PASSWORD, $USERTABLE_PASSWORDUPDATEFLAG;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $USERTABLE_PASSWORD . ", " . $USERTABLE_ID . ", " . $USERTABLE_PASSWORDUPDATEFLAG . " FROM " . $USERTABLE . " WHERE " . $USERTABLE_EMAIL . "= ?");
    $stmt->bind_param("s", $emailAddress);
    $stmt->execute();
    $password = null;
    $id = null;
    $updateFlag = null;
    $stmt->bind_result($password, $id, $updateFlag);
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    $result = ['password' => $password, 'id' => $id, 'updateFlag' => $updateFlag];
    return $result;
}

function logInUser($userId) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $ACTIVITYTABLE, $ACTIVITYTABLE_USERID, $ACTIVITYTABLE_LOGGEDIN;

    date_default_timezone_set('America/Los_Angeles');
    $loggedIn = date('Y-m-d H:i:s');

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("INSERT INTO " . $ACTIVITYTABLE . " (" . $ACTIVITYTABLE_USERID . ", " . $ACTIVITYTABLE_LOGGEDIN . ") VALUES (?,?)");
    $stmt->bind_param("is", $userId, $loggedIn);
    $stmt->execute();
    $id = $mysqli->insert_id;
    $stmt->close();
    $mysqli->close();
    return $id;
}

function logOutUser($sessionId) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $ACTIVITYTABLE, $ACTIVITYTABLE_LOGGEDOUT, $ACTIVITYTABLE_ID;

    date_default_timezone_set('America/Los_Angeles');
    $loggedOut = date('Y-m-d H:i:s');

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("UPDATE " . $ACTIVITYTABLE . " SET " . $ACTIVITYTABLE_LOGGEDOUT . "=? WHERE " . $ACTIVITYTABLE_ID . "=?");
    $stmt->bind_param("si", $loggedOut, $sessionId);
    $stmt->execute();
    $stmt->close();
    $mysqli->close();
}

function getUserID($emailAddress) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $USERTABLE_ID, $USERTABLE, $USERTABLE_EMAIL;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $USERTABLE_ID . " FROM " . $USERTABLE . " WHERE " . $USERTABLE_EMAIL . "= ?");
    $stmt->bind_param("s", $emailAddress);
    $stmt->execute();
    $id = null;
    $stmt->bind_result($id);
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return $id;
}

function recordError($userid, $correct, $error, $context, $sentenceid) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $ERRORTABLE, $ERRORTABLE_USERID, $ERRORTABLE_CORRECT, $ERRORTABLE_ERROR, $ERRORTABLE_CONTEXT, $ERRORTABLE_SENTENCEID;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("INSERT INTO " . $ERRORTABLE . " (" . $ERRORTABLE_USERID . ", " . $ERRORTABLE_CORRECT . ", " . $ERRORTABLE_ERROR . ", " . $ERRORTABLE_CONTEXT . "," . $ERRORTABLE_SENTENCEID . ") VALUES (?,?,?,?,?)");
    $stmt->bind_param("isssi", $userid, $correct, $error, $context, $sentenceid);
    $finished = $stmt->execute();
    $stmt->close();
    $mysqli->close();
    return $finished;
}

function recordCorrect($userid, $correct, $context, $sentenceid) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $CORRECTTABLE, $CORRECTTABLE_USERID, $CORRECTTABLE_CORRECT, $CORRECTTABLE_CONTEXT, $CORRECTTABLE_SENTENCEID;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("INSERT INTO " . $CORRECTTABLE . " (" . $CORRECTTABLE_USERID . ", " . $CORRECTTABLE_CORRECT . ", " . $CORRECTTABLE_CONTEXT . ", " . $CORRECTTABLE_SENTENCEID . ") VALUES (?,?,?,?)");
    $stmt->bind_param("issi", $userid, $correct, $context, $sentenceid);
    $finished = $stmt->execute();
    $stmt->close();
    $mysqli->close();
    return $finished;
}

function recordSentence($sentences) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);

    $stmt = $mysqli->prepare("INSERT INTO " . $SENTENCETABLE . " (" . $SENTENCETABLE_SENTENCE . ") VALUES (?)");
    foreach ($sentences as $sentence) {
        $stmt->bind_param("s", $sentence);
        $stmt->execute();
    }
    $stmt->close();
    $mysqli->close();
}

function getIndicesOfAllSentences() {
//get an array of all sentence indices
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_ID;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $SENTENCETABLE_ID . " FROM " . $SENTENCETABLE);
    $stmt->execute();
    $id = null;
    $result = [];
    $stmt->bind_result($id);
    while ($stmt->fetch()) {
        array_push($result, $id);
    }
    $stmt->close();
    $mysqli->close();
    return $result;
}

function getSentence($id) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE, $SENTENCETABLE_ID;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);

    $stmt = $mysqli->prepare("SELECT " . $SENTENCETABLE_SENTENCE . " FROM " . $SENTENCETABLE . " WHERE " . $SENTENCETABLE_ID . "=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $sentence = null;
    $stmt->bind_result($sentence);
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    $result = ['sentence' => $sentence, 'id' => $id];
    return $result;
}

function fetchSentences($id) {
//pass in array of sentence ids, get back array of these sentences from DB
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE, $SENTENCETABLE_ID;

    $sentence = null;
    $result = array();

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $SENTENCETABLE_SENTENCE . " FROM " . $SENTENCETABLE . " WHERE " . $SENTENCETABLE_ID . "=?");

    while (count($id) > 0) {
        $thisId = array_pop($id);
        $stmt->bind_param('i', $thisId);
        $stmt->execute();
        $stmt->bind_result($sentence);
        $stmt->fetch();
        array_push($result, ['sentence' => $sentence, 'id' => $thisId]);
    }
    $stmt->close();
    $mysqli->close();
    return $result;
}

function getAllSentences() {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE, $SENTENCETABLE_ID;

    $sentence = null;
    $id = null;
    $result = array();

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $SENTENCETABLE_ID . ", " . $SENTENCETABLE_SENTENCE . " FROM " . $SENTENCETABLE);
    $stmt->execute();
    $stmt->bind_result($id, $sentence);
    while ($stmt->fetch()) {
        array_push($result, ['sentence' => $sentence, 'id' => $id]);
    }
    $stmt->close();
    $mysqli->close();
    return $result;
}

function getSpecificSentence($id) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $SENTENCETABLE, $SENTENCETABLE_SENTENCE, $SENTENCETABLE_ID;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);

    $stmt = $mysqli->prepare("SELECT " . $SENTENCETABLE_SENTENCE . " FROM " . $SENTENCETABLE . " WHERE " . $SENTENCETABLE_ID . "= ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $stmt->bind_result($sentence);
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return $sentence;
}

function getPerformance($id) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $ERRORTABLE, $ERRORTABLE_USERID, $ERRORTABLE_CORRECT, $ERRORTABLE_ERROR, $ERRORTABLE_CONTEXT;
    $results = array();
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT count(*) as count, " . $ERRORTABLE_CORRECT . ", " . $ERRORTABLE_ERROR . " from " . $ERRORTABLE . " where " . $ERRORTABLE_USERID . " = ? group by " . $ERRORTABLE_CORRECT . ", " . $ERRORTABLE_ERROR . " ORDER BY " . $ERRORTABLE_CORRECT . " DESC, count DESC");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $error = null;
    $correct = null;
    $count = null;
    $stmt->bind_result($count, $correct, $error);
    while ($stmt->fetch()) {
        $r = ['count' => $count, 'correct' => $correct, 'error' => $error];
        array_push($results, $r);
    }
    $stmt->close();
    $mysqli->close();
    return $results;
}

function getPerformanceAcrossPrepositions($id) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $ERRORTABLE, $ERRORTABLE_USERID, $ERRORTABLE_CORRECT, $ERRORTABLE_ERROR, $ERRORTABLE_CONTEXT;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $ERRORTABLE_CORRECT . ", COUNT(*) AS count FROM " . $ERRORTABLE . " WHERE " . $ERRORTABLE_USERID . " =? GROUP BY " . $ERRORTABLE_CORRECT . " ORDER BY count DESC");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $correct = null;
    $count = null;
    $results = array();
    $stmt->bind_result($correct, $count);
    while ($stmt->fetch()) {
        $r = ['correct' => $correct, 'count' => $count];
        array_push($results, $r);
    }
    $stmt->close();
    $mysqli->close();
    return $results;
}

function getPerformanceByContext($id, $correct) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $ERRORTABLE, $ERRORTABLE_USERID, $ERRORTABLE_CORRECT, $ERRORTABLE_ERROR, $ERRORTABLE_CONTEXT;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare(
            "SELECT " . $ERRORTABLE_CONTEXT . ", COUNT(*) as count FROM " . $ERRORTABLE
            . " WHERE " . $ERRORTABLE_USERID . "=? AND " . $ERRORTABLE_CORRECT
            . "=? GROUP BY " . $ERRORTABLE_CONTEXT . " ORDER BY count DESC");
    $stmt->bind_param('is', $id, $correct);
    $stmt->execute();
    $context = null;
    $count = null;
    $results = array();
    $stmt->bind_result($context, $count);
    while ($stmt->fetch()) {
        $r = ['count' => $count, 'context' => $context];
        $mysqliTwo = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
        $stmtTwo = $mysqliTwo->prepare(
                "SELECT " . $ERRORTABLE_ERROR . ", COUNT(*) as count FROM " . $ERRORTABLE
                . " WHERE " . $ERRORTABLE_USERID . "=? AND " . $ERRORTABLE_CONTEXT
                . "=? GROUP BY " . $ERRORTABLE_ERROR . " ORDER BY count DESC");
        $stmtTwo->bind_param('is', $id, $context);
        $stmtTwo->execute();
        $error = null;
        $errorCount = null;
        $stmtTwo->bind_result($error, $errorCount);
        while ($stmtTwo->fetch()) {
            $r[$error] = $errorCount;
        }
        array_push($results, $r);
    }
    $stmt->close();
    $stmtTwo->close();
    $mysqli->close();
    $mysqliTwo->close();
    return $results;
}

function getDefinitionFromContext($context) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $DEFINITIONTABLE, $DEFINITIONTABLE_CONTEXT, $DEFINITIONTABLE_DEFINITION;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $DEFINITIONTABLE_DEFINITION . " FROM " . $DEFINITIONTABLE . " WHERE " . $DEFINITIONTABLE_CONTEXT . "=?");
    $stmt->bind_param('s', $context);
    $stmt->execute();
    $definition = null;
    $stmt->bind_result($definition);
    $stmt->fetch();
    $stmt->close();
    $mysqli->close();
    return $definition;
}

function getAllDefinitions() {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $DEFINITIONTABLE, $DEFINITIONTABLE_CONTEXT, $DEFINITIONTABLE_DEFINITION;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $DEFINITIONTABLE_CONTEXT . ", " . $DEFINITIONTABLE_DEFINITION . " FROM " . $DEFINITIONTABLE);
    $stmt->execute();
    $definitions = array();
    $con = null;
    $def = null;
    $stmt->bind_result($con, $def);
    while ($stmt->fetch()) {
        $a = ['context' => $con, 'definition' => $def];
        array_push($definitions, $a);
    }
    $stmt->close();
    $mysqli->close();
    return $definitions;
}

function getLanguages() {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $LANGUAGETABLE, $LANGUAGETABLE_LANGUAGE, $LANGUAGETABLE_ID;
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $LANGUAGETABLE_LANGUAGE . " FROM " . $LANGUAGETABLE);
    $stmt->execute();
    $definition = null;
    $stmt->bind_result($language);
    $results = array();
    while ($stmt->fetch()) {
        array_push($results, $language);
    }
    $stmt->close();
    $mysqli->close();
    return $results;
}

function resetPassword($email) {
    $id = getUserID($email);
    if ($id === NULL) {
//no such user
        return 'No such user';
    } else {
        $newPassword = getRandomPassword();
        if (updatePassword($id, $newPassword)) {
//$subject = 'Password reset';
//$message = 'Hello dear user,' . PHP_EOL . PHP_EOL . 'Your password has been reset. Your new password is ' . PHP_EOL . PHP_EOL . $newPassword . PHP_EOL . PHP_EOL . 'Thanks!';
//$additionalHeaders = array();
//$additionalHeaders[] = 'From: webmaster@practiceprepositions.com';
//$additionalHeaders[] = 'Reply-to: webmaster@practiceprepositions.com';
//$additionalHeaders[] = 'X-Mailer: PHP/' . phpversion();
//mail($email, $subject, $message, implode("\r\n", $additionalHeaders));
            return newPassword;
        } else
            return 'Password update failed.';
    }
}

function getRandomPassword() {
    $alpha = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    $alphaLength = strlen($alpha) - 1;
    $passwordArray = array();
    for ($i = 0; $i < 2; $i++) {
        $rand = rand(0, $alphaLength);
        $new = substr($alpha, $rand, 1);
        $passwordArray[$i] = $new;
    }
    return implode('', $passwordArray);
}

function updatePassword($id, $newUnhashedPassword) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $USERTABLE_ID, $USERTABLE, $USERTABLE_PASSWORD, $USERTABLE_PASSWORDUPDATEFLAG;
    $hashedPassword = create_hash($newUnhashedPassword);
    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("UPDATE " . $USERTABLE . " SET " . $USERTABLE_PASSWORD . "=?, " . $USERTABLE_PASSWORDUPDATEFLAG . "=1 WHERE " . $USERTABLE_ID . "=?");
    $stmt->bind_param("si", $hashedPassword, $id);
    return ($stmt->execute());
}

function selectNewPassword($id, $newPassword) {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $USERTABLE_ID, $USERTABLE, $USERTABLE_PASSWORDUPDATEFLAG;

    if (updatePassword($id, $newPassword)) {
//clear the updatePassword flag
        $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
        $stmt = $mysqli->prepare("UPDATE " . $USERTABLE . " SET " . $USERTABLE_PASSWORDUPDATEFLAG . "=0 WHERE " . $USERTABLE_ID . "=?");
        $stmt->bind_param("i", $id);
        return ($stmt->execute());
    } else {
        return FALSE;
    }
}

function getAllPrepositionsFromDB() {
    global $HOST, $USER, $DBUSERPASSWORD, $DB;
    global $PREPOSITIONSTABLE, $PREPOSITIONSTABLE_PREPOSITION;

    $mysqli = new mysqli($HOST, $USER, $DBUSERPASSWORD, $DB);
    $stmt = $mysqli->prepare("SELECT " . $PREPOSITIONSTABLE_PREPOSITION . " FROM " . $PREPOSITIONSTABLE);
    $stmt->execute();
    $preposition = null;
    $stmt->bind_result($preposition);
    $results = array();
    while ($stmt->fetch()) {
        array_push($results, $preposition);
    }
    $stmt->close();
    $mysqli->close();
    return $results;
}
