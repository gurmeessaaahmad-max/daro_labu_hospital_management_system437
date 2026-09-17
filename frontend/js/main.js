/* =========================================================
   DARO LABU HOSPITAL
   COMMON SYSTEM JAVASCRIPT
========================================================= */


/* =========================================================
   PAGE READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        protectPage();

        initializeUserInformation();

        initializeSidebar();

        initializeActiveMenu();

        initializeLogout();

        initializeDate();

        initializeYear();

        initializeDashboard();

        initializeRolePermissions();

    }
);


/* =========================================================
   AUTHENTICATION
========================================================= */

function isLoggedIn() {

    const localLogin =
        localStorage.getItem("loggedIn");

    const sessionLogin =
        sessionStorage.getItem("loggedIn");

    return (
        localLogin === "true" ||
        sessionLogin === "true"
    );

}


/* =========================================================
   GET USER
========================================================= */

function getCurrentUser() {

    try {

        const storedUser =
            localStorage.getItem("currentUser");

        if (storedUser) {

            return JSON.parse(storedUser);

        }

    } catch (error) {

        console.error(
            "Unable to read current user:",
            error
        );

    }


    /*
       Compatibility with the existing
       project data.
    */

    const username =
        localStorage.getItem("username") ||
        sessionStorage.getItem("username");

    const role =
        localStorage.getItem("role") ||
        sessionStorage.getItem("role");

    const roleKey =
        localStorage.getItem("roleKey") ||
        sessionStorage.getItem("roleKey") ||
        localStorage.getItem("userRole");


    if (!username && !role) {

        return null;

    }


    return {

        username:
            username || "User",

        name:
            username || "User",

        role:
            role || "Staff",

        roleKey:
            roleKey || "staff"

    };

}


/* =========================================================
   GET ROLE
========================================================= */

function getCurrentRole() {

    const user =
        getCurrentUser();

    if (user && user.roleKey) {

        return String(
            user.roleKey
        ).toLowerCase();

    }


    return (
        localStorage.getItem("roleKey") ||
        localStorage.getItem("userRole") ||
        ""
    ).toLowerCase();

}


/* =========================================================
   PROTECT PAGE
========================================================= */

function protectPage() {

    const path =
        window.location.pathname
            .toLowerCase();


    /*
       Login page does not need protection.
    */

    if (
        path.endsWith("/login.html") ||
        path.endsWith("login.html")
    ) {

        return true;

    }


    if (!isLoggedIn()) {

        window.location.href =
            getLoginPath();

        return false;

    }


    return true;

}


/* =========================================================
   LOGIN PATH
========================================================= */

function getLoginPath() {

    const path =
        window.location.pathname
            .toLowerCase();


    const folderPages = [

        "/patients/",
        "/doctors/",
        "/appointments/",
        "/pharmacy/",
        "/laboratory/",
        "/billing/",
        "/reports/",
        "/settings/",
        "/prescriptions/",
        "/medical-records/"

    ];


    for (
        let i = 0;
        i < folderPages.length;
        i++
    ) {

        if (
            path.includes(
                folderPages[i]
            )
        ) {

            return "../login.html";

        }

    }


    return "login.html";

}


/* =========================================================
   DASHBOARD PATH
========================================================= */

function getDashboardPath() {

    const path =
        window.location.pathname
            .toLowerCase();


    const folderPages = [

        "/patients/",
        "/doctors/",
        "/appointments/",
        "/pharmacy/",
        "/laboratory/",
        "/billing/",
        "/reports/",
        "/settings/",
        "/prescriptions/",
        "/medical-records/"

    ];


    for (
        let i = 0;
        i < folderPages.length;
        i++
    ) {

        if (
            path.includes(
                folderPages[i]
            )
        ) {

            return "../dashboard.html";

        }

    }


    return "dashboard.html";

}


/* =========================================================
   USER INFORMATION
========================================================= */

