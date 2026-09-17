/* =========================================================
   DARO LABU HOSPITAL
   DASHBOARD JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       CHECK LOGIN
    ====================================================== */

    if (typeof isLoggedIn === "function") {

        if (!isLoggedIn()) {
            window.location.href = "login.html";
            return;
        }

    } else {

        const loggedIn = localStorage.getItem("loggedIn");

        if (loggedIn !== "true") {
            window.location.href = "login.html";
            return;
        }

    }


    /* =====================================================
       GET CURRENT USER
    ====================================================== */

    let username = localStorage.getItem("username") || "Admin";
    let role = localStorage.getItem("role") || "Admin";

    let currentUser = null;


    if (typeof getAuthenticatedUser === "function") {

        currentUser = getAuthenticatedUser();

        if (currentUser) {
            username = currentUser.username || username;
            role = currentUser.role || role;
        }

    }


    /* =====================================================
       USER DISPLAY NAME
    ====================================================== */

    let displayName = username;

    const nameMap = {
        admin: "System Administrator",
        doctor: "Doctor",
        nurse: "Nurse",
        pharmacy: "Pharmacy Staff",
        laboratory: "Laboratory Staff",
        cashier: "Billing Staff",
        reception: "Reception Staff",
        accountant: "Accountant"
    };


    const lowerUsername = String(username).toLowerCase();

    if (nameMap[lowerUsername]) {
        displayName = nameMap[lowerUsername];
    }


    /* =====================================================
       DISPLAY USER
    ====================================================== */

    const welcomeUser =
        document.getElementById("welcomeUser");

    const topUserName =
        document.getElementById("topUserName");

    const topUserRole =
        document.getElementById("topUserRole");


    if (welcomeUser) {
        welcomeUser.textContent = displayName;
    }


    if (topUserName) {
        topUserName.textContent = displayName;
    }


    if (topUserRole) {
        topUserRole.textContent = role;
    }


    /* =====================================================
       LOCAL STORAGE HELPER
    ====================================================== */

    function getData(newKey, oldKey) {

        try {

            const newData =
                JSON.parse(
                    localStorage.getItem(newKey) || "[]"
                );

            if (Array.isArray(newData) && newData.length > 0) {
                return newData;
            }

        } catch (error) {
            console.error(error);
        }


        if (oldKey) {

            try {

                const oldData =
                    JSON.parse(
                        localStorage.getItem(oldKey) || "[]"
                    );

                if (Array.isArray(oldData)) {
                    return oldData;
                }

            } catch (error) {
                console.error(error);
            }

        }


        return [];
    }


    /* =====================================================
       LOAD PATIENTS
    ====================================================== */

    function loadPatients() {

        const patients =
            getData(
                "daroLabuPatients",
                "patients"
            );

        const element =
            document.getElementById("totalPatients");

        if (element) {
            element.textContent = patients.length;
        }
    }


    /* =====================================================
       LOAD DOCTORS
    ====================================================== */

    function loadDoctors() {

        const doctors =
            getData(
                "daroLabuDoctors",
                "doctors"
            );

        const element =
            document.getElementById("totalDoctors");

        if (element) {
            element.textContent = doctors.length;
        }
    }


    /* =====================================================
       LOAD APPOINTMENTS
    ====================================================== */

    function loadAppointments() {

        const appointments =
            getData(
                "daroLabuAppointments",
                "appointments"
            );

        const element =
            document.getElementById("totalAppointments");

        if (element) {
            element.textContent = appointments.length;
        }
    }


    /* =====================================================
       LOAD REVENUE
    ====================================================== */

    function loadRevenue() {

        const invoices =
            getData(
                "daroLabuInvoices",
                "invoices"
            );


        const payments =
            getData(
                "daroLabuPayments",
                "payments"
            );


        let revenue = 0;


        /* -----------------------------------------------
           First try payment history
        ------------------------------------------------ */

        if (payments.length > 0) {

            payments.forEach(function (payment) {

                const amount =
                    Number(payment.amount) || 0;

                revenue += amount;

            });

        } else {

            /* -------------------------------------------
               Otherwise use paid invoice amounts
            -------------------------------------------- */

            invoices.forEach(function (invoice) {

                if (
                    invoice.paymentStatus === "Paid" ||
                    invoice.status === "Paid"
                ) {

                    let amount =
                        Number(invoice.paidAmount);

                    if (isNaN(amount)) {

                        amount =
                            Number(invoice.total) || 0;

                    }

                    revenue += amount;

                }

            });

        }


        const element =
            document.getElementById("totalRevenue");


        if (element) {

            element.textContent =
                revenue.toLocaleString(
                    "en-US",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                ) + " ETB";

        }

    }


    /* =====================================================
       HOSPITAL SETTINGS
    ====================================================== */

    function loadHospitalSettings() {

        try {

            const settings =
                JSON.parse(
                    localStorage.getItem("hospitalSettings")
                    || "{}"
                );


            const hospitalName =
                document.getElementById("hospitalName");


            if (
                hospitalName &&
                settings.name
            ) {

                hospitalName.textContent =
                    settings.name;

            }

        } catch (error) {

            console.error(
                "Unable to load hospital settings:",
                error
            );

        }

    }


    /* =====================================================
       CURRENT YEAR
    ====================================================== */

    const year =
        document.getElementById("currentYear");


    if (year) {
        year.textContent =
            new Date().getFullYear();
    }


    /* =====================================================
       MOBILE SIDEBAR
    ====================================================== */

    const sidebar =
        document.getElementById("sidebar");

    const menuToggle =
        document.getElementById("menuToggle");

    const sidebarOverlay =
        document.getElementById("sidebarOverlay");


    function openSidebar() {

        if (sidebar) {
            sidebar.classList.add("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("show");
        }

    }


    function closeSidebar() {

        if (sidebar) {
            sidebar.classList.remove("open");
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("show");
        }

    }


    if (menuToggle) {

        menuToggle.addEventListener(
            "click",
            function () {

                if (
                    sidebar &&
                    sidebar.classList.contains("open")
                ) {

                    closeSidebar();

                } else {

                    openSidebar();

                }

            }
        );

    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );

    }


    /* =====================================================
       CLOSE MOBILE SIDEBAR AFTER CLICK
    ====================================================== */

    const menuLinks =
        document.querySelectorAll(".menu-link");


    menuLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                if (
                    window.innerWidth <= 800
                ) {

                    closeSidebar();

                }

            }
        );

    });


    /* =====================================================
       LOGOUT
    ====================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) {
                    return;
                }


                if (
                    typeof logoutUser === "function"
                ) {

                    logoutUser();

                } else {

                    localStorage.removeItem("loggedIn");
                    localStorage.removeItem("username");
                    localStorage.removeItem("role");
                    localStorage.removeItem("currentUser");
                    localStorage.removeItem("userRole");

                    window.location.href =
                        "login.html";

                }

            }
        );

    }


    /* =====================================================
       LOAD DASHBOARD DATA
    ====================================================== */

    loadPatients();

    loadDoctors();

    loadAppointments();

    loadRevenue();

    loadHospitalSettings();


    /* =====================================================
       REFRESH DATA WHEN TAB BECOMES ACTIVE
    ====================================================== */

    window.addEventListener(
        "storage",
        function () {

            loadPatients();
            loadDoctors();
            loadAppointments();
            loadRevenue();
            loadHospitalSettings();

        }
    );


});