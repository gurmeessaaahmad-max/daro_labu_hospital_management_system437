/* =========================================================
   DARO LABU HOSPITAL
   DOCTORS MANAGEMENT
   FLASK + MYSQL
   COMPLETE JAVASCRIPT
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       API
    ===================================================== */

    const API_URL = "http://127.0.0.1:5000/api";


    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const addDoctorButton = document.getElementById("openDoctorModal");
    const doctorModal = document.getElementById("doctorModal");
    const closeDoctorModal = document.getElementById("closeDoctorModal");
    const cancelDoctor = document.getElementById("cancelDoctor");

    const doctorForm = document.getElementById("doctorForm");

    const doctorGrid = document.getElementById("doctorGrid");
    const doctorSearch = document.getElementById("doctorSearch");
    const departmentFilter = document.getElementById("departmentFilter");

    const doctorLoading = document.getElementById("doctorLoading");
    const doctorError = document.getElementById("doctorError");
    const doctorErrorMessage = document.getElementById("doctorErrorMessage");
    const doctorEmpty = document.getElementById("doctorEmpty");

    const retryDoctors = document.getElementById("retryDoctors");

    const doctorTotal = document.getElementById("doctorTotal");
    const generalMedicineTotal = document.getElementById("generalMedicineTotal");
    const specialistTotal = document.getElementById("specialistTotal");
    const availableTotal = document.getElementById("availableTotal");

    const doctorCount = document.getElementById("doctorCount");

    const doctorFormMessage = document.getElementById("doctorFormMessage");

    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");
    const sidebarOverlay = document.getElementById("sidebarOverlay");

    const logoutBtn = document.getElementById("logoutBtn");

    const doctorModalTitle = document.getElementById("doctorModalTitle");
    const doctorModalDescription = document.getElementById("doctorModalDescription");
    const saveDoctorText = document.getElementById("saveDoctorText");


    /* =====================================================
       DATA
    ===================================================== */

    let doctors = [];


    /* =====================================================
       START
    ===================================================== */

    initialize();


    async function initialize() {

        console.log("Doctors module started.");

        setupEvents();

        displayUserInformation();

        await loadDepartments();

        await loadDoctors();
    }


    /* =====================================================
       EVENTS
    ===================================================== */

    function setupEvents() {

        /* Add Doctor */

        if (addDoctorButton) {

            addDoctorButton.addEventListener("click", function (event) {

                event.preventDefault();

                console.log("Add Doctor button clicked.");

                openDoctorModal();

            });

        } else {

            console.error(
                "ERROR: #openDoctorModal button was not found."
            );
        }


        /* Close button */

        if (closeDoctorModal) {

            closeDoctorModal.addEventListener(
                "click",
                closeDoctorModalWindow
            );
        }


        /* Cancel */

        if (cancelDoctor) {

            cancelDoctor.addEventListener(
                "click",
                closeDoctorModalWindow
            );
        }


        /* Click outside modal */

        if (doctorModal) {

            doctorModal.addEventListener("click", function (event) {

                if (event.target === doctorModal) {

                    closeDoctorModalWindow();

                }

            });

        }


        /* ESC */

        document.addEventListener("keydown", function (event) {

            if (event.key === "Escape") {

                closeDoctorModalWindow();

            }

        });


        /* Form submit */

        if (doctorForm) {

            doctorForm.addEventListener(
                "submit",
                handleDoctorSubmit
            );

        }


        /* Search */

        if (doctorSearch) {

            doctorSearch.addEventListener(
                "input",
                filterDoctors
            );

        }


        /* Department filter */

        if (departmentFilter) {

            departmentFilter.addEventListener(
                "change",
                filterDoctors
            );

        }


        /* Retry */

        if (retryDoctors) {

            retryDoctors.addEventListener(
                "click",
                loadDoctors
            );

        }


        /* Mobile menu */

        if (menuButton) {

            menuButton.addEventListener("click", function () {

                if (sidebar) {

                    sidebar.classList.toggle("open");

                }

                if (sidebarOverlay) {

                    sidebarOverlay.classList.toggle("show");

                }

            });

        }


        /* Mobile overlay */

        if (sidebarOverlay) {

            sidebarOverlay.addEventListener("click", function () {

                if (sidebar) {

                    sidebar.classList.remove("open");

                }

                sidebarOverlay.classList.remove("show");

            });

        }


        /* Logout */

        if (logoutBtn) {

            logoutBtn.addEventListener("click", function () {

                if (
                    confirm(
                        "Are you sure you want to logout?"
                    )
                ) {

                    localStorage.removeItem("loggedInUser");
                    localStorage.removeItem("user");
                    localStorage.removeItem("token");

                    window.location.href = "../login.html";

                }

            });

        }

    }


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openDoctorModal() {

        if (!doctorModal) {

            console.error(
                "ERROR: #doctorModal was not found."
            );

            return;
        }


        /* Reset form */

        if (doctorForm) {

            doctorForm.reset();

        }


        /* Clear hidden ID */

        const doctorId = document.getElementById("doctorId");

        if (doctorId) {

            doctorId.value = "";

        }


        /* Reset modal text */

        if (doctorModalTitle) {

            doctorModalTitle.textContent =
                "Add New Doctor";

        }


        if (doctorModalDescription) {

            doctorModalDescription.textContent =
                "Enter the doctor's information below.";

        }


        if (saveDoctorText) {

            saveDoctorText.textContent =
                "Save Doctor";

        }


        hideFormMessage();


        /* Show modal */

        doctorModal.classList.add("show");
        doctorModal.classList.add("active");

        doctorModal.style.display = "flex";

        doctorModal.setAttribute(
            "aria-hidden",
            "false"
        );


        /* Focus first field */

        setTimeout(function () {

            const firstName =
                document.getElementById(
                    "doctorFirstName"
                );

            if (firstName) {

                firstName.focus();

            }

        }, 100);

    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeDoctorModalWindow() {

        if (!doctorModal) {

            return;
        }


        doctorModal.classList.remove("show");
        doctorModal.classList.remove("active");

        doctorModal.style.display = "none";

        doctorModal.setAttribute(
            "aria-hidden",
            "true"
        );


        hideFormMessage();

    }


    /* =====================================================
       LOAD DEPARTMENTS
    ===================================================== */

    async function loadDepartments() {

        try {

            console.log(
                "Loading departments..."
            );


            const response = await fetch(
                `${API_URL}/departments`
            );


            if (!response.ok) {

                throw new Error(
                    "Failed to load departments."
                );

            }


            const data = await response.json();

            console.log(
                "Departments:",
                data
            );


            let departments = data;


            if (data.departments) {

                departments =
                    data.departments;

            }


            if (!Array.isArray(departments)) {

                departments = [];

            }


            populateDepartments(
                departments
            );


        } catch (error) {

            console.error(
                "Department loading error:",
                error
            );


            populateDepartments([]);

        }

    }


    /* =====================================================
       POPULATE DEPARTMENTS
    ===================================================== */

    function populateDepartments(
        departments
    ) {

        const departmentSelect =
            document.getElementById(
                "department"
            );


        if (departmentSelect) {

            departmentSelect.innerHTML =
                '<option value="">Select Department</option>';


            departments.forEach(function (department) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department.id ||
                    department.department_id;


                option.textContent =
                    department.name ||
                    department.department_name ||
                    department.department ||
                    "Department";


                departmentSelect.appendChild(
                    option
                );

            });

        }


        /* Filter */

        if (departmentFilter) {

            departmentFilter.innerHTML =
                '<option value="all">All Departments</option>';


            departments.forEach(function (department) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    department.id ||
                    department.department_id;


                option.textContent =
                    department.name ||
                    department.department_name ||
                    department.department ||
                    "Department";


                departmentFilter.appendChild(
                    option
                );

            });

        }

    }


    /* =====================================================
       LOAD DOCTORS
    ===================================================== */

    async function loadDoctors() {

        showLoading();

        hideError();


        try {

            console.log(
                "Loading doctors from MySQL..."
            );


            const response = await fetch(
                `${API_URL}/doctors`
            );


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const data =
                await response.json();


            console.log(
                "Doctors received:",
                data
            );


            if (Array.isArray(data)) {

                doctors = data;

            } else if (
                Array.isArray(data.doctors)
            ) {

                doctors = data.doctors;

            } else {

                doctors = [];

            }


            renderDoctors();

            updateStatistics();


        } catch (error) {

            console.error(
                "Doctor loading error:",
                error
            );


            doctors = [];

            showError(
                "Unable to load doctors. Make sure Flask and MySQL are running."
            );

        } finally {

            hideLoading();

        }

    }


    /* =====================================================
       RENDER DOCTORS
    ===================================================== */

    function renderDoctors() {

        if (!doctorGrid) {

            return;

        }


        doctorGrid.innerHTML = "";


        const filteredDoctors =
            getFilteredDoctors();


        if (filteredDoctors.length === 0) {

            doctorEmpty.style.display =
                "block";

            updateDoctorCount(0);

            return;

        }


        doctorEmpty.style.display =
            "none";


        filteredDoctors.forEach(function (doctor) {

            const card =
                createDoctorCard(
                    doctor
                );


            doctorGrid.appendChild(card);

        });


        updateDoctorCount(
            filteredDoctors.length
        );

    }


    /* =====================================================
       CREATE DOCTOR CARD
    ===================================================== */

    function createDoctorCard(
        doctor
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "doctor-card";


        const id =
            doctor.id ||
            doctor.doctor_id ||
            "";


        const firstName =
            doctor.first_name ||
            "";


        const middleName =
            doctor.middle_name ||
            "";


        const lastName =
            doctor.last_name ||
            "";


        const fullName =
            `${firstName} ${middleName} ${lastName}`
                .replace(/\s+/g, " ")
                .trim();


        const specialization =
            doctor.specialization ||
            doctor.specialty ||
            "General Medicine";


        const department =
            doctor.department_name ||
            doctor.department ||
            "Not assigned";


        const phone =
            doctor.phone ||
            "Not available";


        const email =
            doctor.email ||
            "Not available";


        const license =
            doctor.license_number ||
            doctor.licenseNumber ||
            "Not available";


        const status =
            doctor.status ||
            "Active";


        const isActive =
            String(status).toLowerCase() ===
            "active";


        card.innerHTML = `

            <div class="doctor-card-header">

                <div class="doctor-avatar">

                    <i class="fa-solid fa-user-doctor"></i>

                </div>

                <div class="doctor-status">

                    <span class="availability-dot ${
                        isActive
                            ? "active"
                            : "inactive"
                    }"></span>

                    ${escapeHtml(status)}

                </div>

            </div>


            <div class="doctor-card-body">

                <h3>
                    Dr. ${escapeHtml(fullName)}
                </h3>

                <p class="doctor-specialty">
                    ${escapeHtml(specialization)}
                </p>

                <div class="doctor-detail">

                    <i class="fa-solid fa-building"></i>

                    <span>
                        ${escapeHtml(department)}
                    </span>

                </div>

                <div class="doctor-detail">

                    <i class="fa-solid fa-phone"></i>

                    <span>
                        ${escapeHtml(phone)}
                    </span>

                </div>

                <div class="doctor-detail">

                    <i class="fa-solid fa-envelope"></i>

                    <span>
                        ${escapeHtml(email)}
                    </span>

                </div>

                <div class="doctor-detail">

                    <i class="fa-solid fa-id-card"></i>

                    <span>
                        ${escapeHtml(license)}
                    </span>

                </div>

            </div>


            <div class="doctor-card-footer">

                <button
                    type="button"
                    class="secondary-button view-doctor"
                    data-id="${id}"
                >

                    <i class="fa-solid fa-eye"></i>

                    View

                </button>


                <button
                    type="button"
                    class="delete-button delete-doctor"
                    data-id="${id}"
                >

                    <i class="fa-solid fa-trash"></i>

                    Delete

                </button>

            </div>

        `;


        const viewButton =
            card.querySelector(
                ".view-doctor"
            );


        if (viewButton) {

            viewButton.addEventListener(
                "click",
                function () {

                    viewDoctor(id);

                }
            );

        }


        const deleteButton =
            card.querySelector(
                ".delete-doctor"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                function () {

                    deleteDoctor(id);

                }
            );

        }


        return card;

    }


    /* =====================================================
       SUBMIT DOCTOR
    ===================================================== */

    async function handleDoctorSubmit(
        event
    ) {

        event.preventDefault();


        console.log(
            "Doctor form submitted."
        );


        const firstName =
            document.getElementById(
                "doctorFirstName"
            ).value.trim();


        const middleName =
            document.getElementById(
                "doctorMiddleName"
            ).value.trim();


        const lastName =
            document.getElementById(
                "doctorLastName"
            ).value.trim();


        const specialization =
            document.getElementById(
                "specialty"
            ).value.trim();


        const departmentId =
            document.getElementById(
                "department"
            ).value;


        const licenseNumber =
            document.getElementById(
                "licenseNumber"
            ).value.trim();


        const phone =
            document.getElementById(
                "doctorPhone"
            ).value.trim();


        const email =
            document.getElementById(
                "doctorEmail"
            ).value.trim();


        const status =
            document.getElementById(
                "doctorStatus"
            ).value;


        if (!firstName) {

            showFormMessage(
                "Please enter the doctor's first name.",
                "error"
            );

            return;

        }


        if (!lastName) {

            showFormMessage(
                "Please enter the doctor's last name.",
                "error"
            );

            return;

        }


        if (!departmentId) {

            showFormMessage(
                "Please select a department.",
                "error"
            );

            return;

        }


        if (!phone) {

            showFormMessage(
                "Please enter the doctor's phone number.",
                "error"
            );

            return;

        }


        const doctorData = {

            user_id: null,

            department_id:
                Number(departmentId),

            first_name:
                firstName,

            middle_name:
                middleName,

            last_name:
                lastName,

            specialization:
                specialization,

            license_number:
                licenseNumber,

            phone:
                phone,

            email:
                email,

            status:
                status

        };


        console.log(
            "Sending doctor data:",
            doctorData
        );


        setSaveButtonLoading(true);


        try {

            const response =
                await fetch(
                    `${API_URL}/doctors`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(
                                doctorData
                            )

                    }
                );


            const data =
                await response.json();


            console.log(
                "Server response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Failed to save doctor."
                );

            }


            showFormMessage(
                "Doctor added successfully!",
                "success"
            );


            setTimeout(function () {

                closeDoctorModalWindow();

                loadDoctors();

            }, 800);


        } catch (error) {

            console.error(
                "Save doctor error:",
                error
            );


            showFormMessage(
                error.message ||
                "Unable to save doctor.",
                "error"
            );

        } finally {

            setSaveButtonLoading(false);

        }

    }


    /* =====================================================
       VIEW DOCTOR
    ===================================================== */

    async function viewDoctor(
        id
    ) {

        if (!id) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/doctors/${id}`
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load doctor."
                );

            }


            const data =
                await response.json();


            const doctor =
                data.doctor ||
                data;


            alert(
                formatDoctorDetails(
                    doctor
                )
            );


        } catch (error) {

            console.error(
                error
            );


            alert(
                "Unable to load doctor information."
            );

        }

    }


    /* =====================================================
       FORMAT DOCTOR DETAILS
    ===================================================== */

    function formatDoctorDetails(
        doctor
    ) {

        const fullName =
            `${doctor.first_name || ""} ${
                doctor.middle_name || ""
            } ${
                doctor.last_name || ""
            }`
                .replace(/\s+/g, " ")
                .trim();


        return (

            "Doctor Information\n\n" +

            "Name: Dr. " +
            fullName +

            "\nSpecialization: " +
            (
                doctor.specialization ||
                "Not available"
            ) +

            "\nDepartment: " +
            (
                doctor.department_name ||
                doctor.department ||
                "Not available"
            ) +

            "\nPhone: " +
            (
                doctor.phone ||
                "Not available"
            ) +

            "\nEmail: " +
            (
                doctor.email ||
                "Not available"
            ) +

            "\nLicense: " +
            (
                doctor.license_number ||
                "Not available"
            ) +

            "\nStatus: " +
            (
                doctor.status ||
                "Active"
            )

        );

    }


    /* =====================================================
       DELETE DOCTOR
    ===================================================== */

    async function deleteDoctor(
        id
    ) {

        if (!id) {

            return;

        }


        const doctor =
            doctors.find(function (item) {

                return String(
                    item.id ||
                    item.doctor_id
                ) === String(id);

            });


        const name =
            doctor
                ? `${doctor.first_name || ""} ${
                    doctor.last_name || ""
                  }`.trim()
                : "this doctor";


        const confirmed =
            confirm(
                `Are you sure you want to delete Dr. ${name}?`
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/doctors/${id}`,
                    {

                        method: "DELETE"

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Unable to delete doctor."
                );

            }


            alert(
                "Doctor deleted successfully."
            );


            await loadDoctors();


        } catch (error) {

            console.error(
                "Delete doctor error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete doctor."
            );

        }

    }


    /* =====================================================
       SEARCH + FILTER
    ===================================================== */

    function filterDoctors() {

        renderDoctors();

    }


    function getFilteredDoctors() {

        const search =
            doctorSearch
                ? doctorSearch.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedDepartment =
            departmentFilter
                ? departmentFilter.value
                : "all";


        return doctors.filter(
            function (doctor) {

                const fullName =
                    `${doctor.first_name || ""} ${
                        doctor.middle_name || ""
                    } ${
                        doctor.last_name || ""
                    }`
                        .toLowerCase();


                const specialization =
                    (
                        doctor.specialization ||
                        doctor.specialty ||
                        ""
                    )
                        .toLowerCase();


                const phone =
                    (
                        doctor.phone ||
                        ""
                    )
                        .toLowerCase();


                const license =
                    (
                        doctor.license_number ||
                        ""
                    )
                        .toLowerCase();


                const departmentId =
                    String(
                        doctor.department_id ||
                        ""
                    );


                const departmentName =
                    (
                        doctor.department_name ||
                        doctor.department ||
                        ""
                    )
                        .toLowerCase();


                const matchesSearch =

                    !search ||

                    fullName.includes(
                        search
                    ) ||

                    specialization.includes(
                        search
                    ) ||

                    phone.includes(
                        search
                    ) ||

                    license.includes(
                        search
                    );


                const matchesDepartment =

                    selectedDepartment ===
                        "all" ||

                    departmentId ===
                        String(
                            selectedDepartment
                        ) ||

                    departmentName ===
                        String(
                            selectedDepartment
                        ).toLowerCase();


                return (
                    matchesSearch &&
                    matchesDepartment
                );

            }
        );

    }


    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatistics() {

        const total =
            doctors.length;


        const active =
            doctors.filter(
                function (doctor) {

                    return String(
                        doctor.status ||
                        "Active"
                    ).toLowerCase() ===
                    "active";

                }
            ).length;


        const generalMedicine =
            doctors.filter(
                function (doctor) {

                    const specialty =
                        (
                            doctor.specialization ||
                            doctor.specialty ||
                            ""
                        ).toLowerCase();


                    return (
                        specialty.includes(
                            "general"
                        ) ||
                        specialty.includes(
                            "medicine"
                        )
                    );

                }
            ).length;


        const specialists =
            doctors.filter(
                function (doctor) {

                    const specialty =
                        (
                            doctor.specialization ||
                            doctor.specialty ||
                            ""
                        ).toLowerCase();


                    return (
                        specialty !== "" &&
                        !specialty.includes(
                            "general medicine"
                        )
                    );

                }
            ).length;


        if (doctorTotal) {

            doctorTotal.textContent =
                total;

        }


        if (generalMedicineTotal) {

            generalMedicineTotal.textContent =
                generalMedicine;

        }


        if (specialistTotal) {

            specialistTotal.textContent =
                specialists;

        }


        if (availableTotal) {

            availableTotal.textContent =
                active;

        }

    }


    /* =====================================================
       DOCTOR COUNT
    ===================================================== */

    function updateDoctorCount(
        count
    ) {

        if (!doctorCount) {

            return;

        }


        doctorCount.textContent =
            `${count} Doctor${
                count === 1
                    ? ""
                    : "s"
            }`;

    }


    /* =====================================================
       LOADING
    ===================================================== */

    function showLoading() {

        if (doctorLoading) {

            doctorLoading.style.display =
                "flex";

        }

        if (doctorGrid) {

            doctorGrid.style.display =
                "none";

        }

        if (doctorEmpty) {

            doctorEmpty.style.display =
                "none";

        }

    }


    function hideLoading() {

        if (doctorLoading) {

            doctorLoading.style.display =
                "none";

        }

        if (doctorGrid) {

            doctorGrid.style.display =
                "grid";

        }

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function showError(
        message
    ) {

        if (doctorErrorMessage) {

            doctorErrorMessage.textContent =
                message;

        }

        if (doctorError) {

            doctorError.style.display =
                "flex";

        }

    }


    function hideError() {

        if (doctorError) {

            doctorError.style.display =
                "none";

        }

    }


    /* =====================================================
       FORM MESSAGE
    ===================================================== */

    function showFormMessage(
        message,
        type
    ) {

        if (!doctorFormMessage) {

            return;

        }


        doctorFormMessage.textContent =
            message;


        doctorFormMessage.className =
            `form-message ${type}`;


        doctorFormMessage.style.display =
            "block";

    }


    function hideFormMessage() {

        if (!doctorFormMessage) {

            return;

        }


        doctorFormMessage.style.display =
            "none";


        doctorFormMessage.textContent =
            "";

    }


    /* =====================================================
       SAVE BUTTON
    ===================================================== */

    function setSaveButtonLoading(
        loading
    ) {

        const button =
            document.getElementById(
                "saveDoctorButton"
            );


        if (!button) {

            return;

        }


        button.disabled =
            loading;


        if (loading) {

            if (saveDoctorText) {

                saveDoctorText.textContent =
                    "Saving...";

            }

        } else {

            if (saveDoctorText) {

                saveDoctorText.textContent =
                    "Save Doctor";

            }

        }

    }


    /* =====================================================
       USER INFORMATION
    ===================================================== */

    function displayUserInformation() {

        let user = null;


        try {

            user =
                JSON.parse(
                    localStorage.getItem(
                        "loggedInUser"
                    )
                );

        } catch (error) {

            user = null;

        }


        if (!user) {

            try {

                user =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        )
                    );

            } catch (error) {

                user = null;

            }

        }


        if (!user) {

            return;

        }


        const username =
            user.username ||
            user.name ||
            user.full_name ||
            "Administrator";


        const role =
            user.role ||
            "Admin";


        const sidebarUsername =
            document.getElementById(
                "sidebarUsername"
            );


        const sidebarRole =
            document.getElementById(
                "sidebarRole"
            );


        const topUsername =
            document.getElementById(
                "topUsername"
            );


        const topRole =
            document.getElementById(
                "topRole"
            );


        if (sidebarUsername) {

            sidebarUsername.textContent =
                username;

        }


        if (sidebarRole) {

            sidebarRole.textContent =
                role;

        }


        if (topUsername) {

            topUsername.textContent =
                username;

        }


        if (topRole) {

            topRole.textContent =
                role;

        }

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value == null
                ? ""
                : String(value);


        return div.innerHTML;

    }

});