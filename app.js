document.addEventListener('DOMContentLoaded', function () {

    // Store current view state globally within the closure
    let currentMonth = new Date().getMonth() + 1;
    let currentYear = new Date().getFullYear();
    let currentClass = ''; // Add class tracking
    let elements = {}; // Keep elements reference updated

    // ---- Sidebar Functionality ----
    function initializeSidebar() {
        const threeDotBtn = document.getElementById('threeDotBtn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        const closeSidebar = document.getElementById('closeSidebar');
        const logoutBtn = document.getElementById('logoutBtn');

        // Open sidebar
        if (threeDotBtn) {
            threeDotBtn.addEventListener('click', function () {
                sidebar.classList.add('open');
                sidebarOverlay.classList.add('open');
            });
        }

        // Close sidebar - close button
        if (closeSidebar) {
            closeSidebar.addEventListener('click', function () {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('open');
            });
        }

        // Close sidebar - overlay click
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', function () {
                sidebar.classList.remove('open');
                sidebarOverlay.classList.remove('open');
            });
        }

        // Logout functionality
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function () {
                // The logout functionality is now handled by Firebase Auth in app.html
                // This is a fallback for any remaining localStorage dependencies
                if (confirm('Are you sure you want to logout?')) {
                    // Clear any local data if needed
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('username');

                    // The Firebase signOut in app.html will handle the actual logout
                    console.log('Logout initiated from app.js');
                }
            });
        }

        // Profile menu options
        const editProfile = document.getElementById('editProfile');
        const settings = document.getElementById('settings');
        const help = document.getElementById('help');
        const about = document.getElementById('about');

        if (editProfile) {
            editProfile.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'edit-profile.html';
            });
        }

        if (settings) {
            settings.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'settings.html';
            });
        }

        if (help) {
            help.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'help.html';
            });
        }

        if (about) {
            about.addEventListener('click', function (e) {
                e.preventDefault();
                window.location.href = 'about.html';
            });
        }
    }

    // ---- About Modal Functions ----
    function closeAboutModal() {
        document.getElementById('aboutModal').classList.remove('active');
    }

    // Close modal when clicking outside
    document.addEventListener('click', function (e) {
        const modal = document.getElementById('aboutModal');
        if (e.target === modal) {
            closeAboutModal();
        }
    });

    // Make closeAboutModal globally accessible
    window.closeAboutModal = closeAboutModal;


    // ---- Initialization ----
    function initApp() {
        console.log("Initializing App");
        loadDarkModePreference();
        initializeSidebar(); // Initialize sidebar functionality
        showHomePage(); // Start on home page
    }

    function initializeDOMElements() {
        console.log("Initializing DOM elements map");
        // This function now finds elements relevant to the CURRENT view
        // It's important it runs AFTER the view's HTML is rendered
        return {
            // Home page elements
            createNewSheetBtn: document.getElementById('createNewSheet'),
            viewAllSheetsBtn: document.getElementById('viewAllSheets'),

            // Sheet page elements
            monthSelect: document.getElementById('monthSelect'),
            yearSelect: document.getElementById('yearSelect'),
            classInput: document.getElementById('classInput'),
            addStudentBtn: document.getElementById('addStudentBtn'),
            exportBtn: document.getElementById('exportBtn'),
            attendanceTable: document.getElementById('attendanceTable'),
            tableBody: document.getElementById('attendanceTable')?.querySelector('tbody'),
            headerRow: document.getElementById('headerRow'),
            backToHomeSheet: document.getElementById('backToHomeSheet'), // Specific ID for sheet back button

            // All Sheets page elements
            sheetsContainer: document.getElementById('sheetsContainer'),
            backToHomeAllSheets: document.getElementById('backToHomeAllSheets'), // Specific ID for all sheets back button

            // Common elements (might exist in multiple views)
            darkModeToggle: document.getElementById('darkModeToggle'),
            appContainer: document.getElementById('appContainer') // Main container
        };
    }

    // ---- View Rendering Functions ----
    function showFeeManagementPage(year, month, className) {
        console.log("Showing Fee Management Page for:", year, month, className);
        // elements.homePage.style.display = 'none'; // Assuming single page app, appContainer is cleared
        // elements.attendanceSheet.style.display = 'none';
        // elements.allSheetsView.style.display = 'none';
        // elements.feeManagementPage.style.display = 'block'; // This will be handled by appContainer.innerHTML
        if (!elements.appContainer) {
            console.error("CRITICAL: appContainer not found!");
            return;
        }

        loadDarkModePreference(); // Ensure dark mode is consistent

        const feeYear = year || currentYear;
        const feeMonth = month || currentMonth;
        const feeClassName = className || currentClass;

        const feeStorageKey = getFeeStorageKey(feeYear, feeMonth, feeClassName);
        let feeData = { students: [] };
        if (feeStorageKey) {
            try {
                const storedData = localStorage.getItem(feeStorageKey);
                if (storedData) {
                    feeData = JSON.parse(storedData);
                    if (!Array.isArray(feeData.students)) feeData.students = [];
                }
            } catch (e) {
                console.error("Error loading fee data:", e);
                feeData.students = [];
            }
        }

        const monthName = new Date(feeYear, feeMonth - 1).toLocaleString('default', { month: 'long' });

        elements.appContainer.innerHTML = `
            <header class="sheet-header"> <!-- Reusing sheet-header style -->
                <img src="logo.png" alt="Logo" class="app-logo-sheet">
                <h1>Fee Management: ${feeClassName} - ${monthName} ${feeYear}</h1>
                <p>ছাত্রদের ফি সংগ্রহ ও ব্যবস্থাপনা</p>
            </header>
            <main>
                 <h2 class="sheet-title">FEE RECORDS</h2>
                <div class="controls top-controls">
                    <button id="backToHomeFees" class="btn back-btn"> <i class="fas fa-home"></i> Home</button>
                    <button id="saveFeeDataBtn" class="btn save-btn"><i class="fas fa-save"></i> Save Fee Data</button>
                    <div class="dark-mode-toggle">
                        <span class="mode-label">Light</span>
                        <label class="switch">
                            <input type="checkbox" id="darkModeToggle">
                            <span class="slider round"></span>
                        </label>
                        <span class="mode-label">Dark</span>
                    </div>
                </div>
                <div class="table-container responsive-table">
                    <table id="feeTable">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Roll</th>
                                <th>Tuition Fee</th>
                                <th>Exam Fee</th>
                                <th>Other Fees</th>
                                <th>Total Paid</th>
                                <th>Dues</th>
                            </tr>
                        </thead>
                        <tbody id="feeTableBody">
                            ${feeData.students.map((student, index) => `
                                <tr data-index="${index}">
                                    <td>${student.name || 'N/A'}</td>
                                    <td>${student.roll || 'N/A'}</td>
                                    <td><input type="number" class="fee-input" data-field="tuitionFee" value="${student.tuitionFee || ''}" placeholder="0.00"></td>
                                    <td><input type="number" class="fee-input" data-field="examFee" value="${student.examFee || ''}" placeholder="0.00"></td>
                                    <td><input type="number" class="fee-input" data-field="otherFees" value="${student.otherFees || ''}" placeholder="0.00"></td>
                                    <td><input type="number" class="fee-input" data-field="totalPaid" value="${student.totalPaid || ''}" placeholder="0.00"></td>
                                    <td class="dues-cell">${calculateDues(student)}</td>
                                </tr>
                            `).join('')}
                            ${feeData.students.length === 0 ? '<tr><td colspan="7">No student data found for this sheet. Create an attendance sheet first.</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
            </main>
        `;

        elements = initializeDOMElements(); // Re-initialize for new elements

        if (elements.darkModeToggle) {
            elements.darkModeToggle.checked = document.documentElement.hasAttribute('data-theme');
            elements.darkModeToggle.addEventListener('change', toggleDarkMode);
        }
        const backToHomeFeesBtn = document.getElementById('backToHomeFees');
        if (backToHomeFeesBtn) {
            backToHomeFeesBtn.addEventListener('click', showHomePage);
        }

        const saveFeeDataBtn = document.getElementById('saveFeeDataBtn');
        if (saveFeeDataBtn) {
            saveFeeDataBtn.addEventListener('click', () => saveFeeData(feeYear, feeMonth, feeClassName));
        }

        // Add event listeners to fee input fields to recalculate dues on change
        const feeTableBody = document.getElementById('feeTableBody');
        if (feeTableBody) {
            feeTableBody.querySelectorAll('.fee-input').forEach(input => {
                input.addEventListener('input', (event) => {
                    const row = event.target.closest('tr');
                    if (!row) return;
                    const studentData = {
                        tuitionFee: parseFloat(row.querySelector('input[data-field="tuitionFee"]').value) || 0,
                        examFee: parseFloat(row.querySelector('input[data-field="examFee"]').value) || 0,
                        otherFees: parseFloat(row.querySelector('input[data-field="otherFees"]').value) || 0,
                        totalPaid: parseFloat(row.querySelector('input[data-field="totalPaid"]').value) || 0,
                    };
                    const duesCell = row.querySelector('.dues-cell');
                    if (duesCell) {
                        duesCell.textContent = calculateDues(studentData);
                    }
                });
            });
        }
    }

    function calculateDues(student) {
        const tuition = parseFloat(student.tuitionFee) || 0;
        const exam = parseFloat(student.examFee) || 0;
        const other = parseFloat(student.otherFees) || 0;
        const paid = parseFloat(student.totalPaid) || 0;
        const totalFees = tuition + exam + other;
        const dues = totalFees - paid;
        return dues.toFixed(2);
    }

    function saveFeeData(year, month, className) {
        const feeStorageKey = getFeeStorageKey(year, month, className);
        if (!feeStorageKey) {
            alert("Error: Could not determine storage key for saving fee data.");
            return;
        }

        const feeTableBody = document.getElementById('feeTableBody');
        if (!feeTableBody) {
            alert("Error: Fee table not found.");
            return;
        }

        let feeDataToSave = { students: [] };
        const existingDataStr = localStorage.getItem(feeStorageKey);
        if (existingDataStr) {
            try {
                const parsedData = JSON.parse(existingDataStr);
                if (parsedData && Array.isArray(parsedData.students)) {
                    feeDataToSave = parsedData;
                }
            } catch (e) { console.error("Error parsing existing fee data before save:", e); }
        }

        const currentStudentsOnPageMap = new Map();
        feeTableBody.querySelectorAll('tr[data-index]').forEach(row => {
            const studentName = row.cells[0].textContent;
            const studentRoll = row.cells[1].textContent;
            const tuitionFee = row.querySelector('input[data-field="tuitionFee"]').value;
            const examFee = row.querySelector('input[data-field="examFee"]').value;
            const otherFees = row.querySelector('input[data-field="otherFees"]').value;
            const totalPaid = row.querySelector('input[data-field="totalPaid"]').value;

            // Use a composite key of name and roll if roll might be empty or non-unique initially
            const studentKey = `${studentName}-${studentRoll}`;
            currentStudentsOnPageMap.set(studentKey, {
                name: studentName,
                roll: studentRoll,
                tuitionFee: tuitionFee || '0',
                examFee: examFee || '0',
                otherFees: otherFees || '0',
                totalPaid: totalPaid || '0',
            });
        });

        // Update existing students or add new ones from the page to feeDataToSave.students
        const updatedStudents = feeDataToSave.students.map(storedStudent => {
            const studentKey = `${storedStudent.name}-${storedStudent.roll}`;
            if (currentStudentsOnPageMap.has(studentKey)) {
                const pageStudentData = currentStudentsOnPageMap.get(studentKey);
                currentStudentsOnPageMap.delete(studentKey); // Remove from map as it's processed
                return pageStudentData; // Update with data from the page
            }
            return storedStudent; // Keep stored student if not on page (e.g. if filtered out, though not implemented here)
        });

        // Add any students that were on the page but not in the original feeDataToSave.students
        // (This handles students newly added via attendance sheet)
        currentStudentsOnPageMap.forEach(pageStudent => {
            updatedStudents.push(pageStudent);
        });

        feeDataToSave.students = updatedStudents;

        try {
            localStorage.setItem(feeStorageKey, JSON.stringify(feeDataToSave));
            alert('Fee data saved successfully!');
            console.log(`Fee data saved for key: ${feeStorageKey}`);
        } catch (e) {
            console.error("Failed to save fee data:", e);
            alert("Error saving fee data. Local storage might be full or disabled.");
        }
    }

    function showHomePage() {
        console.log("showHomePage function called");
        if (!elements.appContainer) {
            // If called very first time, get the container
            elements.appContainer = document.getElementById('appContainer');
            if (!elements.appContainer) {
                console.error("CRITICAL: appContainer not found!");
                return;
            }
        }

        elements.appContainer.innerHTML = `
            <header>
                <img src="logo.png" alt="Logo" class="app-logo">
                <h1>Attendance System</h1>
                <div class="header-controls">
                    <div class="dark-mode-toggle">
                        <span class="mode-label">Light</span>
                        <label class="switch">
                            <input type="checkbox" id="darkModeToggle">
                            <span class="slider round"></span>
                        </label>
                        <span class="mode-label">Dark</span>
                    </div>
                    <div class="menu-toggle">
                        <button class="three-dot-btn" id="threeDotBtn">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </div>
                </div>
            </header>

            <!-- Sidebar -->
            <div class="sidebar" id="sidebar">
                <div class="sidebar-header">
                    <h3>Menu</h3>
                    <button class="close-sidebar" id="closeSidebar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="sidebar-content">
                    <div class="profile-info">
                        <i class="fas fa-user-circle profile-avatar"></i>
                        <div class="profile-details">
                            <span class="profile-name">User Name</span>
                            <span class="profile-email">user@example.com</span>
                        </div>
                    </div>
                    <hr>
                    <ul class="sidebar-menu">
                        <li><a href="#" id="editProfile"><i class="fas fa-edit"></i> Edit Profile</a></li>
                        <li><a href="#" id="settings"><i class="fas fa-cog"></i> Settings</a></li>
                        <li><a href="#" id="help"><i class="fas fa-question-circle"></i> Help</a></li>
                        <li><a href="#" id="about"><i class="fas fa-info-circle"></i> About</a></li>
                    </ul>
                    <hr>
                    <button class="logout-btn" id="logoutBtn">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>

            <!-- Sidebar Overlay -->
            <div class="sidebar-overlay" id="sidebarOverlay"></div>

            <main class="home-page">
                <div class="card-container">
                    <div class="card">
                        <i class="fas fa-plus-circle card-icon"></i>
                        <h2>Create New Sheet</h2>
                        <p>Click here to create a new attendance sheet</p>
                        <button id="createNewSheet" class="btn card-btn">
                            <i class="fas fa-plus"></i> New Sheet
                        </button>
                    </div>
                    <div class="card">
                        <i class="fas fa-list-alt card-icon"></i>
                        <h2>View All Sheets</h2>
                        <p>Click here to see all previously created sheets</p>
                        <button id="viewAllSheets" class="btn card-btn">
                            <i class="fas fa-eye"></i> View All
                        </button>
                    </div>
                </div>
            </main>
        `;
        elements = initializeDOMElements();
        setupHomePageEventListeners();
        initializeSidebar(); // Re-initialize sidebar after content is recreated
        // Re-apply dark mode state visually to the new toggle
        if (elements.darkModeToggle) {
            elements.darkModeToggle.checked = document.documentElement.hasAttribute('data-theme');
        }
    }

    function showAttendanceSheet() {
        console.log("showAttendanceSheet function called");
        if (!elements.appContainer) {
            console.error("CRITICAL: appContainer not found!");
            return; // Cannot render without container
        }

        elements.appContainer.innerHTML = `
            <header class="sheet-header">
                <img src="logo.png" alt="Logo" class="app-logo-sheet">
                <h1>Smart Attendance Manager</h1>
                <p>স্মার্ট হাজিরা ব্যবস্থাপক</p>
            </header>
            <div class="info-bar">
                <div class="info-item">
                    <label for="monthSelect">MONTH:</label>
                    <select id="monthSelect">
                        <option value="1">January</option><option value="2">February</option><option value="3">March</option>
                        <option value="4">April</option><option value="5">May</option><option value="6">June</option>
                        <option value="7">July</option><option value="8">August</option><option value="9">September</option>
                        <option value="10">October</option><option value="11">November</option><option value="12">December</option>
                    </select>
                </div>
                <div class="info-item">
                    <label for="yearSelect">YEAR:</label>
                    <select id="yearSelect">
                        </select>
                </div>
                <div class="info-item">
                    <label for="classInput">CLASS:</label>
                    <input type="text" id="classInput" placeholder="Enter Class Name">
                </div>
            </div>
            <main>
                <h2 class="sheet-title">ATTENDANCE SHEET</h2>
                <div class="controls top-controls">
                    <button id="addStudentBtn" class="btn add-btn">
                        <i class="fas fa-user-plus"></i> Add Student
                    </button>
                    <button id="exportBtn" class="btn export-btn">
                        <i class="fas fa-file-export"></i> Export to CSV
                    </button>
                    <button id="manageFeesBtn" class="btn fee-btn" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white;">
                        <i class="fas fa-file-invoice-dollar"></i> Manage Fees
                    </button>
                    <button id="viewAnalyticsSheetBtn" class="btn" style="background: linear-gradient(135deg, #ec4899, #be185d); color: white;">
                        <i class="fas fa-chart-pie"></i> Analytics
                    </button>
                    <button id="backToHomeSheet" class="btn back-btn"> <i class="fas fa-home"></i> Home
                    </button>
                    <div class="dark-mode-toggle">
                        <span class="mode-label">Light</span>
                        <label class="switch">
                            <input type="checkbox" id="darkModeToggle">
                            <span class="slider round"></span>
                        </label>
                        <span class="mode-label">Dark</span>
                    </div>
                </div>
                <div class="table-container">
                    <table id="attendanceTable">
                        <thead>
                            <tr id="headerRow">
                                <th>NAME</th><th>ROLL</th><th>PHONE</th><th>ACTIONS</th> </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
                <div class="attendance-status-legend">
                   <strong>Legend:</strong>
                   <span class="status-indicator"><div class="status-dot present"></div> Present</span>
                   <span class="status-indicator"><div class="status-dot absent"></div> Absent</span>
                   <span class="status-indicator"><div class="status-dot late"></div> Late</span>
                   <span class="status-indicator"><div class="status-dot not-marked"></div> Not Marked</span>
               </div>
            </main>
        `;

        // Reinitialize DOM elements map AFTER innerHTML is set
        elements = initializeDOMElements();

        // Populate Year dropdown
        const currentFullYear = new Date().getFullYear();
        if (elements.yearSelect) {
            for (let y = currentFullYear - 5; y <= currentFullYear + 5; y++) {
                const option = document.createElement('option');
                option.value = y;
                option.textContent = y;
                elements.yearSelect.appendChild(option);
            }
            // Set current/default values from global state
            elements.monthSelect.value = currentMonth;
            elements.yearSelect.value = currentYear;
        } else {
            console.error("yearSelect element not found after rendering sheet view!");
        }
        if (elements.classInput) {
            elements.classInput.value = currentClass;
        }


        // Set dark mode state visually
        if (elements.darkModeToggle) {
            elements.darkModeToggle.checked = document.documentElement.hasAttribute('data-theme');
        }

        // Setup event listeners specific to this view
        setupSheetEventListeners();

        // Initial table setup and data load
        updateTableHeaders(); // This will also call loadAttendanceData
        setupAutoSave();
    }

    function showAllSheets() {
        console.log("showAllSheets function called");
        if (!elements.appContainer) {
            console.error("CRITICAL: appContainer not found!");
            return;
        }

        elements.appContainer.innerHTML = `
            <div class="all-sheets-page">
                 <header>
                     <img src="logo.png" alt="Logo" class="app-logo">
                     <h1>All Saved Sheets</h1>
                      <div class="controls">
                         <button id="backToHomeAllSheets" class="btn back-btn"> <i class="fas fa-home"></i> Home
                         </button>
                         <button id="viewPhoneDirectory" class="btn" style="background: #10b981; color: white;" onclick="showPhoneDirectory()"> <i class="fas fa-phone-alt"></i> Phone Directory
                         </button>
                         <div class="dark-mode-toggle">
                             <span class="mode-label">Light</span>
                             <label class="switch">
                                 <input type="checkbox" id="darkModeToggle">
                                 <span class="slider round"></span>
                             </label>
                             <span class="mode-label">Dark</span>
                         </div>
                     </div>
                 </header>
                 <main>
                     <div id="sheetsContainer" class="sheets-container">
                         <p>Loading sheets...</p>
                     </div>
                 </main>
            </div>
        `;
        // Update elements map and setup listeners
        elements = initializeDOMElements();
        setupAllSheetsEventListeners();
        // Re-apply dark mode state visually to the new toggle
        if (elements.darkModeToggle) {
            elements.darkModeToggle.checked = document.documentElement.hasAttribute('data-theme');
        }
        // Load the sheets list
        loadAllSheets();
    }