function initializeUserInformation() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const name =
        user.name ||
        user.username ||
        "User";

    const role =
        user.role ||
        "Staff";


    const elements = {

        sidebarUsername:
            document.getElementById(
                "sidebarUsername"
            ),

        sidebarRole:
            document.getElementById(
                "sidebarRole"
            ),

        topUsername:
            document.getElementById(
                "topUsername"
            ),

        topRole:
            document.getElementById(
                "topRole"
            ),

        welcomeName:
            document.getElementById(
                "welcomeName"
            ),

        welcomeRole:
            document.getElementById(
                "welcomeRole"
            )

    };


    Object.keys(elements).forEach(
        function (key) {

            if (elements[key]) {

                if (
                    key.includes("Role")
                ) {

                    elements[key].textContent =
                        role;

                } else {

                    elements[key].textContent =
                        name;

                }

            }

        }
    );

}


/* =========================================================
   SIDEBAR
========================================================= */

function initializeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (
        !sidebar ||
        !menuToggle
    ) {

        return;

    }


    menuToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "open"
            );

            if (overlay) {

                overlay.classList.toggle(
                    "show"
                );

            }

        }
    );


    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                closeSidebar();

            }
        );

    }


    const links =
        sidebar.querySelectorAll(
            "a"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    if (
                        window.innerWidth <=
                        700
                    ) {

                        closeSidebar();

                    }

                }
            );

        }
    );

}


/* =========================================================
   CLOSE SIDEBAR
========================================================= */

function closeSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (sidebar) {

        sidebar.classList.remove(
            "open"
        );

    }

    if (overlay) {

        overlay.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   ACTIVE MENU
========================================================= */

function initializeActiveMenu() {

    const currentPath =
        window.location.pathname
            .toLowerCase();


    const links =
        document.querySelectorAll(
            ".nav-item[data-module]"
        );


    links.forEach(
        function (link) {

            const module =
                link.dataset.module;

            if (!module) {
                return;
            }


            let active = false;


            if (
                module === "dashboard"
            ) {

                active =
                    currentPath.endsWith(
                        "/dashboard.html"
                    );

            } else {

                active =
                    currentPath.includes(
                        "/" + module + "/"
                    );

            }


            link.classList.toggle(
                "active",
                active
            );

        }
    );

}


/* =========================================================
   LOGOUT
========================================================= */

function initializeLogout() {

    const logout =
        document.getElementById(
            "logoutBtn"
        );


    if (!logout) {
        return;
    }


    logout.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const confirmed =
                confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            logoutUser();

        }
    );

}


/* =========================================================
   LOGOUT USER
========================================================= */

function logoutUser() {

    /*
       Authentication only.
       Hospital records are NOT deleted.
    */

    localStorage.removeItem(
        "loggedIn"
    );

    localStorage.removeItem(
        "currentUser"
    );

    localStorage.removeItem(
        "username"
    );

    localStorage.removeItem(
        "role"
    );

    localStorage.removeItem(
        "roleKey"
    );

    localStorage.removeItem(
        "userRole"
    );


    sessionStorage.removeItem(
        "loggedIn"
    );

    sessionStorage.removeItem(
        "currentUser"
    );

    sessionStorage.removeItem(
        "username"
    );

    sessionStorage.removeItem(
        "role"
    );

    sessionStorage.removeItem(
        "roleKey"
    );


    window.location.href =
        getLoginPath();

}


/* =========================================================
   DATE
========================================================= */

function initializeDate() {

    const element =
        document.getElementById(
            "currentDate"
        );


    if (!element) {
        return;
    }


    const today =
        new Date();


    element.textContent =
        today.toLocaleDateString(
            "en-US",
            {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

}


/* =========================================================
   YEAR
========================================================= */

function initializeYear() {

    const year =
        new Date().getFullYear();


    const element =
        document.getElementById(
            "currentYear"
        );


    if (element) {

        element.textContent =
            year;

    }

}


/* =========================================================
   STORAGE
========================================================= */

function getStorageData(
    key,
    defaultValue = []
) {

    try {

        const value =
            localStorage.getItem(
                key
            );


        if (!value) {

            return defaultValue;

        }


        const parsed =
            JSON.parse(value);


        return parsed;

    } catch (error) {

        console.error(
            "Storage error:",
            error
        );

        return defaultValue;

    }

}


/* =========================================================
   NUMBER
========================================================= */

function formatNumber(
    number
) {

    return Number(
        number || 0
    ).toLocaleString(
        "en-US"
    );

}


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
    amount
) {

    return Number(
        amount || 0
    ).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );

}


