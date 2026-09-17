/* =========================================
   DARO LABU HOSPITAL
   DYNAMIC REPORTS
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadReports();

    const refreshButton =
        document.getElementById("refreshReports");

    const printButton =
        document.getElementById("printReports");


    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            loadReports
        );

    }


    if (printButton) {

        printButton.addEventListener(
            "click",
            function () {
                window.print();
            }
        );

    }


    const logoutLink =
        document.getElementById("logoutLink");

    if (logoutLink) {

        logoutLink.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                localStorage.removeItem("loggedIn");
                localStorage.removeItem("username");
                localStorage.removeItem("role");
                localStorage.removeItem("currentUser");
                localStorage.removeItem("userRole");

                window.location.href =
                    "../login.html";

            }
        );

    }

});


/* =========================================
   LOAD ALL REPORTS
========================================= */

function loadReports() {

    const patients = getArray(
        "daroLabuPatients",
        "patients"
    );

    const doctors = getArray(
        "daroLabuDoctors",
        "doctors"
    );

    const appointments = getArray(
        "daroLabuAppointments",
        "appointments"
    );

    const laboratory = getArray(
        "daroLabuLaboratory",
        "laboratory"
    );

    const prescriptions = getArray(
        "daroLabuPrescriptions",
        "prescriptions"
    );

    const medicines = getArray(
        "daroLabuMedicines",
        "medicines"
    );

    const medicalRecords = getArray(
        "daroLabuMedicalRecords",
        "medicalRecords"
    );

    const invoices = getArray(
        "daroLabuInvoices",
        "invoices"
    );

    const payments = getArray(
        "daroLabuPayments",
        "payments"
    );

    const dispensing = getArray(
        "daroLabuDispensing",
        "dispensing"
    );


    /* SUMMARY */

    setText(
        "totalPatients",
        patients.length
    );

    setText(
        "totalDoctors",
        doctors.length
    );

    setText(
        "totalAppointments",
        appointments.length
    );

    setText(
        "totalLaboratory",
        laboratory.length
    );

    setText(
        "totalPrescriptions",
        prescriptions.length
    );

    setText(
        "totalMedicines",
        medicines.length
    );


    /* FINANCIAL */

    const activeInvoices =
        invoices.filter(function (invoice) {

            return String(
                invoice.status || ""
            ).toLowerCase() !== "cancelled";

        });


    const paidInvoices =
        activeInvoices.filter(function (invoice) {

            const status =
                String(
                    invoice.paymentStatus ||
                    invoice.status ||
                    ""
                ).toLowerCase();

            return status === "paid";

        });


    const pendingInvoices =
        activeInvoices.filter(function (invoice) {

            const status =
                String(
                    invoice.paymentStatus ||
                    invoice.status ||
                    ""
                ).toLowerCase();

            return (
                status === "pending" ||
                status === "partial" ||
                status === "unpaid"
            );

        });


    let totalRevenue = 0;


    activeInvoices.forEach(function (invoice) {

        totalRevenue += getPaidAmount(
            invoice,
            payments
        );

    });


    setText(
        "totalInvoices",
        activeInvoices.length
    );

    setText(
        "paidInvoices",
        paidInvoices.length
    );

    setText(
        "pendingInvoices",
        pendingInvoices.length
    );

    setText(
        "totalRevenue",
        formatETB(totalRevenue)
    );


    /* OTHER MODULES */

    setText(
        "totalMedicalRecords",
        medicalRecords.length
    );

    setText(
        "totalPayments",
        payments.length
    );

    setText(
        "totalDispensing",
        dispensing.length
    );


    /* TABLES */

    loadRecentPatients(patients);

    loadRecentInvoices(activeInvoices);

}


/* =========================================
   RECENT PATIENTS
========================================= */

