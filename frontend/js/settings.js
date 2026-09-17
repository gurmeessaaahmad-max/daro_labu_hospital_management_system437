/* =========================================
   DARO LABU HOSPITAL
   SETTINGS JAVASCRIPT
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("hospitalSettingsForm");
    const resetButton = document.getElementById("resetSettings");
    const logoutLink = document.getElementById("logoutLink");

    const hospitalName = document.getElementById("hospitalName");
    const registrationNumber = document.getElementById("registrationNumber");
    const hospitalPhone = document.getElementById("hospitalPhone");
    const hospitalEmail = document.getElementById("hospitalEmail");
    const hospitalAddress = document.getElementById("hospitalAddress");
    const hospitalLogo = document.getElementById("hospitalLogo");

    const message = document.getElementById("settingsMessage");

    /* =========================================
       LOAD SETTINGS
    ========================================= */

    loadSettings();


    /* =========================================
       FORM SUBMIT
    ========================================= */

    if (form) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            saveSettings();

        });

    }


    /* =========================================
       RESET BUTTON
    ========================================= */

    if (resetButton) {

        resetButton.addEventListener("click", function () {

            const confirmed = confirm(
                "Are you sure you want to reset hospital settings?"
            );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem("hospitalSettings");

            loadSettings();

            showMessage(
                "Hospital settings have been reset.",
                "success"
            );

        });

    }


    /* =========================================
       LIVE PREVIEW
    ========================================= */

    const previewFields = [
        hospitalName,
        registrationNumber,
        hospitalPhone,
        hospitalEmail,
        hospitalAddress
    ];

    previewFields.forEach(function (field) {

        if (field) {

            field.addEventListener("input", updatePreview);

        }

    });


    /* =========================================
       LOGOUT
    ========================================= */

    if (logoutLink) {

        logoutLink.addEventListener("click", function (event) {

            event.preventDefault();

            const confirmed = confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmed) {
                return;
            }

            localStorage.removeItem("loggedIn");
            localStorage.removeItem("username");
            localStorage.removeItem("role");

            localStorage.removeItem("currentUser");
            localStorage.removeItem("userRole");

            window.location.href = "../login.html";

        });

    }


    /* =========================================
       FUNCTIONS
    ========================================= */


    function loadSettings() {

        let settings = {};

        try {

            settings = JSON.parse(
                localStorage.getItem("hospitalSettings")
            ) || {};

        } catch (error) {

            console.error(
                "Unable to read hospital settings:",
                error
            );

            settings = {};

        }


        hospitalName.value =
            settings.name ||
            "Daro Labu Hospital";

        registrationNumber.value =
            settings.registrationNumber ||
            "";

        hospitalPhone.value =
            settings.phone ||
            settings.mobile ||
            "";

        hospitalEmail.value =
            settings.email ||
            "";

        hospitalAddress.value =
            settings.address ||
            "";

        hospitalLogo.value =
            settings.logo ||
            "";

        updatePreview();

    }


    function saveSettings() {

        const settings = {

            name:
                hospitalName.value.trim() ||
                "Daro Labu Hospital",

            registrationNumber:
                registrationNumber.value.trim(),

            phone:
                hospitalPhone.value.trim(),

            mobile:
                hospitalPhone.value.trim(),

            email:
                hospitalEmail.value.trim(),

            address:
                hospitalAddress.value.trim(),

            logo:
                hospitalLogo.value.trim(),

            updatedAt:
                new Date().toISOString()

        };


        localStorage.setItem(
            "hospitalSettings",
            JSON.stringify(settings)
        );


        updatePreview();

        showMessage(
            "Hospital settings saved successfully.",
            "success"
        );

    }


    function updatePreview() {

        const previewName =
            document.getElementById(
                "previewHospitalName"
            );

        const previewAddress =
            document.getElementById(
                "previewAddress"
            );

        const previewPhone =
            document.getElementById(
                "previewPhone"
            );

        const previewEmail =
            document.getElementById(
                "previewEmail"
            );

        const previewRegistration =
            document.getElementById(
                "previewRegistration"
            );


        if (previewName) {

            previewName.textContent =
                hospitalName.value.trim() ||
                "Daro Labu Hospital";

        }


        if (previewAddress) {

            previewAddress.textContent =
                hospitalAddress.value.trim() ||
                "Hospital Address";

        }


        if (previewPhone) {

            previewPhone.textContent =
                "Phone: " +
                (
                    hospitalPhone.value.trim() ||
                    "-"
                );

        }


        if (previewEmail) {

            previewEmail.textContent =
                "Email: " +
                (
                    hospitalEmail.value.trim() ||
                    "-"
                );

        }


        if (previewRegistration) {

            previewRegistration.textContent =
                "Registration No: " +
                (
                    registrationNumber.value.trim() ||
                    "-"
                );

        }

    }


    function showMessage(text, type) {

        if (!message) {
            return;
        }

        message.textContent = text;

        message.className =
            "settings-message " + type;

        setTimeout(function () {

            message.className =
                "settings-message";

            message.textContent = "";

        }, 4000);

    }

});