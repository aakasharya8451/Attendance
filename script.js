// JavaScript Class for Attendance Card
class AttendanceCard {
    constructor(subject, code, totalAttendanceCount, attendanceCount, baseURL) {
        this.subject = subject;
        this.code = code;
        this.attendanceCount = attendanceCount;
        this.totalAttendanceCount = totalAttendanceCount;
        this.baseURL = baseURL;
        this.attendanceStatus = '';

        this.createCard();
        this.addEventListeners();
        this.defaultProgressBar();
    }

    createCard() {
        // Create the HTML structure for the attendance card
        const card = document.createElement('div');
        card.classList.add('attendance-card');

        card.innerHTML = `
            <div class="left-container">
                <div class="attendance-subject-heading-conatiner">
                    <span class="subject-heading">${this.subject}</span>
                    <span class="subject-code">${this.code}</span>
                </div>
                <div class="attendance-subject-details">
                    <div class="attendance-count">
                        <span class="subheading-text">Attendance: </span>
                        <span class="subheading-details-text" id="${this.code}-subheading-details-text">${this.attendanceCount}/${this.totalAttendanceCount}</span>
                    </div>
                    <div class="attendance-status">
                        <span class="subheading-text">Status: </span>
                        <span class="subheading-details-text">${this.attendanceStatus}</span>
                    </div>
                </div>
            </div>
            <div class="right-container">
                <div class="top-progressbar-container" id="${this.code}-progressbar">
                </div>
                <div class="bottom-attendance-mark-button-container">
                    <div class="${this.code}-present-button present-button"><i class="material-symbols-outlined icon-size">check_circle</i></div>
                    <div class="${this.code}-absent-button absent-button"><i class="material-symbols-outlined icon-size">cancel</i></div>
                    <div class="${this.code}-undo-button undo-button"><i class="material-symbols-outlined icon-size">undo</i></div>
                </div>
            </div>
        `;

        // Append the card to the attendance card container
        document.querySelector('.attendance-card-container').appendChild(card);
    }

