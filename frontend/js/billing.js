/* =========================================================
   DARO LABU HOSPITAL
   BILLING JAVASCRIPT
========================================================= */

const API_BASE = "http://127.0.0.1:5000/api";


// =========================================================
// GLOBAL DATA
// =========================================================

let patients = [];
let doctors = [];
let invoices = [];


// =========================================================
// DOM ELEMENTS
// =========================================================

const billingForm = document.getElementById("billingForm");

const invoicePatient = document.getElementById("invoicePatient");
const invoiceDoctor = document.getElementById("invoiceDoctor");
const invoiceDate = document.getElementById("invoiceDate");
const invoiceServiceType = document.getElementById("invoiceServiceType");
const invoiceDescription = document.getElementById("invoiceDescription");
const invoiceQuantity = document.getElementById("invoiceQuantity");
const invoiceUnitPrice = document.getElementById("invoiceUnitPrice");
const invoiceDiscount = document.getElementById("invoiceDiscount");

const paymentStatus = document.getElementById("paymentStatus");
const paymentMethod = document.getElementById("paymentMethod");
const amountPaid = document.getElementById("amountPaid");

const invoiceNotes = document.getElementById("invoiceNotes");

const subtotalElement = document.getElementById("subtotal");
const discountDisplay = document.getElementById("discountDisplay");
const totalAmountElement = document.getElementById("totalAmount");

const invoiceTableBody = document.getElementById("invoiceTableBody");
const invoiceSearch = document.getElementById("invoiceSearch");
const paymentStatusFilter = document.getElementById("paymentStatusFilter");

const recordCount = document.getElementById("recordCount");
const emptyState = document.getElementById("emptyState");

const totalInvoices = document.getElementById("totalInvoices");
const paidInvoices = document.getElementById("paidInvoices");
const pendingInvoices = document.getElementById("pendingInvoices");
const totalRevenue = document.getElementById("totalRevenue");

const newInvoiceBtn = document.getElementById("newInvoiceBtn");
const clearFormBtn = document.getElementById("clearFormBtn");
const emptyCreateBtn = document.getElementById("emptyCreateBtn");

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const menuToggle = document.getElementById("menuToggle");
const logoutBtn = document.getElementById("logoutBtn");

const viewModal = document.getElementById("viewModal");
const closeViewModal = document.getElementById("closeViewModal");
const closeViewBtn = document.getElementById("closeViewBtn");
const invoicePreview = document.getElementById("invoicePreview");
const printInvoiceBtn = document.getElementById("printInvoiceBtn");


// =========================================================
// PAGE START
// =========================================================

document.addEventListener("DOMContentLoaded", async () => {

    setTodayDate();

    setupEvents();

    await loadPatients();

    await loadDoctors();

    await loadInvoices();

    calculateTotal();

});


// =========================================================
// SET TODAY DATE
// =========================================================

function setTodayDate() {

    if (!invoiceDate) return;

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    invoiceDate.value = `${year}-${month}-${day}`;
}


// =========================================================
// EVENT LISTENERS
// =========================================================

function setupEvents() {

    billingForm?.addEventListener("submit", handleCreateInvoice);

    invoiceQuantity?.addEventListener("input", calculateTotal);

    invoiceUnitPrice?.addEventListener("input", calculateTotal);

    invoiceDiscount?.addEventListener("input", calculateTotal);

    invoiceSearch?.addEventListener("input", renderInvoices);

    paymentStatusFilter?.addEventListener(
        "change",
        renderInvoices
    );

    newInvoiceBtn?.addEventListener(
        "click",
        showInvoiceForm
    );

    emptyCreateBtn?.addEventListener(
        "click",
        showInvoiceForm
    );

    clearFormBtn?.addEventListener(
        "click",
        clearForm
    );

    closeViewModal?.addEventListener(
        "click",
        closeInvoiceModal
    );

    closeViewBtn?.addEventListener(
        "click",
        closeInvoiceModal
    );

    printInvoiceBtn?.addEventListener(
        "click",
        printInvoice
    );

    menuToggle?.addEventListener(
        "click",
        openSidebar
    );

    sidebarOverlay?.addEventListener(
        "click",
        closeSidebar
    );

    logoutBtn?.addEventListener(
        "click",
        handleLogout
    );

}


// =========================================================
// LOAD PATIENTS
// =========================================================

async function loadPatients() {

    try {

        const response = await fetch(
            `${API_BASE}/patients`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load patients"
            );
        }

        patients = data.patients || [];

        populatePatients();

    } catch (error) {

        console.error("Patient loading error:", error);

        invoicePatient.innerHTML = `
            <option value="">
                Failed to load patients
            </option>
        `;

    }
}


