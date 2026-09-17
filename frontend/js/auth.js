/* =========================================================
   DARO LABU HOSPITAL MANAGEMENT SYSTEM
   CENTRAL AUTHENTICATION SYSTEM
   FRONTEND / LOCAL STORAGE VERSION
========================================================= */

"use strict";


/* =========================================================
   DEFAULT USERS
========================================================= */

const DEFAULT_USERS = [

    {
        id: "USR-001",
        username: "admin",
        password: "admin123",
        fullName: "System Administrator",
        role: "Admin",
        status: "Active"
    },

    {
        id: "USR-002",
        username: "doctor",
        password: "doctor123",
        fullName: "Hospital Doctor",
        role: "Doctor",
        status: "Active"
    },

    {
        id: "USR-003",
        username: "nurse",
        password: "nurse123",
        fullName: "Hospital Nurse",
        role: "Nurse",
        status: "Active"
    },

    {
        id: "USR-004",
        username: "pharmacy",
        password: "pharmacy123",
        fullName: "Pharmacy Staff",
        role: "Pharmacist",
        status: "Active"
    },

    {
        id: "USR-005",
        username: "laboratory",
        password: "lab123",
        fullName: "Laboratory Staff",
        role: "Laboratory",
        status: "Active"
    },

    {
        id: "USR-006",
        username: "cashier",
        password: "cashier123",
        fullName: "Billing Staff",
        role: "Cashier",
        status: "Active"
    },

    {
        id: "USR-007",
        username: "reception",
        password: "reception123",
        fullName: "Reception Staff",
        role: "Receptionist",
        status: "Active"
    },

    {
        id: "USR-008",
        username: "accountant",
        password: "accountant123",
        fullName: "Hospital Accountant",
        role: "Accountant",
        status: "Active"
    }

];


/* =========================================================
   STORAGE NAMES
========================================================= */

const AUTH_STORAGE = {

    users: "daroLabuUsers",

    loggedIn: "loggedIn",

    username: "username",

    role: "role",

    currentUser: "currentUser",

    userRole: "userRole",

    rememberedUsername: "rememberedUsername"

};


/* =========================================================
   ROLE PERMISSIONS
========================================================= */

const ROLE_PERMISSIONS = {

    Admin: [
        "dashboard",
        "patients",
        "doctors",
        "appointments",
        "medical-records",
        "laboratory",
        "prescriptions",
        "pharmacy",
        "billing",
        "payments",
        "reports",
        "users",
        "settings"
    ],

    Doctor: [
        "dashboard",
        "patients",
        "appointments",
        "medical-records",
        "laboratory",
        "prescriptions"
    ],

    Nurse: [
        "dashboard",
        "patients",
        "appointments",
        "medical-records"
    ],

    Pharmacist: [
        "dashboard",
        "patients",
        "prescriptions",
        "pharmacy"
    ],

    Laboratory: [
        "dashboard",
        "patients",
        "laboratory"
    ],

    Cashier: [
        "dashboard",
        "patients",
        "billing",
        "payments"
    ],

    Receptionist: [
        "dashboard",
        "patients",
        "doctors",
        "appointments"
    ],

    Accountant: [
        "dashboard",
        "billing",
        "payments",
        "reports"
    ]

};


/* =========================================================
   INITIALIZE USERS
========================================================= */

function initializeUsers() {

    const savedUsers =
        localStorage.getItem(AUTH_STORAGE.users);

    if (!savedUsers) {

        localStorage.setItem(
            AUTH_STORAGE.users,
            JSON.stringify(DEFAULT_USERS)
        );

        return DEFAULT_USERS;
    }

    try {

        const users = JSON.parse(savedUsers);

        if (!Array.isArray(users)) {

            localStorage.setItem(
                AUTH_STORAGE.users,
                JSON.stringify(DEFAULT_USERS)
            );

            return DEFAULT_USERS;
        }

        return users;

    } catch (error) {

        localStorage.setItem(
            AUTH_STORAGE.users,
            JSON.stringify(DEFAULT_USERS)
        );

        return DEFAULT_USERS;
    }
}


/* =========================================================
   GET ALL USERS
========================================================= */

