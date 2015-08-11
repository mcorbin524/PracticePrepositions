
var logInMessage = 'Log in to get started!';
var logBackInMessage = 'Log back in to practice some more!';
//var status = 'stay';
var currentContent = null;
var utilFile = 'util/mUtil.php';
//var utilFile = '1.2/util/mUtil.php';//web only
var resultsManagementFile = 'util/ResultsManagement.php';
var contentTemplateFile = 'util/ContentTemplate.php';
var webDataFile = 'util/getWebData.php';
var webTextFile = 'util/getWebText.php';
var sentenceServed = false;

var loggedInStatus = (function () {
    obj = {};
    var log_in_status = false;
    var user_id = 0;
    var log_in = function (id) {
        log_in_status = true;
        user_id = id;
    };
    var log_out = function () {
        log_in_status = false;
        user_id = 0;
    };
    var status = function () {
        return log_in_status;
    };
    var get_id = function () {
        return user_id;
    };
    var deploySpecialFeatures = function () {
        if (user_id === 1) {
            superUserTools();
        }
    };
    var clearSpecialFeatures = function () {
        $('#superUserTools').children().remove();
    };
    obj.log_in = log_in;
    obj.log_out = log_out;
    obj.status = status;
    obj.get_id = get_id;
    obj.stat = log_in_status;
    obj.id = user_id;
    obj.deploySpecialFeatures = deploySpecialFeatures;
    obj.clearSpecialFeatures = clearSpecialFeatures;
    return obj;
})();

//if (typeof (Storage) !== 'undefined') {
//    sessionStorage.setItem('loggedInStatus', JSON.stringify(loggedInStatus));
//    console.log(JSON.parse(sessionStorage.getItem('loggedInStatus')));
//}

var sentenceMakerHolder = (function () {
    obj = {};
    var sentenceMaker = {};
    var setMaker = function (maker) {
        sentenceMaker = maker;
    };
    var getMaker = function () {
        return sentenceMaker;
    };
    obj.setMaker = setMaker;
    obj.getMaker = getMaker;
    return obj;
})();

$(function () {
    $("[data-role=panel]").enhanceWithin().panel();
});

$(document).on('panelbeforeopen', '#correctionsPanel', function () {
    $('#correctionsUl').children().remove();
    loadExplainPanel(sentenceMakerHolder.getMaker().getStoredResults());
});

$(document).on('click', '#resetPasswordBtn', function () {
    $('#password').hide();
    $('#resetPasswordBtn').hide();
    $('#loginFormSubmitButton').text('Reset Password');
    $(document).off('click', '#loginFormSubmitButton');
    $(document).on('click', '#loginFormSubmitButton', resetPasswordButton);
    $('#loginPanelTitle').text('Reset Password');
});

$(document).on('panelbeforeclose', '#controlsPanel', function () {
    dataStore.updateActiveSentences();
    console.log(JSON.stringify(dataStore.getOnPrepositions()));

    //if (status === 'go') {
    //    getContent();
    //} else {
    //    if (sentenceMakerHolder.getMaker().screenCurrentSentence()) {
    //        getContent('repeat');
    //    } else {
    //        getContent();
    //    }
    //}
});

$(document).on('panelbeforeopen', '#controlsPanel', function () {
    if (sessionStorage.getItem('loggedInStatus')) {
        alert('session storage set');
    }

    var ul = $('#prepositionsUl');
    ul.children().remove();
    ul.off();

    var onPrepositions = dataStore.getOnPrepositions();

    $.each(onPrepositions, function (index, element) {
        var preposition = index;
        var onStatus = element;
        //console.log(index + ':' + element);
        var t = $('<li>');
        $(t).append($('<a/>', {text: preposition}));
        ul.append(t);
    });
    ul.listview('refresh');
    ul.find('a.ui-btn').each(function () {
        var anchor = $(this);
        var preposition = anchor.text();
        if (anchor.hasClass('ui-icon-carat-r')) {
            anchor.removeClass('ui-icon-carat-r').addClass('ui-icon-check');
        }
        $.each(onPrepositions, function (index, element) {
            if (index !== preposition)
                return true;
            if (element === 'off') {
                anchor.removeClass('ui-icon-check').addClass('ui-icon-delete');
            }
        });
        ul.listview('refresh');
    });

    ul.on('click', 'a', function (event) {
        event.preventDefault();
        if ($(this).hasClass('ui-icon-check')) {
            $(this).removeClass('ui-icon-check').addClass('ui-icon-delete');
        } else {
            $(this).removeClass('ui-icon-delete').addClass('ui-icon-check');
        }
        var anchors = $('#prepositionsUl').find('a');
        var onCount = 0;
        $.each(anchors, function (index, element) {
            if ($(element).hasClass('ui-icon-check')) {
                onCount++;
            }
        });
        if (onCount < 2) {
            customAlert('Please select at least two prepositions to work with.');
            $(this).removeClass('ui-icon-delete').addClass('ui-icon-check');
        }
        else {
            dataStore.togglePrepositionStatus($(this).text());//togglePrepositionSessionData($(this).text());
        }
    });
});

