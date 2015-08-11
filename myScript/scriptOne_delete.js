
var logInMessage = 'Log in to check your answers!';
var status = 'stay';
var currentContent = null;
var utilFile = 'util/util.php';
var resultsManagementFile = 'util/ResultsManagement.php';
var contentTemplateFile = 'util/ContentTemplate.php';
var webDataFile = 'util/getWebData.php';
var webTextFile = 'util/getWebText.php';



function logInControl() {

    $(function () {
        $("[data-role=panel]").enhanceWithin().panel();
    });

    $.ajax({
        url: utilFile,
        method: 'POST',
        dataType: 'text',
        data: {task: 'setOnPrepositions'},
        success: function () {
            getContent();
        },
        error: function (result) {
            alert('error on setOnPrepositions');
        }
    });

    $(document).on('panelbeforeopen', '#correctionsPanel', function () {
        $('#correctionsUl').children().remove();
        currentContent();

    });

    $(document).on('click', '#resetPasswordBtn', function () {
        $('#password').hide();
        $('#resetPasswordBtn').hide();
        $('#loginFormSubmitButton').text('Reset Password');
        $(document).off('click', '#loginFormSubmitButton');
        $(document).on('click', '#loginFormSubmitButton', resetPasswordButton);
        $('#loginPanelTitle').text('Reset Password');
    });

    $(document).on('click', '#prepositionsPanelOpener', function () {
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'json',
            data: {task: 'refreshStatistics'},
            success: function (result) {
                $('#errorsUl').children().remove();
                $.each(result, function (index, element) {
                    var number = element.count;
                    var correct = element.correct;
                    var t = $('<li>');
                    $(t).append($('<a/>', {text: correct}).on('click', function () {
                        $.ajax({
                            url: utilFile,
                            method: 'POST',
                            dataType: 'JSON',
                            data: {task: 'getErrorDetails', errorPreposition: correct},
                            success: function (result) {
                                $('#pageThreeUl').children().remove();
                                $('#pageThreeHeader').children().remove();
                                $('#pageThreeHeader').append($('<h2/>', {id: 'p3Title', text: 'Errors with preposition '}));
                                $('#p3Title').append($('<i/>', {text: correct}));

                                $.each(result, function (index, element) {
                                    var errors = '';
                                    $.each(element, function (ind, ele) {
                                        if (ind !== 'context' && ind !== 'count')
                                            errors += ind + ' (' + ele + ') ';
                                    });
                                    $.ajax({
                                        url: utilFile,
                                        method: 'POST',
                                        dataType: 'TEXT',
                                        data: {task: 'getDefinition', context: element.context},
                                        success: function (result) {
                                            $('#pageThreeUl').append($('<li/>', {id: element.context, text: result}));
                                            $('#pageThreeUl').children('li').last().append($('<p/>', {text: 'errors: ' + errors}));
                                        },
                                        error: function (result) {
                                            alert('definition fetch failed.')
                                        }});
                                });
                                $('#pageThreeUl').listview('refresh');
                            },
                            error: function (result) {
                                console.log(result);
                            }});
                        $('body').pagecontainer('change', '#pageThree');

                    }));
                    $('#errorsUl').append(t);
                });
                $('#errorsUl').listview('refresh');
                $('#prepositionsPanel').panel('open');
            },
            error: function (result) {
                alert("db results problem");
            }
        });
    });

    $(document).on('panelbeforeclose', '#controlsPanel', function () {
        var sentenceId = $('#textContainer').attr('name');
        if (status === 'go') {
            getContent();
        } else {
            getContent(sentenceId);
        }

    });

    $(document).on('panelbeforeopen', '#controlsPanel', function () {
        var ul = $('#prepositionsUl');
        ul.children().remove();
        sessionStorage.setItem('allPrepositions', '');
        ul.off();
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'getOnPrepositions'},
            success: function (result) {
                $.each(result, function (index, element) {
                    var preposition = index;
                    var onStatus = element;
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
                    $.each(result, function (index, element) {
                        if (index !== preposition)
                            return true;
                        if (element === 'off') {
                            anchor.removeClass('ui-icon-check').addClass('ui-icon-delete');
                        }
                    });
                    ul.listview('refresh');
                });
            },
            error: function (result) {
                console.log(result);
            }
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
                togglePrepositionSessionData($(this).text());
            }
        });
    });



    $(document).on('pagecontainercreate', function () {

        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'randomizeSentences'},
            success: function (result) {
            },
            error: function (result) {
                console.log(result);
            }
        });

        $.ajax({
            'url': utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'checkLoggedIn'},
            success: function (result) {
                if (result.loggedIn === 'true') {
                    $('.loginStatus').text("LOGGED IN AS " + result.email);
                    $('#logInOutBtn').text('Log out');
                    $(document).off('click', '#logInOutBtn');
                    $(document).on('click', '#logInOutBtn', function () {
                        logOut(result.sessionId);
                    });
                }
                else if (result.loggedIn === 'false') {
                    $('.loginStatus').text(logInMessage);
                    $('#logInOutBtn').text('Log in');
                    $(document).off('click', '#logInOutBtn');
                    $(document).on('click', '#logInOutBtn', function () {
                        logIn();
                    });

                }
                else {
                    $('.loginStatus').text("UNDEFINED");
                    console.log(result);
                    alert(result);
                }
            },
            error: function (result) {
                alert(result);
                console.log(result);
            }
        });

        $(document).on('click', "#testDatabase", function () {
            $.ajax({
                url: utilFile,
                method: 'POST',
                dataType: 'json',
                data: {task: 'testDatabase'},
                success: function (result) {
                    console.log(result);
                },
                error: function (result) {
                    console.log(result);
                }
            });
        });
        $(document).on('click', '#storeSentences', function () {
            $.ajax({
                url: utilFile,
                method: 'POST',
                dataType: 'text',
                data: {task: 'storeSentences'},
                success: function () {
                },
                error: function () {
                }
            });
        });

        $(document).on('click', '#processRawText', function () {
            $.ajax({
                url: utilFile,
                method: 'POST',
                dataType: 'text',
                data: {task: 'processRawText'},
                success: function (result) {
                },
                error: function (result) {
                    alert('Text processing failed : ' + result);
                    console.log(result);
                }});
        });

        $(document).on('click', '#getWebData', function () {
            $.ajax({url: webDataFile,
                method: 'POST',
                dataType: 'JSON',
                success: function (result) {
                    var d = result.data;
                    $.each(d, function (index, element) {
                        var l = $('<li/>');
                        var a = $('<a/>', {'href': '#', 'text': element.address}).click(function () {
                            $.ajax({'url': webTextFile,
                                'method': 'POST',
                                'dataType': 'text',
                                'data': {'address': element.address},
                                'success': function (result) {
                                    console.log(result);
                                },
                                'error': function (result) {
                                    alert(result);
                                }});
                        });
                        a.appendTo(l);
                        l.appendTo($('#myLinks'));
                    });
                },
                error: function (result) {
                    console.log(result);
                    alert('error : ' + result);
                }});
        });
        $(document).on('click', '#logInOutBtn', logIn);

        $(document).on('click', '#loginFormSubmitButton', onLogInFormSubmit
                );
        $(document).on('click', '#contentABtn', function () {
            getContent();
        });
    });
}

