// =========================================================
// DARO LABU HOSPITAL - LABORATORY MODULE
// =========================================================

const API_BASE = "http://127.0.0.1:5000/api";

// =========================================================
// GLOBAL VARIABLES
// =========================================================

let patients = [];
let doctors = [];
let laboratoryTests = [];
let laboratoryRequests = [];
let laboratoryResults = [];

let editingRequestId = null;


// =========================================================
// PAGE LOAD
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    initializeLaboratoryPage();

});


// =========================================================
// INITIALIZE PAGE
// =========================================================

async function initializeLaboratoryPage() {

    try {

        await Promise.all([
            loadPatients(),
            loadDoctors(),
            loadLaboratoryTests(),
            loadLaboratoryRequests(),
            loadLaboratoryResults()
        ]);

        setupEventListeners();

        populatePatientSelect();
        populateDoctorSelect();
        populateTestSelect();

        renderLaboratoryRequests();

        updateStatistics();

    } catch (error) {

        console.error("Laboratory page initialization error:", error);

    }

}


// =========================================================
// LOAD PATIENTS
// =========================================================

async function loadPatients() {

    try {

        const response = await fetch(`${API_BASE}/patients`);

        if (!response.ok) {
            throw new Error("Failed to load patients");
        }

        const data = await response.json();

        patients = data.patients || [];

        console.log("Patients loaded:", patients);

    } catch (error) {

        console.error("Error loading patients:", error);

        patients = [];

    }

}


// =========================================================
// LOAD DOCTORS
// =========================================================

async function loadDoctors() {

    try {

        const response = await fetch(`${API_BASE}/doctors`);

        if (!response.ok) {
            throw new Error("Failed to load doctors");
        }

        const data = await response.json();

        doctors = data.doctors || [];

        console.log("Doctors loaded:", doctors);

    } catch (error) {

        console.error("Error loading doctors:", error);

        doctors = [];

    }

}


// =========================================================
// LOAD LABORATORY TESTS
// =========================================================

async function loadLaboratoryTests() {

    try {

        const response = await fetch(`${API_BASE}/laboratory/tests`);

        if (!response.ok) {
            throw new Error("Failed to load laboratory tests");
        }

        const data = await response.json();

        laboratoryTests = data.tests || [];

        console.log("Laboratory tests loaded:", laboratoryTests);

    } catch (error) {

        console.error("Error loading laboratory tests:", error);

        laboratoryTests = [];

    }

}


// =========================================================
// LOAD LABORATORY REQUESTS
// =========================================================

async function loadLaboratoryRequests() {

    try {

        const response = await fetch(`${API_BASE}/laboratory/requests`);

        if (!response.ok) {
            throw new Error("Failed to load laboratory requests");
        }

        const data = await response.json();

        laboratoryRequests = data.requests || [];

        console.log("Laboratory requests loaded:", laboratoryRequests);

    } catch (error) {

        console.error("Error loading laboratory requests:", error);

        laboratoryRequests = [];

    }

}


// =========================================================
// LOAD LABORATORY RESULTS
// =========================================================

async function loadLaboratoryResults() {

    try {

        const response = await fetch(`${API_BASE}/laboratory/results`);

        if (!response.ok) {
            throw new Error("Failed to load laboratory results");
        }

        const data = await response.json();

        laboratoryResults = data.results || [];

        console.log("Laboratory results loaded:", laboratoryResults);

    } catch (error) {

        console.error("Error loading laboratory results:", error);

        laboratoryResults = [];

    }

}


// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEventListeners() {

    const addLabTestBtn = document.getElementById("addLabTestBtn");

    if (addLabTestBtn) {

        addLabTestBtn.addEventListener("click", function () {

            openLaboratoryModal();

        });

    }


    const closeLabModalBtn = document.getElementById("closeLabModalBtn");

    if (closeLabModalBtn) {

        closeLabModalBtn.addEventListener("click", function () {

            closeLaboratoryModal();

        });

    }


    const cancelLabBtn = document.getElementById("cancelLabBtn");

    if (cancelLabBtn) {

        cancelLabBtn.addEventListener("click", function () {

            closeLaboratoryModal();

        });

    }


    const laboratoryForm = document.getElementById("laboratoryForm");

    if (laboratoryForm) {

        laboratoryForm.addEventListener("submit", handleLaboratoryFormSubmit);

    }


    const labSearch = document.getElementById("labSearch");

    if (labSearch) {

        labSearch.addEventListener("input", function () {

            renderLaboratoryRequests();

        });

    }


    const statusFilter = document.getElementById("statusFilter");

    if (statusFilter) {

        statusFilter.addEventListener("change", function () {

            renderLaboratoryRequests();

        });

    }


    const testName = document.getElementById("testName");

    if (testName) {

        testName.addEventListener("change", function () {

            updateTestInformation();

        });

    }

}