//$(document).on('panelbeforeclose', '#controlsPanel', function () {
//    dataStore.updateActiveSentences();
//});

$(document).on('pagecontainercreate', function () {
    //need to go to the server each time to find the logged in status because brower-side data isn't persistent
    //console.log(localStorage.getItem('loggedInStatus'));
    //console.log(localStorage.getItem('userId'));
    $('#headerOne').css('background-color', '#FFFFFF');
    $.ajax({
        'url': utilFile,
        method: 'POST',
        dataType: 'JSON',
        data: {task: 'checkLoggedIn'},
        success: function (result) {
            //console.log('ajax checking logged in');
            if (result.loggedIn === 'true') {
                loggedInStatus.log_in(result.userId);
                loggedInStatus.deploySpecialFeatures();
                $('#logInOutBtn').text('Log out');
                $(document).off('click', '#logInOutBtn');
                $(document).on('click', '#logInOutBtn', function () {
                    logOut(result.sessionId);
                });
            }
            else if (result.loggedIn === 'false') {
                //console.log('not logged in');
                loggedInStatus.log_out();
                $('#textContainer').text(logInMessage);
                //$('.loginStatus').text(logInMessage);
                $('#logInOutBtn').text('Log in');
                $(document).off('click', '#logInOutBtn');
                $(document).on('click', '#logInOutBtn', function () {
                    logIn();
                });
            }
            else {
                $('.loginStatus').text("UNDEFINED");
                console.log(result);
            }
        },
        error: function (result) {
            console.log(result);
        }
    });
    $(document).on('click', '#loginFormSubmitButton', onLogInFormSubmit);
});

var customAlert = function (text) {
    $('#customAlertPopupText').text(text);
    $('#customAlertPopup').popup('open');
};

var storeSentence = function (text) {
    $('#sentenceStoreText').text(text);
    $('#sentenceStorePopup').popup('open');
};
//continue here on sentence store thing!!!!

var markIncorrect = function (element) {
    $(element).css('color', 'red');
};

var menuMaker = function (word, location, selection, container) {
    var textAnchor;
    var popup;

    var buildTextAnchor = function () {
        return $('<a/>', {
            'text': word,
            'class': 'inTextAnchor',
            'id': 'a' + location,
            'data-rel': 'popup',
            'href': '#popupDiv' + location});
    };
    var buildPopup = function () {
        return getPopupList(location, selection);
    };

    var getPopupList = function (number, selectionsArray) {
        var popupDiv = $('<div/>', {'data-role': 'popup', 'id': 'popupDiv' + number});
        var unorderedList = $('<ul/>', {'data-role': 'listview', 'data-inset': 'true'});
        popupDiv.append(getListMembers(unorderedList, selectionsArray));
        return popupDiv;
    };

    var getListMembers = function (list, selectionsArray) {
        $.each(selectionsArray, function (index, element) {
            var listItem = $('<li/>').append(getAnchor(element)).trigger('create');
            list.append(listItem);
        });
        return list;
    };

    var getAnchor = function (element) {
        var thisAnchor = $('<a/>', {'text': element});
        return setAnchorAction(thisAnchor);
    };

    var setAnchorAction = function (anchor) {
        anchor.click(function () {
            var listWord = anchor.text();
            var textWord = $('#a' + location).text();
            anchor.text(textWord);
            $('#a' + location).text(listWord);
            $('#popupDiv' + location).popup('close');
        });
        return anchor;
    };

    var addTextAnchor = function () {
        container.append(textAnchor);
    };
    var addPopupMenu = function () {
        container.append(popup);
    };

    textAnchor = buildTextAnchor();
    popup = buildPopup();
    addTextAnchor();
    addPopupMenu();
};

function addLoggedInFunctionality(element) {
    var a = $('<a/>', {
        'href': '#',
        'data-transition': 'slide',
        'class': 'ui-btn ui-corner-all ui-btn-inline',
        'text': 'Enter'});
    element.children().remove();
    a.appendTo(element);
    a.click(function () {
        //status = 'go';

        var b = $('<a/>', {
            'href': '#',
            'data-transition': 'slide',
            'class': 'ui-btn ui-corner-all ui-btn-inline',
            'text': 'Next',
            'id': 'nextBtn'});
        b.appendTo(element);
        b.click(function () {
            getContent();
        });

        var e = $('<a/>', {
            'href': '#',
            'data-transition': 'slide',
            'class': 'ui-btn ui-corner-all ui-btn-inline',
            'text': 'Explain',
            'id': 'explainBtn'
        });
        e.appendTo(element);
        e.click(function () {
            $('#correctionsPanel').panel("open");
        });

        $(this).off();
        $(this).on('click', function () {
            getContent('repeat');
        });
        $(this).text('Try Again?');

        correctText();
    }
    );
}