function customAlert(text) {
    $('#customAlertPopupText').text(text);
    $('#customAlertPopup').popup('open');
}

function resetPasswordButton() {
    if ($('#emailAddress').val() === '') {
        customAlert('Email address missing.');
    }
    else {
        var email = $('#emailAddress').val();
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'text',
            data: {task: 'resetPassword', email: email},
            success: function (result) {
                if (result === 'No such user') {
                    customAlert('Unable to reset password.  Please check that email address is correct and try again.');
                }
                else {
                    customAlert('Password has been reset, and new password has been sent to your email adddress.');
                }

                $('#emailAddress').val('');
                $('#password').val('');
                $('#password').show();
                $('#resetPasswordBtn').show();
                $('#loginFormSubmitButton').text('Submit');
                $(document).off('click', '#loginFormSubmitButton');
                $(document).on('click', '#loginFormSubmitButton', onLogInFormSubmit);
                $('#loginPanelTitle').text('Log in or Register');
            },
            error: function (result) {
                customAlert('Unable to reset password.  Please check email address and try again.');
            }
        });
    }
}

function onLogInFormSubmit() {
    var password = $('#password').val();
    var emailAddress = $('#emailAddress').val();
    $('#password').val('');
    $('#emailAddress').val('');
    if (password === '' || emailAddress === '')
        customAlert('Email or password are missing.');
    else {
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'submitUserData', 'password': password, 'emailAddress': emailAddress},
            success: function (result) {
                var loggedIn = result.loggedin;
                var emailAddress = result.emailAddress;
                var passwordFlagUpdate = result.passwordUpdate;
                var userId = result.userId;
                var sessionId = result.sessionId;
                if (loggedIn === 'true') {
                    //login successful
                    if (passwordFlagUpdate === 1) {
                        $('.loginStatus').text("LOGGED IN AS " + emailAddress);
                        $(document).off('click', '#logInOutBtn');
                        $(document).on('click', '#logInOutBtn', function () {
                            logOut(sessionId);
                        });
                        $('#logInOutBtn').text('Log out');

                        $('#loginPanelTitle').text('Select new password');
                        $('#emailAddress').hide();
                        $('#resetPasswordBtn').hide();
                        $('#loginFormSubmitButton').text('Submit');
                        $(document).off('click', '#loginFormSubmitButton');
                        $(document).on('click', '#loginFormSubmitButton', function () {
                            selectNewPasswordButton(userId)
                        });
                    }
                    else {
                        $('#loginPanel').panel('close');
                        $('.loginStatus').text("LOGGED IN AS " + emailAddress);
                        $(document).off('click', '#logInOutBtn');
                        $(document).on('click', '#logInOutBtn', function () {
                            logOut(sessionId);
                        });
                        $('#logInOutBtn').text('Log out');
                    }
                    var sentenceId = $('#textContainer').attr('name');
                    getContent(sentenceId);
                }
                else if (loggedIn === 'false') {
                    customAlert('Login was unsuccessful.  Please check email address and password and try again.');
                }
                else {
                    alert('unexpected success on loginFormSubmitButton');
                }
            },
            error: function (result) {
                alert('error on ' + $('#loginFormSubmitButton').attr('id'));
            }
        });
    }
}