// =========================================================
// POPULATE PATIENTS
// =========================================================

function populatePatients() {

    invoicePatient.innerHTML = `
        <option value="">
            Select patient
        </option>
    `;

    patients.forEach(patient => {

        const option = document.createElement("option");

        option.value = patient.patient_id;

        const name = [
            patient.first_name,
            patient.middle_name,
            patient.last_name
        ]
        .filter(Boolean)
        .join(" ");

        option.textContent =
            `${patient.patient_number || ""} - ${name}`;

        invoicePatient.appendChild(option);

    });

}


// =========================================================
// LOAD DOCTORS
// =========================================================

async function loadDoctors() {

    try {

        const response = await fetch(
            `${API_BASE}/doctors`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load doctors"
            );
        }

        doctors = data.doctors || [];

        populateDoctors();

    } catch (error) {

        console.error("Doctor loading error:", error);

        invoiceDoctor.innerHTML = `
            <option value="">
                Failed to load doctors
            </option>
        `;

    }
}


// =========================================================
// POPULATE DOCTORS
// =========================================================

function populateDoctors() {

    invoiceDoctor.innerHTML = `
        <option value="">
            Select doctor
        </option>
    `;

    doctors.forEach(doctor => {

        const option = document.createElement("option");

        option.value = doctor.doctor_id;

        const doctorName = [
            doctor.first_name,
            doctor.middle_name,
            doctor.last_name
        ]
        .filter(Boolean)
        .join(" ");

        option.textContent =
            `${doctorName}${doctor.specialization ? " - " + doctor.specialization : ""}`;

        invoiceDoctor.appendChild(option);

    });

}


// =========================================================
// LOAD INVOICES
// =========================================================

