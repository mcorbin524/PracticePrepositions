<?php
session_start();
?>

<!DOCTYPE html>
<html>
    <head>
        <style>
            .wrap {
                white-space: normal !important
            }
        </style>
        <link rel="icon" type="image/ico" href="favicon.ico"/>

        <title>Practice Prepositions</title>
       <!-- <script>$(document).on('pagecreate', function () {
                alert('page create');
            });
        </script>
       --> 
       <meta name="viewport" content="width=device-width, initial-scale=1">
        <!--
        <link rel="stylesheet" href="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css" />
        <script src="http://code.jquery.com/jquery-1.11.1.min.js"></script>
        <script src="http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js"></script>
        -->
        <link rel="stylesheet" href="script/jquery.mobile-1.4.5.css">
        <script src="script/jquery.js"></script>
        <script src="script/jquery.mobile-1.4.5.min.js"></script>

        <script src="myScript/loginManagement.js"></script>
        <script src="myScript/sentenceManagement.js"></script>
        <script src="myScript/mScript.js"></script>
        <script src="myScript/utilities.js"></script>
        <!--
        <script src="1.2/myScript/loginManagement.js"></script>
        <script src="1.2/myScript/sentenceManagement.js"></script>
        <script src="1.2/myScript/mScript.js"></script>
        <script src="1.2/myScript/utilities.js"></script>
        -->

    </head>
    <body>
        <div data-role="page" id="pageOne">

            <div id = "headerOne" data-role="header">
                <!--
                    <img src="1.2/img/logo.png">
                -->            
                <img src="img/logo.png">
            </div>

            <div role="main" class="ui-content" style="padding:10px 20px;">
                <div id = "scoreContainer">
                    <p id="score"> </p>
                </div>
                <div id="contentViewer">
                    <p id="textContainer"></p>
                </div>
                <p id="loggedInFunctions"></p>
            </div>

            <div data-role="footer" style="padding:10px 20px;">
                 <!-- <p class="loginStatus" style="padding:10px 20px;"></p>-->
                <a id="logInOutBtn" href="#" data-transition="slide" class="ui-btn ui-corner-all ui-btn-inline">Log In</a>
                <a id="controlsPanelOpener" href="#controlsPanel" data-transition="slide" class="ui-btn ui-icon-gear ui-btn-icon-notext ui-corner-all ui-btn-inline"></a>
                <p id="superUserTools">
                </p>

            </div>

            <div data-role="popup" id = "customAlertPopup">
                <p id="customAlertPopupText"></p>
            </div>

            <div data-role="popup" id = "sentenceStorePopup">
                <p id="sentenceStoreText"></p>
                <a id="saveSentence" href="#" data-transition="slide" class="ui-btn ui-corner-all ui-btn-inline">Save</a>
                <a id="cancelSaveSentence" href="#" data-transition="slide" class="ui-btn ui-corner-all ui-btn-inline">Cancel</a>
            </div>

            <div data-role="panel" id="loginPanel" data-position="right" data-display="overlay">
                <div style="padding:10px 20px;">
                    <h3 id="loginPanelTitle">Log in or Register</h3>
                    <input id="emailAddress" type='email' placeholder="email address">
                    <input id="password" type ='password' placeholder="password">
                    <a id="loginFormSubmitButton" class="ui-btn ui-corner-all">Submit</a>
                    <a id="resetPasswordBtn">Reset Password</a>
                </div>
            </div>

            <div data-role="panel" id="controlsPanel" data-position="right" data-display="overlay">
                <h3>Choose prepositions to work on:</h3>
                <ul id="prepositionsUl" data-role="listview" data-split-icon = "gear" data-count-theme = "c" data-inset="true">
                </ul>
            </div>

            <div data-role="panel" id="correctionsPanel" data-position="right" data-theme="a" data-display="overlay">
                <h3>Definitions</h3>
                <ul id="correctionsUl" data-role="listview" data-inset="true">
                </ul>
            </div>

            <div data-role="popup" id="saveSentenceDialog" data-overlay-theme="a" data-theme="a" data-dismissible="false" style="max-width:1000px;">
                <div data-role="header" data-theme="a">
                    <h1>Save Sentence?</h1>
                </div>
                <div role="main" class="ui-content">
                    <p id="textToSave"></p>
                    <p id="cleanedTextToSave"></p>
                    <a href="#" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back">Cancel</a>
                    <a href="#" id="sentenceUpdateButton" class="ui-btn ui-corner-all ui-shadow ui-btn-inline ui-btn-b" data-rel="back" data-transition="flow">Save</a>
                </div>
            </div>
            

        </div>
    </body>
</html>