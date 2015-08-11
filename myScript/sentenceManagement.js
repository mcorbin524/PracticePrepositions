var utilFile = 'util/mUtil.php';
//var utilFile = '1.2/util/mUtil.php';//web only
var dataStore;

var dataStore = (function () {
    //console.log('making new dataStore');
    //this will hold an array of active sentences; an array of cached useless sentences; and the current up-to-date On prepositions
    //will monitor the sentences still in the array and will fetch more when needed
    //will delete used sentences and will cache those that can't be used since they don't contain On prepositions
    //when On prepositions are changed, will review the cache and move any usable sentences to the active list; will move any useless active sentence to the cache
    var obj = {};
    var sentenceFetchIncrements = 10;//might want to increase this for efficiency's sake
    var activeSentences = [];
    var cachedSentences = [];
    var onPrepositions = {};
    var definitions = [];

    var getOnPrepositions = function () {
        return onPrepositions;
    };

    var setOnPrepositions = function (prepositions) {
        onPrepositions = prepositions;
        updateActiveSentences();
    };

    var getDefinitions = function () {
        return definitions;
    };

    var shuffleArray = function (array) {
        var currentIndex = array.length;
        var temporaryValue;
        var randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    };

    var updateActiveSentences = function () {
        for (var i = activeSentences.length - 1; i >= 0; i -= 1) {
            if (!isUsefulSentence(activeSentences[i].sentence)) {
                var b = activeSentences.splice(i, 1);
                cachedSentences.push(b[0]);
            }
        }
        for (var i = cachedSentences.length - 1; i >= 0; i -= 1) {
            if (isUsefulSentence(cachedSentences[i].sentence)) {
                var r = cachedSentences.splice(i, 1);
                activeSentences.push(r[0]);
            }
        }
        activeSentences = shuffleArray(activeSentences);
        if (activeSentences.length <= sentenceFetchIncrements) {
            getMoreSentences();
        }
    };

    var getCachedSentences = function () {
        return cachedSentences;
    };

    var getActiveSentences = function () {
        return activeSentences;
    };

    var serveSentence = function () {
        if (activeSentences.length <= sentenceFetchIncrements) {
            getMoreSentences();
        }
        return activeSentences.shift();
    };

    var sentenceToArray = function (sentence) {
        //this assumes that the very final character in every sentence will be a punctuation mark; this is separated off as a distinet array element
        var array = [];
        array = separatePunctuation(sentence.split(' '));
        //var lastElement = array[array.length - 1];
        //var length = lastElement.length;
        //var punctuation = lastElement.substring(length - 1);
        //var lastWord = lastElement.substring(0, length - 1);
        //array[array.length - 1] = lastWord;
        //array.push(punctuation);
        return array;
    };

    var separatePunctuation = function (sentenceArray) {
        var lastElement = sentenceArray[sentenceArray.length - 1];
        var length = lastElement.length;
        var punctuation = lastElement.substring(length - 1);
        var lastWord = lastElement.substring(0, length - 1);
        sentenceArray[sentenceArray.length - 1] = lastWord;
        sentenceArray.push(punctuation);
        return sentenceArray;
    };

    var cleanSentenceArray = function (sentenceArray) {
        result = [];
        for (var i = 0; i < sentenceArray.length; i += 1) {
            var word = sentenceArray[i];
            var lastIndex = word.lastIndexOf('#');
            obj = {};
            if (lastIndex === -1) {
                obj.word = word;
            } else {
                var context = word.substr(0, lastIndex + 1);
                if (context === '#*#') {
                    obj.word = word.slice(lastIndex + 1);
                }
                else {
                    obj.word = word.slice(lastIndex + 1);
                    obj.preposition = true;
                    obj.context = word.substr(0, lastIndex + 1);
                }
            }
            result.push(obj);
        }
        return result;
    };

    var isUsefulSentence = function (sentenceArray) {
        var useful = false;
        for (var i = 0; i < sentenceArray.length; i += 1) {
            var word = sentenceArray[i].word;
            //need to make sure that the sentence is accompanied by a definition--so it has an associated context
            useful = (useful || (onPrepositions[word] === 'on' && sentenceArray[i].preposition === true));
        }
        return useful;
    };

    var createDemoSentence = function (sentenceText) {
        var array = cleanSentenceArray(sentenceToArray(sentenceText));
        var sentence = '';
        for (var i = 0, len = array.length; i < len; i += 1) {
            sentence += array[i].word;
            if (i < len - 2) {
                sentence += ' ';
            }
        }
        return sentence;
    };

    var getMoreSentences = function () {
        var needDefinitions = definitions.length === 0 ? 'true' : 'false';
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'getSentences', 'needDefinitions': needDefinitions},
            success: function (result) {
                if (result.definitions !== 'null') {
                    definitions = result.definitions;
                }
                var sentences = result.sentences;
                $.each(sentences, function (index, element) {

                    var id = element.id;
                    var sentence = element.sentence;
                    var array = cleanSentenceArray(sentenceToArray(sentence));
                    var obj = {
                        id: id,
                        sentence: array
                    };
                    if (isUsefulSentence(array)) {
                        activeSentences.push(obj);
                    }
                    else {
                        cachedSentences.push(obj);
                    }
                });

                if (activeSentences.length <= sentenceFetchIncrements) {
                    getMoreSentences();
                }
                //on page refresh, if logged in and if there's no sentence, display a sentence
                if (!sentenceServed && loggedInStatus.status()) {
                    getContent();
                }
            },
            error: function (result) {
                console.log('getMoreSentences error:');
                console.log(result);
            }
        });
    };
    var initializePrepositions = function () {
        $.ajax({
            url: utilFile,
            dataType: 'JSON',
            method: 'POST',
            data: {task: 'getAllPrepositions'},
            success: function (result) {
                //console.log('ajax initializing prepositions');
                setOnPrepositions(result);
            }
        });
    };

    var togglePrepositionStatus = function (preposition) {
        if (onPrepositions[preposition] === 'off') {
            onPrepositions[preposition] = 'on';
        } else {
            onPrepositions[preposition] = 'off';
        }
    };


    initializePrepositions();
    obj.separatePunctuation = separatePunctuation;
    obj.serveSentence = serveSentence;
    obj.isUsefulSentence = isUsefulSentence;
    obj.createDemoSentence = createDemoSentence;
    obj.getOnPrepositions = getOnPrepositions;
    obj.getCachedSentences = getCachedSentences;
    obj.getActiveSentences = getActiveSentences;
    obj.getDefinitions = getDefinitions;
    obj.togglePrepositionStatus = togglePrepositionStatus;
    obj.updateActiveSentences = updateActiveSentences;
    return obj;
})();

