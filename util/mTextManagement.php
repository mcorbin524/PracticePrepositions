<?php

include_once "mDBManagement.php";

function getSentences() {
    $number = 10; //this is hard-coded!
    $sentenceIds = array();
    if (!isset($_SESSION['randomizedSentenceArray'])) {
        randomizeSentences();
    }
    $array = $_SESSION['randomizedSentenceArray'];
    for ($i = 0; $i < $number; $i+=1) {
        //get a single sentence from the database using the randomized sequence stored in $_SESSION['randomizedSentenceArray']
        //make the array into a neverending cycle--get the first item in the array and then put that item right back on at the end.
        $id = array_shift($array);
        array_push($array, $id);
        array_push($sentenceIds, $id);
    }
    $_SESSION['randomizedSentenceArray'] = $array;
    //return $sentenceIds;
    return fetchSentences($sentenceIds);
}

/*
  function parseText($request) {
  $thisRequest = null;
  if ($request !== 'random') {
  $thisRequest = $request;
  }
  $textArray = getWordArray($thisRequest);

  //override the requested text if there are none of the On prepositions in this sentence
  while (!sentenceContainsOnPreposition($textArray)) {
  $textArray = getWordArray();
  }

  $prepositionArray = getAllOnPrepositions();
  $resultArray = array();
  foreach ($textArray as $key => $item) {
  $lowerCaseItem = strtolower($item);
  if (in_array($lowerCaseItem, $prepositionArray)) {
  $selections = getSelections(4, $item); //important to remember that the first item of this array is simply the id of the sentence itself!!!
  $inText = $selections['inText'];
  unset($selections['inText']);
  $tempArray = ['word' => $inText, 'location' => $key, 'preposition' => 'true', 'selections' => $selections];
  array_push($resultArray, $tempArray);
  } else {
  $tempArray = ['word' => $item, 'location' => $key, 'preposition' => 'false'];
  array_push($resultArray, $tempArray);
  }
  }
  return $resultArray;
  }
 */
/*
  function sentenceContainsOnPreposition($textArray) {
  $onPrepositions = getAllOnPrepositions();
  $found = null;
  foreach ($textArray as $element) {
  foreach ($onPrepositions as $pElement) {
  if ($element === $pElement) {
  $found = 'found';
  }
  }
  }
  return ($found === 'found');
  }
 */
/*
  function getSelections($number, $original) {
  $prepositions = getAllOnPrepositions();
  $size = count($prepositions);
  //to prevent searching for more unique results than the array contains
  $counter = ($number > $size - 1) ? $size - 1 : $number;
  $results = [];

  while ($counter > 0) {
  $index = rand(0, $size - 1);
  $replacement = trim($prepositions[$index]);
  $caseAdjustedReplacement = caseCoordinate($original, $replacement);
  if (strcmp($original, $caseAdjustedReplacement) === 0 || in_array($caseAdjustedReplacement, $results)) {
  continue;
  }
  array_push($results, $caseAdjustedReplacement);
  $counter--;
  }
  //need to randomly seed the correct answer into the selections-make it roughly even odds that the given selection is the right one
  $rand = rand(0, $number - 1);
  if ($rand !== 0) {
  //switch the correct answer and one of the selections, chosen at random
  $rand = rand(0, count($results) - 1);
  $switch = $results[$rand];
  $results['inText'] = $switch;
  $results[$rand] = $original;
  } else {
  $results['inText'] = $original;
  }
  return $results;
  }
 */

function fetchText($fullPath) {
    $myFile = fopen($fullPath, 'r');
    $text = fread($myFile, filesize($fullPath));
    fclose($myFile);
    return $text;
}

function writeText($text, $path) {
    $myFile = fopen($path, 'a+');
    $text = fwrite($myFile, $text);
    fclose($myFile);
}

function getArrayOfTexts($fullPath) {
//returns array, whose elements are sentences
    return $textsArray = file($fullPath, FILE_IGNORE_NEW_LINES);
}

function getWordArray($request = null) {
//if no argument is given, then this function should return the next sentence in the ramdomized sequence;
//if an argument is given, then it should return the sentence requested
    $data = null;

    if ($request !== null) {
        $data = getSentence($request);
    } else {
        //get a single sentence from the database using the randomized sequence stored in $_SESSION['randomizedSentenceArray']
        $array = $_SESSION['randomizedSentenceArray'];
        //make the array into a neverending cycle--get the first item in the array and then put that item right back on at the end.
        $id = array_shift($array);
        array_push($array, $id);
        $_SESSION['randomizedSentenceArray'] = $array;

        $data = getSentence($id);
    }
    $text = $data['sentence'];
    $id = $data['id'];
    $ntext = cleanTextOfContextIdentifiers($text);
    $textArray = explode(' ', $ntext);
    array_unshift($textArray, $id); //this is important to error validation, don't delete!!
    return $textArray;
}

function randomizeSentences() {
    $sentenceArray = getIndicesOfAllSentences();
    shuffle($sentenceArray);
    $_SESSION['randomizedSentenceArray'] = $sentenceArray;
    //it appears that this return value isn't needed or used anywhere.
    return $sentenceArray;
}

function getSingleOriginalSentence($sentenceID) {
//returns string, which is a sentence
    $text = cleanTextOfContextIdentifiers(getSpecificSentence($sentenceID));
    return $text;
}

function caseCoordinate($modelString, $returnString) {
    $firstLetter = substr($modelString, 0, 1);
    if (ctype_upper($firstLetter)) {
        return ucwords($returnString);
    } else {
        return strtolower($returnString);
    }
}

