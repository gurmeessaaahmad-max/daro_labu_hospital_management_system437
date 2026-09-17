/* =========================================================
   DARO LABU HOSPITAL
   MEDICAL RECORDS MANAGEMENT
   FLASK + MYSQL VERSION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const API_URL = "http://127.0.0.1:5000/api";

    let medicalRecords = [];
    let patients = [];
    let doctors = [];
    let appointments = [];

    let editingRecordId = null;


    /* =====================================================
       GET ELEMENTS
       ===================================================== */

    const form = document.getElementById("medicalRecordForm");

    const patientSelect = document.getElementById("patient");
    const doctorSelect = document.getElementById("doctor");
    const appointmentSelect = document.getElementById("appointment");

    const visitDate = document.getElementById("visitDate");
    const chiefComplaint = document.getElementById("chiefComplaint");
    const symptoms = document.getElementById("symptoms");
    const diagnosis = document.getElementById("diagnosis");
    const treatment = document.getElementById("treatment");
    const notes = document.getElementById("notes");

    const clearButton = document.getElementById("clearRecord");
    const searchInput = document.getElementById("searchRecord");
    const tableBody = document.getElementById("recordsTableBody");
    const emptyState = document.getElementById("emptyRecords");
    const saveButton = document.getElementById("saveRecordBtn");


    /* =====================================================
       START
       ===================================================== */

    loadAllData();


    /* =====================================================
       LOAD ALL DATA
       ===================================================== */

    async function loadAllData() {

        try {

            await loadPatients();
            await loadDoctors();
            await loadAppointments();
            await loadMedicalRecords();

            updateStatistics();

        } catch (error) {

            console.error("Initial loading error:", error);

            alert(
                "Could not load Medical Records data.\n\n" +
                error.message
            );
        }
    }


    /* =====================================================
       LOAD PATIENTS
       ===================================================== */

    async function loadPatients() {

        const response =
            await fetch(`${API_URL}/patients`);

        const data =
            await readJson(response);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load patients."
            );
        }

        patients = data.patients || [];

        patientSelect.innerHTML =
            `<option value="">Select Patient</option>`;

        patients.forEach(function (patient) {

            const option =
                document.createElement("option");

            option.value =
                patient.patient_id;

            const fullName =
                [
                    patient.first_name,
                    patient.middle_name,
                    patient.last_name
                ]
                .filter(Boolean)
                .join(" ");

            option.textContent =
                `${patient.patient_number || "PAT"} - ${fullName}`;

            patientSelect.appendChild(option);
        });
    }


    /* =====================================================
       LOAD DOCTORS
       ===================================================== */

    async function loadDoctors() {

        const response =
            await fetch(`${API_URL}/doctors`);

        const data =
            await readJson(response);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load doctors."
            );
        }

        doctors = data.doctors || [];

        doctorSelect.innerHTML =
            `<option value="">Select Doctor</option>`;

        doctors.forEach(function (doctor) {

            const option =
                document.createElement("option");

            option.value =
                doctor.doctor_id;

            const fullName =
                [
                    doctor.first_name,
                    doctor.middle_name,
                    doctor.last_name
                ]
                .filter(Boolean)
                .join(" ");

            option.textContent =
                `Dr. ${fullName}`;

            doctorSelect.appendChild(option);
        });
    }


    /* =====================================================
       LOAD APPOINTMENTS
       ===================================================== */

    async function loadAppointments() {

        const response =
            await fetch(`${API_URL}/appointments`);

        const data =
            await readJson(response);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load appointments."
            );
        }

        appointments =
            data.appointments || [];

        renderAppointmentOptions();
    }


    /* =====================================================
       RENDER APPOINTMENTS
       ===================================================== */

    function renderAppointmentOptions() {

        if (!appointmentSelect) {
            return;
        }

        const previousValue =
            appointmentSelect.value;

        appointmentSelect.innerHTML =
            `<option value="">No Appointment</option>`;

        const selectedPatientId =
            Number(patientSelect.value);

        appointments.forEach(function (appointment) {

            if (
                selectedPatientId &&
                Number(appointment.patient_id) !== selectedPatientId
            ) {
                return;
            }

            const option =
                document.createElement("option");

            option.value =
                appointment.appointment_id;

            const patientName =
                [
                    appointment.patient_first_name,
                    appointment.patient_middle_name,
                    appointment.patient_last_name
                ]
                .filter(Boolean)
                .join(" ");

            const doctorName =
                [
                    appointment.doctor_first_name,
                    appointment.doctor_middle_name,
                    appointment.doctor_last_name
                ]
                .filter(Boolean)
                .join(" ");

            const appointmentDate =
                formatDateTime(
                    appointment.appointment_date
                );

            option.textContent =
                `#${appointment.appointment_id} - ` +
                `${patientName || "Patient"} - ` +
                `Dr. ${doctorName || "Doctor"} - ` +
                `${appointmentDate}`;

            appointmentSelect.appendChild(option);
        });

        if (previousValue) {

            const optionExists =
                Array.from(
                    appointmentSelect.options
                ).some(function (option) {

                    return option.value === previousValue;
                });

            if (optionExists) {

                appointmentSelect.value =
                    previousValue;
            }
        }
    }


    /* =====================================================
       PATIENT CHANGE
       ===================================================== */

    patientSelect.addEventListener(
        "change",
        function () {

            renderAppointmentOptions();
        }
    );


    /* =====================================================
       LOAD MEDICAL RECORDS
       ===================================================== */

    async function loadMedicalRecords() {

        const response =
            await fetch(`${API_URL}/medical-records`);

        const data =
            await readJson(response);

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                data.error ||
                "Failed to load medical records."
            );
        }

        /*
         * IMPORTANT:
         *
         * Backend returns:
         * data.records
         *
         * Not:
         * data.medical_records
         */

        medicalRecords =
            data.records || data.medical_records || [];

        renderMedicalRecords();
    }


    /* =====================================================
       RENDER RECORDS
       ===================================================== */

    function renderMedicalRecords() {

        tableBody.innerHTML = "";

        const searchText =
            searchInput
                ? searchInput.value.toLowerCase().trim()
                : "";

        const filteredRecords =
            medicalRecords.filter(function (record) {

                const patientName =
                    [
                        record.patient_first_name,
                        record.patient_middle_name,
                        record.patient_last_name
                    ]
                    .filter(Boolean)
                    .join(" ");

                const doctorName =
                    [
                        record.doctor_first_name,
                        record.doctor_middle_name,
                        record.doctor_last_name
                    ]
                    .filter(Boolean)
                    .join(" ");

                const text =
                    `${record.patient_number || ""} ` +
                    `${patientName} ` +
                    `${doctorName} ` +
                    `${record.diagnosis || ""} ` +
                    `${record.chief_complaint || ""} ` +
                    `${record.symptoms || ""} ` +
                    `${record.treatment || ""}`
                    .toLowerCase();

                return text.includes(searchText);
            });


        if (filteredRecords.length === 0) {

            emptyState.style.display =
                "block";

            return;
        }


        emptyState.style.display =
            "none";


        filteredRecords.forEach(function (record) {

            const row =
                document.createElement("tr");


            const patientName =
                [
                    record.patient_first_name,
                    record.patient_middle_name,
                    record.patient_last_name
                ]
                .filter(Boolean)
                .join(" ");


            const doctorName =
                [
                    record.doctor_first_name,
                    record.doctor_middle_name,
                    record.doctor_last_name
                ]
                .filter(Boolean)
                .join(" ");


            const dateText =
                formatDateTime(
                    record.visit_date
                );


            row.innerHTML = `

                <td>
                    <strong>
                        MR-${String(record.record_id).padStart(4, "0")}
                    </strong>
                </td>

                <td>
                    <strong>
                        ${escapeHtml(
                            record.patient_number || "-"
                        )}
                    </strong>

                    <br>

                    <small>
                        ${escapeHtml(
                            patientName || "-"
                        )}
                    </small>
                </td>

                <td>
                    ${escapeHtml(
                        doctorName
                            ? "Dr. " + doctorName
                            : "-"
                    )}

                    <br>

                    <small>
                        ${escapeHtml(
                            record.specialization || ""
                        )}
                    </small>
                </td>

                <td>
                    ${escapeHtml(dateText)}
                </td>

                <td>
                    ${escapeHtml(
                        record.diagnosis ||
                        "Not diagnosed"
                    )}
                </td>

                <td>
                    ${
                        record.appointment_id
                            ? "#" + record.appointment_id
                            : "None"
                    }
                </td>

                <td>

                    <div class="record-actions">

                        <button
                            type="button"
                            class="btn-view"
                            data-id="${record.record_id}"
                            title="View Record">

                            <i class="fas fa-eye"></i>

                        </button>


                        <button
                            type="button"
                            class="btn-edit"
                            data-id="${record.record_id}"
                            title="Edit Record">

                            <i class="fas fa-edit"></i>

                        </button>


                        <button
                            type="button"
                            class="btn-delete"
                            data-id="${record.record_id}"
                            title="Delete Record">

                            <i class="fas fa-trash"></i>

                        </button>

                    </div>

                </td>
            `;


            tableBody.appendChild(row);
        });
    }


    /* =====================================================
       SEARCH
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            renderMedicalRecords
        );
    }


    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            await saveMedicalRecord();
        }
    );


    /* =====================================================
       SAVE MEDICAL RECORD
       ===================================================== */

    async function saveMedicalRecord() {

        const patientId =
            Number(patientSelect.value);

        const doctorId =
            Number(doctorSelect.value);

        const appointmentId =
            appointmentSelect.value
                ? Number(appointmentSelect.value)
                : null;


        /* -------------------------------------------------
           VALIDATION
           ------------------------------------------------- */

        if (!patientId) {

            alert("Please select a patient.");

            patientSelect.focus();

            return;
        }


        if (!doctorId) {

            alert("Please select a doctor.");

            doctorSelect.focus();

            return;
        }


        if (!visitDate.value) {

            alert("Please select the visit date.");

            visitDate.focus();

            return;
        }


        /* -------------------------------------------------
           CONVERT DATE
           ------------------------------------------------- */

        const mysqlVisitDate =
            convertLocalDateTimeToMySQL(
                visitDate.value
            );


        if (!mysqlVisitDate) {

            alert("Invalid visit date.");

            return;
        }


        /* -------------------------------------------------
           DATA
           ------------------------------------------------- */

        const payload = {

            patient_id: patientId,

            doctor_id: doctorId,

            appointment_id: appointmentId,

            visit_date: mysqlVisitDate,

            chief_complaint:
                chiefComplaint.value.trim(),

            symptoms:
                symptoms.value.trim(),

            diagnosis:
                diagnosis.value.trim(),

            treatment:
                treatment.value.trim(),

            notes:
                notes.value.trim()
        };


        console.log(
            "Sending medical record:",
            payload
        );


        try {

            saveButton.disabled = true;

            saveButton.innerHTML =
                `<i class="fas fa-spinner fa-spin"></i> Saving...`;


            let url =
                `${API_URL}/medical-records`;

            let method =
                "POST";


            if (editingRecordId) {

                url =
                    `${API_URL}/medical-records/${editingRecordId}`;

                method =
                    "PUT";
            }


            const response =
                await fetch(
                    url,
                    {
                        method: method,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(payload)
                    }
                );


            const data =
                await readJson(response);


            console.log(
                "Medical record server response:",
                data
            );


            if (!response.ok || !data.success) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Medical record could not be saved."
                );
            }


            alert(
                editingRecordId
                    ? "Medical record updated successfully!"
                    : "Medical record saved successfully!"
            );


            clearForm();


            await loadMedicalRecords();

            updateStatistics();

        } catch (error) {

            console.error(
                "MEDICAL RECORD SAVE ERROR:",
                error
            );


            alert(
                "Could not save medical record.\n\n" +
                error.message
            );

        } finally {

            saveButton.disabled = false;

            saveButton.innerHTML =
                `<i class="fas fa-save"></i> Save Record`;
        }
    }


    /* =====================================================
       TABLE BUTTONS
       ===================================================== */

    tableBody.addEventListener(
        "click",
        async function (event) {

            const button =
                event.target.closest("button");

            if (!button) {
                return;
            }


            const recordId =
                Number(button.dataset.id);


            if (!recordId) {
                return;
            }


            if (
                button.classList.contains("btn-view")
            ) {

                viewRecord(recordId);

                return;
            }


            if (
                button.classList.contains("btn-edit")
            ) {

                editRecord(recordId);

                return;
            }


            if (
                button.classList.contains("btn-delete")
            ) {

                await deleteRecord(recordId);

                return;
            }
        }
    );


    /* =====================================================
       VIEW RECORD
       ===================================================== */

    function viewRecord(recordId) {

        const record =
            medicalRecords.find(function (item) {

                return Number(item.record_id) === recordId;
            });


        if (!record) {

            alert("Medical record not found.");

            return;
        }


        const patientName =
            [
                record.patient_first_name,
                record.patient_middle_name,
                record.patient_last_name
            ]
            .filter(Boolean)
            .join(" ");


        const doctorName =
            [
                record.doctor_first_name,
                record.doctor_middle_name,
                record.doctor_last_name
            ]
            .filter(Boolean)
            .join(" ");


        alert(

            "DARO LABU HOSPITAL\n" +
            "==============================\n\n" +

            "Medical Record: MR-" +
            String(record.record_id)
                .padStart(4, "0") +

            "\n\nPatient: " +
            (patientName || "-") +

            "\nPatient Number: " +
            (record.patient_number || "-") +

            "\n\nDoctor: " +
            (
                doctorName
                    ? "Dr. " + doctorName
                    : "-"
            ) +

            "\nSpecialization: " +
            (record.specialization || "-") +

            "\n\nVisit Date: " +
            formatDateTime(record.visit_date) +

            "\n\nChief Complaint:\n" +
            (record.chief_complaint || "-") +

            "\n\nSymptoms:\n" +
            (record.symptoms || "-") +

            "\n\nDiagnosis:\n" +
            (record.diagnosis || "-") +

            "\n\nTreatment:\n" +
            (record.treatment || "-") +

            "\n\nClinical Notes:\n" +
            (record.notes || "-")
        );
    }


    /* =====================================================
       EDIT RECORD
       ===================================================== */

    function editRecord(recordId) {

        const record =
            medicalRecords.find(function (item) {

                return Number(item.record_id) === recordId;
            });


        if (!record) {

            alert("Medical record not found.");

            return;
        }


        editingRecordId =
            recordId;


        patientSelect.value =
            String(record.patient_id);


        renderAppointmentOptions();


        doctorSelect.value =
            String(record.doctor_id);


        if (record.appointment_id) {

            appointmentSelect.value =
                String(record.appointment_id);

        } else {

            appointmentSelect.value =
                "";
        }


        visitDate.value =
            convertMySQLDateTimeToLocal(
                record.visit_date
            );


        chiefComplaint.value =
            record.chief_complaint || "";


        symptoms.value =
            record.symptoms || "";


        diagnosis.value =
            record.diagnosis || "";


        treatment.value =
            record.treatment || "";


        notes.value =
            record.notes || "";


        saveButton.innerHTML =
            `<i class="fas fa-save"></i> Update Record`;


        const formTitle =
            document.getElementById("formTitle");


        if (formTitle) {

            formTitle.textContent =
                "Update Medical Record";
        }


        form.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }


    /* =====================================================
       DELETE RECORD
       ===================================================== */

    async function deleteRecord(recordId) {

        const record =
            medicalRecords.find(function (item) {

                return Number(item.record_id) === recordId;
            });


        if (!record) {

            alert("Medical record not found.");

            return;
        }


        const patientName =
            [
                record.patient_first_name,
                record.patient_middle_name,
                record.patient_last_name
            ]
            .filter(Boolean)
            .join(" ");


        const confirmed =
            confirm(
                `Are you sure you want to delete the medical record for ${patientName || "this patient"}?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/medical-records/${recordId}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await readJson(response);


            if (!response.ok || !data.success) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "Failed to delete medical record."
                );
            }


            alert(
                "Medical record deleted successfully!"
            );


            if (
                editingRecordId === recordId
            ) {

                clearForm();
            }


            await loadMedicalRecords();

            updateStatistics();


        } catch (error) {

            console.error(
                "Delete error:",
                error
            );


            alert(
                "Could not delete medical record.\n\n" +
                error.message
            );
        }
    }


    /* =====================================================
       CLEAR FORM
       ===================================================== */

    clearButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            clearForm();
        }
    );


    function clearForm() {

        editingRecordId = null;


        form.reset();


        appointmentSelect.innerHTML =
            `<option value="">No Appointment</option>`;


        renderAppointmentOptions();


        saveButton.disabled = false;

        saveButton.innerHTML =
            `<i class="fas fa-save"></i> Save Record`;


        const formTitle =
            document.getElementById("formTitle");


        if (formTitle) {

            formTitle.textContent =
                "Medical Record";
        }
    }


    /* =====================================================
       STATISTICS
       ===================================================== */

    function updateStatistics() {

        const totalRecords =
            document.getElementById("totalRecords");

        const diagnosedRecords =
            document.getElementById("diagnosedRecords");

        const appointmentRecords =
            document.getElementById("appointmentRecords");

        const todayRecords =
            document.getElementById("todayRecords");


        totalRecords.textContent =
            medicalRecords.length;


        diagnosedRecords.textContent =
            medicalRecords.filter(function (record) {

                return (
                    record.diagnosis &&
                    String(record.diagnosis).trim() !== ""
                );

            }).length;


        appointmentRecords.textContent =
            medicalRecords.filter(function (record) {

                return Boolean(
                    record.appointment_id
                );

            }).length;


        const today =
            getLocalDateString();


        todayRecords.textContent =
            medicalRecords.filter(function (record) {

                if (!record.visit_date) {
                    return false;
                }

                return (
                    String(record.visit_date)
                        .substring(0, 10) === today
                );

            }).length;
    }


    /* =====================================================
       DATE CONVERSION
       ===================================================== */

    function convertLocalDateTimeToMySQL(value) {

        if (!value) {
            return null;
        }


        let result =
            String(value).replace("T", " ");


        if (result.length === 16) {

            result += ":00";
        }


        return result;
    }


    function convertMySQLDateTimeToLocal(value) {

        if (!value) {
            return "";
        }


        let result =
            String(value)
                .replace(" ", "T");


        return result.substring(0, 16);
    }


    function formatDateTime(value) {

        if (!value) {
            return "-";
        }


        let text =
            String(value)
                .replace("T", " ");


        const date =
            new Date(
                text.replace(" ", "T")
            );


        if (isNaN(date.getTime())) {

            return text;
        }


        return date.toLocaleString();
    }


    function getLocalDateString() {

        const now =
            new Date();


        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        return `${year}-${month}-${day}`;
    }


    /* =====================================================
       READ JSON RESPONSE
       ===================================================== */

    async function readJson(response) {

        const text =
            await response.text();


        if (!text) {
            return {};
        }


        try {

            return JSON.parse(text);

        } catch (error) {

            console.error(
                "Server returned:",
                text
            );


            throw new Error(
                "Server returned an invalid response."
            );
        }
    }


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});