    defaultProgressBar() {
        const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
        progressBarContainer.innerHTML = "";
        // console.log(progressBarContainer);

        const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount) * 100).toFixed(2);
        const varTempPrecentage = isNaN(percentageForProgressbar) ? 0 : percentageForProgressbar;
        // console.log(varTempPrecentage);

        const progressBar = new AttendanceProgressBarCard(varTempPrecentage, `${this.code}-progressbar`);
        progressBar.createCard();
    }

    addEventListeners() {
        // Add event listeners for the present and absent buttons
        const presentButton = document.querySelector(`.${this.code}-present-button`);
        const absentButton = document.querySelector(`.${this.code}-absent-button`);
        const undoButton = document.querySelector(`.${this.code}-undo-button`);

        presentButton.addEventListener('click', () => this.markAttendancePresent());
        absentButton.addEventListener('click', () => this.markAttendanceAbsent());
        undoButton.addEventListener('click', () => this.undoLastAttendance());
    }

    async undoLastAttendance() {
        // console.log(this.code, "undo Button pressed");
        try {
            const { lastDate, lastStatus } = await fetchLastAttendanceData(this.code);
            const undoMessageScreen = document.createElement('div');
            undoMessageScreen.classList.add('undo-message-screen');
            undoMessageScreen.innerHTML = `
                <div class="message-box">
                    <p>Are you sure you want to undo the last attendance?</p>
                    <p>Date: ${lastDate}</p>
                    <p>Status: ${lastStatus}</p>
                    <button class="${this.code}-confirmUndo">Confirm</button>
                    <button class="cancel ${this.code}-cancelUndo">Cancel</button>
                </div>
            `;
            document.body.appendChild(undoMessageScreen);
            console.log(this.code);

            async function confirmUndo(sheetName, baseURL) {
                const loadingScreen = document.createElement('div');
                loadingScreen.classList.add('loading-screen');
                loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
                document.body.appendChild(loadingScreen);
                try {
                    const bodyUndoData = { method: 'POST', body: `{"type":"Undo","sheetname":"${sheetName}"}` };
                    const response = await fetch(baseURL, bodyUndoData);
                    const responseData = await response.json();
    
                    // console.log(responseData);
                    // console.log(sheetName);
                    // console.log(bodyUndoData);
                    console.log("Undo confirmed");
                    undoMessageScreen.innerHTML = "";
                    undoMessageScreen.innerHTML = `
                        <div class="message-box">
                            <p>${responseData.message}</p>
                            <button class="cancel ${sheetName}-cancelSubCancelUndo">Cancel</button>
                        </div>
                    `;
                    const cancelSubCancelUndoButton = document.querySelector(`.${sheetName}-cancelSubCancelUndo`);
                    cancelSubCancelUndoButton.addEventListener('click', () => cancelSubCancelUndo(sheetName));
                } catch (err) {
                    console.error(err);
                } finally {
                    // Hide loading screen
                    document.body.removeChild(loadingScreen);
                }
            }

            async function cancelSubCancelUndo(code) {
                // console.log("Undo canceled");
                document.body.removeChild(undoMessageScreen);
                const loadingScreen = document.createElement('div');
                loadingScreen.classList.add('loading-screen');
                loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
                document.body.appendChild(loadingScreen);
                try {
                    const { totalStatuses, totalPresent } = await fetchData(code);
                    const attendanceCountN = totalPresent;
                    const totalAttendanceCountN = totalStatuses;

                    const countElement = document.querySelector(`#${code}-subheading-details-text`);
                    countElement.textContent = `${attendanceCountN}/${totalAttendanceCountN}`;

                    const progressBarContainer = document.querySelector(`#${code}-progressbar`);
                    progressBarContainer.innerHTML = "";

                    const percentageForProgressbar = ((attendanceCountN / totalAttendanceCountN) * 100).toFixed(2);
                    const varTempPrecentage = isNaN(percentageForProgressbar) ? 0 : percentageForProgressbar;

                    const progressBar = new AttendanceProgressBarCard(varTempPrecentage, `${code}-progressbar`);
                    progressBar.createCard();
                } catch (err) {
                    console.error(err);
                } finally {
                    // Hide loading screen
                    document.body.removeChild(loadingScreen);
                }
            }

            function cancelUndo() {
                // console.log("Undo canceled");
                document.body.removeChild(undoMessageScreen);
            }
            const undoConfirmButton = document.querySelector(`.${this.code}-confirmUndo`);
            const undoCancelButton = document.querySelector(`.${this.code}-cancelUndo`);
            undoConfirmButton.addEventListener('click', () => confirmUndo(this.code, this.baseURL));
            undoCancelButton.addEventListener('click', () => cancelUndo());
        } catch (err) {
            console.error(err);
        }
    }

    async markAttendancePresent() {
        // Display loading screen
        const loadingScreen = document.createElement('div');
        loadingScreen.classList.add('loading-screen');
        loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loadingScreen);

        const bodyAttendanceData = { method: 'POST', body: `{"type":"Mark","sheetname":"${this.code}","status":"Present"}` };

        try {
            // Perform fetch request
            const response = await fetch(this.baseURL, bodyAttendanceData);
            const responseData = await response.json();
            // console.log(responseData);

            // Code to run after the fetch is complete
            const { totalStatuses, totalPresent } = await fetchData(this.code);
            this.attendanceCount = totalPresent;
            this.totalAttendanceCount = totalStatuses;

            const countElement = document.querySelector(`#${this.code}-subheading-details-text`);
            countElement.textContent = `${this.attendanceCount}/${this.totalAttendanceCount}`;

            const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
            progressBarContainer.innerHTML = "";

            const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount) * 100).toFixed(2);
            const varTempPrecentage = isNaN(percentageForProgressbar) ? 0 : percentageForProgressbar;

            const progressBar = new AttendanceProgressBarCard(varTempPrecentage, `${this.code}-progressbar`);
            progressBar.createCard();
        } catch (err) {
            console.error(err);
        } finally {
            // Hide loading screen
            document.body.removeChild(loadingScreen);
        }
    }

    async markAttendanceAbsent() {
        // Display loading screen
        const loadingScreen = document.createElement('div');
        loadingScreen.classList.add('loading-screen');
        loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(loadingScreen);

        const bodyAttendanceData = { method: 'POST', body: `{"type":"Mark","sheetname":"${this.code}","status":"Absent"}` };

        try {
            // Perform fetch request
            const response = await fetch(this.baseURL, bodyAttendanceData);
            const responseData = await response.json();
            // console.log(responseData);
            // Code to run after the fetch is complete
            const { totalStatuses, totalPresent } = await fetchData(this.code);
            this.totalAttendanceCount = totalStatuses;

            const countElement = document.querySelector(`#${this.code}-subheading-details-text`);
            countElement.textContent = `${this.attendanceCount}/${this.totalAttendanceCount}`;

            const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
            progressBarContainer.innerHTML = "";

            const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount) * 100).toFixed(2);
            const varTempPrecentage = isNaN(percentageForProgressbar) ? 0 : percentageForProgressbar;

            const progressBar = new AttendanceProgressBarCard(varTempPrecentage, `${this.code}-progressbar`);
            progressBar.createCard();
        } catch (err) {
            console.error(err);
        } finally {
            // Hide loading screen
            document.body.removeChild(loadingScreen);
        }
    }
}

    // markAttendance(status) {
    //     // Update attendance count and status
    //     this.attendanceCount++;
    //     this.attendanceStatus = status;

    //     // Update the DOM elements
    //     const countElement = document.querySelector(`#${this.code} .subheading-details-text`);
    //     const statusElement = document.querySelector(`#${this.code} .subheading-status-text`);

    //     countElement.textContent = this.attendanceCount;
    //     statusElement.textContent = this.attendanceStatus;
    // }