function selectNewPasswordButton(userId) {

    var newPassword = $('#password').val();
    if (newPassword === '') {
        customAlert('Please enter a new password.');
    } else {
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'text',
            data: {task: 'selectNewPassword', id: userId, newPassword: newPassword},
            success: function () {
                $('#password').val('');
                $('#loginPanel').panel('close');

                $('#loginPanelTitle').text('Log in or Register');
                $('#emailAddress').show();
                $('#resetPasswordBtn').show();
                $('#loginFormSubmitButton').text('Submit');
                $(document).off('click', '#loginFormSubmitButton');
                $(document).on('click', '#loginFormSubmitButton', onLogInFormSubmit);
            },
            error: function () {
                alert('password flag clear fail')
            }
        });
    }
}

function logOut(sessionId) {
    $.ajax({
        url: utilFile,
        method: 'POST',
        dataType: 'text',
        data: {task: 'logOut', sessionId: sessionId},
        success: function (result) {
            if (result === 'true') {

                $('.loginStatus').text(logInMessage);
                $(document).off('click', '#logInOutBtn');
                $(document).on('click', '#logInOutBtn', logIn)
                $('#logInOutBtn').text('Log in');
                $('#loggedInFunctions').children().remove();
                $('#contentViewer').trigger('create');
            }
            else if (result === 'false') {
                alert('not logged out');
            }
            else
            {
                alert('unexpected success on ' + $('#logOutBtn').attr('id'));
            }
        },
        error: function (result) {
            alert('error on ' + $('#logOutBtn').attr('id'));
        }
    });
}
function logIn() {
    $.ajax({
        url: utilFile,
        method: 'POST',
        dataType: 'JSON',
        data: {task: 'checkLoggedIn'},
        success: function (result) {
            if (result.loggedIn === 'false')
                $('#loginPanel').panel('open');
            else if (result.loggedIn === 'true')
                customAlert('You are already logged in.');
            else
                alert('unexpected success on ' + $('#logInBtn').attr('id'));
        },
        error: function (result) {
            alert('error on ' + $('#logInBtn').attr('id'));
        }
    });
}

function togglePrepositionSessionData(preposition) {
    $.ajax({
        url: utilFile,
        method: 'POST',
        dataType: 'JSON',
        data: {task: 'togglePreposition', toggleThisPreposition: preposition},
        success: function (result) {
        },
        error: function (result) {
            alert('toggle prepositon failed');
        }
    });
}

function markIncorrect(element) {
    $(element).css('color', 'red');
}