// =========================================================
// PATIENT SELECT
// =========================================================

function populatePatientSelect() {

    const patientSelect = document.getElementById("labPatient");

    if (!patientSelect) return;

    patientSelect.innerHTML = `
        <option value="">Select Patient</option>
    `;

    patients.forEach(patient => {

        const option = document.createElement("option");

        option.value = patient.patient_id;

        const name = buildPatientName(patient);

        option.textContent =
            `${patient.patient_number || ""} - ${name}`.trim();

        patientSelect.appendChild(option);

    });

}


// =========================================================
// DOCTOR SELECT
// =========================================================

function populateDoctorSelect() {

    const doctorSelect = document.getElementById("labDoctor");

    if (!doctorSelect) return;

    doctorSelect.innerHTML = `
        <option value="">Not assigned</option>
    `;

    doctors.forEach(doctor => {

        const option = document.createElement("option");

        option.value = doctor.doctor_id;

        const name = buildDoctorName(doctor);

        option.textContent = `Dr. ${name}`;

        doctorSelect.appendChild(option);

    });

}


// =========================================================
// TEST SELECT
// =========================================================

function populateTestSelect() {

    const testSelect = document.getElementById("testName");

    if (!testSelect) return;

    testSelect.innerHTML = `
        <option value="">Select Test</option>
    `;

    laboratoryTests.forEach(test => {

        if (test.status && test.status !== "Active") {
            return;
        }

        const option = document.createElement("option");

        option.value = test.test_id;

        option.textContent = test.test_name;

        testSelect.appendChild(option);

    });

}


// =========================================================
// BUILD PATIENT NAME
// =========================================================

function buildPatientName(patient) {

    const parts = [
        patient.patient_first_name || patient.first_name,
        patient.patient_middle_name || patient.middle_name,
        patient.patient_last_name || patient.last_name
    ];

    return parts
        .filter(value => value && String(value).trim() !== "")
        .map(value => String(value).trim())
        .join(" ");

}


// =========================================================
// BUILD DOCTOR NAME
// =========================================================

function buildDoctorName(doctor) {

    const parts = [
        doctor.doctor_first_name || doctor.first_name,
        doctor.doctor_middle_name || doctor.middle_name,
        doctor.doctor_last_name || doctor.last_name
    ];

    return parts
        .filter(value => value && String(value).trim() !== "")
        .map(value => String(value).trim())
        .join(" ");

}


// =========================================================
// GET PATIENT NAME FROM REQUEST
// =========================================================

function getPatientName(request) {

    if (
        request.patient_first_name ||
        request.patient_middle_name ||
        request.patient_last_name
    ) {

        const name = [
            request.patient_first_name,
            request.patient_middle_name,
            request.patient_last_name
        ]
            .filter(value => value && String(value).trim() !== "")
            .join(" ");

        if (request.patient_number) {
            return `${request.patient_number} - ${name}`;
        }

        return name || "Unknown Patient";
    }


    const patient = patients.find(item =>
        Number(item.patient_id) === Number(request.patient_id)
    );


    if (!patient) {
        return "Unknown Patient";
    }


    const name = buildPatientName(patient);

    if (patient.patient_number) {
        return `${patient.patient_number} - ${name}`;
    }

    return name || "Unknown Patient";

}


// =========================================================
// GET DOCTOR NAME FROM REQUEST
// =========================================================

function getDoctorName(request) {

    if (
        request.doctor_first_name ||
        request.doctor_middle_name ||
        request.doctor_last_name
    ) {

        const name = [
            request.doctor_first_name,
            request.doctor_middle_name,
            request.doctor_last_name
        ]
            .filter(value => value && String(value).trim() !== "")
            .join(" ");

        return name ? `Dr. ${name}` : "Unknown Doctor";

    }


    if (
        request.doctor_id === null ||
        request.doctor_id === undefined ||
        request.doctor_id === ""
    ) {

        return "Not assigned";

    }


    const doctor = doctors.find(item =>
        Number(item.doctor_id) === Number(request.doctor_id)
    );


    if (!doctor) {
        return "Unknown Doctor";
    }


    const name = buildDoctorName(doctor);

    return name ? `Dr. ${name}` : "Unknown Doctor";

}