function showAnalyticsDashboard() {
        console.log("showAnalyticsDashboard function called");
        if (!elements.appContainer) return;

        const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

        elements.appContainer.innerHTML = `
            <div class="analytics-page">
                 <header class="sheet-header">
                     <img src="logo.png" alt="Logo" class="app-logo-sheet">
                     <h1>Analytics & Insights</h1>
                     <p>${currentClass} - ${monthName} ${currentYear}</p>
                 </header>
                 <main>
                      <div class="controls top-controls">
                         <button id="backToSheetAnalytics" class="btn back-btn"> <i class="fas fa-arrow-left"></i> Back to Sheet
                         </button>
                         <button id="backToHomeAnalytics" class="btn" style="background: var(--secondary-color); color: white;"> <i class="fas fa-home"></i> Home
                         </button>
                         <div class="dark-mode-toggle">
                             <span class="mode-label">Light</span>
                             <label class="switch">
                                 <input type="checkbox" id="darkModeToggle">
                                 <span class="slider round"></span>
                             </label>
                             <span class="mode-label">Dark</span>
                         </div>
                      </div>
                      <div class="chart-container-wrapper" style="display: flex; flex-wrap: wrap; gap: 30px; justify-content: center; margin-top: 20px;">
                          <div class="chart-box" style="background: var(--card-bg); padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px var(--shadow-color); flex: 1; min-width: 300px; max-width: 500px;">
                              <h3 style="text-align: center; margin-bottom: 15px; border-bottom: 2px solid var(--primary-color); padding-bottom: 10px;">Current Sheet: ${currentClass || 'All Students'}</h3>
                              <canvas id="attendancePieChart"></canvas>
                          </div>
                      </div>
                 </main>
            </div>
        `;

        elements = initializeDOMElements();

        const backToSheetBtn = document.getElementById('backToSheetAnalytics');
        if (backToSheetBtn) backToSheetBtn.addEventListener('click', showAttendanceSheet);

        const backBtn = document.getElementById('backToHomeAnalytics');
        if (backBtn) backBtn.addEventListener('click', showHomePage);

        const darkToggle = document.getElementById('darkModeToggle');
        if (darkToggle) {
            darkToggle.checked = document.documentElement.hasAttribute('data-theme');
            darkToggle.addEventListener('change', toggleDarkMode);
        }

        renderCharts();
    }

    function renderCharts() {
        let totalPresent = 0;
        let totalAbsent = 0;
        let totalLate = 0;
        let totalNotMarked = 0;

        const storageKey = getStorageKey();
        try {
            const dataStr = localStorage.getItem(storageKey);
            const parsedData = JSON.parse(dataStr);
            if (parsedData && parsedData.students) {
                parsedData.students.forEach(student => {
                    if (student.attendance) {
                        for (const day in student.attendance) {
                            const status = student.attendance[day];
                            if (status === 'present') totalPresent++;
                            else if (status === 'absent') totalAbsent++;
                            else if (status === 'late') totalLate++;
                            else if (status === 'not-marked') totalNotMarked++;
                        }
                    }
                });
            }
        } catch(e) {
            console.error("Error loading analytics data:", e);
        }

        if (totalPresent === 0 && totalAbsent === 0 && totalLate === 0 && totalNotMarked === 0) {
            totalPresent = 1;
        }

        const ctx = document.getElementById('attendancePieChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late', 'Not Marked'],
                datasets: [{
                    data: [totalPresent, totalAbsent, totalLate, totalNotMarked],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#6b7280'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: document.documentElement.hasAttribute('data-theme') ? '#f1f5f9' : '#1f2937' } }
                }
            }
        });
    }

    function showStudentAnalytics(studentRoll) {
        console.log("showStudentAnalytics called for:", studentRoll);
        
        const storageKey = getStorageKey();
        let studentData = null;
        
        try {
            const dataStr = localStorage.getItem(storageKey);
            const parsedData = JSON.parse(dataStr);
            if (parsedData && parsedData.students) {
                studentData = parsedData.students.find(s => s.roll === studentRoll);
            }
        } catch(e) {
            console.error("Error loading student data:", e);
        }

        if (!studentData) {
            alert("Student data not found!");
            return;
        }

        let present = 0, absent = 0, late = 0, notMarked = 0;
        
        if (studentData.attendance) {
            for (const day in studentData.attendance) {
                const status = studentData.attendance[day];
                if (status === 'present') present++;
                else if (status === 'absent') absent++;
                else if (status === 'late') late++;
                else if (status === 'not-marked') notMarked++;
            }
        }

        const total = present + absent + late;
        const presentPercent = total > 0 ? Math.round((present / total) * 100) : 0;
        const absentPercent = total > 0 ? Math.round((absent / total) * 100) : 0;
        const latePercent = total > 0 ? Math.round((late / total) * 100) : 0;

        const monthName = new Date(currentYear, currentMonth - 1).toLocaleString('default', { month: 'long' });

        elements.appContainer.innerHTML = `
            <div class="analytics-page">
                <header class="sheet-header">
                    <img src="logo.png" alt="Logo" class="app-logo-sheet">
                    <h1>Student Analytics</h1>
                    <p>${studentData.name} - Roll: ${studentData.roll}</p>
                </header>
                <main>
                    <div class="controls top-controls">
                        <button id="backToSheetFromStudent" class="btn back-btn"> <i class="fas fa-arrow-left"></i> Back to Sheet
                        </button>
                        <button id="backToHomeFromStudent" class="btn" style="background: var(--secondary-color); color: white;"> <i class="fas fa-home"></i> Home
                        </button>
                    </div>
                    <div class="student-analytics-summary" style="background: var(--card-bg); padding: 20px; border-radius: 16px; margin: 20px auto; max-width: 600px; box-shadow: 0 4px 20px var(--shadow-color);">
                        <h3 style="text-align: center; margin-bottom: 20px; color: var(--primary-color);">${currentClass} - ${monthName} ${currentYear}</h3>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div class="stat-box" style="background: linear-gradient(135deg, #10b981, #059669); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                                <div style="font-size: 2rem; font-weight: bold;">${present}</div>
                                <div>Present</div>
                            </div>
                            <div class="stat-box" style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                                <div style="font-size: 2rem; font-weight: bold;">${absent}</div>
                                <div>Absent</div>
                            </div>
                            <div class="stat-box" style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                                <div style="font-size: 2rem; font-weight: bold;">${late}</div>
                                <div>Late</div>
                            </div>
                            <div class="stat-box" style="background: linear-gradient(135deg, #6b7280, #4b5563); padding: 20px; border-radius: 12px; text-align: center; color: white;">
                                <div style="font-size: 2rem; font-weight: bold;">${presentPercent}%</div>
                                <div>Attendance %</div>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container-wrapper" style="display: flex; flex-wrap: wrap; gap: 30px; justify-content: center; margin-top: 20px;">
                        <div class="chart-box" style="background: var(--card-bg); padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px var(--shadow-color); flex: 1; min-width: 300px; max-width: 400px;">
                            <h3 style="text-align: center; margin-bottom: 15px;">Attendance Breakdown</h3>
                            <canvas id="studentPieChart"></canvas>
                        </div>
                    </div>
                </main>
            </div>
        `;

        elements = initializeDOMElements();

        const backToSheetBtn = document.getElementById('backToSheetFromStudent');
        if (backToSheetBtn) backToSheetBtn.addEventListener('click', showAttendanceSheet);

        const backToHomeBtn = document.getElementById('backToHomeFromStudent');
        if (backToHomeBtn) backToHomeBtn.addEventListener('click', showHomePage);

        if (present === 0 && absent === 0 && late === 0) {
            present = 1;
        }

        const ctx = document.getElementById('studentPieChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    data: [present, absent, late],
                    backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom', labels: { color: document.documentElement.hasAttribute('data-theme') ? '#f1f5f9' : '#1f2937' } }
                }
            }
        });
    }

    // ---- Event Listener Setup Functions ----
    function setupHomePageEventListeners() {
        console.log("Setting up home page listeners...");
        
        if (elements.createNewSheetBtn) {
            console.log("Attaching listener to createNewSheetBtn");
            elements.createNewSheetBtn.addEventListener('click', showAttendanceSheet);
        } else { console.error("createNewSheetBtn not found!"); }

        if (elements.viewAllSheetsBtn) {
            console.log("Attaching listener to viewAllSheetsBtn");
            elements.viewAllSheetsBtn.addEventListener('click', showAllSheets);
        } else { console.error("viewAllSheetsBtn not found!"); }

        if (elements.darkModeToggle) {
            console.log("Attaching listener to darkModeToggle (Home)");
            elements.darkModeToggle.addEventListener('change', toggleDarkMode);
        } else { console.error("darkModeToggle not found on Home!"); }
        console.log("Home page listeners setup complete.");
    }

    function setupSheetEventListeners() {
        console.log("Setting up sheet event listeners...");

        // Check if elements are valid before adding listeners
        if (elements.darkModeToggle) {
            console.log("Attaching listener to darkModeToggle (Sheet)");
            elements.darkModeToggle.addEventListener('change', toggleDarkMode);
        } else { console.error("darkModeToggle not found!"); }

        if (elements.addStudentBtn) {
            console.log("Attaching listener to addStudentBtn");
            elements.addStudentBtn.addEventListener('click', addNewStudent);
        } else { console.error("addStudentBtn not found!"); }

        if (elements.exportBtn) {
            console.log("Attaching listener to exportBtn");
            elements.exportBtn.addEventListener('click', exportToCSV);
        } else { console.error("exportBtn not found!"); }

        // Use the specific ID for the back button on this view
        if (elements.backToHomeSheet) {
            console.log("Attaching listener to backToHomeSheet");
            elements.backToHomeSheet.addEventListener('click', showHomePage);
        } else { console.error("backToHomeSheet not found!"); }

        const manageFeesBtn = document.getElementById('manageFeesBtn');
        if (manageFeesBtn) {
            manageFeesBtn.addEventListener('click', () => {
                showFeeManagementPage(currentYear, currentMonth, currentClass);
            });
        }

        const viewAnalyticsSheetBtn = document.getElementById('viewAnalyticsSheetBtn');
        if (viewAnalyticsSheetBtn) {
            viewAnalyticsSheetBtn.addEventListener('click', () => {
                showAnalyticsDashboard();
            });
        }

        // Listen for changes in selectors
        if (elements.monthSelect) elements.monthSelect.addEventListener('change', handleSheetChange);
        if (elements.yearSelect) elements.yearSelect.addEventListener('change', handleSheetChange);
        if (elements.classInput) elements.classInput.addEventListener('blur', handleSheetChange); // Use blur

        // Event delegation for table actions
        if (elements.tableBody) {
            elements.tableBody.addEventListener('click', function (e) {
                const cell = e.target.closest('.attendance-cell');
                const analyticsBtn = e.target.closest('.analytics-btn');
                const deleteBtn = e.target.closest('.delete-btn');

                if (cell) {
                    cycleAttendanceStatus(cell);
                } else if (analyticsBtn) {
                    const row = analyticsBtn.closest('tr');
                    const rollInput = row.querySelector('input[data-field="roll"]');
                    if (rollInput && rollInput.value) {
                        showStudentAnalytics(rollInput.value);
                    } else {
                        alert("Please enter a roll number first!");
                    }
                } else if (deleteBtn) {
                    deleteStudent(deleteBtn.closest('tr'));
                }
            });

            // Auto-save on name/roll edits (using blur)
            elements.tableBody.addEventListener('blur', function (e) {
                if (e.target.classList.contains('editable')) {
                    console.log("Editable field blurred, saving data.");
                    saveAttendanceData();
                }
            }, true); // Use capture phase
        } else { console.error("tableBody not found for delegation setup!"); }

        console.log("Sheet event listeners setup complete.");
    }

    function setupAllSheetsEventListeners() {
        console.log("Setting up all sheets page listeners...");

        if (elements.backToHomeAllSheets) {
            console.log("Attaching listener to backToHomeAllSheets");
            elements.backToHomeAllSheets.addEventListener('click', showHomePage);
        } else { console.error("backToHomeAllSheets not found!"); }

const viewPhoneDirectoryBtn = document.getElementById('viewPhoneDirectory');
        if (viewPhoneDirectoryBtn) {
            viewPhoneDirectoryBtn.onclick = function() {
                showPhoneDirectory();
            };
        }

        if (elements.darkModeToggle) {
            console.log("Attaching listener to darkModeToggle (AllSheets)");
            elements.darkModeToggle.addEventListener('change', toggleDarkMode);
        } else { console.error("darkModeToggle not found on AllSheets!"); }

console.log("All sheets page listeners setup complete.");
    }

    function showPhoneDirectory() {
        console.log("showPhoneDirectory function called");
        if (!elements.appContainer) return;

        const keys = Object.keys(localStorage).filter(key => key.startsWith('attendance_'));
        let allStudents = [];

        keys.forEach(key => {
            try {
                const dataStr = localStorage.getItem(key);
                const parsedData = JSON.parse(dataStr);
                if (parsedData && parsedData.students) {
                    parsedData.students.forEach(student => {
                        if (student.phone && student.phone.trim() !== '') {
                            allStudents.push({
                                name: student.name,
                                roll: student.roll,
                                phone: student.phone,
                                className: key.replace('attendance_', '').split('_').slice(1).join('_')
                            });
                        }
                    });
                }
            } catch(e) {}
        });

        allStudents.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

        let listHTML = '';
        if (allStudents.length === 0) {
            listHTML = '<p style="text-align:center;">No phone numbers found.</p>';
        } else {
            allStudents.forEach(student => {
                let phone = student.phone.replace(/\D/g, '');
                if (!phone.startsWith('88')) phone = '88' + phone;
                listHTML += `
                <div style="background: var(--card-bg); padding: 15px; margin-bottom: 10px; border-radius: 10px; box-shadow: 0 2px 10px var(--shadow-color); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${student.name || 'N/A'}</strong>
                        <br><small>${student.className || 'N/A'} | Roll: ${student.roll || 'N/A'}</small>
                    </div>
                    <a href="https://wa.me/${phone}" target="_blank" style="background: #25D366; color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none;">
                        <i class="fab fa-whatsapp"></i> Message
                    </a>
                </div>`;
            });
        }

        elements.appContainer.innerHTML = `
            <div class="all-sheets-page">
                <header>
                    <img src="logo.png" alt="Logo" class="app-logo">
                    <h1>Phone Directory</h1>
                    <p style="font-size: 0.9rem; opacity: 0.7;">Click to send free WhatsApp message</p>
                    <div class="controls">
                        <button id="backToAllSheets" class="btn back-btn"> <i class="fas fa-arrow-left"></i> Back</button>
                    </div>
                </header>
                <main>
                    <div style="max-width: 600px; margin: 20px auto;">
                        ${listHTML}
                    </div>
                </main>
            </div>`;

        const backBtn = document.getElementById('backToAllSheets');
        if (backBtn) backBtn.addEventListener('click', showAllSheets);
    }

    // ---- Core Logic Functions ----
    function updateTableHeaders() {
        // Ensure elements are fresh (needed if called outside initial load)
        // elements = initializeDOMElements(); // Maybe not needed if structure is stable
        if (!elements.headerRow || !elements.monthSelect || !elements.yearSelect) {
            console.error("Missing critical elements for header update");
            return;
        }
        console.log("Updating table headers...");

        // Clear existing day columns (keep Name, Roll, Actions)
        // Select only th elements that are direct children and not the first, second, or last
        const headers = Array.from(elements.headerRow.children)
            .filter((th, index, arr) => index > 2 && index < arr.length - 1);
        headers.forEach(header => header.remove());

        // Get days in selected month/year
        const year = parseInt(elements.yearSelect.value);
        const month = parseInt(elements.monthSelect.value); // Month is 1-12
        const daysInMonth = new Date(year, month, 0).getDate();
        console.log(`Days in ${year}-${month}: ${daysInMonth}`);

        // Add day columns before the Actions column
        const actionsHeader = elements.headerRow.querySelector('th:last-child');
        if (!actionsHeader) {
            console.error("Actions header not found!");
            return;
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const th = document.createElement('th');
            th.textContent = day;
            elements.headerRow.insertBefore(th, actionsHeader);
        }

        // Load data for the new structure
        loadAttendanceData();
    }

    function handleSheetChange() {
        // No need to save here if using 'blur' on class input and relying on auto-save/blur for table edits
        // saveAttendanceData(); // Might be redundant

        // Update current state from the UI elements
        if (elements.monthSelect) currentMonth = parseInt(elements.monthSelect.value);
        if (elements.yearSelect) currentYear = parseInt(elements.yearSelect.value);
        if (elements.classInput) currentClass = elements.classInput.value.trim();

        console.log(`Sheet changed to: Month=${currentMonth}, Year=${currentYear}, Class=${currentClass}`);

        // Update headers and load new data
        updateTableHeaders();
    }

    function cycleAttendanceStatus(cell) {
        const statuses = ['not-marked', 'present', 'absent', 'late'];
        let currentStatus = statuses.find(s => cell.classList.contains(s)) || 'not-marked';
        const currentIndex = statuses.indexOf(currentStatus);
        const nextStatus = statuses[(currentIndex + 1) % statuses.length];

        console.log(`Cycling status for day ${cell.dataset.day}: ${currentStatus} -> ${nextStatus}`);
        statuses.forEach(status => cell.classList.remove(status));
        cell.classList.add(nextStatus);
        saveAttendanceData(); // Save immediately after change
    }

    function addNewStudent() {
        console.log("addNewStudent function called");
        // Re-check elements as they might be stale if errors occurred before
        if (!elements.tableBody) elements.tableBody = document.getElementById('attendanceTable')?.querySelector('tbody');
        if (!elements.headerRow) elements.headerRow = document.getElementById('headerRow');

        if (!elements.tableBody || !elements.headerRow) {
            console.error("Cannot add student: tableBody or headerRow missing.");
            return;
        }

        const daysInMonth = elements.headerRow.querySelectorAll('th:not(:first-child):not(:nth-child(2)):not(:nth-child(3)):not(:last-child)').length;
        if (daysInMonth <= 0) {
            console.error("Cannot add student: Number of days in header is zero.");
            return; // Avoid adding row if header isn't correctly populated
        }

        const newRow = document.createElement('tr');
        let dayCells = '';
        for (let day = 1; day <= daysInMonth; day++) {
            dayCells += `<td class="attendance-cell not-marked" data-day="${day}"></td>`;
        }

        newRow.innerHTML = `
            <td><input type="text" class="editable" data-field="name" placeholder="Enter Name"></td>
            <td><input type="text" class="editable" data-field="roll" placeholder="Enter Roll"></td>
            <td><input type="tel" class="editable" data-field="phone" placeholder="Phone No."></td>
            ${dayCells}
            <td class="actions-cell">
                <button class="analytics-btn" title="View Student Analytics">
                    <i class="fas fa-chart-pie"></i>
                </button>
                <button class="delete-btn" title="Delete Student">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        elements.tableBody.appendChild(newRow);
        const nameInput = newRow.querySelector('input[data-field="name"]');
        if (nameInput) nameInput.focus(); // Focus the name field

        // Save after adding (to save the empty row structure)
        // saveAttendanceData(); // Optionally save immediately, or wait for blur/autosave
        console.log("New student row added.");
    }

    function deleteStudent(row) {
        console.log("Deleting student row");
        if (!row) return;
        // Optional: Add confirmation
        // if (!confirm("Are you sure you want to delete this student?")) {
        //     return;
        // }

        // Add fade-out animation
        row.style.transition = 'opacity 0.3s ease-out';
        row.style.opacity = '0';

        setTimeout(() => {
            row.remove();
            saveAttendanceData(); // Save after row is removed
            console.log("Student row removed and data saved.");
        }, 300); // Match animation duration
    }


    // ---- Data Handling Functions ----
    function getStorageKey(year, month, className) {
        const y = year || currentYear;
        const m = month || currentMonth;
        const cName = className || currentClass.trim() || 'default';
        return `attendance_${y}-${String(m).padStart(2, '0')}_${cName}`;
    }

    function getFeeStorageKey(year, month, className) {
        const y = year || currentYear;
        const m = month || currentMonth;
        const cName = className || currentClass.trim() || 'default';
        return `fee_${y}-${String(m).padStart(2, '0')}_${cName}`;
    }

    function saveAttendanceData() {
        // Use fresh element references inside, especially tableBody
        const tableBody = document.getElementById('attendanceTable')?.querySelector('tbody');
        if (!tableBody) {
            console.warn("Cannot save data: Table body not found.");
            return; // Don't save if elements aren't ready
        }

        const storageKey = getStorageKey();
        console.log(`Attempting to save data for key: ${storageKey}`);

        const data = {
            students: []
        };

        tableBody.querySelectorAll('tr').forEach((row, index) => {
            const nameInput = row.querySelector('input[data-field="name"]');
            const rollInput = row.querySelector('input[data-field="roll"]');
            const phoneInput = row.querySelector('input[data-field="phone"]');

            if (!nameInput || !rollInput) {
                console.warn(`Skipping row index ${index} due to missing input fields.`);
                return; // Skip malformed rows
            }

            const student = {
                name: nameInput.value.trim(),
                roll: rollInput.value.trim(),
                phone: phoneInput ? phoneInput.value.trim() : '',
                attendance: {}
            };

            row.querySelectorAll('.attendance-cell').forEach(cell => {
                const day = cell.dataset.day;
                if (!day) return; // Skip if cell has no day data attribute

                let status = 'not-marked';
                if (cell.classList.contains('present')) status = 'present';
                else if (cell.classList.contains('absent')) status = 'absent';
                else if (cell.classList.contains('late')) status = 'late';
                student.attendance[day] = status;
            });

            // Save row even if empty, to preserve order and structure
            data.students.push(student);
        });

        try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log(`Data saved successfully for key: ${storageKey}. Students: ${data.students.length}`);

            // Also save/update corresponding fee sheet with student names and rolls
            const feeStorageKey = getFeeStorageKey(); // Uses global currentYear, currentMonth, currentClass

            if (feeStorageKey) {
                let feeData = { students: [] };
                try {
                    const existingFeeData = localStorage.getItem(feeStorageKey);
                    if (existingFeeData) {
                        feeData = JSON.parse(existingFeeData);
                        if (!Array.isArray(feeData.students)) {
                            feeData.students = []; // Ensure students array exists
                        }
                    }
                } catch (e) {
                    console.error("Error parsing existing fee data from localStorage:", e);
                    feeData.students = []; // Reset on error
                }

                // Update student list in feeData, preserving existing fee details if any
                const updatedFeeStudents = data.students.map(attStudent => {
                    // Find existing fee student by roll, or by name if roll is missing (less reliable)
                    const existingFeeStudent = feeData.students.find(fs =>
                        (attStudent.roll && fs.roll === attStudent.roll) ||
                        (!attStudent.roll && fs.name === attStudent.name)
                    );
                    return {
                        name: attStudent.name,
                        roll: attStudent.roll,
                        tuitionFee: existingFeeStudent?.tuitionFee || '',
                        examFee: existingFeeStudent?.examFee || '',
                        otherFees: existingFeeStudent?.otherFees || '',
                        totalPaid: existingFeeStudent?.totalPaid || '',
                        // Dues will be calculated dynamically or on save within fee management page
                    };
                });
                feeData.students = updatedFeeStudents;

                localStorage.setItem(feeStorageKey, JSON.stringify(feeData));
                console.log(`Fee sheet data updated/created for key: ${feeStorageKey} with ${feeData.students.length} students`);
            }

        } catch (e) {
            console.error("Failed to save data to localStorage:", e);
            alert("Error saving data. Local storage might be full or disabled.");
        }
    }

    function loadAttendanceData() {
        // Ensure elements needed for loading exist
        const tableBody = document.getElementById('attendanceTable')?.querySelector('tbody');
        const headerRow = document.getElementById('headerRow');
        if (!tableBody || !headerRow) {
            console.error("Cannot load data: Table body or header row not found.");
            tableBody.innerHTML = '<tr><td colspan="99">Error loading table structure.</td></tr>'; // Show error in table
            return;
        }

        const storageKey = getStorageKey();
        console.log(`Loading data for key: ${storageKey}`);
        let data = null;
        try {
            data = JSON.parse(localStorage.getItem(storageKey)) || { students: [] };
        } catch (e) {
            console.error("Error parsing data from localStorage:", e);
            alert(`Error loading data for ${storageKey}. Data might be corrupted.`);
            data = { students: [] }; // Reset to empty
        }


        // Clear existing rows
        tableBody.innerHTML = '';

        // Get current number of days from header
        const daysInMonth = headerRow.querySelectorAll('th:not(:first-child):not(:nth-child(2)):not(:nth-child(3)):not(:last-child)').length;
        if (daysInMonth <= 0) {
            console.warn("Cannot load student rows: Header days count is zero.");
            // Optionally display a message in the table body
            // tableBody.innerHTML = '<tr><td colspan="99">Select Month/Year to load attendance sheet.</td></tr>';
            return;
        }

        // Sort students by roll number before displaying
        if (data.students && data.students.length > 0) {
            // Sort students by roll number (numeric sort)
            const sortedStudents = data.students.sort((a, b) => {
                const rollA = parseInt(a.roll) || 0;
                const rollB = parseInt(b.roll) || 0;
                // If roll numbers are the same or both are 0, sort alphabetically by name
                if (rollA === rollB) {
                    return (a.name || '').localeCompare(b.name || '');
                }
                return rollA - rollB;
            });
            console.log(`Sorted ${sortedStudents.length} students by roll number`);

            // Recreate rows with sorted data
            sortedStudents.forEach(student => {
                const row = document.createElement('tr');
                let dayCells = '';
                for (let day = 1; day <= daysInMonth; day++) {
                    const status = student.attendance?.[day] || 'not-marked'; // Safer access
                    dayCells += `<td class="attendance-cell ${status}" data-day="${day}"></td>`;
                }

                row.innerHTML = `
                    <td><input type="text" class="editable" data-field="name" value="${student.name || ''}" placeholder="Enter Name"></td>
                    <td><input type="text" class="editable" data-field="roll" value="${student.roll || ''}" placeholder="Enter Roll"></td>
                    <td><input type="tel" class="editable" data-field="phone" value="${student.phone || ''}" placeholder="Phone No."></td>
                    ${dayCells}
                    <td class="actions-cell">
                        <button class="analytics-btn" title="View Student Analytics">
                            <i class="fas fa-chart-pie"></i>
                        </button>
                        <button class="delete-btn" title="Delete Student">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        } else {
            console.log("No student data found for this key. Displaying empty table.");
            // Optionally add a message or a single blank row
            // tableBody.innerHTML = '<tr><td colspan="99">No students added yet. Click "Add Student".</td></tr>';
        }
        console.log(`Loaded ${data.students?.length || 0} students.`);
    }

    function loadAllSheets() {
        const sheetsContainer = document.getElementById('sheetsContainer');
        if (!sheetsContainer) {
            console.error("Cannot load sheets list: sheetsContainer not found.");
            return;
        }
        console.log("Loading all sheets from localStorage...");

        const keys = Object.keys(localStorage).filter(key => key.startsWith('attendance_'));
        let sheetsHTML = '';

        if (keys.length === 0) {
            sheetsHTML = `
                <div class="no-sheets">
                    <i class="fas fa-folder-open"></i>
                    <p>No saved attendance sheets found.</p>
                </div>
            `;
        } else {
            // Sort keys perhaps? By date?
            keys.sort().reverse(); // Simple reverse alphanumeric sort

            keys.forEach(key => {
                const parts = key.replace('attendance_', '').split('_'); // Remove prefix, split by underscore
                if (parts.length < 2) return; // Need at least YYYY-MM and ClassName parts

                const datePart = parts[0]; // YYYY-MM
                const className = parts.slice(1).join('_'); // Join remaining parts for class name

                const dateMatch = datePart.match(/^(\d{4})-(\d{2})$/); // Validate date part format
                if (!dateMatch) return; // Skip invalid keys

                const year = parseInt(dateMatch[1]);
                const month = parseInt(dateMatch[2]);

                if (isNaN(year) || isNaN(month) || month < 1 || month > 12) return; // Validate year/month

                const date = new Date(year, month - 1);
                const monthName = date.toLocaleString('en-US', { month: 'long' }); // English month name

                // Use global functions called via onclick attribute
                sheetsHTML += `
                     <div class="sheet-card" data-key="${key}">
                         <div class="sheet-info">
                             <h3>${className}</h3>
                             <p>${monthName} ${year}</p>
                         </div>
                         <div class="sheet-actions">
                             <button class="btn view-sheet-btn" onclick="viewSheet('${year}', '${month}', '${className}')" title="View Sheet">
                                 <i class="fas fa-eye"></i> View Attendance
                             </button>
                             <button class="btn manage-fees-sheet-btn" onclick="showFeeManagementPageGlobal('${year}', '${month}', '${className}')" title="Manage Fees">
                                 <i class="fas fa-dollar-sign"></i> Manage Fees
                             </button>
                             <button class="btn copy-sheet-btn" onclick="copySheet('${key}')" title="Copy Sheet">
                                 <i class="fas fa-copy"></i> Copy
                             </button>
                             <button class="btn delete-sheet-btn" onclick="deleteSheet('${key}')" title="Delete Sheet">
                                 <i class="fas fa-trash"></i> Delete
                             </button>
                         </div>
                     </div>
                 `;
            });
        }
        sheetsContainer.innerHTML = sheetsHTML;
        console.log(`Found ${keys.length} saved sheets.`);
    }


    // ---- Utilities ----
    function toggleDarkMode() {
        const toggle = document.getElementById('darkModeToggle'); // Get fresh reference
        if (toggle && toggle.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            console.log("Dark mode enabled");
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            console.log("Light mode enabled");
        }
    }

    function loadDarkModePreference() {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            console.log("Loaded dark mode preference");
            // Check toggle state AFTER potential view changes
            const toggle = document.getElementById('darkModeToggle');
            if (toggle) toggle.checked = true;
        } else {
            document.documentElement.removeAttribute('data-theme');
            console.log("Loaded light mode preference");
        }
    }

    function setupAutoSave() {
        // Auto-save when leaving the page (might not always work reliably)
        // window.addEventListener('beforeunload', function(e) {
        //     console.log("beforeunload: Saving data...");
        //     saveAttendanceData();
        //     // Standard way to try and ensure save happens (though not guaranteed)
        //     // e.preventDefault(); // Not always needed or effective
        //     // e.returnValue = ''; // For older browsers
        // });
        // More reliable save points are on blur/change events handled elsewhere.
        console.log("Auto-save setup (primarily relies on blur/change events now).");
    }

    function exportToCSV() {
        console.log("exportToCSV function called");
        // Re-fetch elements needed for export
        const tableBody = document.getElementById('attendanceTable')?.querySelector('tbody');
        const headerRow = document.getElementById('headerRow');
        const monthSelect = document.getElementById('monthSelect');
        const yearSelect = document.getElementById('yearSelect');
        const classInput = document.getElementById('classInput');

        if (!tableBody || !headerRow || !monthSelect || !yearSelect || !classInput) {
            console.error("Cannot export: Missing critical elements.");
            alert("Error: Could not find necessary table elements to export.");
            return;
        }

        const month = monthSelect.value;
        const year = yearSelect.value;
        const className = classInput.value.trim() || 'NoClass';
        const monthName = monthSelect.options[monthSelect.selectedIndex].text;

        const daysInMonth = headerRow.querySelectorAll('th:not(:first-child):not(:nth-child(2)):not(:nth-child(3)):not(:last-child)').length;
        if (daysInMonth <= 0) {
            alert("Error: Cannot export table with no date columns.");
            return;
        }

        let csvContent = `Class: ${className}, Month: ${monthName} ${year}\n`;
        csvContent += `Name,Roll Number,${Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`).join(',')},Total Present,Total Absent,Total Late\n`;

        tableBody.querySelectorAll('tr').forEach(row => {
            const nameInput = row.querySelector('input[data-field="name"]');
            const rollInput = row.querySelector('input[data-field="roll"]');
            if (!nameInput || !rollInput) return; // Skip malformed rows

            const name = nameInput.value.trim();
            const roll = rollInput.value.trim();
            const cells = row.querySelectorAll('.attendance-cell');

            const statuses = Array.from(cells).map(cell => {
                if (cell.classList.contains('present')) return 'P';
                if (cell.classList.contains('absent')) return 'A';
                if (cell.classList.contains('late')) return 'L';
                return '-';
            });

            const totals = {
                present: statuses.filter(s => s === 'P').length,
                absent: statuses.filter(s => s === 'A').length,
                late: statuses.filter(s => s === 'L').length
            };

            const csvName = `"${name.replace(/"/g, '""')}"`;
            const csvRoll = `"${roll.replace(/"/g, '""')}"`;

            csvContent += `${csvName},${csvRoll},${statuses.join(',')},${totals.present},${totals.absent},${totals.late}\n`;
        });

        if (csvContent.split('\n').length <= 2) { // Header + Class/Month info only
            alert("No student data to export.");
            return;
        }

        // Mobile-friendly CSV export
        const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
        const filename = `Attendance_${className}_${monthName}_${year}.csv`;

        // Try to use download attribute for modern browsers
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);

        if (typeof link.download !== 'undefined') { // Check if download attribute is supported
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);
        } else {
            // Fallback for browsers that don't support download attribute (e.g., older mobile browsers)
            // This might open the CSV in the browser window or prompt a download differently.
            window.open(encodedUri);
        }
        console.log(`CSV exported or opened as ${filename}`);
    }

    // ---- Global Functions (exposed via window.) ----
    // Need to be global because they are called by onclick attributes in HTML

    window.copySheet = function (originalKey) {
        console.log(`Global copySheet called: Key=${originalKey}`);
        if (!originalKey || !originalKey.startsWith("attendance_")) {
            console.error("Invalid storage key for copying:", originalKey);
            alert("Error: Cannot copy sheet with invalid key.");
            return;
        }

        try {
            const originalDataString = localStorage.getItem(originalKey);
            if (!originalDataString) {
                console.error("Original sheet data not found:", originalKey);
                alert("Error: Could not find the original sheet data to copy.");
                return;
            }
            const originalData = JSON.parse(originalDataString);

            // Extract original details
            const parts = originalKey.replace('attendance_', '').split('_');
            const datePart = parts[0]; // YYYY-MM
            const originalClassName = parts.slice(1).join('_');
            const dateMatch = datePart.match(/^(\d{4})-(\d{2})$/);
            if (!dateMatch) {
                console.error("Invalid date format in original key:", originalKey);
                alert("Error: Invalid format in the original sheet key.");
                return;
            }
            const year = dateMatch[1];
            const month = dateMatch[2];

            // Prompt for new class name
            let newClassName = prompt(`Enter a new class name for the copied sheet (based on '${originalClassName}'):`, `${originalClassName} (Copy)`);
            if (newClassName === null) {
                console.log("Copy operation cancelled by user.");
                return; // User cancelled
            }
            newClassName = newClassName.trim();
            if (!newClassName) {
                alert("Class name cannot be empty.");
                return;
            }

            // Prompt for new month and year
            let newMonthInput = prompt(`Enter the new month (1-12) for the copied sheet:`, month);
            if (newMonthInput === null) {
                console.log("Copy operation cancelled by user.");
                return; // User cancelled
            }
            let newMonth = parseInt(newMonthInput.trim());
            if (isNaN(newMonth) || newMonth < 1 || newMonth > 12) {
                alert("Invalid month. Please enter a number between 1 and 12.");
                return;
            }
            newMonth = String(newMonth).padStart(2, '0'); // Format MM

            let newYearInput = prompt(`Enter the new year (e.g., ${year}) for the copied sheet:`, year);
            if (newYearInput === null) {
                console.log("Copy operation cancelled by user.");
                return; // User cancelled
            }
            let newYear = parseInt(newYearInput.trim());
            if (isNaN(newYear) || String(newYear).length !== 4) {
                alert("Invalid year. Please enter a 4-digit year.");
                return;
            }
            newYear = String(newYear);

            // Construct new key with new date and class name
            const newKey = `attendance_${newYear}-${newMonth}_${newClassName}`;

            // Check if new key already exists
            if (localStorage.getItem(newKey)) {
                if (!confirm(`A sheet with the name '${newClassName}' for ${newMonth}/${newYear} already exists. Overwrite it?`)) {
                    console.log("Copy operation cancelled, sheet already exists.");
                    return;
                }
            }

            // Save the original attendance data under the new key
            localStorage.setItem(newKey, JSON.stringify(originalData));
            console.log(`Attendance Sheet copied successfully: ${originalKey} -> ${newKey}`);

            // Now, create a corresponding fee sheet for the new attendance sheet
            const newFeeKey = getFeeStorageKey(newYear, newMonth, newClassName);
            if (newFeeKey) {
                const newFeeData = {
                    students: originalData.students.map(student => ({
                        name: student.name,
                        roll: student.roll,
                        tuitionFee: '', // Fees are reset for a new/copied sheet
                        examFee: '',
                        otherFees: '',
                        totalPaid: ''
                    }))
                };
                localStorage.setItem(newFeeKey, JSON.stringify(newFeeData));
                console.log(`Corresponding Fee Sheet created for: ${newFeeKey} with ${newFeeData.students.length} students.`);
            }

            alert(`Sheet copied to '${newClassName}' for ${newMonth}/${newYear}. A new fee sheet has also been prepared.`);

            // Refresh the list of sheets (if currently viewing it)
            const sheetsContainer = document.getElementById('sheetsContainer');
            if (sheetsContainer) {
                loadAllSheets(); // Reload the list to show the new sheet
            }

        } catch (e) {
            console.error("Error during copy operation:", e);
            alert("An error occurred while copying the sheet. Please check the console.");
        }
    };
    window.viewSheet = function (year, month, className) {
        console.log(`Global viewSheet called: Y=${year}, M=${month}, Class=${className}`);
        // Update global state before showing the sheet
        currentYear = parseInt(year);
        currentMonth = parseInt(month);
        currentClass = className;
        showAttendanceSheet(); // Render the sheet view with the updated state
    };

    // Expose showFeeManagementPage globally for direct access from sheet cards if needed
    window.showFeeManagementPageGlobal = function (year, month, className) {
        currentYear = parseInt(year);
        currentMonth = parseInt(month);
        currentClass = className;
        showFeeManagementPage(year, month, className);
    };

    window.deleteSheet = function (storageKey) {
        console.log(`Global deleteSheet called: Key=${storageKey}`);
        if (!storageKey || !storageKey.startsWith("attendance_")) {
            console.error("Invalid storage key for deletion:", storageKey);
            return;
        }
        // Extract details for confirmation message
        const details = storageKey.replace('attendance_', '').replace('_', ' / '); // Basic formatting
        if (confirm(`Are you sure you want to delete the sheet: ${details}? This cannot be undone.`)) {
            try {
                localStorage.removeItem(storageKey);
                console.log(`Deleted sheet: ${storageKey}`);
                // Refresh the list of sheets (if currently viewing it)
                const sheetsContainer = document.getElementById('sheetsContainer');
                if (sheetsContainer) { // Only reload if the container exists (i.e., on the All Sheets page)
                    loadAllSheets();
                }
            } catch (e) {
                console.error("Error deleting sheet from localStorage:", e);
                alert("Error deleting sheet.");
            }
        }
    };

    // ---- About Modal Function ----
    function showAboutModal() {
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="aboutModalOverlay">
                <div class="modal-container about-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-info-circle"></i> About This App</h2>
                        <button class="modal-close" id="closeAboutModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="about-logo">
                            <img src="logo.png" alt="App Logo" class="about-app-logo">
                        </div>
                        
                        <h3 class="about-app-name">Smart Attendance Manager</h3>
                        <p class="about-tagline">স্মার্ট হাজিরা ব্যবস্থাপক</p>
                        
                        <div class="about-version">
                            <span class="version-badge">Version 2.0</span>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-info-circle"></i> About / সম্পর্কে</h4>
                            <p class="about-description">
                                Smart Attendance Manager is a modern web application designed to simplify attendance tracking for educational institutions. 
                                Built with cutting-edge web technologies, it offers a seamless experience for managing student attendance records.
                            </p>
                            <p class="about-description-bn">
                                স্মার্ট অ্যাটেনডেন্স ম্যানেজার একটি আধুনিক ওয়েব অ্যাপ্লিকেশন যা শিক্ষা প্রতিষ্ঠানের জন্য হাজিরা ট্র্যাকিং সহজ করার জন্য ডিজাইন করা হয়েছে। 
                                অত্যাধুনিক ওয়েব প্রযুক্তি দিয়ে তৈরি, এটি ছাত্রদের হাজিরা রেকর্ড পরিচালনার জন্য একটি নিরবচ্ছিন্ন অভিজ্ঞতা প্রদান করে।
                            </p>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-star"></i> Features / বৈশিষ্ট্য</h4>
                            <ul class="about-features">
                                <li><i class="fas fa-check-circle"></i> Create & manage attendance sheets / হাজিরা শীট তৈরি ও পরিচালনা</li>
                                <li><i class="fas fa-check-circle"></i> Track student attendance by month / মাস অনুযায়ী ছাত্র হাজিরা ট্র্যাক করুন</li>
                                <li><i class="fas fa-check-circle"></i> Mark attendance with multiple statuses / একাধিক স্ট্যাটাস সহ হাজিরা চিহ্নিত করুন</li>
                                <li><i class="fas fa-check-circle"></i> Export data to CSV format / CSV ফরম্যাটে ডেটা রপ্তানি করুন</li>
                                <li><i class="fas fa-check-circle"></i> Dark mode support / ডার্ক মোড সমর্থন</li>
                                <li><i class="fas fa-check-circle"></i> Offline data storage / অফলাইন ডেটা সংরক্ষণ</li>
                                <li><i class="fas fa-check-circle"></i> Modern & responsive design / আধুনিক ও প্রতিক্রিয়াশীল ডিজাইন</li>
                                <li><i class="fas fa-check-circle"></i> User authentication with Firebase / Firebase দিয়ে ব্যবহারকারী প্রমাণীকরণ</li>
                            </ul>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-book-open"></i> How to Use / কীভাবে ব্যবহার করবেন</h4>
                            <ol class="about-steps">
                                <li><strong>Create a Sheet:</strong> Click "Create New Sheet" to start / "Create New Sheet" ক্লিক করে শুরু করুন</li>
                                <li><strong>Select Month & Year:</strong> Choose the month and year for tracking / ট্র্যাকিংয়ের জন্য মাস এবং বছর নির্বাচন করুন</li>
                                <li><strong>Add Students:</strong> Add student names and roll numbers / ছাত্রদের নাম এবং রোল নম্বর যোগ করুন</li>
                                <li><strong>Mark Attendance:</strong> Click on cells to mark Present, Absent, or Late / Present, Absent, বা Late চিহ্নিত করতে সেলে ক্লিক করুন</li>
                                <li><strong>Export Data:</strong> Download attendance records as CSV / CSV হিসাবে হাজিরা রেকর্ড ডাউনলোড করুন</li>
                            </ol>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-laptop-code"></i> Technology Stack / প্রযুক্তি স্ট্যাক</h4>
                            <div class="tech-stack">
                                <span class="tech-badge"><i class="fab fa-html5"></i> HTML5</span>
                                <span class="tech-badge"><i class="fab fa-css3-alt"></i> CSS3</span>
                                <span class="tech-badge"><i class="fab fa-js"></i> JavaScript</span>
                                <span class="tech-badge"><i class="fas fa-fire"></i> Firebase</span>
                                <span class="tech-badge"><i class="fas fa-database"></i> LocalStorage</span>
                            </div>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-code"></i> Developer / ডেভেলপার</h4>
                            <p class="developer-name">SM RIFAT BILLAH</p>
                            <p class="company-name"><i class="fas fa-building"></i> Blackman Studio</p>
                            <p class="developer-role"><i class="fas fa-user-tie"></i> Full Stack Developer</p>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-envelope"></i> Contact / যোগাযোগ</h4>
                            <p class="contact-info"><i class="fas fa-envelope"></i> Email: support@blackmanstudio.com</p>
                            <p class="contact-info"><i class="fas fa-globe"></i> Website: www.blackmanstudio.com</p>
                        </div>

                        <div class="about-section">
                            <h4><i class="fas fa-heart"></i> Thank You / ধন্যবাদ</h4>
                            <p class="about-thanks">Thank you for using Smart Attendance Manager! We hope this app makes attendance tracking easier and more efficient for you.</p>
                            <p class="about-thanks-bn">স্মার্ট অ্যাটেনডেন্স ম্যানেজার ব্যবহার করার জন্য আপনাকে ধন্যবাদ! আমরা আশা করি এই অ্যাপটি আপনার জন্য হাজিরা ট্র্যাকিং সহজ এবং আরও দক্ষ করবে।</p>
                        </div>

                        <div class="about-footer">
                            <p>© 2024 Blackman Studio. All rights reserved.</p>
                            <p class="version-info">Version 2.0 | Last Updated: January 2024</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Get modal elements
        const modalOverlay = document.getElementById('aboutModalOverlay');
        const closeBtn = document.getElementById('closeAboutModal');

        // Close modal function
        function closeModal() {
            modalOverlay.classList.add('modal-closing');
            setTimeout(() => {
                modalOverlay.remove();
            }, 300);
        }

        // Add event listeners
        closeBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', function (e) {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });

        // Add keyboard support (ESC key)
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape' && modalOverlay) {
                closeModal();
                document.removeEventListener('keydown', escHandler);
            }
        });

        // Animate modal in
        setTimeout(() => {
            modalOverlay.classList.add('modal-active');
        }, 10);
    }

    // ---- Student Directory View ----
    function showStudentDirectory() {
        console.log("showStudentDirectory function called");
        if (!elements.appContainer) {
            console.error("CRITICAL: appContainer not found!");
            return;
        }

        // Gather all students from all attendance sheets
        const keys = Object.keys(localStorage).filter(key => key.startsWith('attendance_'));
        let allStudents = [];

        keys.forEach(key => {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && Array.isArray(data.students)) {
                    const parts = key.replace('attendance_', '').split('_');
                    const datePart = parts[0];
                    const className = parts.slice(1).join('_');

                    data.students.forEach(student => {
                        if (student.name && student.name.trim()) {
                            allStudents.push({
                                name: student.name,
                                roll: student.roll || 'N/A',
                                phone: student.phone || '',
                                className: className,
                                sheet: datePart
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('Error parsing data for key:', key, e);
            }
        });

        // Remove duplicates (same name + roll = same student, keep the one with phone)
        const uniqueMap = new Map();
        allStudents.forEach(s => {
            const key = `${s.name.toLowerCase()}_${s.roll}`;
            const existing = uniqueMap.get(key);
            if (!existing || (s.phone && !existing.phone)) {
                uniqueMap.set(key, s);
            } else if (existing && !existing.className.includes(s.className)) {
                existing.className += ', ' + s.className;
            }
        });
        const uniqueStudents = Array.from(uniqueMap.values());

        // Sort by class name then roll
        uniqueStudents.sort((a, b) => {
            if (a.className !== b.className) return a.className.localeCompare(b.className);
            const rollA = parseInt(a.roll) || 0;
            const rollB = parseInt(b.roll) || 0;
            return rollA - rollB;
        });

        let studentRows = '';
        if (uniqueStudents.length === 0) {
            studentRows = `<tr><td colspan="5" style="text-align:center; padding:40px; opacity:0.7;">
                <i class="fas fa-user-slash" style="font-size:2rem; margin-bottom:10px; display:block;"></i>
                No students found. Create an attendance sheet and add students first.
            </td></tr>`;
        } else {
            uniqueStudents.forEach((s, i) => {
                const phoneDisplay = s.phone ? s.phone : '<span style="opacity:0.4;">Not set</span>';
                const callBtn = s.phone ? `<a href="tel:${s.phone}" class="btn call-btn" title="Call ${s.name}"><i class="fas fa-phone-alt"></i></a>` : '';
                studentRows += `
                    <tr>
                        <td style="text-align:center; font-weight:600;">${i + 1}</td>
                        <td>
                            <div class="student-name-cell">
                                <i class="fas fa-user-graduate" style="color:var(--primary-color); margin-right:8px;"></i>
                                <strong>${s.name}</strong>
                            </div>
                        </td>
                        <td style="text-align:center;">${s.roll}</td>
                        <td>
                            <div class="phone-cell">
                                <i class="fas fa-phone" style="color:var(--primary-color); margin-right:6px; font-size:0.85rem;"></i>
                                ${phoneDisplay}
                            </div>
                        </td>
                        <td style="text-align:center;">
                            <span class="class-badge">${s.className}</span>
                            ${callBtn}
                        </td>
                    </tr>
                `;
            });
        }

        elements.appContainer.innerHTML = `
            <div class="student-directory-page">
                <header class="directory-header">
                    <div class="directory-header-content">
                        <div class="directory-title-section">
                            <img src="logo.png" alt="Logo" class="app-logo">
                            <div>
                                <h1><i class="fas fa-address-book"></i> Student Directory</h1>
                                <p class="directory-subtitle">ছাত্রদের ফোন নম্বর তালিকা</p>
                            </div>
                        </div>
                        <div class="directory-actions">
                            <button id="backToHomeDirectory" class="btn back-btn"><i class="fas fa-home"></i> Home</button>
                            <div class="dark-mode-toggle">
                                <span class="mode-label">Light</span>
                                <label class="switch">
                                    <input type="checkbox" id="darkModeToggle">
                                    <span class="slider round"></span>
                                </label>
                                <span class="mode-label">Dark</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div class="directory-stats">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <div>
                            <span class="stat-number">${uniqueStudents.length}</span>
                            <span class="stat-label">Total Students</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-phone-alt"></i>
                        <div>
                            <span class="stat-number">${uniqueStudents.filter(s => s.phone).length}</span>
                            <span class="stat-label">With Phone</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-phone-slash"></i>
                        <div>
                            <span class="stat-number">${uniqueStudents.filter(s => !s.phone).length}</span>
                            <span class="stat-label">No Phone</span>
                        </div>
                    </div>
                </div>

                <div class="directory-search">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" id="directorySearch" placeholder="Search students by name, roll, or phone...">
                    </div>
                </div>

                <main>
                    <div class="table-container directory-table-container">
                        <table id="directoryTable" class="directory-table">
                            <thead>
                                <tr>
                                    <th style="width:60px;">#</th>
                                    <th>Student Name</th>
                                    <th style="width:100px;">Roll</th>
                                    <th>Phone Number</th>
                                    <th style="width:150px;">Class / Action</th>
                                </tr>
                            </thead>
                            <tbody id="directoryTableBody">
                                ${studentRows}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        `;

        // Re-init elements
        elements = initializeDOMElements();

        // Dark mode
        if (elements.darkModeToggle) {
            elements.darkModeToggle.checked = document.documentElement.hasAttribute('data-theme');
            elements.darkModeToggle.addEventListener('change', toggleDarkMode);
        }

        // Back to home
        const backBtn = document.getElementById('backToHomeDirectory');
        if (backBtn) backBtn.addEventListener('click', showHomePage);

        // Search functionality
        const searchInput = document.getElementById('directorySearch');
        if (searchInput) {
            searchInput.addEventListener('input', function () {
                const query = this.value.toLowerCase();
                const rows = document.querySelectorAll('#directoryTableBody tr');
                rows.forEach(row => {
                    const text = row.textContent.toLowerCase();
                    row.style.display = text.includes(query) ? '' : 'none';
                });
            });
        }
    }


    // ---- Start the app ----
    initApp();

}); // End DOMContentLoaded