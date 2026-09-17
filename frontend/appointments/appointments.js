/* =========================================================
   DARO LABU HOSPITAL
   APPOINTMENTS MANAGEMENT
   FLASK + MYSQL
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("======================================");
    console.log("Appointments JavaScript started");
    console.log("======================================");

    const API_URL = "http://127.0.0.1:5000/api";

    let appointments = [];
    let patients = [];
    let doctors = [];
    let editingAppointmentId = null;


    /* =====================================================
       GET HTML ELEMENTS
       ===================================================== */

    const addAppointmentBtn =
        document.getElementById("addAppointmentBtn");

    const appointmentModal =
        document.getElementById("appointmentModal");

    const closeAppointmentBtn =
        document.getElementById("closeAppointmentBtn");

    const cancelAppointmentBtn =
        document.getElementById("cancelAppointmentBtn");

    const appointmentForm =
        document.getElementById("appointmentForm");

    const appointmentId =
        document.getElementById("appointmentId");

    const patientSelect =
        document.getElementById("patientSelect");

    const doctorSelect =
        document.getElementById("doctorSelect");

    const department =
        document.getElementById("department");

    const departmentId =
        document.getElementById("departmentId");

    const appointmentDate =
        document.getElementById("appointmentDate");

    const appointmentTime =
        document.getElementById("appointmentTime");

    const appointmentStatus =
        document.getElementById("appointmentStatus");

    const reason =
        document.getElementById("reason");

    const notes =
        document.getElementById("notes");

    const saveAppointmentBtn =
        document.getElementById("saveAppointmentBtn");

    const searchAppointment =
        document.getElementById("searchAppointment");

    const statusFilter =
        document.getElementById("statusFilter");

    const appointmentsTableBody =
        document.getElementById("appointmentsTableBody");

    const emptyAppointments =
        document.getElementById("emptyAppointments");


    /* =====================================================
       CHECK IMPORTANT HTML ELEMENTS
       ===================================================== */

    console.log("Add button:", addAppointmentBtn);
    console.log("Modal:", appointmentModal);
    console.log("Form:", appointmentForm);
    console.log("Patient select:", patientSelect);
    console.log("Doctor select:", doctorSelect);
    console.log("Table body:", appointmentsTableBody);


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadPatients();
    loadDoctors();
    loadAppointments();


    /* =====================================================
       ADD APPOINTMENT BUTTON
       ===================================================== */

    if (addAppointmentBtn) {

        addAppointmentBtn.addEventListener("click", function (event) {

            event.preventDefault();

            console.log("Add Appointment button clicked");

            editingAppointmentId = null;

            clearForm();

            if (appointmentStatus) {
                appointmentStatus.value = "Scheduled";
            }

            openModal();

        });

    } else {

        console.error(
            "ERROR: addAppointmentBtn was not found!"
        );

    }


    /* =====================================================
       CLOSE BUTTON
       ===================================================== */

    if (closeAppointmentBtn) {

        closeAppointmentBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeModal();

            }
        );

    }


    /* =====================================================
       CANCEL BUTTON
       ===================================================== */

    if (cancelAppointmentBtn) {

        cancelAppointmentBtn.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                closeModal();

            }
        );

    }


    /* =====================================================
       CLICK OUTSIDE MODAL
       ===================================================== */

    if (appointmentModal) {

        appointmentModal.addEventListener(
            "click",
            function (event) {

                if (event.target === appointmentModal) {
                    closeModal();
                }

            }
        );

    }


    /* =====================================================
       ESCAPE KEY
       ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Escape") {
                closeModal();
            }

        }
    );


    /* =====================================================
       DOCTOR CHANGE
       ===================================================== */

    if (doctorSelect) {

        doctorSelect.addEventListener(
            "change",
            function () {

                const selectedOption =
                    doctorSelect.options[
                        doctorSelect.selectedIndex
                    ];

                if (
                    !selectedOption ||
                    !selectedOption.value
                ) {

                    if (department) {
                        department.value = "";
                    }

                    if (departmentId) {
                        departmentId.value = "";
                    }

                    return;
                }


                if (department) {

                    department.value =
                        selectedOption.dataset.department || "";

                }


                if (departmentId) {

                    departmentId.value =
                        selectedOption.dataset.departmentId || "";

                }

            }
        );

    }


    /* =====================================================
       SAVE APPOINTMENT
       ===================================================== */

    if (appointmentForm) {

        appointmentForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                console.log("Appointment form submitted");


                /* -----------------------------------------
                   GET VALUES
                   ----------------------------------------- */

                const patientId =
                    patientSelect
                        ? patientSelect.value
                        : "";

                const doctorId =
                    doctorSelect
                        ? doctorSelect.value
                        : "";

                const date =
                    appointmentDate
                        ? appointmentDate.value
                        : "";

                const time =
                    appointmentTime
                        ? appointmentTime.value
                        : "";

                const status =
                    appointmentStatus
                        ? appointmentStatus.value
                        : "Scheduled";

                const appointmentReason =
                    reason
                        ? reason.value.trim()
                        : "";

                const appointmentNotes =
                    notes
                        ? notes.value.trim()
                        : "";


                /* -----------------------------------------
                   VALIDATION
                   ----------------------------------------- */

                if (!patientId) {

                    alert("Please select a patient.");

                    if (patientSelect) {
                        patientSelect.focus();
                    }

                    return;

                }


                if (!doctorId) {

                    alert("Please select a doctor.");

                    if (doctorSelect) {
                        doctorSelect.focus();
                    }

                    return;

                }


                if (!date) {

                    alert(
                        "Please select appointment date."
                    );

                    if (appointmentDate) {
                        appointmentDate.focus();
                    }

                    return;

                }


                if (!time) {

                    alert(
                        "Please select appointment time."
                    );

                    if (appointmentTime) {
                        appointmentTime.focus();
                    }

                    return;

                }


                /* -----------------------------------------
                   DATA
                   ----------------------------------------- */

                const appointmentData = {

                    patient_id: Number(patientId),

                    doctor_id: Number(doctorId),

                    appointment_date: date,

                    appointment_time: time,

                    reason: appointmentReason,

                    notes: appointmentNotes,

                    status: status || "Scheduled"

                };


                console.log(
                    "Data being sent:",
                    appointmentData
                );


                /* -----------------------------------------
                   DISABLE SAVE BUTTON
                   ----------------------------------------- */

                if (saveAppointmentBtn) {

                    saveAppointmentBtn.disabled = true;

                    saveAppointmentBtn.textContent =
                        "Saving...";

                }


                try {

                    let response;


                    /* -------------------------------------
                       CREATE
                       ------------------------------------- */

                    if (editingAppointmentId === null) {

                        console.log(
                            "Creating new appointment..."
                        );


                        response = await fetch(
                            `${API_URL}/appointments`,
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        appointmentData
                                    )
                            }
                        );

                    }


                    /* -------------------------------------
                       UPDATE
                       ------------------------------------- */

                    else {

                        console.log(
                            "Updating appointment:",
                            editingAppointmentId
                        );


                        response = await fetch(
                            `${API_URL}/appointments/${editingAppointmentId}`,
                            {
                                method: "PUT",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        appointmentData
                                    )
                            }
                        );

                    }


                    console.log(
                        "Server response:",
                        response.status
                    );


                    const result =
                        await response.json();


                    console.log(
                        "Server result:",
                        result
                    );


                    if (
                        !response.ok ||
                        result.success !== true
                    ) {

                        throw new Error(
                            result.message ||
                            "Failed to save appointment."
                        );

                    }


                    /* -------------------------------------
                       SUCCESS
                       ------------------------------------- */

                    if (editingAppointmentId === null) {

                        alert(
                            "Appointment saved successfully!"
                        );

                    } else {

                        alert(
                            "Appointment updated successfully!"
                        );

                    }


                    closeModal();

                    await loadAppointments();


                } catch (error) {

                    console.error(
                        "SAVE APPOINTMENT ERROR:",
                        error
                    );


                    alert(
                        "Unable to save appointment.\n\n" +
                        error.message
                    );


                } finally {

                    if (saveAppointmentBtn) {

                        saveAppointmentBtn.disabled = false;

                        saveAppointmentBtn.textContent =
                            "Save Appointment";

                    }

                }

            }
        );

    } else {

        console.error(
            "ERROR: appointmentForm was not found!"
        );

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    if (searchAppointment) {

        searchAppointment.addEventListener(
            "input",
            function () {

                renderAppointments();

            }
        );

    }


    /* =====================================================
       STATUS FILTER
       ===================================================== */

    if (statusFilter) {

        statusFilter.addEventListener(
            "change",
            function () {

                renderAppointments();

            }
        );

    }


    /* =====================================================
       LOAD PATIENTS
       ===================================================== */

    async function loadPatients() {

        try {

            console.log("Loading patients...");


            const response =
                await fetch(
                    `${API_URL}/patients`
                );


            if (!response.ok) {

                throw new Error(
                    `Patients API error: ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "Patients:",
                result
            );


            if (
                !result.success ||
                !Array.isArray(result.patients)
            ) {

                throw new Error(
                    result.message ||
                    "Invalid patients data."
                );

            }


            patients =
                result.patients;


            populatePatientSelect();


            console.log(
                "Patients loaded:",
                patients.length
            );


        } catch (error) {

            console.error(
                "LOAD PATIENTS ERROR:",
                error
            );


            if (patientSelect) {

                patientSelect.innerHTML =
                    `<option value="">
                        Unable to load patients
                    </option>`;

            }

        }

    }


    /* =====================================================
       POPULATE PATIENT SELECT
       ===================================================== */

    function populatePatientSelect() {

        if (!patientSelect) {

            console.error(
                "patientSelect not found."
            );

            return;

        }


        patientSelect.innerHTML =
            `<option value="">
                Select Patient
            </option>`;


        patients.forEach(function (patient) {

            const option =
                document.createElement("option");


            option.value =
                patient.patient_id;


            const fullName = [

                patient.first_name,

                patient.middle_name,

                patient.last_name

            ]
                .filter(Boolean)
                .join(" ");


            option.textContent =
                `${patient.patient_number || ""} - ${fullName}`;


            patientSelect.appendChild(option);

        });

    }


    /* =====================================================
       LOAD DOCTORS
       ===================================================== */

    async function loadDoctors() {

        try {

            console.log("Loading doctors...");


            const response =
                await fetch(
                    `${API_URL}/doctors`
                );


            if (!response.ok) {

                throw new Error(
                    `Doctors API error: ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "Doctors:",
                result
            );


            if (
                !result.success ||
                !Array.isArray(result.doctors)
            ) {

                throw new Error(
                    result.message ||
                    "Invalid doctors data."
                );

            }


            doctors =
                result.doctors;


            populateDoctorSelect();


            console.log(
                "Doctors loaded:",
                doctors.length
            );


        } catch (error) {

            console.error(
                "LOAD DOCTORS ERROR:",
                error
            );


            if (doctorSelect) {

                doctorSelect.innerHTML =
                    `<option value="">
                        Unable to load doctors
                    </option>`;

            }

        }

    }


    /* =====================================================
       POPULATE DOCTOR SELECT
       ===================================================== */

    function populateDoctorSelect() {

        if (!doctorSelect) {

            console.error(
                "doctorSelect not found."
            );

            return;

        }


        doctorSelect.innerHTML =
            `<option value="">
                Select Doctor
            </option>`;


        doctors.forEach(function (doctor) {

            const option =
                document.createElement("option");


            option.value =
                doctor.doctor_id;


            const fullName = [

                doctor.first_name,

                doctor.middle_name,

                doctor.last_name

            ]
                .filter(Boolean)
                .join(" ");


            option.textContent =
                `Dr. ${fullName}` +
                (
                    doctor.specialization
                        ? ` - ${doctor.specialization}`
                        : ""
                );


            option.dataset.department =
                doctor.department_name || "";


            option.dataset.departmentId =
                doctor.department_id || "";


            doctorSelect.appendChild(option);

        });

    }


    /* =====================================================
       LOAD APPOINTMENTS
       ===================================================== */

    async function loadAppointments() {

        try {

            console.log(
                "Loading appointments..."
            );


            const response =
                await fetch(
                    `${API_URL}/appointments`
                );


            if (!response.ok) {

                throw new Error(
                    `Appointments API error: ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "Appointments:",
                result
            );


            if (!result.success) {

                throw new Error(
                    result.message ||
                    "Failed to load appointments."
                );

            }


            appointments =
                Array.isArray(result.appointments)
                    ? result.appointments
                    : [];


            console.log(
                "Appointments loaded:",
                appointments.length
            );


            renderAppointments();

            updateStatistics();


        } catch (error) {

            console.error(
                "LOAD APPOINTMENTS ERROR:",
                error
            );


            appointments = [];

            renderAppointments();

            updateStatistics();

        }

    }


    /* =====================================================
       RENDER APPOINTMENTS
       ===================================================== */

    function renderAppointments() {

        if (!appointmentsTableBody) {

            console.error(
                "appointmentsTableBody not found."
            );

            return;

        }


        const searchText =
            searchAppointment
                ? searchAppointment.value
                    .trim()
                    .toLowerCase()
                : "";


        const selectedStatus =
            statusFilter
                ? statusFilter.value
                : "";


        const filteredAppointments =
            appointments.filter(
                function (appointment) {

                    const patientName = [

                        appointment.patient_first_name,

                        appointment.patient_middle_name,

                        appointment.patient_last_name

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    const doctorName = [

                        appointment.doctor_first_name,

                        appointment.doctor_middle_name,

                        appointment.doctor_last_name

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    const patientNumber =
                        String(
                            appointment.patient_number || ""
                        ).toLowerCase();


                    const reasonText =
                        String(
                            appointment.reason || ""
                        ).toLowerCase();


                    const matchesSearch =
                        !searchText ||

                        patientName.includes(searchText) ||

                        doctorName.includes(searchText) ||

                        patientNumber.includes(searchText) ||

                        reasonText.includes(searchText);


                    const matchesStatus =
                        !selectedStatus ||

                        appointment.status === selectedStatus;


                    return (
                        matchesSearch &&
                        matchesStatus
                    );

                }
            );


        appointmentsTableBody.innerHTML = "";


        /* ---------------------------------------------
           NO DATA
           --------------------------------------------- */

        if (filteredAppointments.length === 0) {

            if (emptyAppointments) {

                emptyAppointments.style.display =
                    "block";

            }

            return;

        }


        if (emptyAppointments) {

            emptyAppointments.style.display =
                "none";

        }


        /* ---------------------------------------------
           CREATE TABLE ROWS
           --------------------------------------------- */

        filteredAppointments.forEach(
            function (appointment) {

                const row =
                    document.createElement("tr");


                const patientName = [

                    appointment.patient_first_name,

                    appointment.patient_middle_name,

                    appointment.patient_last_name

                ]
                    .filter(Boolean)
                    .join(" ");


                const doctorName = [

                    appointment.doctor_first_name,

                    appointment.doctor_middle_name,

                    appointment.doctor_last_name

                ]
                    .filter(Boolean)
                    .join(" ");


                row.innerHTML = `

                    <td>
                        ${appointment.appointment_id}
                    </td>

                    <td>
                        <strong>
                            ${escapeHTML(
                                appointment.patient_number || ""
                            )}
                        </strong>

                        <br>

                        <span class="table-secondary">
                            ${escapeHTML(patientName)}
                        </span>
                    </td>

                    <td>
                        Dr. ${escapeHTML(doctorName)}

                        <br>

                        <span class="table-secondary">
                            ${escapeHTML(
                                appointment.specialization || ""
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            appointment.department_name || "-"
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            appointment.appointment_date
                        )}

                        <br>

                        <span class="table-secondary">
                            ${formatTime(
                                appointment.appointment_time
                            )}
                        </span>
                    </td>

                    <td>
                        ${escapeHTML(
                            appointment.reason || "-"
                        )}
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(
                            appointment.status
                        )}">
                            ${escapeHTML(
                                appointment.status ||
                                "Scheduled"
                            )}
                        </span>
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn edit-btn"
                                data-id="${appointment.appointment_id}"
                                title="Edit Appointment">

                                <i class="fa-solid fa-pen"></i>

                            </button>


                            <button
                                type="button"
                                class="action-btn delete-btn"
                                data-id="${appointment.appointment_id}"
                                title="Delete Appointment">

                                <i class="fa-solid fa-trash"></i>

                            </button>

                        </div>

                    </td>

                `;


                appointmentsTableBody.appendChild(row);

            }
        );


        attachRowButtons();

    }


    /* =====================================================
       EDIT / DELETE BUTTONS
       ===================================================== */

    function attachRowButtons() {

        const editButtons =
            document.querySelectorAll(
                ".edit-btn"
            );


        editButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        const id =
                            Number(
                                button.dataset.id
                            );

                        editAppointment(id);

                    }
                );

            }
        );


        const deleteButtons =
            document.querySelectorAll(
                ".delete-btn"
            );


        deleteButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();

                        const id =
                            Number(
                                button.dataset.id
                            );

                        deleteAppointment(id);

                    }
                );

            }
        );

    }


    /* =====================================================
       EDIT APPOINTMENT
       ===================================================== */

    function editAppointment(id) {

        console.log(
            "Editing appointment:",
            id
        );


        const appointment =
            appointments.find(
                function (item) {

                    return Number(
                        item.appointment_id
                    ) === Number(id);

                }
            );


        if (!appointment) {

            alert(
                "Appointment not found."
            );

            return;

        }


        editingAppointmentId =
            Number(id);


        if (appointmentId) {

            appointmentId.value =
                appointment.appointment_id;

        }


        if (patientSelect) {

            patientSelect.value =
                String(
                    appointment.patient_id
                );

        }


        if (doctorSelect) {

            doctorSelect.value =
                String(
                    appointment.doctor_id
                );

        }


        /* ---------------------------------------------
           DEPARTMENT
           --------------------------------------------- */

        const selectedDoctor =
            doctorSelect
                ? doctorSelect.options[
                    doctorSelect.selectedIndex
                ]
                : null;


        if (selectedDoctor) {

            if (department) {

                department.value =
                    selectedDoctor.dataset.department || "";

            }


            if (departmentId) {

                departmentId.value =
                    selectedDoctor.dataset.departmentId || "";

            }

        }


        /* ---------------------------------------------
           DATE
           --------------------------------------------- */

        if (appointmentDate) {

            appointmentDate.value =
                formatDateForInput(
                    appointment.appointment_date
                );

        }


        /* ---------------------------------------------
           TIME
           --------------------------------------------- */

        if (appointmentTime) {

            appointmentTime.value =
                formatTimeForInput(
                    appointment.appointment_time
                );

        }


        /* ---------------------------------------------
           STATUS
           --------------------------------------------- */

        if (appointmentStatus) {

            appointmentStatus.value =
                appointment.status ||
                "Scheduled";

        }


        /* ---------------------------------------------
           REASON
           --------------------------------------------- */

        if (reason) {

            reason.value =
                appointment.reason || "";

        }


        /* ---------------------------------------------
           NOTES
           --------------------------------------------- */

        if (notes) {

            notes.value =
                appointment.notes || "";

        }


        openModal();

    }


    /* =====================================================
       DELETE APPOINTMENT
       ===================================================== */

    async function deleteAppointment(id) {

        console.log(
            "Deleting appointment:",
            id
        );


        const appointment =
            appointments.find(
                function (item) {

                    return Number(
                        item.appointment_id
                    ) === Number(id);

                }
            );


        if (!appointment) {

            alert(
                "Appointment not found."
            );

            return;

        }


        const patientName = [

            appointment.patient_first_name,

            appointment.patient_middle_name,

            appointment.patient_last_name

        ]
            .filter(Boolean)
            .join(" ");


        const confirmed =
            confirm(
                `Are you sure you want to delete the appointment for ${patientName}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/appointments/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            const result =
                await response.json();


            console.log(
                "Delete response:",
                result
            );


            if (
                !response.ok ||
                result.success !== true
            ) {

                throw new Error(
                    result.message ||
                    "Failed to delete appointment."
                );

            }


            alert(
                "Appointment deleted successfully!"
            );


            await loadAppointments();


        } catch (error) {

            console.error(
                "DELETE APPOINTMENT ERROR:",
                error
            );


            alert(
                "Unable to delete appointment.\n\n" +
                error.message
            );

        }

    }


    /* =====================================================
       OPEN MODAL
       ===================================================== */

    function openModal() {

        if (!appointmentModal) {

            console.error(
                "appointmentModal was not found!"
            );

            return;

        }


        console.log(
            "Opening appointment modal..."
        );


        appointmentModal.classList.add("show");

        appointmentModal.style.display =
            "flex";

        document.body.classList.add(
            "modal-open"
        );

    }


    /* =====================================================
       CLOSE MODAL
       ===================================================== */

    function closeModal() {

        if (!appointmentModal) {
            return;
        }


        console.log(
            "Closing appointment modal..."
        );


        appointmentModal.classList.remove(
            "show"
        );

        appointmentModal.style.display =
            "none";

        document.body.classList.remove(
            "modal-open"
        );


        editingAppointmentId = null;

    }


    /* =====================================================
       CLEAR FORM
       ===================================================== */

    function clearForm() {

        if (appointmentForm) {

            appointmentForm.reset();

        }


        if (appointmentId) {

            appointmentId.value = "";

        }


        if (department) {

            department.value = "";

        }


        if (departmentId) {

            departmentId.value = "";

        }


        if (appointmentStatus) {

            appointmentStatus.value =
                "Scheduled";

        }

    }


    /* =====================================================
       STATISTICS
       ===================================================== */

    function updateStatistics() {

        const total =
            appointments.length;


        const scheduled =
            appointments.filter(
                function (item) {

                    return item.status ===
                        "Scheduled";

                }
            ).length;


        const completed =
            appointments.filter(
                function (item) {

                    return item.status ===
                        "Completed";

                }
            ).length;


        const cancelled =
            appointments.filter(
                function (item) {

                    return item.status ===
                        "Cancelled";

                }
            ).length;


        const totalElement =
            document.getElementById(
                "totalAppointments"
            );


        const scheduledElement =
            document.getElementById(
                "scheduledAppointments"
            );


        const completedElement =
            document.getElementById(
                "completedAppointments"
            );


        const cancelledElement =
            document.getElementById(
                "cancelledAppointments"
            );


        if (totalElement) {

            totalElement.textContent =
                total;

        }


        if (scheduledElement) {

            scheduledElement.textContent =
                scheduled;

        }


        if (completedElement) {

            completedElement.textContent =
                completed;

        }


        if (cancelledElement) {

            cancelledElement.textContent =
                cancelled;

        }

    }


    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(value) {

        if (!value) {
            return "-";
        }


        const dateString =
            String(value).substring(0, 10);


        const date =
            new Date(
                dateString + "T00:00:00"
            );


        if (isNaN(date.getTime())) {

            return String(value);

        }


        return date.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "short",
                day: "numeric"
            }
        );

    }


    function formatDateForInput(value) {

        if (!value) {
            return "";
        }


        return String(value)
            .substring(0, 10);

    }


    /* =====================================================
       FORMAT TIME
       ===================================================== */

    function formatTime(value) {

        if (!value) {
            return "-";
        }


        const parts =
            String(value).split(":");


        if (parts.length < 2) {

            return String(value);

        }


        let hour =
            parseInt(
                parts[0],
                10
            );


        const minute =
            parts[1];


        if (isNaN(hour)) {

            return String(value);

        }


        const period =
            hour >= 12
                ? "PM"
                : "AM";


        hour =
            hour % 12 || 12;


        return `${hour}:${minute} ${period}`;

    }


    function formatTimeForInput(value) {

        if (!value) {
            return "";
        }


        const parts =
            String(value).split(":");


        if (parts.length < 2) {

            return "";

        }


        const hour =
            parts[0].padStart(2, "0");


        const minute =
            parts[1].padStart(2, "0");


        return `${hour}:${minute}`;

    }


    /* =====================================================
       STATUS CLASS
       ===================================================== */

    function getStatusClass(status) {

        switch (status) {

            case "Scheduled":
                return "status-scheduled";

            case "Confirmed":
                return "status-confirmed";

            case "Completed":
                return "status-completed";

            case "Cancelled":
                return "status-cancelled";

            case "No Show":
                return "status-no-show";

            default:
                return "status-scheduled";

        }

    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        return String(value)
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


});