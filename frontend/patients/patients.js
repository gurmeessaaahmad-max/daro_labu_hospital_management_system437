"use strict";

/* =========================================================
   DARO LABU HOSPITAL
   PATIENT MANAGEMENT SYSTEM
   FRONTEND + FLASK + MYSQL
   ========================================================= */


/* =========================================================
   BACKEND API
   ========================================================= */

const API_URL = "http://127.0.0.1:5000/api/patients";


/* =========================================================
   GLOBAL DATA
   ========================================================= */

let patients = [];


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", async function () {

    setupButtons();

    setupForm();

    setupSearch();

    await loadPatients();

});


/* =========================================================
   LOAD PATIENTS FROM MYSQL
   ========================================================= */

async function loadPatients() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "Backend returned status " + response.status
            );
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(
                data.message || "Unable to load patients."
            );
        }

        patients = data.patients || [];

        displayPatients();

        updateStatistics();

        console.log(
            "Patients loaded from MySQL:",
            patients
        );

    } catch (error) {

        console.error(
            "Unable to load patients:",
            error
        );

        patients = [];

        displayPatients();

        updateStatistics();

        alert(
            "Unable to connect to the hospital backend.\n\n" +
            "Please make sure Flask is running at:\n" +
            "http://127.0.0.1:5000"
        );
    }
}


/* =========================================================
   BUTTON SETUP
   ========================================================= */

function setupButtons() {

    const registerButton =
        document.getElementById("registerPatientButton");

    if (registerButton) {

        registerButton.addEventListener(
            "click",
            openPatientModal
        );
    }


    const emptyRegisterButton =
        document.getElementById("emptyRegisterButton");

    if (emptyRegisterButton) {

        emptyRegisterButton.addEventListener(
            "click",
            openPatientModal
        );
    }


    const closeButton =
        document.getElementById("closePatientModal");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closePatientModal
        );
    }


    const cancelButton =
        document.getElementById("cancelPatientButton");

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closePatientModal
        );
    }


    const closeDetailsButton =
        document.getElementById("closeDetailsModal");

    if (closeDetailsButton) {

        closeDetailsButton.addEventListener(
            "click",
            closeDetailsModal
        );
    }


    const logoutButton =
        document.getElementById("logoutButton");

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }


    const patientModal =
        document.getElementById("patientModal");

    if (patientModal) {

        patientModal.addEventListener(
            "click",
            function (event) {

                if (event.target === patientModal) {

                    closePatientModal();
                }

            }
        );
    }


    const detailsModal =
        document.getElementById("detailsModal");

    if (detailsModal) {

        detailsModal.addEventListener(
            "click",
            function (event) {

                if (event.target === detailsModal) {

                    closeDetailsModal();
                }

            }
        );
    }

}


/* =========================================================
   FORM SETUP
   ========================================================= */

function setupForm() {

    const form =
        document.getElementById("patientForm");

    if (!form) {

        console.error(
            "patientForm was not found."
        );

        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await registerPatient();

        }
    );

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById("patientSearch");

    if (!searchInput) {
        return;
    }


    searchInput.addEventListener(
        "input",
        function () {

            displayPatients(
                searchInput.value.trim()
            );

        }
    );

}


/* =========================================================
   OPEN PATIENT MODAL
   ========================================================= */

function openPatientModal() {

    const modal =
        document.getElementById("patientModal");

    if (!modal) {

        console.error(
            "patientModal was not found."
        );

        return;
    }


    modal.classList.add("show");

    document.body.classList.add(
        "modal-open"
    );


    const firstName =
        document.getElementById("firstName");

    if (firstName) {

        setTimeout(
            function () {

                firstName.focus();

            },
            100
        );
    }

}


/* =========================================================
   CLOSE PATIENT MODAL
   ========================================================= */

function closePatientModal() {

    const modal =
        document.getElementById("patientModal");

    if (!modal) {
        return;
    }


    modal.classList.remove("show");

    document.body.classList.remove(
        "modal-open"
    );


    const form =
        document.getElementById("patientForm");

    if (form) {

        form.reset();
    }

}


/* =========================================================
   REGISTER PATIENT
   ========================================================= */