function cleanTextOfContextIdentifiers($text) {
//takes a string sentence and returns string, minus context identifiers 
    $textArray = explode(' ', $text);
    $result = [];
    foreach ($textArray as $word) {
        $location = strripos($word, '#');
        if ($location === FALSE) {
            array_push($result, $word);
        } else {
            $subString = substr($word, $location + 1);
            array_push($result, $subString);
        }
    }
    return implode(' ', $result);
}

function getContextArray($sentenceID) {
    $text = getSpecificSentence($sentenceID);
    $textArray = explode(' ', $text);
    $result = [];
    foreach ($textArray as $key => $element) {
        $location = strripos($element, '#');
        if ($location === FALSE) {
            continue;
        }
        $length = strlen($element);
        $context = substr($element, -1 * $length, $location + 1);
        $result[$key] = $context;
    }
    return $result;
}

function cleanRawText($text) {
    //$fromPath = '../text/rawText.txt';
    //$text = fetchText($fromPath);
    //writeText(getprepositionInstances(removeNewLines($text)), $toPath);
    return getprepositionInstances(removeNewLines($text));
}

function scanExistingSentences() {
    $sentenceArray = getAllSentences();
    $prepositionArray = getAllPrepositions();
    $result = array();
    foreach ($sentenceArray as $data) {
        $sentence = $data['sentence'];
        $words = explode(' ', trim($sentence));
        $numberOfWords = count($words);
        $count = 0;
        foreach ($words as $word) {
            if ($count == $numberOfWords - 1) {
                //this is the last word, separate the word from the final character, which is punctuation  
                $length = strlen($word);
                $word = substr($word, 0, $length - 1);
            }
            if (in_array(strtolower($word), $prepositionArray)) {
                array_push($result, ['sentence' => markupSentence(trim($sentence)), 'id' => $data['id']]); //used to trim markupSentence(), this but that shoudl be solved!!!
                break;
            }
            $count+=1;
        }
    }
    return $result;
}

function getAllPrepositions() {
    return getAllPrepositionsFromDB();
}

/*
  function getAllOnPrepositions() {
  if (!isset($_SESSION['onPrepositions'])) {
  setOnPrepositions();
  }
  $prepositionsArray = $_SESSION['onPrepositions'];
  $result = [];
  foreach ($prepositionsArray as $preposition => $onStatus) {
  if ($onStatus === 'off') {
  continue;
  } array_push($result, $preposition);
  }
  return $result;
  }
 */
/*
  function getOnPrepositions() {
  //returns an array in the format ['of'=>'on','in'=>'off'] or false on failure
  if (!isset($_SESSION['onPrepositions'])) {
  return false;
  }
  return $_SESSION['onPrepositions'];
  }

 */

function toggleOnPreposition($preposition) {
//toggles status of given preposition, returns false on failure
    if (!isset($_SESSION['onPrepositions'])) {
        return false;
    }
    $onPrepositions = $_SESSION['onPrepositions'];
    $current = $onPrepositions[$preposition];
    if ($current === 'on') {
        $onPrepositions[$preposition] = 'off';
    } else if ($current === 'off') {
        $onPrepositions[$preposition] = 'on';
    } else {
        return false;
    }
    $_SESSION['onPrepositions'] = $onPrepositions;
    return $_SESSION['onPrepositions'];
}

function setOnPrepositions() {
//sets all propostions as on
    $prepositionArray = getAllPrepositions();
    $results = [];
    foreach ($prepositionArray as $element) {
        $results[$element] = 'on';
    }
    $_SESSION['onPrepositions'] = $results;
    return $_SESSION['onPrepositions'];
}

function getprepositionInstances($text) {
    $prepositionArray = getAllPrepositions();
    $result = array();
    $sentences = explode('. ', $text);
    foreach ($sentences as $sentence) {
        $words = explode(' ', trim($sentence));
        $numberOfWords = count($words);
        $count = 0;
        foreach ($words as $word) {
            if ($count == $numberOfWords - 1) {
                //this is the last word in the sentence, need to separate word from punctuation
                $length = strlen($word);
                $word = substr($word, 0, $length - 1);
            }
            if (in_array(strtolower($word), $prepositionArray)) {
                array_push($result, trim(markupSentence(trim($sentence))) . '.' . PHP_EOL);
                break;
            }
            $count+=1;
        }
    }
    return $result;
    //return implode('', $result);
}

function markupSentence($sentence) {
    $prepositionArray = getAllPrepositions();
    $result = '';
    $wordArray = explode(' ', $sentence);
    $numberOfWords = count($wordArray);
    $count = 0;
    foreach ($wordArray as $word) {
        if ($count == $numberOfWords - 1) {
            //this is the last word, separate the word from the final character, which is punctuation
            $length = strlen($word);
            $punctuation = substr($word, $length - 1, 1);
            $word = substr($word, 0, $length - 1);
            if (in_array(strtolower($word), $prepositionArray)) {
                $result.='#' . strtolower($word) . '#' . $word . $punctuation;
            } else {
                $result.=$word . $punctuation;
            }
        } else {
            if (in_array(strtolower($word), $prepositionArray)) {
                $result.='#' . strtolower($word) . '#' . $word . ' ';
            } else {
                $result.=$word . ' ';
            }
        }
        $count+=1;
    }
    return $result;
}

function removeNewLines($text) {
//eliminate all line returns, then eliminate any double spaces
    $array = explode(PHP_EOL, $text);
    $result = implode(' ', $array);
    $array = explode('  ', $result);
    $result = implode(' ', $array);

    return $result;
}
