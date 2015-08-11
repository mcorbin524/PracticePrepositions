var utilFile = 'util/mUtil.php';
//var utilFile = '1.2/util/mUtil.php';//web only

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
                console.log('ajax resetting password');
                if (result === 'No such user') {
                    customAlert('Unable to reset password.  Please check that email address is correct and try again.');
                }
                else {
                    customAlert('Your password has been reset, and the new password has been sent to your email address.');
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

var validateEmail = function (email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
};

function onLogInFormSubmit() {
    var password = $('#password').val();
    var emailAddress = $('#emailAddress').val();
    $('#emailAddress').val('');
    $('#password').val('');
    if (password === '' || emailAddress === '') {
        customAlert('Email or password are missing.');
    }
    else if (!validateEmail(emailAddress)) {
        customAlert('Invalid email format. Please re-enter.');
    }
    else {
        $.ajax({
            url: utilFile,
            method: 'POST',
            dataType: 'JSON',
            data: {task: 'submitUserData', 'password': password, 'emailAddress': emailAddress},
            success: function (result) {
                console.log('ajax login form submit');
                var loggedIn = result.loggedin;
                var emailAddress = result.emailAddress;
                var passwordFlagUpdate = result.passwordUpdate;
                var userId = result.userId;
                var sessionId = result.sessionId;
                if (loggedIn === 'true') {
                    //login successful
                    loggedInStatus.log_in(userId);
                    loggedInStatus.deploySpecialFeatures();
                    if (passwordFlagUpdate === 1) {
                        reverseLoginButtonFunction(sessionId);

                        $('#loginPanelTitle').text('Select new password');
                        $('#emailAddress').hide();
                        $('#resetPasswordBtn').hide();
                        $('#loginFormSubmitButton').text('Submit');
                        $(document).off('click', '#loginFormSubmitButton');
                        $(document).on('click', '#loginFormSubmitButton', function () {
                            selectNewPasswordButton(userId);
                        });
                    }
                    else {
                        $('#loginPanel').panel('close');
                        reverseLoginButtonFunction(sessionId);
                    }
                    getContent();
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
                console.log(result);
            }
        });
    }
}

var reverseLoginButtonFunction = function (sessionId) {
    $(document).off('click', '#logInOutBtn');
    $(document).on('click', '#logInOutBtn', function () {
        logOut(sessionId);
    });
    $('#logInOutBtn').text('Log out');
};




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
                console.log('ajax select new password');
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
                alert('password flag clear fail');
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
            ///console.log('ajax log out');
            if (result === 'true') {
                loggedInStatus.log_out();
                loggedInStatus.clearSpecialFeatures();
                $('#textContainer').text(logBackInMessage);
                $(document).off('click', '#logInOutBtn');
                $(document).on('click', '#logInOutBtn', logIn);
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
            console.log('ajax log in');
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