async function registerPatient() {

    /* -----------------------------------------------------
       GET FORM VALUES
       ----------------------------------------------------- */

    const firstName =
        getValue("firstName");

    const middleName =
        getValue("middleName");

    const lastName =
        getValue("lastName");

    const gender =
        getValue("gender");

    const age =
        getValue("age");

    const dateOfBirth =
        getValue("dateOfBirth");

    const phone =
        getValue("phone");

    const bloodGroup =
        getValue("bloodGroup");

    const email =
        getValue("email");

    const status =
        getValue("status") || "Active";

    const address =
        getValue("address");

    const emergencyContact =
        getValue("emergencyContact");


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (!firstName) {

        alert(
            "Please enter the patient's first name."
        );

        focusElement("firstName");

        return;
    }


    if (!lastName) {

        alert(
            "Please enter the patient's last name."
        );

        focusElement("lastName");

        return;
    }


    if (!gender) {

        alert(
            "Please select the patient's gender."
        );

        focusElement("gender");

        return;
    }


    if (
        age === "" ||
        Number(age) < 0
    ) {

        alert(
            "Please enter a valid age."
        );

        focusElement("age");

        return;
    }


    if (!phone) {

        alert(
            "Please enter the patient's phone number."
        );

        focusElement("phone");

        return;
    }


    /* -----------------------------------------------------
       GENERATE PATIENT NUMBER
       ----------------------------------------------------- */

    const patientNumber =
        generatePatientNumber();


    /* -----------------------------------------------------
       CREATE DATA
       ----------------------------------------------------- */

    const patientData = {

        patient_number:
            patientNumber,

        first_name:
            firstName,

        middle_name:
            middleName || null,

        last_name:
            lastName,

        date_of_birth:
            dateOfBirth || null,

        gender:
            gender,

        phone:
            phone,

        email:
            email || null,

        address:
            address || null,

        emergency_contact_name:
            emergencyContact || null,

        emergency_contact_phone:
            null,

        blood_group:
            bloodGroup || null,

        marital_status:
            getValue("maritalStatus") || null,

        status:
            status

    };


    console.log(
        "Sending patient to backend:",
        patientData
    );


    /* -----------------------------------------------------
       SEND TO FLASK
       ----------------------------------------------------- */

    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            patientData
                        )
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                data.message ||
                "Failed to create patient."
            );
        }


        /* -------------------------------------------------
           SUCCESS
           ------------------------------------------------- */

        alert(
            "Patient registered successfully!\n\n" +
            "Patient Number: " +
            patientNumber
        );


        closePatientModal();


        await loadPatients();


        console.log(
            "Patient created successfully:",
            data
        );


    } catch (error) {

        console.error(
            "Error creating patient:",
            error
        );


        alert(
            "Failed to register patient.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   GENERATE PATIENT NUMBER
   ========================================================= */

function generatePatientNumber() {

    let highestNumber = 0;


    patients.forEach(
        function (patient) {

            const number =
                String(
                    patient.patient_number || ""
                );


            const match =
                number.match(
                    /DLH-(\d+)/
                );


            if (match) {

                const value =
                    parseInt(
                        match[1],
                        10
                    );


                if (
                    value > highestNumber
                ) {

                    highestNumber =
                        value;
                }

            }

        }
    );


    return (
        "DLH-" +
        String(
            highestNumber + 1
        ).padStart(
            4,
            "0"
        )
    );

}


/* =========================================================
   GET INPUT VALUE
   ========================================================= */

function getValue(elementID) {

    const element =
        document.getElementById(
            elementID
        );


    if (!element) {
        return "";
    }


    return element.value.trim();

}


/* =========================================================
   FOCUS ELEMENT
   ========================================================= */

function focusElement(elementID) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.focus();
    }

}


/* =========================================================
   DISPLAY PATIENTS
   ========================================================= */