function loadRecentPatients(patients) {

    const table =
        document.getElementById(
            "recentPatientsTable"
        );

    if (!table) {
        return;
    }


    const sorted =
        [...patients].sort(function (a, b) {

            return getDateValue(
                b.createdAt || b.registrationDate || b.date
            )
            -
            getDateValue(
                a.createdAt || a.registrationDate || a.date
            );

        });


    const recent =
        sorted.slice(0, 5);


    if (recent.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="4" class="empty-row">
                    No patient records found.
                </td>
            </tr>`;

        return;

    }


    table.innerHTML = recent.map(function (patient) {

        const id =
            patient.id ||
            patient.patientId ||
            "-";

        const name =
            patient.name ||
            patient.fullName ||
            (
                (patient.firstName || "") +
                " " +
                (patient.lastName || "")
            ).trim() ||
            "-";

        const gender =
            patient.gender ||
            "-";

        const date =
            patient.registrationDate ||
            patient.createdAt ||
            patient.date ||
            "-";


        return `
            <tr>
                <td>${escapeHTML(id)}</td>
                <td>${escapeHTML(name)}</td>
                <td>${escapeHTML(gender)}</td>
                <td>${formatDate(date)}</td>
            </tr>
        `;

    }).join("");

}


/* =========================================
   RECENT INVOICES
========================================= */

function loadRecentInvoices(invoices) {

    const table =
        document.getElementById(
            "recentInvoicesTable"
        );

    if (!table) {
        return;
    }


    const sorted =
        [...invoices].sort(function (a, b) {

            return getDateValue(
                b.createdAt || b.date || b.invoiceDate
            )
            -
            getDateValue(
                a.createdAt || a.date || a.invoiceDate
            );

        });


    const recent =
        sorted.slice(0, 5);


    if (recent.length === 0) {

        table.innerHTML =
            `<tr>
                <td colspan="4" class="empty-row">
                    No invoice records found.
                </td>
            </tr>`;

        return;

    }


    table.innerHTML = recent.map(function (invoice) {

        const number =
            invoice.invoiceNumber ||
            invoice.id ||
            "-";

        const patient =
            invoice.patientName ||
            invoice.patient ||
            "-";

        const total =
            Number(
                invoice.total ||
                invoice.amount ||
                0
            );

        const status =
            String(
                invoice.paymentStatus ||
                invoice.status ||
                "Pending"
            );


        return `
            <tr>

                <td>
                    ${escapeHTML(number)}
                </td>

                <td>
                    ${escapeHTML(patient)}
                </td>

                <td>
                    ${formatETB(total)}
                </td>

                <td>
                    ${getStatusBadge(status)}
                </td>

            </tr>
        `;

    }).join("");

}


/* =========================================
   GET ARRAY
========================================= */

function getArray(primaryKey, oldKey) {

    let data = [];

    try {

        const primary =
            JSON.parse(
                localStorage.getItem(primaryKey)
            );

        if (Array.isArray(primary)) {
            data = primary;
        }

    } catch (error) {
        data = [];
    }


    if (
        data.length === 0 &&
        oldKey
    ) {

        try {

            const old =
                JSON.parse(
                    localStorage.getItem(oldKey)
                );

            if (Array.isArray(old)) {
                data = old;
            }

        } catch (error) {
            data = [];
        }

    }

    return data;

}


/* =========================================
   PAID AMOUNT
========================================= */

function getPaidAmount(invoice, payments) {

    const invoiceId =
        invoice.id ||
        invoice.invoiceId;


    let amount =
        Number(
            invoice.paidAmount ||
            invoice.paid ||
            0
        );


    payments.forEach(function (payment) {

        if (
            String(
                payment.invoiceId
            ) === String(invoiceId)
        ) {

            amount += Number(
                payment.amount || 0
            );

        }

    });


    return amount;

}


/* =========================================
   STATUS BADGE
========================================= */

function getStatusBadge(status) {

    const clean =
        String(status)
            .trim()
            .toLowerCase();


    let className =
        "status-pending";


    if (clean === "paid") {

        className =
            "status-paid";

    } else if (clean === "partial") {

        className =
            "status-partial";

    }


    return `
        <span class="status-badge ${className}">
            ${escapeHTML(status)}
        </span>
    `;

}


/* =========================================
   FORMAT ETB
========================================= */

function formatETB(amount) {

    return (
        Number(amount) || 0
    ).toLocaleString(
        "en-US",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ) + " ETB";

}


/* =========================================
   DATE
========================================= */

function getDateValue(value) {

    if (!value) {
        return 0;
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return 0;
    }

    return date.getTime();

}


function formatDate(value) {

    if (!value) {
        return "-";
    }

    const date =
        new Date(value);

    if (isNaN(date.getTime())) {
        return escapeHTML(value);
    }

    return date.toLocaleDateString();

}


/* =========================================
   TEXT
========================================= */

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = value;
    }

}


/* =========================================
   SECURITY
========================================= */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}