/* =========================================================
   DARO LABU HOSPITAL
   LOGIN PAGE JAVASCRIPT
========================================================= */

"use strict";


document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* =================================================
           ELEMENTS
        ================================================= */

        const loginForm =
            document.getElementById("loginForm");

        const usernameInput =
            document.getElementById("username");

        const passwordInput =
            document.getElementById("password");

        const passwordToggle =
            document.getElementById("passwordToggle");

        const rememberUsername =
            document.getElementById("rememberUsername");

        const forgotPassword =
            document.getElementById("forgotPassword");

        const loginButton =
            document.getElementById("loginButton");

        const loginMessage =
            document.getElementById("loginMessage");

        const menuButton =
            document.getElementById("menuButton");

        const mainNav =
            document.getElementById("mainNav");

        const currentYear =
            document.getElementById("currentYear");


        /* =================================================
           INITIALIZE USERS
        ================================================= */

        if (
            typeof initializeUsers ===
            "function"
        ) {

            initializeUsers();

        }


        /* =================================================
           CURRENT YEAR
        ================================================= */

        if (currentYear) {

            currentYear.textContent =
                new Date().getFullYear();

        }


        /* =================================================
           MOBILE MENU
        ================================================= */

        if (menuButton && mainNav) {

            menuButton.addEventListener(
                "click",
                function () {

                    mainNav.classList.toggle(
                        "active"
                    );


                    const icon =
                        menuButton.querySelector("i");


                    if (
                        mainNav.classList.contains(
                            "active"
                        )
                    ) {

                        icon.className =
                            "fa-solid fa-xmark";

                    } else {

                        icon.className =
                            "fa-solid fa-bars";

                    }

                }
            );


            const navLinks =
                mainNav.querySelectorAll("a");


            navLinks.forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        mainNav.classList.remove(
                            "active"
                        );

                        const icon =
                            menuButton.querySelector("i");

                        icon.className =
                            "fa-solid fa-bars";

                    }
                );

            });

        }


        /* =================================================
           PASSWORD SHOW / HIDE
        ================================================= */

        if (
            passwordToggle &&
            passwordInput
        ) {

            passwordToggle.addEventListener(
                "click",
                function () {

                    if (
                        passwordInput.type ===
                        "password"
                    ) {

                        passwordInput.type =
                            "text";

                        passwordToggle.innerHTML =
                            '<i class="fa-solid fa-eye-slash"></i>';

                        passwordToggle.setAttribute(
                            "aria-label",
                            "Hide password"
                        );

                    } else {

                        passwordInput.type =
                            "password";

                        passwordToggle.innerHTML =
                            '<i class="fa-solid fa-eye"></i>';

                        passwordToggle.setAttribute(
                            "aria-label",
                            "Show password"
                        );

                    }

                }
            );

        }


        /* =================================================
           REMEMBER USERNAME
        ================================================= */

        const savedUsername =
            localStorage.getItem(
                "rememberedUsername"
            );


        if (
            savedUsername &&
            usernameInput
        ) {

            usernameInput.value =
                savedUsername;

            if (rememberUsername) {

                rememberUsername.checked =
                    true;

            }

        }


        /* =================================================
           DISPLAY MESSAGE
        ================================================= */

        function showMessage(
            message,
            type
        ) {

            if (!loginMessage) {
                return;
            }

            loginMessage.textContent =
                message;

            loginMessage.className =
                "login-message show " +
                type;

        }


        /* =================================================
           CLEAR MESSAGE
        ================================================= */

        function clearMessage() {

            if (!loginMessage) {
                return;
            }

            loginMessage.textContent =
                "";

            loginMessage.className =
                "login-message";

        }


        /* =================================================
           LOGIN FORM
        ================================================= */

        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                function (event) {

                    event.preventDefault();

                    clearMessage();


                    const username =
                        usernameInput.value.trim();

                    const password =
                        passwordInput.value;


                    /* -------------------------------------
                       VALIDATION
                    ------------------------------------- */

                    if (!username) {

                        showMessage(
                            "Please enter your username.",
                            "error"
                        );

                        usernameInput.focus();

                        return;

                    }


                    if (!password) {

                        showMessage(
                            "Please enter your password.",
                            "error"
                        );

                        passwordInput.focus();

                        return;

                    }


                    /* -------------------------------------
                       DISABLE BUTTON
                    ------------------------------------- */

                    loginButton.disabled =
                        true;

                    loginButton.innerHTML =
                        '<i class="fa-solid fa-spinner fa-spin"></i>' +
                        '<span>Signing in...</span>';


                    /* -------------------------------------
                       LOGIN
                    ------------------------------------- */

                    let result;


                    if (
                        typeof loginUser ===
                        "function"
                    ) {

                        result =
                            loginUser(
                                username,
                                password
                            );

                    } else {

                        result = {

                            success: false,

                            message:
                                "Authentication system is not loaded."

                        };

                    }


                    /* -------------------------------------
                       LOGIN SUCCESS
                    ------------------------------------- */

                    if (result.success) {


                        if (
                            rememberUsername &&
                            rememberUsername.checked
                        ) {

                            localStorage.setItem(
                                "rememberedUsername",
                                username
                            );

                        } else {

                            localStorage.removeItem(
                                "rememberedUsername"
                            );

                        }


                        showMessage(
                            "Login successful. Opening dashboard...",
                            "success"
                        );


                        setTimeout(
                            function () {

                                window.location.href =
                                    "dashboard.html";

                            },
                            500
                        );


                        return;

                    }


                    /* -------------------------------------
                       LOGIN FAILED
                    ------------------------------------- */

                    showMessage(
                        result.message ||
                        "Invalid username or password.",
                        "error"
                    );


                    loginButton.disabled =
                        false;

                    loginButton.innerHTML =
                        '<i class="fa-solid fa-right-to-bracket"></i>' +
                        '<span>Sign In</span>';

                }
            );

        }


        /* =================================================
           FORGOT PASSWORD
        ================================================= */

        if (forgotPassword) {

            forgotPassword.addEventListener(
                "click",
                function () {

                    alert(
                        "Please contact the hospital administrator to reset your account password."
                    );

                }
            );

        }


        /* =================================================
           CLOSE MENU WHEN CLICKING OUTSIDE
        ================================================= */

        document.addEventListener(
            "click",
            function (event) {

                if (
                    !mainNav ||
                    !menuButton
                ) {
                    return;
                }


                if (
                    mainNav.classList.contains(
                        "active"
                    ) &&
                    !mainNav.contains(
                        event.target
                    ) &&
                    !menuButton.contains(
                        event.target
                    )
                ) {

                    mainNav.classList.remove(
                        "active"
                    );


                    const icon =
                        menuButton.querySelector("i");


                    icon.className =
                        "fa-solid fa-bars";

                }

            }
        );

    }
);