function displayPatients(
    searchTerm = ""
) {

    const tableBody =
        document.getElementById(
            "patientsTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    /* -----------------------------------------------------
       SEARCH
       ----------------------------------------------------- */

    const search =
        searchTerm.toLowerCase();


    const filteredPatients =
        patients.filter(
            function (patient) {

                const firstName =
                    String(
                        patient.first_name || ""
                    );


                const middleName =
                    String(
                        patient.middle_name || ""
                    );


                const lastName =
                    String(
                        patient.last_name || ""
                    );


                const fullName =
                    (
                        firstName +
                        " " +
                        middleName +
                        " " +
                        lastName
                    )
                    .trim()
                    .toLowerCase();


                const patientNumber =
                    String(
                        patient.patient_number || ""
                    )
                    .toLowerCase();


                const phone =
                    String(
                        patient.phone || ""
                    )
                    .toLowerCase();


                return (
                    fullName.includes(search) ||
                    patientNumber.includes(search) ||
                    phone.includes(search)
                );

            }
        );


    /* -----------------------------------------------------
       EMPTY RESULT
       ----------------------------------------------------- */

    if (
        filteredPatients.length === 0
    ) {

        if (emptyState) {

            emptyState.style.display =
                "flex";
        }

        return;
    }


    if (emptyState) {

        emptyState.style.display =
            "none";
    }


    /* -----------------------------------------------------
       CREATE TABLE ROWS
       ----------------------------------------------------- */

    filteredPatients.forEach(
        function (patient) {

            const row =
                document.createElement("tr");


            const fullName =
                (
                    (patient.first_name || "") +
                    " " +
                    (patient.middle_name || "") +
                    " " +
                    (patient.last_name || "")
                )
                .trim();


            const patientID =
                patient.patient_number || "-";


            const gender =
                patient.gender || "-";


            const age =
                calculateAge(
                    patient.date_of_birth
                );


            const phone =
                patient.phone || "-";


            const bloodGroup =
                patient.blood_group || "-";


            const status =
                patient.status || "Active";


            row.innerHTML = `

                <td>
                    <span class="patient-id">
                        ${escapeHTML(patientID)}
                    </span>
                </td>


                <td>

                    <div class="patient-name">

                        <div class="patient-avatar">
                            ${getInitials(patient)}
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(fullName)}
                            </strong>

                        </div>

                    </div>

                </td>


                <td>
                    ${escapeHTML(gender)}
                </td>


                <td>
                    ${escapeHTML(String(age))}
                </td>


                <td>
                    ${escapeHTML(phone)}
                </td>


                <td>

                    <span class="blood-badge">
                        ${escapeHTML(bloodGroup)}
                    </span>

                </td>


                <td>

                    <span class="
                        status-badge
                        ${getStatusClass(status)}
                    ">

                        ${escapeHTML(status)}

                    </span>

                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            type="button"
                            class="action-button view-button"
                            title="View patient"
                            data-action="view"
                            data-id="${escapeHTML(
                                String(patient.patient_id)
                            )}"
                        >

                            <i class="fa-solid fa-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="action-button delete-button"
                            title="Delete patient"
                            data-action="delete"
                            data-id="${escapeHTML(
                                String(patient.patient_id)
                            )}"
                        >

                            <i class="fa-solid fa-trash"></i>

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        }
    );


    /* -----------------------------------------------------
       ACTION BUTTONS
       ----------------------------------------------------- */

    const actionButtons =
        tableBody.querySelectorAll(
            ".action-button"
        );


    actionButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const action =
                        button.dataset.action;


                    const id =
                        button.dataset.id;


                    if (
                        action === "view"
                    ) {

                        viewPatient(id);
                    }


                    if (
                        action === "delete"
                    ) {

                        await deletePatient(id);
                    }

                }
            );

        }
    );

}


/* =========================================================
   CALCULATE AGE
   ========================================================= */

function calculateAge(dateOfBirth) {

    if (!dateOfBirth) {
        return "-";
    }


    const birthDate =
        new Date(dateOfBirth);


    if (
        isNaN(
            birthDate.getTime()
        )
    ) {

        return "-";
    }


    const today =
        new Date();


    let age =
        today.getFullYear() -
        birthDate.getFullYear();


    const monthDifference =
        today.getMonth() -
        birthDate.getMonth();


    if (
        monthDifference < 0 ||
        (
            monthDifference === 0 &&
            today.getDate() <
            birthDate.getDate()
        )
    ) {

        age--;
    }


    return age >= 0
        ? age
        : "-";

}


/* =========================================================
   GET INITIALS
   ========================================================= */

function getInitials(patient) {

    const first =
        String(
            patient.first_name || ""
        ).trim();


    const last =
        String(
            patient.last_name || ""
        ).trim();


    let initials = "";


    if (first) {

        initials +=
            first.charAt(0);
    }


    if (last) {

        initials +=
            last.charAt(0);
    }


    if (!initials) {

        initials = "P";
    }


    return escapeHTML(
        initials.toUpperCase()
    );

}


/* =========================================================
   STATUS CLASS
   ========================================================= */

function getStatusClass(status) {

    switch (
        String(status || "")
            .toLowerCase()
    ) {

        case "active":
            return "status-active";

        case "admitted":
            return "status-admitted";

        case "discharged":
            return "status-discharged";

        case "inactive":
            return "status-inactive";

        default:
            return "status-active";
    }

}


/* =========================================================
   UPDATE STATISTICS
   ========================================================= */

function updateStatistics() {

    const total =
        patients.length;


    const active =
        patients.filter(
            function (patient) {

                return (
                    String(
                        patient.status || ""
                    ).toLowerCase() ===
                    "active"
                );

            }
        ).length;


    const admitted =
        patients.filter(
            function (patient) {

                return (
                    String(
                        patient.status || ""
                    ).toLowerCase() ===
                    "admitted"
                );

            }
        ).length;


    /*
       Today's Patients

       Your current patients table does not yet
       have a registration-date column.

       Therefore this remains 0 for now.
    */

    const todayPatients = 0;


    setText(
        "totalPatients",
        total
    );


    setText(
        "activePatients",
        active
    );


    setText(
        "admittedPatients",
        admitted
    );


    setText(
        "todayPatients",
        todayPatients
    );

}


/* =========================================================
   SET TEXT
   ========================================================= */

function setText(
    elementID,
    value
) {

    const element =
        document.getElementById(
            elementID
        );


    if (element) {

        element.textContent =
            value;
    }

}


/* =========================================================
   VIEW PATIENT
   ========================================================= */

function viewPatient(patientID) {

    const patient =
        patients.find(
            function (item) {

                return (
                    String(
                        item.patient_id
                    ) ===
                    String(patientID)
                );

            }
        );


    if (!patient) {

        alert(
            "Patient information was not found."
        );

        return;
    }


    const details =
        document.getElementById(
            "patientDetails"
        );


    const fullName =
        (
            (patient.first_name || "") +
            " " +
            (patient.middle_name || "") +
            " " +
            (patient.last_name || "")
        )
        .trim();


    const age =
        calculateAge(
            patient.date_of_birth
        );


    if (details) {

        details.innerHTML = `

            <div class="details-profile">

                <div class="large-avatar">
                    ${getInitials(patient)}
                </div>


                <div>

                    <h3>
                        ${escapeHTML(fullName)}
                    </h3>

                    <p>
                        ${escapeHTML(
                            patient.patient_number || "-"
                        )}
                    </p>

                </div>

            </div>


            <div class="details-grid">

                <div class="detail-item">

                    <span>Gender</span>

                    <strong>
                        ${escapeHTML(
                            patient.gender || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Age</span>

                    <strong>
                        ${escapeHTML(
                            String(age)
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Phone</span>

                    <strong>
                        ${escapeHTML(
                            patient.phone || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Blood Group</span>

                    <strong>
                        ${escapeHTML(
                            patient.blood_group || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Date of Birth</span>

                    <strong>
                        ${escapeHTML(
                            formatDate(
                                patient.date_of_birth
                            )
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Status</span>

                    <strong>
                        ${escapeHTML(
                            patient.status || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Email</span>

                    <strong>
                        ${escapeHTML(
                            patient.email || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <span>Marital Status</span>

                    <strong>
                        ${escapeHTML(
                            patient.marital_status || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item full-detail">

                    <span>Address</span>

                    <strong>
                        ${escapeHTML(
                            patient.address || "-"
                        )}
                    </strong>

                </div>


                <div class="detail-item full-detail">

                    <span>Emergency Contact</span>

                    <strong>
                        ${escapeHTML(
                            patient.emergency_contact_name || "-"
                        )}
                    </strong>

                </div>

            </div>

        `;
    }


    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (modal) {

        modal.classList.add("show");

        document.body.classList.add(
            "modal-open"
        );
    }

}


/* =========================================================
   FORMAT DATE
   ========================================================= */

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }


    const date =
        new Date(dateValue);


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return String(dateValue);
    }


    return date.toLocaleDateString();

}


/* =========================================================
   CLOSE DETAILS MODAL
   ========================================================= */

function closeDetailsModal() {

    const modal =
        document.getElementById(
            "detailsModal"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove("show");


    document.body.classList.remove(
        "modal-open"
    );

}


/* =========================================================
   DELETE PATIENT
   ========================================================= */

async function deletePatient(patientID) {

    const patient =
        patients.find(
            function (item) {

                return (
                    String(
                        item.patient_id
                    ) ===
                    String(patientID)
                );

            }
        );


    if (!patient) {

        alert(
            "Patient information was not found."
        );

        return;
    }


    const name =
        (
            (patient.first_name || "") +
            " " +
            (patient.middle_name || "") +
            " " +
            (patient.last_name || "")
        )
        .trim();


    /* -----------------------------------------------------
       CONFIRM DELETE
       ----------------------------------------------------- */

    const confirmed =
        confirm(
            "Are you sure you want to delete this patient?\n\n" +
            "Patient: " +
            name +
            "\n" +
            "Patient Number: " +
            (
                patient.patient_number || "-"
            ) +
            "\n\n" +
            "This action will permanently remove the patient from MySQL."
        );


    if (!confirmed) {
        return;
    }


    /* -----------------------------------------------------
       DELETE FROM MYSQL THROUGH FLASK
       ----------------------------------------------------- */

    try {

        const response =
            await fetch(
                API_URL +
                "/" +
                encodeURIComponent(
                    patient.patient_id
                ),
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.error ||
                data.message ||
                "Failed to delete patient."
            );
        }


        /* -------------------------------------------------
           SUCCESS
           ------------------------------------------------- */

        alert(
            "Patient deleted successfully!"
        );


        await loadPatients();


        console.log(
            "Patient deleted:",
            patient
        );


    } catch (error) {

        console.error(
            "Delete patient error:",
            error
        );


        alert(
            "Failed to delete patient.\n\n" +
            error.message
        );

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    const confirmed =
        confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    window.location.href =
        "../login/login.html";

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    const text =
        String(
            value ?? ""
        );


    return text
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
   KEYBOARD SUPPORT
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closePatientModal();

            closeDetailsModal();
        }

    }
);