var correctText = function () {
    var answer = $('#textContainer').text();
    $('#textContainer').children('a').attr('href', '#');
    var result = sentenceMakerHolder.getMaker().checkResults(answer, loggedInStatus.get_id());
    $.each(result, function (index, element) {
        var ind = element.index;
        if (element.grade === 'correct') {
            $('#a' + ind).css('color', '#32CD32');
        } else if (element.grade === 'error') {
            $('#a' + ind).css('color', 'red');
        }
    });
};


var loadExplainPanel = function (results) {

    var combined = [];
    $.each(results, function (index, element) {
        combined.push({
            'index': element.index,
            'word': element.correct,
            'context': element.context,
            'correct': element.grade,
            'definition': element.definition,
            'padding': element.padding
        });
    });

    $.each(combined, function (index, element) {
        var a = $('<li/>');
        var pre = $('<span/>', {text: element.padding.preceeding});
        var post = $('<span/>', {text: element.padding.succeeding});
        var word = $('<span/>', {text: ' ' + element.word});
        if (element.correct === 'correct') {
            word.css({'color': 'green'});
        } else if (element.correct === 'error') {
            word.css({'color': 'red'});
        }
        a.append(pre);
        a.append(word);
        a.append(post);
        var p = $('<p/>', {class: 'wrap'});
        p.append($('<span/>', {text: element.word}).css({'font-style': 'italic', 'font-weight': 'bold'}));
        p.append($('<span/>', {text: ' - ' + element.definition}));
        a.append(p);
        $('#correctionsUl').append(a);
    });
    $('#correctionsUl').listview('refresh');
};

function getContent(request) {
    //console.log('getting content');
    var loggedIn = loggedInStatus.status();

    request = typeof request === 'undefined' ? 'random' : request;
    if (request !== 'repeat') {
        sentenceMakerHolder.setMaker(sentenceMaker(dataStore.serveSentence()));
    }
    var data = sentenceMakerHolder.getMaker().getParsedSentence();
    var sentence = data;
    if (loggedIn === true) {
        $('#statisticsPanel').children().remove();
        $('#score').text('');
        addLoggedInFunctionality($('#loggedInFunctions'));
    } else {
        $('#loggedInFunctions').children().remove();
    }

    $("[id^='popupDiv']").remove();
    $('#contentViewer').children().remove();
    $('#contentViewer').append($('<p/>', {'id': 'textContainer'}));
    $.each(sentence, function (index, element) {
        //use lower case word for comparison purposes
        var lowerCaseWord = element.word.toLowerCase();
        if (element.preposition === true && dataStore.getOnPrepositions()[lowerCaseWord] === 'on') {
            var target = $('#textContainer');

            menuMaker(element.selections.inText, element.location, element.selections.results, target);
        }
        else {
            $('#textContainer').append(element.word);
        }
        if (index < sentence.length - 2) {
            //don't put a space before or after the punctuation mark that is the final element
            $('#textContainer').append(' ');
        }
    });

    $('#contentViewer').trigger('create');
    //status = 'stay';
    sentenceServed = true;
}

var superUserTools = function () {

    $('<a/>', {'id': 'getWebData', 'href': '#', 'data-transition': 'slide', 'class': "ui-btn ui-corner-all ui-btn-inline", text: 'Web Data'}).appendTo($('#superUserTools'));
    //$('<a/>', {'id': 'storeSentences', 'href': '#', 'data-transition': 'slide', 'class': "ui-btn ui-corner-all ui-btn-inline", text: 'Store Sentences'}).appendTo($('#superUserTools'));
    $('<a/>', {'id': 'processRawText', 'href': '#', 'data-transition': 'slide', 'class': "ui-btn ui-corner-all ui-btn-inline", text: 'Process Text'}).appendTo($('#superUserTools'));
    $('<a/>', {'id': 'updateExistingSentences', 'href': '#', 'data-transition': 'slide', 'class': "ui-btn ui-corner-all ui-btn-inline", text: 'Update Existing'}).appendTo($('#superUserTools'));
    $('<p/>', {id: 'articleHome'}).appendTo($('#superUserTools'));
    $('<ul/>', {id: 'myLinks'}).appendTo($('#superUserTools'));
    $('<div/>', {id: 'sentencesDiv', class: 'inline'}).appendTo($('#superUserTools'));
    $('<div/>', {id: 'definitionsDiv', class: 'inline'}).appendTo($('#superUserTools'));
    $('<ul/>', {id: 'mySentences', 'data-role': 'listview', 'data-inset': 'true'}).appendTo($('#sentencesDiv'));
    $('<ul/>', {id: 'myDefinitions', 'data-role': 'listview', 'data-inset': 'true'}).appendTo($('#definitionsDiv'));
    $('<textarea/>', {rows: "150", columns: "100", id: "textArea"}).appendTo($('#superUserTools'));
};