/* =========================================================
   DASHBOARD
========================================================= */

function initializeDashboard() {

    const dashboard =
        document.querySelector(
            ".app-layout"
        );


    if (!dashboard) {
        return;
    }


    updateDashboardStatistics();

    loadTodayAppointments();

    updateNotifications();

}


/* =========================================================
   GET ARRAY LENGTH
========================================================= */

function getArrayLength(
    key
) {

    const data =
        getStorageData(
            key,
            []
        );


    if (Array.isArray(data)) {

        return data.length;

    }


    if (
        data &&
        typeof data === "object"
    ) {

        return Object.keys(
            data
        ).length;

    }


    return 0;

}


/* =========================================================
   DASHBOARD STATISTICS
========================================================= */

function updateDashboardStatistics() {

    /*
       These keys match the existing
       patient and doctor modules.
    */

    const patients =
        getStorageData(
            "patients",
            []
        );


    const doctors =
        getStorageData(
            "doctors",
            []
        );


    const appointments =
        getStorageData(
            "appointments",
            []
        );


    const prescriptions =
        getStorageData(
            "prescriptions",
            []
        );


    const medicalRecords =
        getStorageData(
            "medicalRecords",
            []
        );


    const patientCount =
        Array.isArray(patients)
            ? patients.length
            : 0;


    const doctorCount =
        Array.isArray(doctors)
            ? doctors.length
            : 0;


    const appointmentCount =
        Array.isArray(appointments)
            ? appointments.length
            : 0;


    const prescriptionCount =
        Array.isArray(prescriptions)
            ? prescriptions.length
            : 0;


    const recordCount =
        Array.isArray(medicalRecords)
            ? medicalRecords.length
            : 0;


    setText(
        "totalPatients",
        formatNumber(patientCount)
    );

    setText(
        "totalDoctors",
        formatNumber(doctorCount)
    );


    setText(
        "overviewPatients",
        formatNumber(patientCount)
    );

    setText(
        "overviewDoctors",
        formatNumber(doctorCount)
    );

    setText(
        "overviewAppointments",
        formatNumber(appointmentCount)
    );

    setText(
        "overviewPrescriptions",
        formatNumber(prescriptionCount)
    );

    setText(
        "overviewRecords",
        formatNumber(recordCount)
    );


    /*
       Today's appointments
    */

    const todayAppointments =
        getTodayAppointments(
            appointments
        );


    setText(
        "todayAppointments",
        formatNumber(
            todayAppointments.length
        )
    );


    /*
       Revenue
    */

    const revenue =
        calculateTodayRevenue();


    setText(
        "todayRevenue",
        formatCurrency(revenue)
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


/* =========================================================
   TODAY APPOINTMENTS
========================================================= */

function getTodayAppointments(
    appointments
) {

    if (
        !Array.isArray(
            appointments
        )
    ) {

        return [];

    }


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        today.getMonth();


    const day =
        today.getDate();


    return appointments.filter(
        function (appointment) {

            const dateValue =
                appointment.date ||
                appointment.appointmentDate ||
                appointment.createdAt;


            if (!dateValue) {

                return false;

            }


            const date =
                new Date(
                    dateValue
                );


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return false;

            }


            return (
                date.getFullYear() === year &&
                date.getMonth() === month &&
                date.getDate() === day
            );

        }
    );

}


/* =========================================================
   LOAD APPOINTMENTS
========================================================= */

function loadTodayAppointments() {

    const container =
        document.getElementById(
            "appointmentsList"
        );


    if (!container) {
        return;
    }


    const appointments =
        getStorageData(
            "appointments",
            []
        );


    const today =
        getTodayAppointments(
            appointments
        );


    if (
        today.length === 0
    ) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="fa-regular fa-calendar-xmark"></i>

                <strong>
                    No appointments today
                </strong>

                <span>
                    New appointments will appear here.
                </span>

            </div>

        `;

        return;

    }


    /*
       Display maximum 5.
    */

    const displayAppointments =
        today.slice(0, 5);


    container.innerHTML =
        displayAppointments
            .map(
                function (
                    appointment,
                    index
                ) {

                    return createAppointmentRow(
                        appointment,
                        index
                    );

                }
            )
            .join("");

}


/* =========================================================
   CREATE APPOINTMENT ROW
========================================================= */

function createAppointmentRow(
    appointment,
    index
) {

    const patientName =
        appointment.patientName ||
        appointment.patient ||
        appointment.name ||
        "Patient";


    const doctorName =
        appointment.doctorName ||
        appointment.doctor ||
        "Doctor";


    const department =
        appointment.department ||
        appointment.reason ||
        "Hospital appointment";


    const status =
        String(
            appointment.status ||
            "Pending"
        );


    const time =
        appointment.time ||
        appointment.appointmentTime ||
        "--:--";


    const initials =
        getInitials(
            patientName
        );


    const avatarClasses = [
        "blue",
        "purple",
        "green"
    ];


    const avatar =
        avatarClasses[
            index %
            avatarClasses.length
        ];


    const statusClass =
        status
            .toLowerCase()
            .replace(
                /\s+/g,
                "-"
            );


    return `

        <div class="appointment-row">

            <div class="appointment-time">

                <strong>
                    ${escapeHTML(time)}
                </strong>

                <span>
                    TIME
                </span>

            </div>


            <div class="patient-avatar ${avatar}">

                ${escapeHTML(initials)}

            </div>


            <div class="appointment-patient">

                <strong>
                    ${escapeHTML(patientName)}
                </strong>

                <span>
                    ${escapeHTML(department)}
                    ${doctorName !== "Doctor"
                        ? " • " + escapeHTML(doctorName)
                        : ""
                    }
                </span>

            </div>


            <span class="status ${statusClass}">

                ${escapeHTML(status)}

            </span>

        </div>

    `;

}


/* =========================================================
   INITIALS
========================================================= */

function getInitials(
    name
) {

    if (!name) {
        return "P";
    }


    const words =
        String(name)
            .trim()
            .split(/\s+/);


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }


    return (
        words[0][0] +
        words[1][0]
    ).toUpperCase();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   REVENUE
========================================================= */

function calculateTodayRevenue() {

    const possibleKeys = [

        "payments",
        "invoices",
        "billing",
        "transactions"

    ];


    let total = 0;


    for (
        let i = 0;
        i < possibleKeys.length;
        i++
    ) {

        const data =
            getStorageData(
                possibleKeys[i],
                []
            );


        if (
            !Array.isArray(data)
        ) {

            continue;

        }


        data.forEach(
            function (item) {

                const dateValue =
                    item.date ||
                    item.paymentDate ||
                    item.createdAt ||
                    item.invoiceDate;


                if (!isToday(
                    dateValue
                )) {

                    return;

                }


                const status =
                    String(
                        item.status ||
                        "paid"
                    ).toLowerCase();


                if (
                    status !== "paid" &&
                    status !== "completed" &&
                    status !== "success"
                ) {

                    return;

                }


                const amount =
                    Number(
                        item.amount ||
                        item.paidAmount ||
                        item.total ||
                        item.grandTotal ||
                        0
                    );


                if (
                    !Number.isNaN(
                        amount
                    )
                ) {

                    total += amount;

                }

            }
        );


        /*
           Stop if payments
           already gave us data.
        */

        if (
            total > 0
        ) {

            break;

        }

    }


    return total;

}


/* =========================================================
   IS TODAY
========================================================= */

function isToday(
    dateValue
) {

    if (!dateValue) {

        return false;

    }


    const date =
        new Date(
            dateValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return false;

    }


    const today =
        new Date();


    return (
        date.getFullYear() ===
            today.getFullYear() &&

        date.getMonth() ===
            today.getMonth() &&

        date.getDate() ===
            today.getDate()
    );

}


/* =========================================================
   NOTIFICATIONS
========================================================= */

function updateNotifications() {

    const element =
        document.getElementById(
            "notificationCount"
        );


    if (!element) {
        return;
    }


    const appointments =
        getStorageData(
            "appointments",
            []
        );


    const today =
        getTodayAppointments(
            appointments
        );


    const pending =
        today.filter(
            function (item) {

                const status =
                    String(
                        item.status ||
                        "Pending"
                    ).toLowerCase();

                return (
                    status === "pending"
                );

            }
        ).length;


    element.textContent =
        Math.min(
            today.length + pending,
            99
        );

}


/* =========================================================
   ROLE PERMISSIONS
========================================================= */

function initializeRolePermissions() {

    const role =
        getCurrentRole();


    if (!role) {
        return;
    }


    /*
       Elements with data-roles
       are hidden when the user's
       role is not allowed.
    */

    const restrictedElements =
        document.querySelectorAll(
            "[data-roles]"
        );


    restrictedElements.forEach(
        function (element) {

            const roles =
                element.dataset.roles
                    .split(",")
                    .map(
                        function (item) {

                            return item
                                .trim()
                                .toLowerCase();

                        }
                    );


            if (
                !roles.includes(
                    role
                )
            ) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );


    /*
       Quick actions
    */

    const quickActions =
        document.querySelectorAll(
            "[data-quick-role]"
        );


    quickActions.forEach(
        function (element) {

            const roles =
                element.dataset.quickRole
                    .split(",")
                    .map(
                        function (item) {

                            return item
                                .trim()
                                .toLowerCase();

                        }
                    );


            if (
                !roles.includes(
                    role
                )
            ) {

                element.classList.add(
                    "hidden"
                );

            }

        }
    );


    /*
       Module cards
    */

    const modulePermissions = {

        patients:
            [
                "admin",
                "doctor",
                "reception",
                "pharmacy",
                "laboratory",
                "cashier"
            ],

        doctors:
            [
                "admin",
                "doctor",
                "reception"
            ],

        appointments:
            [
                "admin",
                "doctor",
                "reception"
            ],

        "medical-records":
            [
                "admin",
                "doctor",
                "reception"
            ],

        laboratory:
            [
                "admin",
                "doctor",
                "laboratory"
            ],

        pharmacy:
            [
                "admin",
                "doctor",
                "pharmacy"
            ],

        billing:
            [
                "admin",
                "cashier"
            ],

        reports:
            [
                "admin",
                "doctor",
                "reception",
                "pharmacy",
                "laboratory",
                "cashier"
            ]

    };


    const cards =
        document.querySelectorAll(
            "[data-module-card]"
        );


    cards.forEach(
        function (card) {

            const module =
                card.dataset.moduleCard;


            const allowed =
                modulePermissions[
                    module
                ] || [];


            if (
                !allowed.includes(
                    role
                )
            ) {

                card.classList.add(
                    "hidden"
                );

            }

        }
    );

}


/* =========================================================
   SAVE STORAGE
========================================================= */

function saveStorageData(
    key,
    data
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(
                data
            )
        );

        return true;

    } catch (error) {

        console.error(
            "Unable to save data:",
            error
        );

        return false;

    }

}


/* =========================================================
   GENERATE ID
========================================================= */

function generateID(
    prefix = "ID"
) {

    return (
        prefix +
        "-" +
        Date.now() +
        "-" +
        Math.floor(
            Math.random() * 1000
        )
    );

}


/* =========================================================
   CONFIRM DELETE
========================================================= */

function confirmDelete(
    name = "this item"
) {

    return confirm(
        "Are you sure you want to delete " +
        name +
        "?"
    );

}


/* =========================================================
   PRINT
========================================================= */

function printPage() {

    window.print();

}