var sentenceMaker = function (object) {
//this object will be created when the enter button is placed; its raw material is a single sentence which it will take from the data store
//the On prepositions from the time of its creation will be stored in a closure
//it will need a function to update these on prepositions
//it will parse the raw string to identify prepositions;create DOM elements to contain words and prepositions; and set event listeners for those elements
//it will check answers against original and report results to the server
    var obj = {};
    //var parsedSentence = [];
    //this will be an array of objects containing: position in sentence; correct answer; context
    var wordsToCheck = [];
    var currentSentence;
    var sentenceId;
    var storedResults;

    var parseSentence = function () {
        //array is an object holding an array of objects (called sentence) containing obj.word; obj.preposition; obj.context
        //need to add: obj.selections
        wordsToCheck = [];
        //var arr = array;
        for (var i = 0, len = currentSentence.length; i < len; i += 1) {
            //is it a preposition, and is it currently On (using lower case for comparison purposes)
            var lowerCaseWord = currentSentence[i].word.toLowerCase();
            if (currentSentence[i].preposition === true && dataStore.getOnPrepositions()[lowerCaseWord] === 'on') {
                var selections = createChoicesList(4, currentSentence[i].word);
                currentSentence[i].selections = selections;
                currentSentence[i].location = i;
                var objToCheck = {
                    positionInSentence: i,
                    correctAnswer: currentSentence[i].word,
                    context: currentSentence[i].context
                };
                wordsToCheck.push(objToCheck);
            }
        }
    };
    var ucwords = function (str) {
        return (str + '')
                .replace(/^([a-z\u00E0-\u00FC])|\s+([a-z\u00E0-\u00FC])/g, function ($1) {
                    return $1.toUpperCase();
                });
    };
    var random = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    var caseCoordinate = function (modelString, returnString) {
        var firstLetter = modelString.charAt(0);
        if (firstLetter === firstLetter.toUpperCase()) {
            return ucwords(returnString);
        } else {
            return returnString.toLowerCase();
        }
    };

    var createChoicesList = function (numberOfChoices, correctChoice) {
        var obj = {};
        var array = [];
        var onPrepositions = dataStore.getOnPrepositions();
        for (var key in onPrepositions) {
            if (onPrepositions.hasOwnProperty(key) && onPrepositions[key] === 'on') {
                array.push(key);
            }
        }
        var size = array.length;
  //      console.log('size: ' + size);
  //      console.log('#choices: ' + numberOfChoices);
  //      console.log(array);
        //to prevent searching for more unique results than the array contains
        var counter = (numberOfChoices > size - 1) ? size - 1 : numberOfChoices;
        var results = [];
        while (counter > 0) {
            var index = random(0, size - 1);
   //         console.log('index: ' + index);
            var replacement = array[index]; //.trim();
            var caseAdjustedReplacement = caseCoordinate(correctChoice, replacement);
            if (correctChoice.localeCompare(caseAdjustedReplacement) === 0 || results.indexOf(caseAdjustedReplacement) !== -1) {
                continue;
            }
            results.push(caseAdjustedReplacement);
            counter--;
        }
        //need to randomly seed the correct answer into the selections-make it roughly even odds that the given selection is the right one
        var r = random(0, results.length);
        if (r !== 0) {
            //switch the correct answer and one of the selections, chosen at random
            var u = random(0, results.length - 1);
            var s = results[u];
            obj.inText = s;
            results[u] = correctChoice;
        } else {
            obj.inText = correctChoice;
        }
        obj.results = results;
        return obj;
    };
    var screenCurrentSentence = function () {
        return dataStore.isUsefulSentence(currentSentence);
    };


    var checkResults = function (sentence, userid) {
        var results = [];
        //this checking scheme relies on a 1-to-1 substitution of prepositions for prepositions
        var array = dataStore.separatePunctuation(sentence.split(' '));
        for (var i = 0, len = wordsToCheck.length; i < len; i += 1) {
            var position = wordsToCheck[i].positionInSentence;
            var context = wordsToCheck[i].context;
            var padding;
            var grade;
            var definition = 'none';
            var definitions = dataStore.getDefinitions();
            //can't this be done earlier and in some more efficient way?
            for (var z = 0, length = definitions.length; z < length; z += 1) {
                if (definitions[z].context === context) {
                    definition = definitions[z].definition;
                }
            }
            if (array[position].localeCompare(wordsToCheck[i].correctAnswer) !== 0) {
                grade = 'error';
            }
            else {
                grade = 'correct';
            }
            padding = getSentencePadding(position);
            results.push({
                definition: definition,
                userid: userid,
                grade: grade,
                correct: wordsToCheck[i].correctAnswer,
                selected: array[position],
                context: context,
                index: position,
                sentenceid: sentenceId,
                padding: padding
            }
            );
        }
        reportResults(results);
        storedResults = results;
        return results;
    };

    var reportResults = function (results) {
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'text',
            data: {task: 'recordResults', data: results},
            success: function (result) {
                //console.log('ajax reporting results');
            },
            error: function (result) {
                console.log(result);
            }
        });
    };

    var getSentencePadding = function (index) {
        preceeding = '';
        succeeding = '';
        var phraseLength = 1;
        var length = currentSentence.length - 1;
        var point = 1;
        while ((index - point >= 0) && point <= phraseLength) {
            preceeding = currentSentence[index - point].word + ' ' + preceeding;
            point += 1;
        }
        point = 1;
        var space = ' ';
        while ((index + point <= length) && point <= phraseLength) {
            if ((index + point === length)) {
                space = '';
            }
            succeeding = succeeding + space + currentSentence[index + point].word;
            point += 1;
        }
        preceeding = (index - phraseLength > 0) ? '...' + preceeding : preceeding;
        succeeding = (index + phraseLength < length) ? succeeding + '...' : succeeding;
        return {preceeding: preceeding, succeeding: succeeding};
    };

    var getParsedSentence = function () {
        parseSentence();
        return currentSentence;
    };
    var setSentence = function (obj) {
        currentSentence = obj.sentence;
        sentenceId = obj.id;
    };
    var getStoredResults = function () {
        return storedResults;
    };
    setSentence(object);
    obj.getParsedSentence = getParsedSentence;
    obj.checkResults = checkResults;
    obj.getStoredResults = getStoredResults;
    obj.screenCurrentSentence = screenCurrentSentence;
    return obj;
};