// =========================================================
// GET TEST NAME
// =========================================================

function getTestName(request) {

    if (request.test_name) {
        return request.test_name;
    }

    const test = laboratoryTests.find(item =>
        Number(item.test_id) === Number(request.test_id)
    );

    return test ? test.test_name : "Unknown Test";

}


// =========================================================
// GET TEST CATEGORY
// =========================================================

function getTestCategory(request) {

    if (request.category) {
        return request.category;
    }

    const test = laboratoryTests.find(item =>
        Number(item.test_id) === Number(request.test_id)
    );

    return test ? (test.category || "-") : "-";

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(dateValue) {

    if (!dateValue) {
        return "-";
    }

    const date = new Date(dateValue);

    if (isNaN(date.getTime())) {
        return dateValue;
    }

    return date.toLocaleDateString("en-US", {

        year: "numeric",
        month: "numeric",
        day: "numeric"

    });

}


// =========================================================
// RENDER LABORATORY REQUESTS
// =========================================================

function renderLaboratoryRequests() {

    const tableBody =
        document.getElementById("laboratoryTableBody");

    if (!tableBody) return;


    const searchInput =
        document.getElementById("labSearch");

    const statusFilter =
        document.getElementById("statusFilter");


    const searchText =
        searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";


    const selectedStatus =
        statusFilter
            ? statusFilter.value
            : "";


    let filteredRequests = laboratoryRequests.filter(request => {

        const patient = getPatientName(request).toLowerCase();

        const doctor = getDoctorName(request).toLowerCase();

        const test = getTestName(request).toLowerCase();

        const requestId =
            String(request.request_id || "").toLowerCase();

        const status =
            String(request.status || "").toLowerCase();


        const matchesSearch =
            !searchText ||
            patient.includes(searchText) ||
            doctor.includes(searchText) ||
            test.includes(searchText) ||
            requestId.includes(searchText);


        const matchesStatus =
            !selectedStatus ||
            request.status === selectedStatus;


        return matchesSearch && matchesStatus;

    });


    tableBody.innerHTML = "";


    if (filteredRequests.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align:center; padding:30px;">
                    No laboratory requests found.
                </td>
            </tr>
        `;

        return;

    }


    filteredRequests.forEach(request => {

        const row = document.createElement("tr");


        const patient = getPatientName(request);

        const doctor = getDoctorName(request);

        const test = getTestName(request);

        const category = getTestCategory(request);

        const date = formatDate(request.request_date);

        const priority = request.priority || "Normal";

        const status = request.status || "Requested";


        row.innerHTML = `

            <td>
                LAB-${String(request.request_id).padStart(4, "0")}
            </td>

            <td>
                ${escapeHtml(patient)}
            </td>

            <td>
                ${escapeHtml(doctor)}
            </td>

            <td>
                ${escapeHtml(test)}
            </td>

            <td>
                ${escapeHtml(category)}
            </td>

            <td>
                ${date}
            </td>

            <td>
                ${escapeHtml(priority)}
            </td>

            <td>
                <span class="status-badge ${getStatusClass(status)}">
                    ${escapeHtml(status)}
                </span>
            </td>

            <td>

                <button
                    type="button"
                    class="action-btn view-btn"
                    onclick="viewLaboratoryRequest(${request.request_id})"
                    title="View">
                    <i class="fas fa-eye"></i>
                </button>

                <button
                    type="button"
                    class="action-btn edit-btn"
                    onclick="editLaboratoryRequest(${request.request_id})"
                    title="Edit">
                    <i class="fas fa-edit"></i>
                </button>

                <button
                    type="button"
                    class="action-btn delete-btn"
                    onclick="deleteLaboratoryRequest(${request.request_id})"
                    title="Delete">
                    <i class="fas fa-trash"></i>
                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// =========================================================
// STATUS CLASS
// =========================================================

function getStatusClass(status) {

    switch (status) {

        case "Requested":
            return "status-requested";

        case "Sample Collected":
            return "status-collected";

        case "Processing":
            return "status-processing";

        case "Completed":
            return "status-completed";

        case "Cancelled":
            return "status-cancelled";

        default:
            return "";

    }

}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics() {

    const totalTests =
        document.getElementById("totalTests");

    const pendingTests =
        document.getElementById("pendingTests");

    const completedTests =
        document.getElementById("completedTests");

    const cancelledTests =
        document.getElementById("cancelledTests");


    const total =
        laboratoryRequests.length;


    const pending =
        laboratoryRequests.filter(request =>
            request.status !== "Completed" &&
            request.status !== "Cancelled"
        ).length;


    const completed =
        laboratoryRequests.filter(request =>
            request.status === "Completed"
        ).length;


    const cancelled =
        laboratoryRequests.filter(request =>
            request.status === "Cancelled"
        ).length;


    if (totalTests) {
        totalTests.textContent = total;
    }

    if (pendingTests) {
        pendingTests.textContent = pending;
    }

    if (completedTests) {
        completedTests.textContent = completed;
    }

    if (cancelledTests) {
        cancelledTests.textContent = cancelled;
    }

}


// =========================================================
// OPEN MODAL
// =========================================================

function openLaboratoryModal(request = null) {

    const modal = document.getElementById("labModal");

    const form = document.getElementById("laboratoryForm");

    const title = document.getElementById("labModalTitle");


    if (!modal || !form) return;


    editingRequestId = request
        ? request.request_id
        : null;


    if (title) {

        title.textContent =
            request
                ? "Edit Laboratory Request"
                : "New Laboratory Request";

    }


    form.reset();


    populatePatientSelect();

    populateDoctorSelect();

    populateTestSelect();


    if (request) {

        const patientSelect =
            document.getElementById("labPatient");

        const doctorSelect =
            document.getElementById("labDoctor");

        const testSelect =
            document.getElementById("testName");

        const categoryInput =
            document.getElementById("testCategory");

        const dateInput =
            document.getElementById("testDate");

        const prioritySelect =
            document.getElementById("labPriority");

        const statusSelect =
            document.getElementById("labStatus");

        const priceInput =
            document.getElementById("testPrice");

        const resultInput =
            document.getElementById("testResult");

        const notesInput =
            document.getElementById("labNotes");


        if (patientSelect) {
            patientSelect.value = request.patient_id || "";
        }

        if (doctorSelect) {
            doctorSelect.value = request.doctor_id || "";
        }

        if (testSelect) {
            testSelect.value = request.test_id || "";
        }

        if (categoryInput) {
            categoryInput.value = request.category || "";
        }

        if (dateInput && request.request_date) {

            dateInput.value =
                request.request_date.substring(0, 10);

        }

        if (prioritySelect) {
            prioritySelect.value =
                request.priority || "Normal";
        }

        if (statusSelect) {
            statusSelect.value =
                request.status || "Requested";
        }

        if (priceInput) {
            priceInput.value =
                request.price || "0.00";
        }

        if (notesInput) {
            notesInput.value =
                request.notes || "";
        }

        if (resultInput) {

            const result = laboratoryResults.find(item =>
                Number(item.request_id) ===
                Number(request.request_id)
            );

            resultInput.value =
                result
                    ? result.result_value || ""
                    : "";

        }

    }


    updateTestInformation();


    modal.style.display = "flex";

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeLaboratoryModal() {

    const modal = document.getElementById("labModal");

    if (modal) {
        modal.style.display = "none";
    }

    editingRequestId = null;

}


// =========================================================
// UPDATE TEST INFORMATION
// =========================================================

function updateTestInformation() {

    const testSelect =
        document.getElementById("testName");

    const categoryInput =
        document.getElementById("testCategory");

    const priceInput =
        document.getElementById("testPrice");


    if (!testSelect) return;


    const test = laboratoryTests.find(item =>
        Number(item.test_id) === Number(testSelect.value)
    );


    if (!test) {

        if (categoryInput) {
            categoryInput.value = "";
        }

        if (priceInput) {
            priceInput.value = "";
        }

        return;

    }


    if (categoryInput) {

        categoryInput.value =
            test.category || "";

    }


    if (priceInput) {

        priceInput.value =
            test.price || "0.00";

    }

}


// =========================================================
// FORM SUBMIT
// =========================================================

async function handleLaboratoryFormSubmit(event) {

    event.preventDefault();


    const patientId =
        document.getElementById("labPatient")?.value;

    const doctorId =
        document.getElementById("labDoctor")?.value;

    const testId =
        document.getElementById("testName")?.value;

    const priority =
        document.getElementById("labPriority")?.value || "Normal";

    const status =
        document.getElementById("labStatus")?.value || "Requested";

    const notes =
        document.getElementById("labNotes")?.value || "";


    if (!patientId) {

        alert("Please select a patient.");

        return;

    }


    if (!testId) {

        alert("Please select a laboratory test.");

        return;

    }


    const requestData = {

        patient_id: Number(patientId),

        doctor_id:
            doctorId
                ? Number(doctorId)
                : null,

        test_id: Number(testId),

        priority: priority,

        status: status,

        notes: notes

    };


    try {

        let response;


        if (editingRequestId) {

            response = await fetch(
                `${API_BASE}/laboratory/requests/${editingRequestId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(requestData)
                }
            );

        } else {

            response = await fetch(
                `${API_BASE}/laboratory/requests`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(requestData)
                }
            );

        }


        const data = await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to save laboratory request."
            );

        }


        alert(
            editingRequestId
                ? "Laboratory request updated successfully."
                : "Laboratory request created successfully."
        );


        closeLaboratoryModal();


        await loadLaboratoryRequests();

        await loadLaboratoryResults();

        renderLaboratoryRequests();

        updateStatistics();


    } catch (error) {

        console.error("Save laboratory request error:", error);

        alert(error.message);

    }

}


// =========================================================
// VIEW REQUEST
// =========================================================

function viewLaboratoryRequest(requestId) {

    const request = laboratoryRequests.find(item =>
        Number(item.request_id) === Number(requestId)
    );


    if (!request) {

        alert("Laboratory request not found.");

        return;

    }


    const patient = getPatientName(request);

    const doctor = getDoctorName(request);

    const test = getTestName(request);

    const category = getTestCategory(request);


    const result = laboratoryResults.find(item =>
        Number(item.request_id) === Number(requestId)
    );


    let message = `

Laboratory Request

Request ID: LAB-${String(request.request_id).padStart(4, "0")}

Patient: ${patient}

Doctor: ${doctor}

Test: ${test}

Category: ${category}

Date: ${formatDate(request.request_date)}

Priority: ${request.priority || "Normal"}

Status: ${request.status || "Requested"}

`;


    if (request.notes) {

        message += `

Notes: ${request.notes}
`;

    }


    if (result) {

        message += `

Result: ${result.result_value || "-"}

Reference Range: ${result.reference_range || "-"}

Interpretation: ${result.interpretation || "-"}

Technician: ${result.technician_name || "-"}
`;

    }


    alert(message);

}


// =========================================================
// EDIT REQUEST
// =========================================================

function editLaboratoryRequest(requestId) {

    const request = laboratoryRequests.find(item =>
        Number(item.request_id) === Number(requestId)
    );


    if (!request) {

        alert("Laboratory request not found.");

        return;

    }


    openLaboratoryModal(request);

}


// =========================================================
// DELETE REQUEST
// =========================================================

async function deleteLaboratoryRequest(requestId) {

    const confirmed = confirm(
        "Are you sure you want to delete this laboratory request?"
    );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `${API_BASE}/laboratory/requests/${requestId}`,
            {
                method: "DELETE"
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Failed to delete laboratory request."
            );

        }


        alert("Laboratory request deleted successfully.");


        await loadLaboratoryRequests();

        await loadLaboratoryResults();

        renderLaboratoryRequests();

        updateStatistics();


    } catch (error) {

        console.error("Delete laboratory request error:", error);

        alert(error.message);

    }

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }


    return String(value)

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#039;");

}


// =========================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =========================================================

window.addEventListener("click", function (event) {

    const modal =
        document.getElementById("labModal");


    if (modal && event.target === modal) {

        closeLaboratoryModal();

    }

});


// =========================================================
// MAKE FUNCTIONS AVAILABLE TO HTML BUTTONS
// =========================================================

window.viewLaboratoryRequest =
    viewLaboratoryRequest;

window.editLaboratoryRequest =
    editLaboratoryRequest;

window.deleteLaboratoryRequest =
    deleteLaboratoryRequest;

window.openLaboratoryModal =
    openLaboratoryModal;

window.closeLaboratoryModal =
    closeLaboratoryModal;