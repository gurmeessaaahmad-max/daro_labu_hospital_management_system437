/* =========================================================
   DARO LABU HOSPITAL
   PHARMACY MANAGEMENT
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

    let medicines = [];
    let categories = [];
    let editingMedicineId = null;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const medicineModal = document.getElementById("medicineModal");
    const medicineForm = document.getElementById("medicineForm");

    const medicineTableBody =
        document.getElementById("pharmacyTableBody");

    const emptyState =
        document.getElementById("emptyState");

    const medicineSearch =
        document.getElementById("medicineSearch");

    const categoryFilter =
        document.getElementById("categoryFilter");

    const category =
        document.getElementById("category");

    const openMedicineModalBtn =
        document.getElementById("openMedicineModalBtn");

    const addMedicineBtn =
        document.getElementById("addMedicineBtn");

    const emptyAddBtn =
        document.getElementById("emptyAddBtn");

    const closeMedicineModalBtn =
        document.getElementById("closeMedicineModalBtn");

    const cancelMedicineBtn =
        document.getElementById("cancelMedicineBtn");

    const modalTitle =
        document.getElementById("modalTitle");

    const medicineId =
        document.getElementById("medicineId");

    const medicineName =
        document.getElementById("medicineName");

    const genericName =
        document.getElementById("genericName");

    const dosage =
        document.getElementById("dosage");

    const unit =
        document.getElementById("unit");

    const stockQuantity =
        document.getElementById("stockQuantity");

    const reorderLevel =
        document.getElementById("reorderLevel");

    const purchasePrice =
        document.getElementById("purchasePrice");

    const sellingPrice =
        document.getElementById("sellingPrice");

    const expiryDate =
        document.getElementById("expiryDate");

    const medicineStatus =
        document.getElementById("medicineStatus");

    const saveButtonText =
        document.getElementById("saveButtonText");

    const recordCount =
        document.getElementById("recordCount");

    const totalMedicines =
        document.getElementById("totalMedicines");

    const inStockMedicines =
        document.getElementById("inStockMedicines");

    const lowStockMedicines =
        document.getElementById("lowStockMedicines");

    const outOfStockMedicines =
        document.getElementById("outOfStockMedicines");


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadPharmacyData();


    /* =====================================================
       LOAD ALL DATA
    ===================================================== */

    async function loadPharmacyData() {

        try {

            await Promise.all([
                loadMedicines(),
                loadCategories()
            ]);

        } catch (error) {

            console.error(
                "Pharmacy loading error:",
                error
            );

            showMessage(
                "Unable to load pharmacy data. Make sure Flask is running.",
                "error"
            );
        }
    }


    /* =====================================================
       LOAD MEDICINES
    ===================================================== */

    async function loadMedicines() {

        const response =
            await fetch(`${API_URL}/medicines`);

        if (!response.ok) {
            throw new Error(
                `Medicines API error: ${response.status}`
            );
        }

        const data =
            await response.json();

        console.log("Medicines API:", data);

        if (Array.isArray(data)) {

            medicines = data;

        } else if (Array.isArray(data.medicines)) {

            medicines = data.medicines;

        } else {

            medicines = [];
        }

        updateStatistics();
        renderMedicines();
    }


    /* =====================================================
       LOAD CATEGORIES
    ===================================================== */

    async function loadCategories() {

        /*
           Your current database does not show a categories
           table in the SHOW TABLES result.

           Therefore we create the category list from the
           medicines that already exist.
        */

        const uniqueCategories = new Set();

        medicines.forEach(function (medicine) {

            if (
                medicine.category_name &&
                medicine.category_name.trim() !== ""
            ) {

                uniqueCategories.add(
                    medicine.category_name.trim()
                );

            } else if (
                medicine.category &&
                medicine.category.trim() !== ""
            ) {

                uniqueCategories.add(
                    medicine.category.trim()
                );
            }
        });

        categories =
            Array.from(uniqueCategories).sort();

        populateCategoryDropdowns();
    }


    /* =====================================================
       CATEGORY DROPDOWNS
    ===================================================== */

    function populateCategoryDropdowns() {

        if (categoryFilter) {

            categoryFilter.innerHTML =
                `<option value="">All Categories</option>`;

            categories.forEach(function (cat) {

                const option =
                    document.createElement("option");

                option.value = cat;
                option.textContent = cat;

                categoryFilter.appendChild(option);
            });
        }


        if (category) {

            const currentValue =
                category.value;

            category.innerHTML =
                `<option value="">Select Category</option>`;

            categories.forEach(function (cat) {

                const option =
                    document.createElement("option");

                option.value = cat;
                option.textContent = cat;

                category.appendChild(option);
            });

            /*
               Keep the previous selected category if possible.
            */

            if (currentValue) {
                category.value = currentValue;
            }
        }
    }


    /* =====================================================
       RENDER MEDICINES
    ===================================================== */

    function renderMedicines() {

        if (!medicineTableBody) {
            return;
        }

        const searchValue =
            medicineSearch
                ? medicineSearch.value
                    .trim()
                    .toLowerCase()
                : "";

        const selectedCategory =
            categoryFilter
                ? categoryFilter.value
                : "";


        const filteredMedicines =
            medicines.filter(function (medicine) {

                const name =
                    String(
                        medicine.medicine_name || ""
                    ).toLowerCase();

                const generic =
                    String(
                        medicine.generic_name || ""
                    ).toLowerCase();

                const code =
                    String(
                        medicine.medicine_id || ""
                    ).toLowerCase();

                const medicineCategory =
                    String(
                        medicine.category_name ||
                        medicine.category ||
                        ""
                    );


                const matchesSearch =
                    !searchValue ||
                    name.includes(searchValue) ||
                    generic.includes(searchValue) ||
                    code.includes(searchValue);


                const matchesCategory =
                    !selectedCategory ||
                    medicineCategory === selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );
            });


        medicineTableBody.innerHTML = "";


        if (filteredMedicines.length === 0) {

            if (emptyState) {
                emptyState.style.display = "block";
            }

        } else {

            if (emptyState) {
                emptyState.style.display = "none";
            }


            filteredMedicines.forEach(function (medicine) {

                const row =
                    document.createElement("tr");

                const medicineCode =
                    "MED-" +
                    String(medicine.medicine_id)
                        .padStart(4, "0");

                const name =
                    escapeHTML(
                        medicine.medicine_name || "-"
                    );

                const generic =
                    escapeHTML(
                        medicine.generic_name || "-"
                    );

                const medicineDosage =
                    escapeHTML(
                        medicine.dosage || "-"
                    );

                const medicineUnit =
                    escapeHTML(
                        medicine.unit || "-"
                    );

                const medicineCategory =
                    escapeHTML(
                        medicine.category_name ||
                        medicine.category ||
                        "-"
                    );

                const price =
                    Number(
                        medicine.selling_price || 0
                    ).toFixed(2);

                const quantity =
                    Number(
                        medicine.quantity || 0
                    );

                const expiry =
                    formatDate(
                        medicine.expiry_date
                    );

                const status =
                    getMedicineStatus(medicine);


                row.innerHTML = `

                    <td>
                        <strong>${medicineCode}</strong>
                    </td>

                    <td>
                        <strong>${name}</strong>
                    </td>

                    <td>
                        ${generic}
                    </td>

                    <td>
                        ${medicineDosage}
                    </td>

                    <td>
                        ${medicineUnit}
                    </td>

                    <td>
                        ${price} ETB
                    </td>

                    <td>
                        <strong>${quantity}</strong>
                    </td>

                    <td>
                        <span class="status-badge ${getStatusClass(status)}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                    <td>
                        ${expiry}
                    </td>

                    <td>

                        <div class="action-buttons">

                            <button
                                type="button"
                                class="action-btn view-btn"
                                data-action="view"
                                data-id="${medicine.medicine_id}"
                                title="View"
                            >
                                <i class="fa-solid fa-eye"></i>
                            </button>

                            <button
                                type="button"
                                class="action-btn edit-btn"
                                data-action="edit"
                                data-id="${medicine.medicine_id}"
                                title="Edit"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="action-btn delete-btn"
                                data-action="delete"
                                data-id="${medicine.medicine_id}"
                                title="Delete"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </td>
                `;

                medicineTableBody.appendChild(row);
            });
        }


        updateRecordCount(
            filteredMedicines.length
        );
    }


    /* =====================================================
       MEDICINE STATUS
    ===================================================== */

    function getMedicineStatus(medicine) {

        const quantity =
            Number(medicine.quantity || 0);

        const reorder =
            Number(medicine.reorder_level || 10);

        const databaseStatus =
            medicine.status || "Available";


        /*
           Expiry check
        */

        if (medicine.expiry_date) {

            const today =
                new Date();

            const expiry =
                new Date(
                    medicine.expiry_date
                );

            today.setHours(
                0, 0, 0, 0
            );

            expiry.setHours(
                0, 0, 0, 0
            );

            if (expiry < today) {
                return "Expired";
            }
        }


        /*
           Stock check
        */

        if (quantity <= 0) {
            return "Out of Stock";
        }


        if (
            quantity <= reorder
        ) {
            return "Low Stock";
        }


        if (
            databaseStatus === "Inactive"
        ) {
            return "Inactive";
        }


        return "Available";
    }


    /* =====================================================
       STATUS CSS CLASS
    ===================================================== */

    function getStatusClass(status) {

        switch (status) {

            case "Available":
                return "status-available";

            case "Low Stock":
                return "status-low";

            case "Expired":
                return "status-expired";

            case "Inactive":
                return "status-inactive";

            case "Out of Stock":
                return "status-out";

            default:
                return "";
        }
    }


    /* =====================================================
       STATISTICS
    ===================================================== */

    function updateStatistics() {

        let available = 0;
        let lowStock = 0;
        let outOfStock = 0;


        medicines.forEach(function (medicine) {

            const quantity =
                Number(
                    medicine.quantity || 0
                );

            const reorderLevel =
                Number(
                    medicine.reorder_level || 10
                );


            if (quantity <= 0) {

                outOfStock++;

            } else if (
                quantity <= reorderLevel
            ) {

                lowStock++;

            } else {

                available++;
            }
        });


        if (totalMedicines) {
            totalMedicines.textContent =
                medicines.length;
        }

        if (inStockMedicines) {
            inStockMedicines.textContent =
                available;
        }

        if (lowStockMedicines) {
            lowStockMedicines.textContent =
                lowStock;
        }

        if (outOfStockMedicines) {
            outOfStockMedicines.textContent =
                outOfStock;
        }
    }


    /* =====================================================
       RECORD COUNT
    ===================================================== */

    function updateRecordCount(count) {

        if (!recordCount) {
            return;
        }

        recordCount.textContent =
            `${count} Medicine${count === 1 ? "" : "s"}`;
    }


    /* =====================================================
       OPEN ADD MODAL
    ===================================================== */

    function openAddMedicineModal() {

        editingMedicineId = null;

        if (medicineForm) {
            medicineForm.reset();
        }

        if (medicineId) {
            medicineId.value = "";
        }

        if (modalTitle) {
            modalTitle.textContent =
                "Add New Medicine";
        }

        if (saveButtonText) {
            saveButtonText.textContent =
                "Save Medicine";
        }

        if (stockQuantity) {
            stockQuantity.value = 0;
        }

        if (reorderLevel) {
            reorderLevel.value = 10;
        }

        if (purchasePrice) {
            purchasePrice.value = 0;
        }

        if (sellingPrice) {
            sellingPrice.value = 0;
        }

        if (medicineStatus) {
            medicineStatus.value =
                "Available";
        }

        openModal();
    }


    /* =====================================================
       OPEN MODAL
    ===================================================== */

    function openModal() {

        if (!medicineModal) {
            return;
        }

        medicineModal.classList.add("show");

        medicineModal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );
    }


    /* =====================================================
       CLOSE MODAL
    ===================================================== */

    function closeModal() {

        if (!medicineModal) {
            return;
        }

        medicineModal.classList.remove(
            "show"
        );

        medicineModal.setAttribute(
            "aria-hidden",
            "true"
        );

        document.body.classList.remove(
            "modal-open"
        );

        editingMedicineId = null;
    }


    /* =====================================================
       EDIT MEDICINE
    ===================================================== */

    async function editMedicine(id) {

        try {

            const response =
                await fetch(
                    `${API_URL}/medicines/${id}`
                );

            if (!response.ok) {

                throw new Error(
                    `Medicine API error: ${response.status}`
                );
            }

            const data =
                await response.json();

            console.log(
                "Medicine details:",
                data
            );


            const medicine =
                data.medicine || data;


            if (!medicine) {

                showMessage(
                    "Medicine not found.",
                    "error"
                );

                return;
            }


            editingMedicineId =
                Number(
                    medicine.medicine_id
                );


            medicineId.value =
                medicine.medicine_id || "";

            medicineName.value =
                medicine.medicine_name || "";

            genericName.value =
                medicine.generic_name || "";

            dosage.value =
                medicine.dosage || "";

            unit.value =
                medicine.unit || "";

            stockQuantity.value =
                medicine.quantity ?? 0;

            reorderLevel.value =
                medicine.reorder_level ?? 10;

            purchasePrice.value =
                medicine.purchase_price ?? 0;

            sellingPrice.value =
                medicine.selling_price ?? 0;

            expiryDate.value =
                normalizeDate(
                    medicine.expiry_date
                );

            medicineStatus.value =
                medicine.status || "Available";


            if (category) {

                const medicineCategory =
                    medicine.category_name ||
                    medicine.category ||
                    "";


                /*
                   If the category isn't already in
                   the dropdown, add it.
                */

                if (
                    medicineCategory &&
                    !Array.from(
                        category.options
                    ).some(
                        option =>
                            option.value ===
                            medicineCategory
                    )
                ) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        medicineCategory;

                    option.textContent =
                        medicineCategory;

                    category.appendChild(
                        option
                    );
                }


                category.value =
                    medicineCategory;
            }


            modalTitle.textContent =
                "Edit Medicine";

            saveButtonText.textContent =
                "Update Medicine";


            openModal();

        } catch (error) {

            console.error(
                "Edit medicine error:",
                error
            );

            showMessage(
                "Unable to load medicine details.",
                "error"
            );
        }
    }


    /* =====================================================
       VIEW MEDICINE
    ===================================================== */

    async function viewMedicine(id) {

        try {

            const response =
                await fetch(
                    `${API_URL}/medicines/${id}`
                );

            if (!response.ok) {
                throw new Error(
                    "Unable to load medicine."
                );
            }

            const data =
                await response.json();

            const medicine =
                data.medicine || data;


            if (!medicine) {
                return;
            }


            const code =
                "MED-" +
                String(
                    medicine.medicine_id
                ).padStart(4, "0");


            const status =
                getMedicineStatus(
                    medicine
                );


            const message =

                `Medicine Details\n\n` +

                `Code: ${code}\n` +

                `Medicine: ${
                    medicine.medicine_name || "-"
                }\n` +

                `Generic Name: ${
                    medicine.generic_name || "-"
                }\n` +

                `Dosage: ${
                    medicine.dosage || "-"
                }\n` +

                `Unit: ${
                    medicine.unit || "-"
                }\n` +

                `Quantity: ${
                    medicine.quantity ?? 0
                }\n` +

                `Reorder Level: ${
                    medicine.reorder_level ?? 10
                }\n` +

                `Purchase Price: ${
                    Number(
                        medicine.purchase_price || 0
                    ).toFixed(2)
                } ETB\n` +

                `Selling Price: ${
                    Number(
                        medicine.selling_price || 0
                    ).toFixed(2)
                } ETB\n` +

                `Expiry Date: ${
                    formatDate(
                        medicine.expiry_date
                    )
                }\n` +

                `Status: ${status}`;


            alert(message);

        } catch (error) {

            console.error(
                "View medicine error:",
                error
            );

            showMessage(
                "Unable to view medicine.",
                "error"
            );
        }
    }


    /* =====================================================
       DELETE MEDICINE
    ===================================================== */

    async function deleteMedicine(id) {

        const medicine =
            medicines.find(
                item =>
                    Number(
                        item.medicine_id
                    ) === Number(id)
            );


        if (!medicine) {

            showMessage(
                "Medicine not found.",
                "error"
            );

            return;
        }


        const confirmed =
            confirm(
                `Are you sure you want to delete "${medicine.medicine_name}"?`
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API_URL}/medicines/${id}`,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to delete medicine."
                );
            }


            showMessage(
                "Medicine deleted successfully.",
                "success"
            );


            await loadMedicines();

        } catch (error) {

            console.error(
                "Delete medicine error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to delete medicine.",
                "error"
            );
        }
    }


    /* =====================================================
       SAVE / UPDATE MEDICINE
    ===================================================== */

    async function saveMedicine(
        event
    ) {

        event.preventDefault();


        const name =
            medicineName.value.trim();


        if (!name) {

            showMessage(
                "Medicine name is required.",
                "error"
            );

            medicineName.focus();

            return;
        }


        const quantity =
            Number(
                stockQuantity.value
            );


        const reorder =
            Number(
                reorderLevel.value || 0
            );


        const purchase =
            Number(
                purchasePrice.value || 0
            );


        const selling =
            Number(
                sellingPrice.value || 0
            );


        if (quantity < 0) {

            showMessage(
                "Stock quantity cannot be negative.",
                "error"
            );

            return;
        }


        if (reorder < 0) {

            showMessage(
                "Reorder level cannot be negative.",
                "error"
            );

            return;
        }


        if (purchase < 0 || selling < 0) {

            showMessage(
                "Price cannot be negative.",
                "error"
            );

            return;
        }


        /*
           Automatically determine stock status.
        */

        let status =
            medicineStatus.value ||
            "Available";


        if (quantity <= 0) {

            status = "Low Stock";

        } else if (
            quantity <= reorder
        ) {

            status = "Low Stock";

        } else {

            status = "Available";
        }


        const payload = {

            medicine_name: name,

            generic_name:
                genericName.value.trim(),

            category_id:
                getCategoryId(),

            dosage:
                dosage.value.trim(),

            unit:
                unit.value,

            quantity:
                quantity,

            reorder_level:
                reorder,

            purchase_price:
                purchase,

            selling_price:
                selling,

            expiry_date:
                expiryDate.value || null,

            status:
                status
        };


        console.log(
            "Medicine payload:",
            payload
        );


        try {

            let response;


            if (editingMedicineId) {

                response =
                    await fetch(
                        `${API_URL}/medicines/${editingMedicineId}`,
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
                        `${API_URL}/medicines`,
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


            console.log(
                "Save medicine response:",
                data
            );


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Unable to save medicine."
                );
            }


            showMessage(
                editingMedicineId
                    ? "Medicine updated successfully."
                    : "Medicine added successfully.",
                "success"
            );


            closeModal();

            await loadMedicines();

            /*
               Reload categories because a new category
               may have been introduced.
            */

            await loadCategories();


        } catch (error) {

            console.error(
                "Save medicine error:",
                error
            );

            showMessage(
                error.message ||
                "Unable to save medicine.",
                "error"
            );
        }
    }


    /* =====================================================
       GET CATEGORY ID
    ===================================================== */

    function getCategoryId() {

        /*
           At the moment your database result did not show
           a categories table.

           Therefore use null when there is no category ID.
        */

        if (
            !category ||
            !category.value
        ) {
            return null;
        }


        /*
           If the dropdown option has a numeric value,
           use it.
        */

        const selectedOption =
            category.options[
                category.selectedIndex
            ];


        if (
            selectedOption &&
            selectedOption.dataset.categoryId
        ) {

            return Number(
                selectedOption.dataset.categoryId
            );
        }


        return null;
    }


    /* =====================================================
       SEARCH
    ===================================================== */

    if (medicineSearch) {

        medicineSearch.addEventListener(
            "input",
            renderMedicines
        );
    }


    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    if (categoryFilter) {

        categoryFilter.addEventListener(
            "change",
            renderMedicines
        );
    }


    /* =====================================================
       ADD BUTTONS
    ===================================================== */

    if (openMedicineModalBtn) {

        openMedicineModalBtn.addEventListener(
            "click",
            openAddMedicineModal
        );
    }


    if (addMedicineBtn) {

        addMedicineBtn.addEventListener(
            "click",
            openAddMedicineModal
        );
    }


    if (emptyAddBtn) {

        emptyAddBtn.addEventListener(
            "click",
            openAddMedicineModal
        );
    }


    /* =====================================================
       CLOSE BUTTONS
    ===================================================== */

    if (closeMedicineModalBtn) {

        closeMedicineModalBtn.addEventListener(
            "click",
            closeModal
        );
    }


    if (cancelMedicineBtn) {

        cancelMedicineBtn.addEventListener(
            "click",
            closeModal
        );
    }


    /* =====================================================
       FORM SUBMIT
    ===================================================== */

    if (medicineForm) {

        medicineForm.addEventListener(
            "submit",
            saveMedicine
        );
    }


    /* =====================================================
       TABLE ACTIONS
    ===================================================== */

    if (medicineTableBody) {

        medicineTableBody.addEventListener(
            "click",
            function (event) {

                const button =
                    event.target.closest(
                        "button[data-action]"
                    );


                if (!button) {
                    return;
                }


                const action =
                    button.dataset.action;


                const id =
                    Number(
                        button.dataset.id
                    );


                if (!id) {
                    return;
                }


                if (action === "view") {

                    viewMedicine(id);

                } else if (action === "edit") {

                    editMedicine(id);

                } else if (action === "delete") {

                    deleteMedicine(id);
                }
            }
        );
    }


    /* =====================================================
       CLICK OUTSIDE MODAL
    ===================================================== */

    if (medicineModal) {

        medicineModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    medicineModal
                ) {
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

            if (
                event.key === "Escape" &&
                medicineModal &&
                medicineModal.classList.contains(
                    "show"
                )
            ) {

                closeModal();
            }
        }
    );


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(dateValue) {

        if (!dateValue) {
            return "-";
        }


        const date =
            new Date(dateValue);


        if (Number.isNaN(
            date.getTime()
        )) {

            return String(
                dateValue
            );
        }


        return date.toLocaleDateString(
            "en-GB"
        );
    }


    /* =====================================================
       NORMALIZE DATE FOR INPUT
    ===================================================== */

    function normalizeDate(dateValue) {

        if (!dateValue) {
            return "";
        }


        const value =
            String(dateValue);


        /*
           MySQL date:
           2028-12-31
        */

        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                value
            )
        ) {

            return value;
        }


        /*
           MySQL datetime:
           2028-12-31T00:00:00
        */

        return value.substring(
            0,
            10
        );
    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

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


    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(
        message,
        type
    ) {

        /*
           Simple message for now.
           We can replace this with a polished toast
           notification later.
        */

        if (type === "success") {

            alert(
                "Success: " +
                message
            );

        } else {

            alert(
                "Error: " +
                message
            );
        }
    }


    /* =====================================================
       MOBILE SIDEBAR
    ===================================================== */

    const sidebar =
        document.getElementById(
            "sidebar"
        );

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const sidebarOverlay =
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

                if (sidebarOverlay) {

                    sidebarOverlay.classList.toggle(
                        "show"
                    );
                }
            }
        );
    }


    if (sidebarOverlay && sidebar) {

        sidebarOverlay.addEventListener(
            "click",
            function () {

                sidebar.classList.remove(
                    "open"
                );

                sidebarOverlay.classList.remove(
                    "show"
                );
            }
        );
    }


    /* =====================================================
       LOGOUT
    ===================================================== */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                const confirmed =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (confirmed) {

                    window.location.href =
                        "../login/login.html";
                }
            }
        );
    }

});