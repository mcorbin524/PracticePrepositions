var utilFile = 'util/mUtil.php';
//var utilFile = '1.2/util/mUtil.php';//web only
var webDataFile = 'util/getWebData.php';
var webTextFile = 'util/getWebText.php';
//var webDataFile = '1.2/util/getWebData.php';//web only
//var webTextFile = '1.2/util/getWebText.php';//web only

var writeSentence = function (sentence) {

    $.ajax({
        url: utilFile,
        dataType: 'JSON',
        method: 'POST',
        data: {task: 'writeSentence', sentence: sentence},
        error: function (result) {
            console.log(result);
        }
    });
};

var updateSentence = function (id, sentence) {
    $.ajax({
        url: utilFile,
        dataType: 'JSON',
        method: 'POST',
        data: {'task': 'updateSentence', sentence: sentence, id: id}
    });

};

$(document).on('pagecontainercreate', function () {

    //this is a utility function that should remain for the time being
    // $(document).on('click', '#storeSentences', function () {
    //     $.ajax({
    //         url: utilFile,
    //         method: 'POST',
    //         dataType: 'text',
    //         data: {task: 'storeSentences'},
    //         success: function () {
    //         },
    //         error: function () {
    //         }
    //     });
    // });

    //$(document).on('click', '#storeSentences', function () {
    //     $.ajax({
    //         url: utilFile,
    //         method: 'POST',
    //         dataType: 'text',
    //         data: {task: 'storeSentences'},
    //         success: function () {
    //         },
    //         error: function () {
    //         }
    //     });
    // });

    $(document).on('click', '#processRawText', function () {
        var text = $('#textArea').val();
        console.log(text);
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'processRawText', text: text},
            success: function (result) {
                $.each(result, function (index, element) {
                    $('<li/>').append($('<span/>', {text: element, 'contenteditable': 'true'})).append($('<a/>', {text: 'Save', class: 'update'})).appendTo($("#mySentences"));
                });
                $('.update').click(
                        function () {
                            var thisSentence = $(this).prev().text();
                            var link = $(this);
                            $('#textToSave').text(thisSentence);
                            $('#cleanedTextToSave').text(dataStore.createDemoSentence(thisSentence));
                            $('#sentenceUpdateButton').off();//wonder if this is necessary?
                            $('#sentenceUpdateButton').click(function () {
                                writeSentence(thisSentence);
                                link.off().css('color', 'red');
                            });
                            $('#saveSentenceDialog').popup('open');
                        }
                );
            },
            error: function (result) {
                alert('Text processing failed : ' + result);
                console.log(result);
            }});

        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'getDefinitions'},
            success: function (result) {
                console.log(result);
                $.each(result, function (index, element) {
                    $('<li/>').append($('<span/>', {text: element.context + ' : '})).append($('<span/>', {text: element.definition})).appendTo($("#myDefinitions"));
                });
            },
            error: function (result) {
                alert('Definitions failed');
                console.log(result);
            }});
    });

    //this is a utility function that should remain for the time being
    $(document).on('click', '#updateExistingSentences', function () {
        $('#mySentences').children().remove();
        $('#myDefinitions').children().remove();
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'updateExistingSentences'},
            success: function (result) {
                console.log(result);
                $.each(result, function (index, element) {
                    $('<li/>').append($('<span/>', {text: element.sentence, 'contenteditable': 'true'})).append($('<a/>', {text: 'Save', 'sentenceid': element.id, class: 'update'})).appendTo($("#mySentences"));
                });
                $('.update').click(
                        function () {
                            var thisSentence = $(this).prev().text();
                            var sentenceId = $(this).attr('sentenceid');
                            var link = $(this);
                            $('#textToSave').text(thisSentence);
                            $('#cleanedTextToSave').text(dataStore.createDemoSentence(thisSentence));
                            $('#sentenceUpdateButton').off();//wonder if this is necessary?
                            $('#sentenceUpdateButton').click(function () {
                                updateSentence(sentenceId, thisSentence);
                                link.off().css('color', 'red');
                            });
                            $('#saveSentenceDialog').popup('open');
                        }
                );
            },
            error: function (result) {
                alert('Text processing failed : ' + result);
                console.log(result);
            }});

        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'getDefinitions'},
            success: function (result) {
//                console.log(result);
                $.each(result, function (index, element) {
                    $('<li/>').append($('<span/>', {text: element.context + ' : '})).append($('<span/>', {text: element.definition})).appendTo($("#myDefinitions"));
                });
            },
            error: function (result) {
                alert('Definitions failed');
                console.log(result);
            }});
    });

    //this is a utility function that should remain for the time being.
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
                                $('#articleHome').text(result);
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


});