function getAllUsers() {

    return initializeUsers();

}


/* =========================================================
   SAVE USERS
========================================================= */

function saveAllUsers(users) {

    if (!Array.isArray(users)) {
        return false;
    }

    localStorage.setItem(
        AUTH_STORAGE.users,
        JSON.stringify(users)
    );

    return true;
}


/* =========================================================
   LOGIN USER
========================================================= */

function loginUser(username, password) {

    initializeUsers();

    const cleanUsername =
        String(username || "")
            .trim()
            .toLowerCase();

    const cleanPassword =
        String(password || "");

    if (!cleanUsername || !cleanPassword) {

        return {
            success: false,
            message: "Please enter your username and password."
        };
    }


    const users = getAllUsers();

    const user = users.find(function (item) {

        return (
            String(item.username).toLowerCase() === cleanUsername &&
            String(item.password) === cleanPassword
        );

    });


    if (!user) {

        return {
            success: false,
            message: "Invalid username or password."
        };
    }


    if (
        user.status &&
        String(user.status).toLowerCase() !== "active"
    ) {

        return {
            success: false,
            message: "This account is inactive. Please contact the administrator."
        };
    }


    const safeUser = {

        id: user.id,

        username: user.username,

        fullName:
            user.fullName ||
            user.username,

        role:
            user.role ||
            "User",

        status:
            user.status ||
            "Active"

    };


    localStorage.setItem(
        AUTH_STORAGE.loggedIn,
        "true"
    );

    localStorage.setItem(
        AUTH_STORAGE.username,
        safeUser.username
    );

    localStorage.setItem(
        AUTH_STORAGE.role,
        safeUser.role
    );

    localStorage.setItem(
        AUTH_STORAGE.userRole,
        safeUser.role
    );

    localStorage.setItem(
        AUTH_STORAGE.currentUser,
        JSON.stringify(safeUser)
    );


    return {

        success: true,

        user: safeUser,

        message: "Login successful."

    };

}


/* =========================================================
   CHECK LOGIN
========================================================= */

function isLoggedIn() {

    return (
        localStorage.getItem(
            AUTH_STORAGE.loggedIn
        ) === "true"
    );

}


/* =========================================================
   GET CURRENT USER
========================================================= */

function getAuthenticatedUser() {

    try {

        const saved =
            localStorage.getItem(
                AUTH_STORAGE.currentUser
            );

        if (saved) {

            return JSON.parse(saved);

        }

    } catch (error) {

        console.error(
            "Unable to read current user.",
            error
        );

    }


    if (!isLoggedIn()) {
        return null;
    }


    return {

        username:
            localStorage.getItem(
                AUTH_STORAGE.username
            ) || "",

        role:
            localStorage.getItem(
                AUTH_STORAGE.role
            ) || "User",

        fullName:
            localStorage.getItem(
                AUTH_STORAGE.username
            ) || "User"

    };

}


/* =========================================================
   GET ROLE
========================================================= */

function getAuthenticatedRole() {

    const user =
        getAuthenticatedUser();

    if (!user) {
        return "";
    }

    return user.role || "";

}


/* =========================================================
   GET USER PERMISSIONS
========================================================= */

function getUserPermissions() {

    const role =
        getAuthenticatedRole();

    return ROLE_PERMISSIONS[role] || [];

}


/* =========================================================
   CHECK PERMISSION
========================================================= */

function hasPermission(moduleName) {

    const role =
        getAuthenticatedRole();

    if (role === "Admin") {
        return true;
    }

    const permissions =
        ROLE_PERMISSIONS[role] || [];

    return permissions.includes(moduleName);

}


/* =========================================================
   GET PAGE PATH
========================================================= */

function getPagePath(moduleName) {

    const pages = {

        dashboard:
            "dashboard.html",

        patients:
            "patients/patients.html",

        doctors:
            "doctors/doctors.html",

        appointments:
            "appointments/appointments.html",

        "medical-records":
            "medical-records/medical-records.html",

        laboratory:
            "laboratory/laboratory.html",

        prescriptions:
            "prescriptions/prescriptions.html",

        pharmacy:
            "pharmacy/pharmacy.html",

        billing:
            "billing/billing.html",

        payments:
            "billing/payment.html",

        reports:
            "reports/reports.html",

        users:
            "users/users.html",

        settings:
            "settings/settings.html"

    };

    return pages[moduleName] || null;

}


