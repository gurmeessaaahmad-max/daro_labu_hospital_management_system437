"use strict";

/* =========================================================
   DARO LABU HOSPITAL
   PAYMENT MANAGEMENT
   COMPLETE JAVASCRIPT
========================================================= */


const INVOICES_KEY = "daroLabuInvoices";

const PAYMENTS_KEY = "daroLabuPayments";


let invoices = [];

let payments = [];

let selectedInvoice = null;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadData();

        setTodayDate();

        loadInvoiceDropdown();

        renderPaymentHistory();

        setupEvents();

    }
);


/* =========================================================
   LOAD DATA
========================================================= */

function loadData() {

    try {

        invoices =
            JSON.parse(
                localStorage.getItem(
                    INVOICES_KEY
                )
            ) || [];

    } catch (error) {

        invoices = [];

    }


    try {

        payments =
            JSON.parse(
                localStorage.getItem(
                    PAYMENTS_KEY
                )
            ) || [];

    } catch (error) {

        payments = [];

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveInvoices() {

    localStorage.setItem(
        INVOICES_KEY,
        JSON.stringify(invoices)
    );

}


function savePayments() {

    localStorage.setItem(
        PAYMENTS_KEY,
        JSON.stringify(payments)
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    const invoiceSelect =
        document.getElementById(
            "paymentInvoice"
        );


    if (invoiceSelect) {

        invoiceSelect.addEventListener(
            "change",
            handleInvoiceChange
        );

    }



    const paidAmount =
        document.getElementById(
            "paidAmount"
        );


    if (paidAmount) {

        paidAmount.addEventListener(
            "input",
            calculatePayment
        );

    }



    const form =
        document.getElementById(
            "paymentForm"
        );


    if (form) {

        form.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                recordPayment();

            }
        );

    }



    const clearBtn =
        document.getElementById(
            "clearPaymentBtn"
        );


    if (clearBtn) {

        clearBtn.addEventListener(
            "click",
            clearPaymentForm
        );

    }



    const menuToggle =
        document.getElementById(
            "menuToggle"
        );


    const sidebar =
        document.getElementById(
            "sidebar"
        );


    const overlay =
        document.getElementById(
            "sidebarOverlay"
        );


    if (menuToggle && sidebar) {

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

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeMobileMenu
        );

    }



    document
        .querySelectorAll(".sidebar-nav a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    closeMobileMenu
                );

            }
        );



    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmLogout) {

                    window.location.href =
                        "../login.html";

                }

            }
        );

    }

}


/* =========================================================
   CLOSE MOBILE MENU
========================================================= */