// }


// Instantiate objects for each attendance card using the sample data
// attendanceData.forEach(data => new AttendanceCard(data.subject, data.code));

const attendanceData = [
  { subject: 'Data Mining', code: 'CA355' },
  { subject: 'Distributed Computing', code: 'CA356' },
  { subject: 'Unix and Shell Programming', code: 'CA325' },
  { subject: 'Distributed Database Systems', code: 'CA328' },
];
const options = { method: 'GET' };

const baseURL = "https://script.google.com/macros/s/AKfycbzWm-rHa-iVxcpDy9-csHtTXyUcBxrBilsbQ7ejYHCnp7VMDXUMBqcymcHBiYmMQN0/exec";
async function fetchData(sheetnumber) {
    try {
        const response = await fetch(`${baseURL}?sheetname=${sheetnumber}`, options);
        const data = await response.json();
        const totalStatuses = data.data.length;
        const totalPresent = data.data.filter(item => item.status === 'Present').length;
      
        return { totalStatuses, totalPresent };
      
    } catch (err) {
        console.error(err);
    }
}
async function fetchLastAttendanceData(sheetnumber) {
    const loadingScreen = document.createElement('div');
    loadingScreen.classList.add('loading-screen');
    loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingScreen);
    try {
        const response = await fetch(`${baseURL}?sheetname=${sheetnumber}`, options);
        const data = await response.json();
        const totalNumberOfStatuses = data.data.length;
        const lastDate = data.data[totalNumberOfStatuses-1].date;
        const lastStatus = data.data[totalNumberOfStatuses-1].status;
      
        return { lastDate, lastStatus };
      
    } catch (err) {
        console.error(err);
    } finally {
        document.body.removeChild(loadingScreen);
    }
}

async function fetchDataForAllSubjects() {
    const loadingScreen = document.createElement('div');
    loadingScreen.classList.add('loading-screen');
    loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingScreen);
    try {
        for (let elementAt = 0; elementAt < attendanceData.length; elementAt++) {
          const subject = attendanceData[elementAt].subject;
          const code = attendanceData[elementAt].code;
          
          const { totalStatuses, totalPresent } = await fetchData(code);
          new AttendanceCard(subject, code, totalStatuses, totalPresent, baseURL);
        }
    } catch (err) {
        console.error(err);
    } finally {
        document.body.removeChild(loadingScreen);
    }
}

fetchDataForAllSubjects();