var menuMaker = function (word, location, selection, container) {

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
    var getAnchor = function (element) {
        var thisAnchor = $('<a/>', {'text': element});
        return setAnchorAction(thisAnchor);
    };
    var getListMembers = function (list, selectionsArray) {
        $.each(selectionsArray, function (index, element) {
            var listItem = $('<li/>').append(getAnchor(element)).trigger('create');
            list.append(listItem);
        });
        return list;
    };
    var getPopupList = function (number, selectionsArray) {
        var popupDiv = $('<div/>', {'data-role': 'popup', 'id': 'popupDiv' + number});
        var unorderedList = $('<ul/>', {'data-role': 'listview', 'data-inset': 'true'});
        popupDiv.append(getListMembers(unorderedList, selectionsArray));
        return popupDiv;
    };
    this.myContainer = container;
    this.myTextAnchor = $('<a/>', {
        'text': word,
        'class': 'inTextAnchor',
        'id': 'a' + location,
        'data-rel': 'popup',
        'href': '#popupDiv' + location});
    this.myPopup = getPopupList(location, selection);
};
menuMaker.prototype.addTextAnchor = function () {
    this.myContainer.append(this.myTextAnchor);
    return this;
};
menuMaker.prototype.addPopupMenu = function () {
    this.myContainer.append(this.myPopup);
    return this;
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
        status = 'go';
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
            var sentence = $('#textContainer').attr('name');
            getContent(sentence);
        });
        $(this).text('Try Again?');

        var answer = $('#textContainer').text();
        var sentenceNumber = $('#textContainer').attr('name');
        $('#textContainer').children('a').attr('href', '#');
        $.ajax({
            url: resultsManagementFile,
            method: 'POST',
            dataType: 'json',
            data: {'answer': answer, 'sentenceNumber': sentenceNumber},
            success: function (results) {
                var result = results.errors;
                
                currentContent = function () {
                    loadExplainPanel(results);
                };

                var errors = [];
                $.each(result, function (index, element) {
                    errors.push('a' + element.index);
                });
                var links = $('a.inTextAnchor');
                $.each(links, function (index, element) {
                    if (errors.length === 0) {
                    }
                    var anchorId = $(element).attr('id');
                    if ($.inArray(anchorId, errors) === -1) {
                        $(element).css('color', '#32CD32');
                        return true;
                    }
                    $(element).css('color', 'red');
                });
            },
            error: function (results) {
            }
        });
    }
    );

}

function loadExplainPanel(result) {
    var corrects = new Array();
    var errors = new Array();
    var original = new Array();
    var definitions = new Array();
    original = result.original;
    corrects = result.corrects;
    errors = result.errors;
    definitions = result.definitions;
    var r = new Array();
    var l = original.length;
    var combined = new Array();
    $.each(definitions, function (index, element) {
        r[element.context] = element.definition;
    });

    $.each(errors, function (index, element) {
        combined.push({'index': element.index, 'word': element.correct, 'context': element.context, 'correct': 'no'});
    });
    $.each(corrects, function (index, element) {
        combined.push({'index': element.index, 'word': element.correct, 'context': element.context, 'correct': 'yes'});
    });
    combined.sort(function (a, b) {
        return a.index - b.index;
    });

    $.each(combined, function (index, element) {

        var a = $('<li/>');
        if (element.index > 1) {
            a.append($('<span/>', {text: '...'}));
        }
        if (element.index !== 0) {
            a.append($('<span/>', {text: original[element.index - 1] + ' '}));
        }
        var b = $('<span/>', {text: ' ' + original[element.index]});
        if (element.correct === 'yes') {
            b.css({'color': 'green'});
        } else if (element.correct === 'no') {
            b.css({'color': 'red'});
        }
        a.append(b);
        if (element.index !== (l - 1)) {
            a.append($('<span/>', {text: ' ' + original[element.index + 1]}));
        }
        if (element.index < (l - 2)) {
            a.append($('<span/>', {text: '...'}));
        }
        var p = $('<p/>', {class: 'wrap'});
        p.append($('<span/>', {text: element.word}).css({'font-style': 'italic', 'font-weight': 'bold'}));
        p.append($('<span/>', {text: ' - ' + r[element.context]}));
        a.append(p);
        $('#correctionsUl').append(a);


    });


    $('#correctionsUl').listview('refresh');
}

function getContent(request) {
    request = typeof request === 'undefined' ? 'random' : request;

    $.ajax({
        url: contentTemplateFile,
        method: 'POST',
        dataType: 'JSON',
        data: {request: request},
        success: function (result) {
            var loggedIn = result.loggedIn;
            var data = result.data;
            if (loggedIn === 'true') {
                $('#statisticsPanel').children().remove();
                $('#score').text('');
                addLoggedInFunctionality($('#loggedInFunctions'));
            } else {
                $('#loggedInFunctions').children().remove();
            }
            $("[id^='popupDiv']").remove();
            $('#contentViewer').children().remove();
            $('#contentViewer').append($('<p/>', {'id': 'textContainer'}));

            $.each(data, function (index, element) {
                if (index === 0) {
                    $('#textContainer').attr({'name': element.word});
                    return true;
                }
                if (element.preposition === 'true') {
                    var target = $('#textContainer');
                    var m = new menuMaker(element.word, element.location - 1, element.selections, target);//need to remember that location here is actually one higher than it should be (base 1) since the first element of the array was just the id of the sentence!!! 
                    m.addTextAnchor().addPopupMenu();

                } else {
                    $('#textContainer').append(element.word);
                }
                $('#textContainer').append(' ');
            });
            $('#contentViewer').trigger('create');
            status = 'stay';
        },
        error: function (result) {
            alert('error on add content: ' + result);
        }
    });

}