function closeMobileMenu() {

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
   SET TODAY
========================================================= */

function setTodayDate() {

    const input =
        document.getElementById(
            "paymentDate"
        );


    if (!input) return;


    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    input.value =
        `${year}-${month}-${day}`;

}


/* =========================================================
   LOAD INVOICE DROPDOWN
========================================================= */

function loadInvoiceDropdown() {

    const select =
        document.getElementById(
            "paymentInvoice"
        );


    if (!select) return;


    select.innerHTML = "";


    const defaultOption =
        document.createElement(
            "option"
        );


    defaultOption.value = "";

    defaultOption.textContent =
        "Select Invoice";


    select.appendChild(
        defaultOption
    );



    invoices.forEach(
        function (invoice) {

            const total =
                getInvoiceTotal(
                    invoice
                );


            const paid =
                getInvoicePaid(
                    invoice
                );


            const balance =
                Math.max(
                    total - paid,
                    0
                );


            const status =
                String(
                    invoice.paymentStatus ||
                    invoice.status ||
                    ""
                ).toLowerCase();


            if (
                status === "cancelled" ||
                status === "paid" ||
                balance <= 0
            ) {

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                getInvoiceId(
                    invoice
                );


            const invoiceNumber =
                invoice.invoiceNumber ||
                invoice.invoiceId ||
                getInvoiceId(invoice);


            const patientName =
                getPatientName(
                    invoice
                );


            option.textContent =
                `${invoiceNumber} — ${patientName} — Due: ${formatMoney(balance)}`;


            select.appendChild(
                option
            );

        }
    );


    if (
        select.options.length === 1
    ) {

        defaultOption.textContent =
            "No unpaid invoices available";

    }

}


/* =========================================================
   INVOICE ID
========================================================= */

function getInvoiceId(invoice) {

    return (
        invoice.id ||
        invoice.invoiceId ||
        invoice.ID ||
        ""
    );

}


/* =========================================================
   INVOICE TOTAL
========================================================= */

function getInvoiceTotal(invoice) {

    return Number(
        invoice.total ??
        invoice.totalAmount ??
        invoice.amount ??
        0
    );

}


/* =========================================================
   PATIENT NAME
========================================================= */

function getPatientName(invoice) {

    if (!invoice) {

        return "Unknown Patient";

    }


    if (invoice.patientName) {

        return invoice.patientName;

    }


    if (invoice.patient) {

        if (
            typeof invoice.patient ===
            "string"
        ) {

            return invoice.patient;

        }

        if (
            invoice.patient.name
        ) {

            return invoice.patient.name;

        }

    }


    const name =
        (
            invoice.firstName ||
            ""
        ) +
        " " +
        (
            invoice.lastName ||
            ""
        );


    return (
        name.trim() ||
        "Unknown Patient"
    );

}


/* =========================================================
   GET PAID AMOUNT
========================================================= */

function getInvoicePaid(invoice) {

    const invoiceId =
        getInvoiceId(
            invoice
        );


    const directPaid =
        Number(
            invoice.paidAmount || 0
        );


    const historyPaid =
        payments
            .filter(
                function (payment) {

                    return String(
                        payment.invoiceId
                    ) === String(
                        invoiceId
                    );

                }
            )
            .reduce(
                function (
                    total,
                    payment
                ) {

                    return (
                        total +
                        Number(
                            payment.amount || 0
                        )
                    );

                },
                0
            );


    return Math.max(
        directPaid,
        historyPaid
    );

}


/* =========================================================
   HANDLE INVOICE CHANGE
========================================================= */

function handleInvoiceChange() {

    const select =
        document.getElementById(
            "paymentInvoice"
        );


    if (!select) return;


    const id =
        select.value;


    if (!id) {

        selectedInvoice = null;

        clearInvoiceInformation();

        return;

    }


    selectedInvoice =
        invoices.find(
            function (invoice) {

                return String(
                    getInvoiceId(invoice)
                ) === String(id);

            }
        );


    if (!selectedInvoice) {

        return;

    }


    const total =
        getInvoiceTotal(
            selectedInvoice
        );


    const previouslyPaid =
        getInvoicePaid(
            selectedInvoice
        );


    const amountDue =
        Math.max(
            total -
            previouslyPaid,
            0
        );


    setValue(
        "paymentPatient",
        getPatientName(
            selectedInvoice
        )
    );


    setValue(
        "invoiceAmount",
        total.toFixed(2)
    );


    setValue(
        "previousPaid",
        previouslyPaid.toFixed(2)
    );


    setValue(
        "amountDue",
        amountDue.toFixed(2)
    );


    const paidInput =
        document.getElementById(
            "paidAmount"
        );


    if (paidInput) {

        paidInput.value =
            amountDue > 0
                ? amountDue.toFixed(2)
                : "";

    }


    calculatePayment();

}


/* =========================================================
   CALCULATE PAYMENT
========================================================= */

function calculatePayment() {

    const due =
        Number(
            getValue(
                "amountDue"
            ) || 0
        );


    let paid =
        Number(
            getValue(
                "paidAmount"
            ) || 0
        );


    if (paid < 0) {

        paid = 0;

    }


    const remaining =
        Math.max(
            due - paid,
            0
        );


    const summaryPaid =
        document.getElementById(
            "summaryPaid"
        );


    const summaryBalance =
        document.getElementById(
            "summaryBalance"
        );


    if (summaryPaid) {

        summaryPaid.textContent =
            formatMoney(
                paid
            );

    }


    if (summaryBalance) {

        summaryBalance.textContent =
            formatMoney(
                remaining
            );

    }

}


/* =========================================================
   RECORD PAYMENT
========================================================= */

function recordPayment() {

    if (!selectedInvoice) {

        alert(
            "Please select an invoice first."
        );

        return;

    }


    const amount =
        Number(
            getValue(
                "paidAmount"
            ) || 0
        );


    const method =
        getValue(
            "paymentMethod"
        );


    const date =
        getValue(
            "paymentDate"
        );


    const transaction =
        getValue(
            "transactionNumber"
        );


    const notes =
        getValue(
            "paymentNotes"
        );


    const total =
        getInvoiceTotal(
            selectedInvoice
        );


    const previousPaid =
        getInvoicePaid(
            selectedInvoice
        );


    const amountDue =
        Math.max(
            total -
            previousPaid,
            0
        );


    /* Validation */

    if (amount <= 0) {

        alert(
            "Payment amount must be greater than 0."
        );

        return;

    }


    if (!method) {

        alert(
            "Please select a payment method."
        );

        return;

    }


    if (!date) {

        alert(
            "Please select payment date."
        );

        return;

    }


    if (amount > amountDue) {

        alert(
            "Payment amount cannot be greater than the amount due."
        );

        return;

    }



    /* Create payment */

    const payment = {

        id:
            "PAY-" +
            Date.now(),

        receiptNumber:
            generateReceiptNumber(),

        invoiceId:
            getInvoiceId(
                selectedInvoice
            ),

        invoiceNumber:
            selectedInvoice.invoiceNumber ||
            selectedInvoice.invoiceId ||
            getInvoiceId(
                selectedInvoice
            ),

        patientId:
            selectedInvoice.patientId ||
            "",

        patientName:
            getPatientName(
                selectedInvoice
            ),

        amount:
            amount,

        paymentMethod:
            method,

        transactionNumber:
            transaction,

        date:
            date,

        notes:
            notes,

        createdAt:
            new Date().toISOString()

    };


    payments.push(
        payment
    );


    /* Update invoice */

    const newPaid =
        previousPaid +
        amount;


    const newBalance =
        Math.max(
            total -
            newPaid,
            0
        );


    selectedInvoice.paidAmount =
        newPaid;


    selectedInvoice.balance =
        newBalance;


    if (newBalance <= 0) {

        selectedInvoice.paymentStatus =
            "Paid";

    } else {

        selectedInvoice.paymentStatus =
            "Partial";

    }


    selectedInvoice.lastPaymentDate =
        date;


    selectedInvoice.lastPaymentMethod =
        method;


    saveInvoices();

    savePayments();


    alert(
        "Payment recorded successfully!\n\n" +
        "Receipt: " +
        payment.receiptNumber
    );


    clearPaymentForm();


    loadData();

    loadInvoiceDropdown();

    renderPaymentHistory();

}


/* =========================================================
   RECEIPT NUMBER
========================================================= */

function generateReceiptNumber() {

    const year =
        new Date()
            .getFullYear();


    return (
        "REC-" +
        year +
        "-" +
        String(
            payments.length + 1
        ).padStart(
            5,
            "0"
        )
    );

}


/* =========================================================
   PAYMENT HISTORY
========================================================= */

function renderPaymentHistory() {

    const tbody =
        document.getElementById(
            "paymentTableBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (
        payments.length === 0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >

                    <i class="fa-solid fa-receipt"></i>

                    <strong>
                        No Payments Yet
                    </strong>

                    <span>
                        Recorded payments will appear here.
                    </span>

                </td>

            </tr>

        `;

        return;

    }


    payments
        .slice()
        .reverse()
        .forEach(
            function (payment) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            payment.receiptNumber ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            payment.invoiceNumber ||
                            "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            payment.patientName ||
                            "-"
                        )}
                    </td>


                    <td>
                        <strong>
                            ${formatMoney(
                                payment.amount
                            )}
                        </strong>
                    </td>


                    <td>

                        <span class="method-badge">

                            ${escapeHTML(
                                payment.paymentMethod ||
                                "-"
                            )}

                        </span>

                    </td>


                    <td>
                        ${escapeHTML(
                            payment.date ||
                            "-"
                        )}
                    </td>


                    <td>

                        <button
                            type="button"
                            class="print-btn"
                            title="Print Receipt"
                            data-payment-id="${escapeHTML(
                                payment.id
                            )}"
                        >

                            <i class="fa-solid fa-print"></i>

                        </button>

                    </td>

                `;


                const printButton =
                    row.querySelector(
                        ".print-btn"
                    );


                if (printButton) {

                    printButton.addEventListener(
                        "click",
                        function () {

                            printReceipt(
                                payment.id
                            );

                        }
                    );

                }


                tbody.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   CLEAR PAYMENT FORM
========================================================= */

function clearPaymentForm() {

    const form =
        document.getElementById(
            "paymentForm"
        );


    if (form) {

        form.reset();

    }


    selectedInvoice = null;


    clearInvoiceInformation();

    setTodayDate();


    const summaryPaid =
        document.getElementById(
            "summaryPaid"
        );


    const summaryBalance =
        document.getElementById(
            "summaryBalance"
        );


    if (summaryPaid) {

        summaryPaid.textContent =
            "0.00 ETB";

    }


    if (summaryBalance) {

        summaryBalance.textContent =
            "0.00 ETB";

    }

}


/* =========================================================
   CLEAR INVOICE INFORMATION
========================================================= */

function clearInvoiceInformation() {

    setValue(
        "paymentPatient",
        ""
    );


    setValue(
        "invoiceAmount",
        ""
    );


    setValue(
        "previousPaid",
        ""
    );


    setValue(
        "amountDue",
        ""
    );


    setValue(
        "paidAmount",
        ""
    );

}


/* =========================================================
   PRINT RECEIPT
========================================================= */

function printReceipt(
    paymentId
) {

    const payment =
        payments.find(
            function (item) {

                return String(
                    item.id
                ) === String(
                    paymentId
                );

            }
        );


    if (!payment) {

        alert(
            "Payment record not found."
        );

        return;

    }


    const invoice =
        invoices.find(
            function (item) {

                return String(
                    getInvoiceId(item)
                ) === String(
                    payment.invoiceId
                );

            }
        );


    const settings =
        JSON.parse(
            localStorage.getItem(
                "hospitalSettings"
            )
        ) || {};


    const hospitalName =
        settings.name ||
        "Daro Labu Hospital";


    const address =
        settings.address ||
        "Daro Labu, Oromia, Ethiopia";


    const phone =
        settings.phone ||
        "+251 900 000 000";


    const win =
        window.open(
            "",
            "_blank"
        );


    if (!win) {

        alert(
            "Please allow pop-ups to print the receipt."
        );

        return;

    }


    win.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeHTML(
                    payment.receiptNumber
                )}
            </title>


            <style>

                body {

                    font-family:
                        Arial,
                        sans-serif;

                    margin: 40px;

                    color: #222;

                }


                .receipt {

                    max-width: 700px;

                    margin: auto;

                    border:
                        1px solid #ddd;

                    padding: 35px;

                }


                .header {

                    text-align: center;

                    border-bottom:
                        2px solid #0066a1;

                    padding-bottom: 20px;

                    margin-bottom: 25px;

                }


                .header h1 {

                    margin: 0;

                    color: #0066a1;

                }


                .header p {

                    margin: 5px 0;

                    color: #666;

                }


                h2 {

                    text-align: center;

                }


                .row {

                    display: flex;

                    justify-content:
                        space-between;

                    padding: 10px 0;

                    border-bottom:
                        1px solid #eee;

                }


                .amount {

                    font-size: 24px;

                    font-weight: bold;

                    color: #0066a1;

                }


                .footer {

                    text-align: center;

                    margin-top: 30px;

                    color: #777;

                    font-size: 12px;

                }


                @media print {

                    body {

                        margin: 0;

                    }


                    .receipt {

                        border: none;

                    }

                }

            </style>

        </head>


        <body>


            <div class="receipt">


                <div class="header">

                    <h1>
                        ${escapeHTML(
                            hospitalName
                        )}
                    </h1>

                    <p>
                        ${escapeHTML(
                            address
                        )}
                    </p>

                    <p>
                        ${escapeHTML(
                            phone
                        )}
                    </p>

                </div>


                <h2>
                    PAYMENT RECEIPT
                </h2>


                <div class="row">

                    <strong>
                        Receipt No.
                    </strong>

                    <span>
                        ${escapeHTML(
                            payment.receiptNumber
                        )}
                    </span>

                </div>


                <div class="row">

                    <strong>
                        Invoice
                    </strong>

                    <span>
                        ${escapeHTML(
                            payment.invoiceNumber ||
                            "-"
                        )}
                    </span>

                </div>


                <div class="row">

                    <strong>
                        Patient
                    </strong>

                    <span>
                        ${escapeHTML(
                            payment.patientName ||
                            "-"
                        )}
                    </span>

                </div>


                <div class="row">

                    <strong>
                        Payment Method
                    </strong>

                    <span>
                        ${escapeHTML(
                            payment.paymentMethod
                        )}
                    </span>

                </div>


                <div class="row">

                    <strong>
                        Date
                    </strong>

                    <span>
                        ${escapeHTML(
                            payment.date
                        )}
                    </span>

                </div>


                <div class="row">

                    <strong>
                        Amount Paid
                    </strong>

                    <span class="amount">
                        ${formatMoney(
                            payment.amount
                        )}
                    </span>

                </div>


                ${
                    payment.transactionNumber
                    ? `
                    <div class="row">

                        <strong>
                            Reference
                        </strong>

                        <span>
                            ${escapeHTML(
                                payment.transactionNumber
                            )}
                        </span>

                    </div>
                    `
                    : ""
                }


                <div class="footer">

                    <p>
                        Thank you for your payment.
                    </p>

                    <p>
                        Daro Labu Hospital Management System
                    </p>

                </div>


            </div>


            <script>

                window.onload =
                    function () {

                        window.print();

                    };

            <\/script>


        </body>

        </html>

    `);


    win.document.close();

}


/* =========================================================
   HELPERS
========================================================= */

function getValue(id) {

    const element =
        document.getElementById(
            id
        );


    return element
        ? element.value
        : "";

}


function setValue(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.value =
            value;

    }

}


function formatMoney(
    value
) {

    const amount =
        Number(
            value || 0
        );


    return (
        amount.toLocaleString(
            "en-US",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        ) +
        " ETB"
    );

}


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