/* =========================================================
   GET DASHBOARD PATH
========================================================= */

function getDashboardPath() {

    return "dashboard.html";

}


/* =========================================================
   LOGOUT
========================================================= */

function logoutUser() {

    localStorage.removeItem(
        AUTH_STORAGE.loggedIn
    );

    localStorage.removeItem(
        AUTH_STORAGE.username
    );

    localStorage.removeItem(
        AUTH_STORAGE.role
    );

    localStorage.removeItem(
        AUTH_STORAGE.userRole
    );

    localStorage.removeItem(
        AUTH_STORAGE.currentUser
    );

    window.location.href =
        getLoginPath();

}


/* =========================================================
   GET LOGIN PATH
========================================================= */

function getLoginPath() {

    const currentPath =
        window.location.pathname;

    if (
        currentPath.includes("/patients/") ||
        currentPath.includes("/doctors/") ||
        currentPath.includes("/appointments/") ||
        currentPath.includes("/laboratory/") ||
        currentPath.includes("/pharmacy/") ||
        currentPath.includes("/prescriptions/") ||
        currentPath.includes("/medical-records/") ||
        currentPath.includes("/billing/") ||
        currentPath.includes("/reports/") ||
        currentPath.includes("/settings/") ||
        currentPath.includes("/users/")
    ) {

        return "../login.html";
    }

    return "login.html";

}


/* =========================================================
   REQUIRE LOGIN
========================================================= */

function requireLogin() {

    if (!isLoggedIn()) {

        window.location.href =
            getLoginPath();

        return false;
    }

    return true;

}


/* =========================================================
   REQUIRE PERMISSION
========================================================= */

function requirePermission(moduleName) {

    if (!requireLogin()) {
        return false;
    }


    if (!hasPermission(moduleName)) {

        alert(
            "You do not have permission to access this module."
        );

        window.location.href =
            getDashboardPath();

        return false;
    }

    return true;

}


/* =========================================================
   DISPLAY CURRENT USER
========================================================= */

function displayCurrentUser() {

    const user =
        getAuthenticatedUser();

    if (!user) {
        return;
    }


    const usernameElements =
        document.querySelectorAll(
            "[data-current-username]"
        );

    usernameElements.forEach(function (element) {

        element.textContent =
            user.username || "";

    });


    const nameElements =
        document.querySelectorAll(
            "[data-current-user]"
        );

    nameElements.forEach(function (element) {

        element.textContent =
            user.fullName ||
            user.username ||
            "User";

    });


    const roleElements =
        document.querySelectorAll(
            "[data-current-role]"
        );

    roleElements.forEach(function (element) {

        element.textContent =
            user.role || "";

    });

}


/* =========================================================
   SETUP LOGOUT BUTTON
========================================================= */

function setupLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, .logout-button, [data-logout]"
        );


    logoutButtons.forEach(function (button) {

        if (button.dataset.logoutReady === "true") {
            return;
        }

        button.dataset.logoutReady = "true";


        button.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                logoutUser();

            }
        );

    });

}


/* =========================================================
   ROLE-BASED MENU
========================================================= */

function setupRoleMenu() {

    if (!isLoggedIn()) {
        return;
    }


    const moduleElements =
        document.querySelectorAll(
            "[data-module]"
        );


    moduleElements.forEach(function (element) {

        const moduleName =
            element.dataset.module;

        if (!hasPermission(moduleName)) {

            element.style.display =
                "none";

        }

    });

}


/* =========================================================
   PROTECT CURRENT PAGE
========================================================= */

function protectPage(moduleName) {

    if (!requirePermission(moduleName)) {
        return false;
    }

    displayCurrentUser();

    setupLogout();

    setupRoleMenu();

    return true;

}


/* =========================================================
   DOCUMENT READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeUsers();

        displayCurrentUser();

        setupLogout();

        setupRoleMenu();

    }
);