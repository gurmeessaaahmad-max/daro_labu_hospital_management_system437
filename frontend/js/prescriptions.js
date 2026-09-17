/* =========================================================
   DARO LABU HOSPITAL
   PRESCRIPTIONS MANAGEMENT
   FRONTEND
   FLASK + MYSQL VERSION
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       API
       ===================================================== */

    const API_URL = "http://127.0.0.1:5000/api";


    /* =====================================================
       DATA
       ===================================================== */

    let patients = [];
    let doctors = [];
    let medicalRecords = [];
    let medicines = [];
    let prescriptions = [];


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const prescriptionForm =
        document.getElementById("prescriptionForm");

    const patientSelect =
        document.getElementById("patient");

    const doctorSelect =
        document.getElementById("doctor");

    const medicalRecordSelect =
        document.getElementById("medicalRecord");

    const prescriptionDate =
        document.getElementById("prescriptionDate");

    const instructions =
        document.getElementById("instructions");

    const prescriptionId =
        document.getElementById("prescriptionId");

    const medicineItems =
        document.getElementById("medicineItems");

    const addMedicineBtn =
        document.getElementById("addMedicineBtn");

    const clearPrescriptionBtn =
        document.getElementById("clearPrescription");

    const savePrescriptionBtn =
        document.getElementById("savePrescriptionBtn");

    const searchPrescription =
        document.getElementById("searchPrescription");

    const prescriptionTableBody =
        document.getElementById("prescriptionTableBody");

    const emptyPrescriptions =
        document.getElementById("emptyPrescriptions");

    const prescriptionModal =
        document.getElementById("prescriptionModal");

    const prescriptionDetails =
        document.getElementById("prescriptionDetails");

    const closePrescriptionModal =
        document.getElementById("closePrescriptionModal");

    const closePrescriptionBtn =
        document.getElementById("closePrescriptionBtn");

    const printPrescriptionBtn =
        document.getElementById("printPrescriptionBtn");


    /* =====================================================
       STATISTICS
       ===================================================== */

    const totalPrescriptions =
        document.getElementById("totalPrescriptions");

    const totalPrescriptionItems =
        document.getElementById("totalPrescriptionItems");

    const recordPrescriptions =
        document.getElementById("recordPrescriptions");

    const todayPrescriptions =
        document.getElementById("todayPrescriptions");


    /* =====================================================
       INITIALIZE
       ===================================================== */

    initialize();


    async function initialize() {

        setDefaultDate();

        await loadAllData();

        /*
         * IMPORTANT:
         * Create ONLY ONE medicine row when the page loads.
         */
        medicineItems.innerHTML = "";

        addMedicineRow();

        setupEvents();

    }


    /* =====================================================
       LOAD ALL DATA
       ===================================================== */

    async function loadAllData() {

        try {

            const results = await Promise.all([

                fetch(`${API_URL}/patients`),

                fetch(`${API_URL}/doctors`),

                fetch(`${API_URL}/medical-records`),

                fetch(`${API_URL}/medicines`),

                fetch(`${API_URL}/prescriptions`)

            ]);


            const responses = await Promise.all(

                results.map(response => {

                    if (!response.ok) {

                        throw new Error(
                            `Server error: ${response.status}`
                        );

                    }

                    return response.json();

                })

            );


            const patientData = responses[0];
            const doctorData = responses[1];
            const recordData = responses[2];
            const medicineData = responses[3];
            const prescriptionData = responses[4];


            patients =
                patientData.patients || [];

            doctors =
                doctorData.doctors || [];

            medicalRecords =
                recordData.medical_records || [];

            medicines =
                medicineData.medicines || [];

            prescriptions =
                prescriptionData.prescriptions || [];


            populatePatients();

            populateDoctors();

            populateMedicalRecords();

            renderPrescriptions();

            updateStatistics();


        } catch (error) {

            console.error(
                "Error loading prescription data:",
                error
            );

            alert(
                "Unable to load prescription data.\n\n" +
                "Please make sure the Flask backend is running."
            );

        }

    }


    /* =====================================================
       PATIENT DROPDOWN
       ===================================================== */

    function populatePatients() {

        patientSelect.innerHTML =
            `<option value="">Select patient</option>`;


        patients.forEach(patient => {

            const option =
                document.createElement("option");

            option.value =
                patient.patient_id;

            option.textContent =
                `${patient.patient_number || ""} - ` +
                `${getFullName(patient)}`;

            patientSelect.appendChild(option);

        });

    }


    /* =====================================================
       DOCTOR DROPDOWN
       ===================================================== */

    function populateDoctors() {

        doctorSelect.innerHTML =
            `<option value="">Select doctor</option>`;


        doctors.forEach(doctor => {

            const option =
                document.createElement("option");

            option.value =
                doctor.doctor_id;

            option.textContent =
                `Dr. ${getFullName(doctor)}` +
                (
                    doctor.specialization
                        ? ` - ${doctor.specialization}`
                        : ""
                );

            doctorSelect.appendChild(option);

        });

    }


    /* =====================================================
       MEDICAL RECORD DROPDOWN
       ===================================================== */

    function populateMedicalRecords() {

        medicalRecordSelect.innerHTML =
            `<option value="">Select medical record</option>`;


        medicalRecords.forEach(record => {

            const option =
                document.createElement("option");

            option.value =
                record.record_id;


            const patientName =
                record.patient_number ||
                getFullNameFromRecord(record);


            option.textContent =
                `MR-${String(record.record_id).padStart(4, "0")}` +
                ` - ${patientName}` +
                (
                    record.diagnosis
                        ? ` - ${record.diagnosis}`
                        : ""
                );


            option.dataset.patientId =
                record.patient_id;

            option.dataset.doctorId =
                record.doctor_id;


            medicalRecordSelect.appendChild(option);

        });

    }


    /* =====================================================
       MEDICINE DROPDOWN
       ===================================================== */

    function createMedicineOptions() {

        let html =
            `<option value="">Select medicine</option>`;


        medicines.forEach(medicine => {

            const availableQuantity =
                Number(medicine.quantity || 0);


            /*
             * Do not allow inactive or expired medicine
             * to be selected for a prescription.
             */

            if (
                medicine.status === "Inactive" ||
                medicine.status === "Expired"
            ) {

                return;

            }


            let extraText = "";


            if (medicine.status) {

                extraText =
                    ` - ${medicine.status}`;

            }


            html +=
                `<option
                    value="${medicine.medicine_id}"
                    data-dosage="${escapeAttribute(
                        medicine.dosage || ""
                    )}"
                    data-quantity="${availableQuantity}">

                    ${escapeHtml(
                        medicine.medicine_name
                    )}

                    ${extraText}

                </option>`;

        });


        return html;

    }


    function updateMedicineSelects() {

        const selects =
            medicineItems.querySelectorAll(
                ".medicineSelect"
            );


        selects.forEach(select => {

            const oldValue =
                select.value;


            select.innerHTML =
                createMedicineOptions();


            if (oldValue) {

                select.value =
                    oldValue;

            }

        });

    }


    /* =====================================================
       ADD MEDICINE ROW
       ===================================================== */

    function addMedicineRow(data = null) {

        const medicineItem =
            document.createElement("div");


        medicineItem.className =
            "medicine-item";


        medicineItem.innerHTML = `

            <div class="form-grid">

                <div class="form-group">

                    <label>
                        Medicine *
                    </label>

                    <select
                        class="medicineSelect"
                        required>

                        ${createMedicineOptions()}

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Quantity *
                    </label>

                    <input
                        type="number"
                        class="medicineQuantity"
                        min="1"
                        value="${data?.quantity || 1}"
                        required>

                </div>


                <div class="form-group">

                    <label>
                        Dosage
                    </label>

                    <input
                        type="text"
                        class="medicineDosage"
                        placeholder="e.g. 500 mg"
                        value="${escapeAttribute(
                            data?.dosage || ""
                        )}">

                </div>


                <div class="form-group">

                    <label>
                        Frequency
                    </label>

                    <input
                        type="text"
                        class="medicineFrequency"
                        placeholder="e.g. 3 times daily"
                        value="${escapeAttribute(
                            data?.frequency || ""
                        )}">

                </div>


                <div class="form-group">

                    <label>
                        Duration
                    </label>

                    <input
                        type="text"
                        class="medicineDuration"
                        placeholder="e.g. 5 days"
                        value="${escapeAttribute(
                            data?.duration || ""
                        )}">

                </div>

            </div>


            <button
                type="button"
                class="btn-danger removeMedicineBtn">

                <i class="fas fa-trash"></i>

                Remove Medicine

            </button>

        `;


        medicineItems.appendChild(
            medicineItem
        );


        const select =
            medicineItem.querySelector(
                ".medicineSelect"
            );


        if (data?.medicine_id) {

            select.value =
                data.medicine_id;


            /*
             * Fill dosage and stock limit when
             * editing an existing prescription.
             */

            const selectedOption =
                select.options[
                    select.selectedIndex
                ];


            if (
                selectedOption &&
                selectedOption.dataset.dosage
            ) {

                const dosage =
                    medicineItem.querySelector(
                        ".medicineDosage"
                    );


                if (!dosage.value) {

                    dosage.value =
                        selectedOption.dataset.dosage;

                }

            }


            if (selectedOption) {

                const available =
                    Number(
                        selectedOption.dataset.quantity || 0
                    );


                const quantity =
                    medicineItem.querySelector(
                        ".medicineQuantity"
                    );


                if (available > 0) {

                    quantity.max =
                        available;

                }

            }

        }


        setupMedicineRowEvents(
            medicineItem
        );

    }


    /* =====================================================
       MEDICINE ROW EVENTS
       ===================================================== */

    function setupMedicineRowEvents(item) {

        const select =
            item.querySelector(
                ".medicineSelect"
            );


        const dosage =
            item.querySelector(
                ".medicineDosage"
            );


        const quantity =
            item.querySelector(
                ".medicineQuantity"
            );


        const removeButton =
            item.querySelector(
                ".removeMedicineBtn"
            );


        /* Medicine selected */

        select.addEventListener(
            "change",
            function () {

                const option =
                    select.options[
                        select.selectedIndex
                    ];


                if (
                    option &&
                    option.dataset.dosage
                ) {

                    dosage.value =
                        option.dataset.dosage;

                }


                const available =
                    Number(
                        option?.dataset.quantity || 0
                    );


                if (available > 0) {

                    quantity.max =
                        available;

                    if (
                        Number(quantity.value) >
                        available
                    ) {

                        quantity.value =
                            available;

                    }

                } else {

                    quantity.removeAttribute(
                        "max"
                    );

                }

            }
        );


        /* Remove medicine */

        removeButton.addEventListener(
            "click",
            function () {

                const allItems =
                    medicineItems.querySelectorAll(
                        ".medicine-item"
                    );


                /*
                 * If only one row exists,
                 * do not remove it.
                 */

                if (allItems.length === 1) {

                    alert(
                        "At least one medicine is required."
                    );

                    return;

                }


                item.remove();

            }
        );

    }


    /* =====================================================
       PATIENT CHANGE
       ===================================================== */

    function handlePatientChange() {

        const patientId =
            patientSelect.value;


        const options =
            medicalRecordSelect.querySelectorAll(
                "option"
            );


        options.forEach(option => {

            if (!option.value) {

                return;

            }


            if (
                !patientId ||
                option.dataset.patientId ===
                patientId
            ) {

                option.hidden = false;

            } else {

                option.hidden = true;

            }

        });


        /*
         * Reset selected medical record
         * when patient changes.
         */

        medicalRecordSelect.value = "";

    }


    /* =====================================================
       MEDICAL RECORD CHANGE
       ===================================================== */

    function handleMedicalRecordChange() {

        const selected =
            medicalRecordSelect.options[
                medicalRecordSelect.selectedIndex
            ];


        if (
            !selected ||
            !selected.value
        ) {

            return;

        }


        const patientId =
            selected.dataset.patientId;


        const doctorId =
            selected.dataset.doctorId;


        if (patientId) {

            patientSelect.value =
                patientId;

        }


        if (doctorId) {

            doctorSelect.value =
                doctorId;

        }

    }


    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    async function handleFormSubmit(event) {

        event.preventDefault();


        const patientId =
            Number(
                patientSelect.value
            );


        const doctorId =
            Number(
                doctorSelect.value
            );


        const recordId =
            medicalRecordSelect.value
                ? Number(
                    medicalRecordSelect.value
                )
                : null;


        if (!patientId) {

            alert(
                "Please select a patient."
            );

            return;

        }


        if (!doctorId) {

            alert(
                "Please select a doctor."
            );

            return;

        }


        const items =
            collectMedicineItems();


        if (items.length === 0) {

            alert(
                "Please select at least one medicine."
            );

            return;

        }


        /*
         * Check quantity.
         */

        for (const item of items) {

            if (
                !item.quantity ||
                item.quantity <= 0
            ) {

                alert(
                    "Medicine quantity must be greater than 0."
                );

                return;

            }


            const medicine =
                medicines.find(
                    medicine =>
                        Number(
                            medicine.medicine_id
                        ) ===
                        Number(
                            item.medicine_id
                        )
                );


            if (!medicine) {

                alert(
                    "Selected medicine was not found."
                );

                return;

            }


            if (
                Number(item.quantity) >
                Number(medicine.quantity || 0)
            ) {

                alert(
                    `${medicine.medicine_name} has only ` +
                    `${medicine.quantity} available.`
                );

                return;

            }

        }


        const payload = {

            patient_id:
                patientId,

            doctor_id:
                doctorId,

            record_id:
                recordId,

            prescription_date:
                prescriptionDate.value,

            instructions:
                instructions.value.trim(),

            items:
                items

        };


        try {

            savePrescriptionBtn.disabled =
                true;


            const editingId =
                prescriptionId.value;


            let response;


            if (editingId) {

                response =
                    await fetch(
                        `${API_URL}/prescriptions/${editingId}`,
                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            } else {

                response =
                    await fetch(
                        `${API_URL}/prescriptions`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    payload
                                )
                        }
                    );

            }


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to save prescription."
                );

            }


            alert(
                editingId
                    ? "Prescription updated successfully."
                    : "Prescription saved successfully."
            );


            clearForm();


            await loadAllData();


        } catch (error) {

            console.error(
                "Save prescription error:",
                error
            );


            alert(
                error.message ||
                "An error occurred while saving the prescription."
            );


        } finally {

            savePrescriptionBtn.disabled =
                false;

        }

    }


    /* =====================================================
       COLLECT MEDICINE ITEMS
       ===================================================== */

    function collectMedicineItems() {

        const rows =
            medicineItems.querySelectorAll(
                ".medicine-item"
            );


        const items = [];


        rows.forEach(row => {

            const medicineSelect =
                row.querySelector(
                    ".medicineSelect"
                );


            const quantity =
                row.querySelector(
                    ".medicineQuantity"
                );


            const dosage =
                row.querySelector(
                    ".medicineDosage"
                );


            const frequency =
                row.querySelector(
                    ".medicineFrequency"
                );


            const duration =
                row.querySelector(
                    ".medicineDuration"
                );


            const medicineId =
                Number(
                    medicineSelect.value
                );


            if (!medicineId) {

                return;

            }


            items.push({

                medicine_id:
                    medicineId,

                quantity:
                    Number(
                        quantity.value
                    ),

                dosage:
                    dosage.value.trim(),

                frequency:
                    frequency.value.trim(),

                duration:
                    duration.value.trim()

            });

        });


        return items;

    }


    /* =====================================================
       LOAD PRESCRIPTIONS
       ===================================================== */

    async function loadPrescriptions() {

        try {

            const response =
                await fetch(
                    `${API_URL}/prescriptions`
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load prescriptions."
                );

            }


            prescriptions =
                data.prescriptions || [];


            renderPrescriptions();

            updateStatistics();


        } catch (error) {

            console.error(
                "Load prescriptions error:",
                error
            );

        }

    }


    /* =====================================================
       RENDER PRESCRIPTIONS
       ===================================================== */

    function renderPrescriptions() {

        const search =
            searchPrescription.value
                .trim()
                .toLowerCase();


        const filtered =
            prescriptions.filter(
                prescription => {

                    if (!search) {

                        return true;

                    }


                    const patient =
                        getPrescriptionPatientName(
                            prescription
                        ).toLowerCase();


                    const doctor =
                        getPrescriptionDoctorName(
                            prescription
                        ).toLowerCase();


                    const medicine =
                        getPrescriptionMedicineNames(
                            prescription
                        ).toLowerCase();


                    return (
                        patient.includes(search) ||
                        doctor.includes(search) ||
                        medicine.includes(search)
                    );

                }
            );


        prescriptionTableBody.innerHTML =
            "";


        if (filtered.length === 0) {

            emptyPrescriptions.style.display =
                "block";

            return;

        }


        emptyPrescriptions.style.display =
            "none";


        filtered.forEach(
            prescription => {

                const row =
                    document.createElement("tr");


                const patient =
                    getPrescriptionPatientName(
                        prescription
                    );


                const doctor =
                    getPrescriptionDoctorName(
                        prescription
                    );


                const medicineNames =
                    getPrescriptionMedicineNames(
                        prescription
                    );


                const date =
                    formatDate(
                        prescription.prescription_date
                    );


                row.innerHTML = `

                    <td>
                        PR-${String(
                            prescription.prescription_id
                        ).padStart(4, "0")}
                    </td>

                    <td>
                        ${escapeHtml(patient)}
                    </td>

                    <td>
                        ${escapeHtml(doctor)}
                    </td>

                    <td>
                        ${escapeHtml(date)}
                    </td>

                    <td>
                        ${escapeHtml(
                            medicineNames
                        )}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="btn-view"
                                title="View"
                                data-action="view"
                                data-id="${prescription.prescription_id}">

                                <i class="fas fa-eye"></i>

                            </button>


                            <button
                                type="button"
                                class="btn-secondary"
                                title="Edit"
                                data-action="edit"
                                data-id="${prescription.prescription_id}">

                                <i class="fas fa-pen"></i>

                            </button>


                            <button
                                type="button"
                                class="btn-danger"
                                title="Delete"
                                data-action="delete"
                                data-id="${prescription.prescription_id}">

                                <i class="fas fa-trash"></i>

                            </button>

                        </div>

                    </td>

                `;


                prescriptionTableBody.appendChild(
                    row
                );

            }
        );

    }


    /* =====================================================
       TABLE ACTIONS
       ===================================================== */

    async function handleTableAction(event) {

        const button =
            event.target.closest(
                "button[data-action]"
            );


        if (!button) {

            return;

        }


        const id =
            Number(
                button.dataset.id
            );


        const action =
            button.dataset.action;


        if (action === "view") {

            viewPrescription(id);

        }


        if (action === "edit") {

            editPrescription(id);

        }


        if (action === "delete") {

            await deletePrescription(id);

        }

    }


    /* =====================================================
       VIEW PRESCRIPTION
       ===================================================== */

    function viewPrescription(id) {

        const prescription =
            prescriptions.find(
                item =>
                    Number(
                        item.prescription_id
                    ) === id
            );


        if (!prescription) {

            alert(
                "Prescription not found."
            );

            return;

        }


        const patient =
            getPrescriptionPatientName(
                prescription
            );


        const doctor =
            getPrescriptionDoctorName(
                prescription
            );


        const items =
            prescription.items || [];


        let itemsHtml = "";


        if (items.length === 0) {

            itemsHtml =
                "<p>No medicine items found.</p>";

        } else {

            itemsHtml = `

                <table class="prescription-detail-table">

                    <thead>

                        <tr>

                            <th>Medicine</th>

                            <th>Quantity</th>

                            <th>Dosage</th>

                            <th>Frequency</th>

                            <th>Duration</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${items.map(item => `

                            <tr>

                                <td>
                                    ${escapeHtml(
                                        item.medicine_name ||
                                        "Unknown"
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        String(
                                            item.quantity || ""
                                        )
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        item.dosage || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        item.frequency || ""
                                    )}
                                </td>

                                <td>
                                    ${escapeHtml(
                                        item.duration || ""
                                    )}
                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            `;

        }


        prescriptionDetails.innerHTML = `

            <div class="detail-grid">

                <div class="detail-item">

                    <strong>Prescription ID</strong>

                    PR-${String(
                        prescription.prescription_id
                    ).padStart(4, "0")}

                </div>


                <div class="detail-item">

                    <strong>Date</strong>

                    ${escapeHtml(
                        formatDateTime(
                            prescription.prescription_date
                        )
                    )}

                </div>


                <div class="detail-item">

                    <strong>Patient</strong>

                    ${escapeHtml(patient)}

                </div>


                <div class="detail-item">

                    <strong>Doctor</strong>

                    ${escapeHtml(doctor)}

                </div>


                <div class="detail-item">

                    <strong>Medical Record</strong>

                    ${
                        prescription.record_id
                            ? `MR-${String(
                                prescription.record_id
                            ).padStart(4, "0")}`
                            : "None"
                    }

                </div>

            </div>


            <h3 class="prescription-detail-title">

                <i class="fas fa-pills"></i>

                Medicines

            </h3>


            ${itemsHtml}


            <h3 class="prescription-detail-title">

                <i class="fas fa-note-sticky"></i>

                Instructions

            </h3>


            <div class="prescription-instructions">

                ${
                    prescription.instructions
                        ? escapeHtml(
                            prescription.instructions
                        )
                        : "No special instructions."
                }

            </div>

        `;


        prescriptionModal.classList.add(
            "show"
        );

    }


    /* =====================================================
       EDIT PRESCRIPTION
       ===================================================== */

    function editPrescription(id) {

        const prescription =
            prescriptions.find(
                item =>
                    Number(
                        item.prescription_id
                    ) === id
            );


        if (!prescription) {

            alert(
                "Prescription not found."
            );

            return;

        }


        prescriptionId.value =
            prescription.prescription_id;


        patientSelect.value =
            prescription.patient_id || "";


        doctorSelect.value =
            prescription.doctor_id || "";


        medicalRecordSelect.value =
            prescription.record_id || "";


        prescriptionDate.value =
            convertToDateTimeLocal(
                prescription.prescription_date
            );


        instructions.value =
            prescription.instructions || "";


        medicineItems.innerHTML =
            "";


        const items =
            prescription.items || [];


        if (items.length === 0) {

            addMedicineRow();

        } else {

            items.forEach(item => {

                addMedicineRow(item);

            });

        }


        savePrescriptionBtn.innerHTML = `

            <i class="fas fa-pen"></i>

            Update Prescription

        `;


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }


    /* =====================================================
       DELETE PRESCRIPTION
       ===================================================== */

    async function deletePrescription(id) {

        const prescription =
            prescriptions.find(
                item =>
                    Number(
                        item.prescription_id
                    ) === id
            );


        if (!prescription) {

            return;

        }


        const confirmed =
            confirm(
                "Are you sure you want to delete this prescription?"
            );


        if (!confirmed) {

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_URL}/prescriptions/${id}`,
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
                    data.message ||
                    "Unable to delete prescription."
                );

            }


            alert(
                "Prescription deleted successfully."
            );


            await loadPrescriptions();


        } catch (error) {

            console.error(
                "Delete prescription error:",
                error
            );


            alert(
                error.message ||
                "Unable to delete prescription."
            );

        }

    }


    /* =====================================================
       CLEAR FORM
       ===================================================== */

    function clearForm() {

        prescriptionForm.reset();


        prescriptionId.value =
            "";


        medicineItems.innerHTML =
            "";


        /*
         * Create exactly ONE medicine row.
         */

        addMedicineRow();


        setDefaultDate();


        savePrescriptionBtn.innerHTML = `

            <i class="fas fa-save"></i>

            Save Prescription

        `;


        medicalRecordSelect
            .querySelectorAll("option")
            .forEach(option => {

                option.hidden = false;

            });

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    function handleSearch() {

        renderPrescriptions();

    }


    /* =====================================================
       MODAL
       ===================================================== */

    function closeModal() {

        prescriptionModal.classList.remove(
            "show"
        );

    }


    /* =====================================================
       PRINT
       ===================================================== */

    function printPrescription() {

        const content =
            prescriptionDetails.innerHTML;


        const printWindow =
            window.open(
                "",
                "_blank",
                "width=900,height=700"
            );


        if (!printWindow) {

            alert(
                "Please allow pop-ups to print the prescription."
            );

            return;

        }


        printWindow.document.write(`

            <!DOCTYPE html>

            <html>

            <head>

                <title>
                    Daro Labu Hospital - Prescription
                </title>

                <style>

                    body {
                        font-family: Arial, sans-serif;
                        padding: 30px;
                        color: #222;
                    }

                    h1 {
                        text-align: center;
                        margin-bottom: 5px;
                    }

                    .hospital-name {
                        text-align: center;
                        margin-bottom: 25px;
                        color: #555;
                    }

                    .detail-grid {
                        display: grid;
                        grid-template-columns:
                            repeat(2, 1fr);
                        gap: 12px;
                        margin-bottom: 25px;
                    }

                    .detail-item {
                        background: #f5f5f5;
                        padding: 12px;
                        border-radius: 5px;
                    }

                    .detail-item strong {
                        display: block;
                        margin-bottom: 5px;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }

                    th,
                    td {
                        border: 1px solid #ccc;
                        padding: 10px;
                        text-align: left;
                    }

                    th {
                        background: #f0f0f0;
                    }

                    .prescription-instructions {
                        border: 1px solid #ddd;
                        padding: 15px;
                        min-height: 50px;
                    }

                    @media print {

                        body {
                            padding: 10px;
                        }

                    }

                </style>

            </head>

            <body>

                <h1>
                    DARO LABU HOSPITAL
                </h1>

                <div class="hospital-name">
                    Prescription
                </div>

                ${content}

            </body>

            </html>

        `);


        printWindow.document.close();

        printWindow.focus();

        printWindow.print();

    }


    /* =====================================================
       STATISTICS
       ===================================================== */

    function updateStatistics() {

        totalPrescriptions.textContent =
            prescriptions.length;


        let itemCount = 0;

        let recordCount = 0;

        let todayCount = 0;


        const today =
            new Date()
                .toISOString()
                .slice(0, 10);


        prescriptions.forEach(
            prescription => {

                itemCount +=
                    (prescription.items || []).length;


                if (
                    prescription.record_id
                ) {

                    recordCount++;

                }


                if (
                    prescription.prescription_date &&
                    String(
                        prescription.prescription_date
                    ).slice(0, 10) === today
                ) {

                    todayCount++;

                }

            }
        );


        totalPrescriptionItems.textContent =
            itemCount;


        recordPrescriptions.textContent =
            recordCount;


        todayPrescriptions.textContent =
            todayCount;

    }


    /* =====================================================
       DEFAULT DATE
       ===================================================== */

    function setDefaultDate() {

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


        const hours =
            String(
                now.getHours()
            ).padStart(2, "0");


        const minutes =
            String(
                now.getMinutes()
            ).padStart(2, "0");


        prescriptionDate.value =
            `${year}-${month}-${day}T${hours}:${minutes}`;

    }


    /* =====================================================
       EVENTS
       ===================================================== */

    function setupEvents() {

        /*
         * Add medicine
         */

        addMedicineBtn.addEventListener(
            "click",
            function () {

                addMedicineRow();

            }
        );


        /*
         * Patient change
         */

        patientSelect.addEventListener(
            "change",
            handlePatientChange
        );


        /*
         * Medical record change
         */

        medicalRecordSelect.addEventListener(
            "change",
            handleMedicalRecordChange
        );


        /*
         * Form submit
         */

        prescriptionForm.addEventListener(
            "submit",
            handleFormSubmit
        );


        /*
         * Clear form
         */

        clearPrescriptionBtn.addEventListener(
            "click",
            clearForm
        );


        /*
         * Search
         */

        searchPrescription.addEventListener(
            "input",
            handleSearch
        );


        /*
         * Table actions
         */

        prescriptionTableBody.addEventListener(
            "click",
            handleTableAction
        );


        /*
         * Close modal buttons
         */

        closePrescriptionModal.addEventListener(
            "click",
            closeModal
        );


        closePrescriptionBtn.addEventListener(
            "click",
            closeModal
        );


        /*
         * Close modal by clicking outside.
         */

        prescriptionModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    prescriptionModal
                ) {

                    closeModal();

                }

            }
        );


        /*
         * Print
         */

        printPrescriptionBtn.addEventListener(
            "click",
            printPrescription
        );

    }


    /* =====================================================
       NAME HELPERS
       ===================================================== */

    function getFullName(person) {

        return [

            person.first_name,

            person.middle_name,

            person.last_name

        ]
        .filter(Boolean)
        .join(" ");

    }


    function getFullNameFromRecord(record) {

        return [

            record.patient_first_name,

            record.patient_middle_name,

            record.patient_last_name

        ]
        .filter(Boolean)
        .join(" ");

    }


    function getPrescriptionPatientName(
        prescription
    ) {

        if (
            prescription.patient_name
        ) {

            return prescription.patient_name;

        }


        return [

            prescription.patient_first_name,

            prescription.patient_middle_name,

            prescription.patient_last_name

        ]
        .filter(Boolean)
        .join(" ") ||

        prescription.patient_number ||

        "Unknown Patient";

    }


    function getPrescriptionDoctorName(
        prescription
    ) {

        if (
            prescription.doctor_name
        ) {

            return prescription.doctor_name;

        }


        return [

            prescription.doctor_first_name,

            prescription.doctor_middle_name,

            prescription.doctor_last_name

        ]
        .filter(Boolean)
        .join(" ") ||

        "Unknown Doctor";

    }


    function getPrescriptionMedicineNames(
        prescription
    ) {

        const items =
            prescription.items || [];


        if (items.length === 0) {

            return "No medicine";

        }


        return items
            .map(
                item =>
                    item.medicine_name ||
                    "Unknown medicine"
            )
            .join(", ");

    }


    /* =====================================================
       DATE HELPERS
       ===================================================== */

    function formatDate(value) {

        if (!value) {

            return "";

        }


        const date =
            new Date(
                String(value)
                    .replace(" ", "T")
            );


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleDateString();

    }


    function formatDateTime(value) {

        if (!value) {

            return "";

        }


        const date =
            new Date(
                String(value)
                    .replace(" ", "T")
            );


        if (
            isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleString();

    }


    function convertToDateTimeLocal(
        value
    ) {

        if (!value) {

            return "";

        }


        const text =
            String(value)
                .replace(" ", "T");


        return text.slice(
            0,
            16
        );

    }


    /* =====================================================
       HTML SECURITY
       ===================================================== */

    function escapeHtml(value) {

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


    function escapeAttribute(value) {

        return escapeHtml(value);

    }

});