async function loadInvoices() {

    try {

        const response = await fetch(
            `${API_BASE}/billing/invoices`
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to load invoices"
            );
        }

        invoices = data.invoices || [];

        renderInvoices();

        updateStatistics();

    } catch (error) {

        console.error("Invoice loading error:", error);

        invoiceTableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;">
                    Failed to load invoices.
                </td>
            </tr>
        `;

    }
}


// =========================================================
// CREATE INVOICE
// =========================================================

async function handleCreateInvoice(event) {

    event.preventDefault();


    const patientId =
        invoicePatient.value;

    const doctorId =
        invoiceDoctor.value;

    const serviceType =
        invoiceServiceType.value;

    const description =
        invoiceDescription.value.trim();

    const quantity =
        Number(invoiceQuantity.value);

    const unitPrice =
        Number(invoiceUnitPrice.value);

    const discount =
        Number(invoiceDiscount.value || 0);

    const status =
        paymentStatus.value;

    const paymentMethodValue =
        paymentMethod.value;

    const paid =
        Number(amountPaid.value || 0);

    const notes =
        invoiceNotes.value.trim();


    // -----------------------------------------------------
    // VALIDATION
    // -----------------------------------------------------

    if (!patientId) {

        alert("Please select a patient.");

        invoicePatient.focus();

        return;
    }


    if (!serviceType) {

        alert("Please select a service type.");

        invoiceServiceType.focus();

        return;
    }


    if (!description) {

        alert("Please enter service description.");

        invoiceDescription.focus();

        return;
    }


    if (quantity <= 0) {

        alert("Quantity must be greater than 0.");

        return;
    }


    if (unitPrice < 0) {

        alert("Unit price cannot be negative.");

        return;
    }


    const subtotal =
        quantity * unitPrice;


    const total =
        Math.max(
            0,
            subtotal - discount
        );


    if (paid < 0) {

        alert("Amount paid cannot be negative.");

        return;
    }


    if (paid > total) {

        alert(
            "Amount paid cannot be greater than the total amount."
        );

        return;
    }


    // -----------------------------------------------------
    // SEND DATA TO FLASK
    // -----------------------------------------------------

    const invoiceData = {

        patient_id:
            Number(patientId),

        /*
         IMPORTANT:
         This sends doctor_id to Flask.
         Your app.py must save it into invoices.doctor_id.
        */
        doctor_id:
            doctorId
                ? Number(doctorId)
                : null,

        invoice_date:
            invoiceDate.value,

        /*
         We combine service type and description
         because invoice_items currently has one
         description field.
        */
        description:
            `${serviceType} - ${description}`,

        quantity:
            quantity,

        unit_price:
            unitPrice,

        discount:
            discount,

        tax:
            0,

        status:
            status,

        payment_method:
            paymentMethodValue,

        amount_paid:
            paid,

        notes:
            notes

    };


    try {

        const response = await fetch(
            `${API_BASE}/billing/invoices`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(invoiceData)
            }
        );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to create invoice"
            );

        }


        alert(
            `Invoice ${data.invoice_number || ""} created successfully.`
        );


        clearForm();


        await loadInvoices();


    } catch (error) {

        console.error(
            "Create invoice error:",
            error
        );

        alert(
            "Failed to create invoice.\n\n" +
            error.message
        );

    }

}


// =========================================================
// CALCULATE TOTAL
// =========================================================

function calculateTotal() {

    const quantity =
        Number(invoiceQuantity?.value || 0);

    const unitPrice =
        Number(invoiceUnitPrice?.value || 0);

    const discount =
        Number(invoiceDiscount?.value || 0);


    const subtotal =
        quantity * unitPrice;


    const total =
        Math.max(
            0,
            subtotal - discount
        );


    subtotalElement.textContent =
        formatMoney(subtotal);


    discountDisplay.textContent =
        formatMoney(discount);


    totalAmountElement.textContent =
        formatMoney(total);

}


// =========================================================
// RENDER INVOICES
// =========================================================

function renderInvoices() {

    const search =
        (invoiceSearch?.value || "")
        .trim()
        .toLowerCase();


    const filter =
        paymentStatusFilter?.value || "all";


    const filtered =
        invoices.filter(invoice => {

            const patientName = [
                invoice.patient_first_name,
                invoice.patient_middle_name,
                invoice.patient_last_name
            ]
            .filter(Boolean)
            .join(" ");


            const doctorName = [
                invoice.doctor_first_name,
                invoice.doctor_middle_name,
                invoice.doctor_last_name
            ]
            .filter(Boolean)
            .join(" ");


            const searchableText = [

                invoice.invoice_number,

                invoice.patient_number,

                patientName,

                doctorName,

                invoice.description

            ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


            const matchesSearch =
                !search ||
                searchableText.includes(search);


            const matchesFilter =
                filter === "all" ||
                normalizeStatus(invoice.status) ===
                normalizeStatus(filter);


            return (
                matchesSearch &&
                matchesFilter
            );

        });


    invoiceTableBody.innerHTML = "";


    recordCount.textContent =
        filtered.length;


    if (filtered.length === 0) {

        emptyState.style.display = "block";

        return;

    }


    emptyState.style.display = "none";


    filtered.forEach(invoice => {

        const row =
            document.createElement("tr");


        // -------------------------------------------------
        // PATIENT NAME
        // -------------------------------------------------

        const patientName = [
            invoice.patient_first_name,
            invoice.patient_middle_name,
            invoice.patient_last_name
        ]
        .filter(Boolean)
        .join(" ") || "—";


        // -------------------------------------------------
        // DOCTOR NAME
        // -------------------------------------------------

        const doctorName = [
            invoice.doctor_first_name,
            invoice.doctor_middle_name,
            invoice.doctor_last_name
        ]
        .filter(Boolean)
        .join(" ") || "—";


        // -------------------------------------------------
        // SERVICE
        // -------------------------------------------------

        const service =
            invoice.description || "—";


        // -------------------------------------------------
        // DATE
        // -------------------------------------------------

        const date =
            formatDate(invoice.invoice_date);


        // -------------------------------------------------
        // STATUS
        // -------------------------------------------------

        const status =
            displayStatus(invoice.status);


        const statusClass =
            getStatusClass(invoice.status);


        // -------------------------------------------------
        // ROW
        // -------------------------------------------------

        row.innerHTML = `

            <td>
                <span class="invoice-number">
                    ${escapeHTML(
                        invoice.invoice_number || "—"
                    )}
                </span>
            </td>


            <td>
                <span class="patient-name">
                    ${escapeHTML(patientName)}
                </span>
            </td>


            <td>
                <span class="doctor-name">
                    ${escapeHTML(doctorName)}
                </span>
            </td>


            <td>
                <span class="service-name">
                    ${escapeHTML(service)}
                </span>
            </td>


            <td>
                ${escapeHTML(date)}
            </td>


            <td>
                <strong>
                    ${formatMoney(invoice.total_amount)}
                </strong>
            </td>


            <td>
                <span class="status-badge ${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </td>


            <td>

                <div class="action-buttons">

                    <button
                        class="action-btn view"
                        title="View Invoice"
                        onclick="viewInvoice(${invoice.invoice_id})"
                    >
                        <i class="fa-solid fa-eye"></i>
                    </button>


                    <button
                        class="action-btn delete"
                        title="Delete Invoice"
                        onclick="deleteInvoice(${invoice.invoice_id})"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </td>

        `;


        invoiceTableBody.appendChild(row);

    });

}


// =========================================================
// VIEW INVOICE
// =========================================================

async function viewInvoice(invoiceId) {

    try {

        const response =
            await fetch(
                `${API_BASE}/billing/invoices/${invoiceId}`
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load invoice"
            );

        }


        const invoice =
            data.invoice;


        displayInvoicePreview(invoice);


        viewModal.classList.add("show");


    } catch (error) {

        console.error(
            "View invoice error:",
            error
        );

        alert(
            "Could not load invoice.\n\n" +
            error.message
        );

    }

}


// =========================================================
// DISPLAY INVOICE PREVIEW
// =========================================================

function displayInvoicePreview(invoice) {

    const patientName = [
        invoice.patient_first_name,
        invoice.patient_middle_name,
        invoice.patient_last_name
    ]
    .filter(Boolean)
    .join(" ") || "—";


    const doctorName = [
        invoice.doctor_first_name,
        invoice.doctor_middle_name,
        invoice.doctor_last_name
    ]
    .filter(Boolean)
    .join(" ") || "—";


    const items =
        invoice.items || [];


    let itemsHTML = "";


    if (items.length > 0) {

        itemsHTML =
            items.map(item => `

                <tr>

                    <td>
                        ${escapeHTML(
                            item.description || "—"
                        )}
                    </td>

                    <td>
                        ${item.quantity || 1}
                    </td>

                    <td>
                        ${formatMoney(
                            item.unit_price
                        )}
                    </td>

                    <td>
                        ${formatMoney(
                            item.total_price
                        )}
                    </td>

                </tr>

            `).join("");

    } else {

        itemsHTML = `
            <tr>
                <td colspan="4">
                    No invoice items
                </td>
            </tr>
        `;

    }


    invoicePreview.innerHTML = `

        <div class="invoice-header-print">

            <h1>Daro Labu Hospital</h1>

            <p>
                Hospital Management System
            </p>

            <p>
                INVOICE
            </p>

        </div>


        <div class="invoice-info">

            <div>
                <strong>Invoice Number:</strong>
                ${escapeHTML(
                    invoice.invoice_number || "—"
                )}
            </div>


            <div>
                <strong>Date:</strong>
                ${escapeHTML(
                    formatDate(invoice.invoice_date)
                )}
            </div>


            <div>
                <strong>Patient:</strong>
                ${escapeHTML(patientName)}
            </div>


            <div>
                <strong>Patient Number:</strong>
                ${escapeHTML(
                    invoice.patient_number || "—"
                )}
            </div>


            <div>
                <strong>Phone:</strong>
                ${escapeHTML(
                    invoice.phone || "—"
                )}
            </div>


            <div>
                <strong>Doctor:</strong>
                ${escapeHTML(doctorName)}
            </div>


            <div>
                <strong>Status:</strong>
                ${escapeHTML(
                    displayStatus(invoice.status)
                )}
            </div>

        </div>


        <table class="preview-table">

            <thead>

                <tr>
                    <th>Description</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>

            </thead>


            <tbody>

                ${itemsHTML}

            </tbody>

        </table>


        <div class="preview-total">

            <div>
                <span>Subtotal</span>
                <strong>
                    ${formatMoney(invoice.subtotal)}
                </strong>
            </div>


            <div>
                <span>Discount</span>
                <strong>
                    ${formatMoney(invoice.discount)}
                </strong>
            </div>


            <div>
                <span>Tax</span>
                <strong>
                    ${formatMoney(invoice.tax)}
                </strong>
            </div>


            <div class="preview-grand-total">
                <span>Total</span>
                <strong>
                    ${formatMoney(invoice.total_amount)}
                </strong>
            </div>

        </div>

    `;

}


// =========================================================
// DELETE INVOICE
// =========================================================

async function deleteInvoice(invoiceId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this invoice?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/billing/invoices/${invoiceId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to delete invoice"
            );

        }


        alert(
            "Invoice deleted successfully."
        );


        await loadInvoices();


    } catch (error) {

        console.error(
            "Delete invoice error:",
            error
        );

        alert(
            "Failed to delete invoice.\n\n" +
            error.message
        );

    }

}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStatistics() {

    totalInvoices.textContent =
        invoices.length;


    const paid =
        invoices.filter(invoice =>
            normalizeStatus(invoice.status) === "paid"
        ).length;


    const pending =
        invoices.filter(invoice => {

            const status =
                normalizeStatus(invoice.status);

            return (
                status === "pending" ||
                status === "unpaid"
            );

        }).length;


    let revenue = 0;


    invoices.forEach(invoice => {

        const status =
            normalizeStatus(invoice.status);


        if (status === "paid") {

            revenue +=
                Number(invoice.total_amount || 0);

        }

    });


    paidInvoices.textContent =
        paid;


    pendingInvoices.textContent =
        pending;


    totalRevenue.textContent =
        formatMoney(revenue);

}


// =========================================================
// NORMALIZE STATUS
// =========================================================

function normalizeStatus(status) {

    if (!status) {
        return "";
    }


    const value =
        String(status)
        .trim()
        .toLowerCase();


    if (
        value === "partially paid" ||
        value === "partial payment"
    ) {
        return "partial";
    }


    if (
        value === "unpaid" ||
        value === "pending"
    ) {
        return "pending";
    }


    return value;

}


// =========================================================
// DISPLAY STATUS
// =========================================================

function displayStatus(status) {

    const value =
        normalizeStatus(status);


    if (value === "paid") {
        return "Paid";
    }


    if (value === "partial") {
        return "Partial Payment";
    }


    if (value === "pending") {
        return "Pending";
    }


    if (value === "cancelled") {
        return "Cancelled";
    }


    return status || "Pending";

}


// =========================================================
// STATUS CSS CLASS
// =========================================================

function getStatusClass(status) {

    const value =
        normalizeStatus(status);


    if (value === "paid") {
        return "status-paid";
    }


    if (value === "partial") {
        return "status-partial";
    }


    if (value === "cancelled") {
        return "status-cancelled";
    }


    return "status-pending";

}


// =========================================================
// FORMAT MONEY
// =========================================================

function formatMoney(value) {

    const number =
        Number(value || 0);


    return (
        number.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) + " ETB"
    );

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }


    const date =
        new Date(value);


    if (Number.isNaN(date.getTime())) {
        return String(value);
    }


    return date.toLocaleDateString(
        "en-GB"
    );

}


// =========================================================
// CLEAR FORM
// =========================================================

function clearForm() {

    billingForm.reset();

    setTodayDate();

    invoiceQuantity.value = 1;

    invoiceDiscount.value = 0;

    amountPaid.value = 0;

    paymentStatus.value = "Paid";

    paymentMethod.value = "Cash";

    calculateTotal();

}


// =========================================================
// SHOW FORM
// =========================================================

function showInvoiceForm() {

    const section =
        document.getElementById(
            "invoiceSection"
        );


    section.scrollIntoView({
        behavior: "smooth"
    });

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeInvoiceModal() {

    viewModal.classList.remove("show");

}


// =========================================================
// PRINT INVOICE
// =========================================================

function printInvoice() {

    const printContent =
        invoicePreview.innerHTML;


    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=700"
        );


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                Daro Labu Hospital Invoice
            </title>


            <style>

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    color: #263238;
                }

                .invoice-header-print {
                    text-align: center;
                    border-bottom: 2px solid #0878b9;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }

                .invoice-header-print h1 {
                    color: #0878b9;
                }

                .invoice-info {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px 30px;
                    margin-bottom: 20px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                th,
                td {
                    border: 1px solid #ddd;
                    padding: 10px;
                    text-align: left;
                }

                th {
                    background: #f2f5f7;
                }

                .preview-total {
                    width: 300px;
                    margin-left: auto;
                    margin-top: 20px;
                }

                .preview-total div {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px;
                }

                .preview-grand-total {
                    border-top: 2px solid #0878b9;
                    font-size: 18px;
                    font-weight: bold;
                }

            </style>

        </head>


        <body>

            ${printContent}

        </body>

        </html>

    `);


    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {

        printWindow.print();

        printWindow.close();

    }, 500);

}


// =========================================================
// SIDEBAR
// =========================================================

function openSidebar() {

    sidebar.classList.add("open");

}


function closeSidebar() {

    sidebar.classList.remove("open");

}


// =========================================================
// LOGOUT
// =========================================================

function handleLogout() {

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


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

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
// MAKE FUNCTIONS AVAILABLE TO HTML
// =========================================================

window.viewInvoice = viewInvoice;
window.deleteInvoice = deleteInvoice;