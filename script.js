// JavaScript Class for Attendance Card
const globalObject = {
    instances: []
};

class AttendanceCard {
    constructor(subject, code, totalAttendanceCount, attendanceCount, baseURL) {
        this.subject = subject;
        this.code = code;
        this.attendanceCount = isNaN(attendanceCount) ? 0 : attendanceCount;
        this.totalAttendanceCount = isNaN(totalAttendanceCount) ? 0 : totalAttendanceCount;
        this.baseURL = baseURL;
        this.attendanceStatus = getAttendanceStatus(this.attendanceCount, this.totalAttendanceCount);
        globalObject.instances.push(this);
        this.createCard();
        this.addEventListeners();
        this.defaultProgressBar();
    }

    createCard() {
        // Create the HTML structure for the attendance card
        const card = document.createElement('div');
        card.classList.add('attendance-card');

        var pressTimer;

        const handlePressAndHold = () => {
            clearTimeout(pressTimer);
            pressTimer = setTimeout(() => {
                window.location.href = `../table.html?sheetname=${this.code}`;
            }, 1000);
        };

        // Touch events
        card.addEventListener('touchstart', handlePressAndHold);
        card.addEventListener('touchend', () => clearTimeout(pressTimer));

        // Mouse events
        card.addEventListener('mousedown', handlePressAndHold);
        card.addEventListener('mouseup', () => clearTimeout(pressTimer));

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
                        <span class="subheading-details-text" id="${this.code}-subheading-details-status-text">${this.attendanceStatus}</span>
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
            const self = this;
            const attendanceData = await fetchLastAttendanceData(this.code);

            const undoMessageScreen = document.createElement('div');
            undoMessageScreen.classList.add('undo-message-screen');

            if (!attendanceData) {
                // Handle the case when there is no data
                // console.log('No attendance data available.');
                undoMessageScreen.innerHTML = "";
                undoMessageScreen.innerHTML = `
                    <div class="message-box">
                        <p>No attendance data available.</p>
                        <button class="cancel ${this.code}-cancelUndo">Cancel</button>
                    </div>
                `;
                document.body.appendChild(undoMessageScreen);

                function cancelUndo() {
                    // console.log("Undo canceled");
                    document.body.removeChild(undoMessageScreen);
                }

                const undoCancelButton = document.querySelector(`.${this.code}-cancelUndo`);
                undoCancelButton.addEventListener('click', () => cancelUndo());
            } else {
                // const { lastDate, lastStatus } = await fetchLastAttendanceData(this.code);
                const { lastDate, lastStatus } = attendanceData;

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
                // console.log(this.code);

                async function confirmUndo(sheetName, baseURL) {
                    const loadingScreen = displayLoadingScreen();
                    try {
                        const bodyUndoData = { method: 'POST', body: `{"type":"Undo","sheetname":"${sheetName}"}` };
                        const response = await fetch(baseURL, bodyUndoData);
                        const responseData = await response.json();

                        // console.log(responseData);
                        // console.log(sheetName);
                        // console.log(bodyUndoData);
                        // console.log("Undo confirmed");
                        undoMessageScreen.innerHTML = "";
                        undoMessageScreen.innerHTML = `
                            <div class="message-box">
                                <p>${responseData.message}</p>
                                <button class="cancel ${sheetName}-cancelSubCancelUndo">Cancel</button>
                            </div>
                        `;
                        const cancelSubCancelUndoButton = document.querySelector(`.${sheetName}-cancelSubCancelUndo`);
                        cancelSubCancelUndoButton.addEventListener('click', cancelSubCancelUndo(sheetName));
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
                    const loadingScreen = displayLoadingScreen();
                    try {
                        const { totalStatuses, totalPresent } = await fetchData(code);
                        self.attendanceCount = totalPresent;
                        self.totalAttendanceCount = totalStatuses;
                        // const attendanceCountN = totalPresent;
                        // const totalAttendanceCountN = totalStatuses;

                        const countElement = document.querySelector(`#${code}-subheading-details-text`);
                        countElement.textContent = `${self.attendanceCount}/${self.totalAttendanceCount}`;

                        var status = getAttendanceStatus(self.attendanceCount, self.totalAttendanceCount);
                        self.attendanceStatus = status;
                        const statusElement = document.querySelector(`#${self.code}-subheading-details-status-text`);
                        statusElement.textContent = self.attendanceStatus;

                        const progressBarContainer = document.querySelector(`#${code}-progressbar`);
                        progressBarContainer.innerHTML = "";

                        const percentageForProgressbar = ((self.attendanceCount / self.totalAttendanceCount) * 100).toFixed(2);
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
            }
        } catch (err) {
            console.error(err);
        }
    }

    async markAttendancePresent() {
        // Display loading screen
        const loadingScreen = displayLoadingScreen();

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

            var status = getAttendanceStatus(this.attendanceCount, this.totalAttendanceCount);
            this.attendanceStatus = status;
            const statusElement = document.querySelector(`#${this.code}-subheading-details-status-text`);
            statusElement.textContent = this.attendanceStatus;

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
        const loadingScreen = displayLoadingScreen();

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

            var status = getAttendanceStatus(this.attendanceCount, this.totalAttendanceCount);
            this.attendanceStatus = status;
            const statusElement = document.querySelector(`#${this.code}-subheading-details-status-text`);
            statusElement.textContent = this.attendanceStatus;

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

function getAttendanceStatus(daysPresent, totalDays) {
    var currentPercentage = (daysPresent / totalDays) * 100;

    if (currentPercentage > 75) {
        var excessDays = totalDays;
        while (currentPercentage >= 75) {
            excessDays++;
            currentPercentage = (daysPresent / excessDays) * 100
        }
        if (((excessDays - totalDays) - 1) === 0) {
            return `Attend Next Class`;
        } else {
            return `You can Leave ${(excessDays - totalDays) - 1} Class`;
        }
    }
    else {
        const daysToAttend = Math.ceil(((0.75 * totalDays) - daysPresent) / 0.25);
        if (daysToAttend === 0 || daysToAttend === 1) {
            return `Attend Next Class`;
        } else {
            return `Attend Next ${daysToAttend} Class`;
        }
    }
}

function  displayLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.classList.add('loading-screen');
    loadingScreen.innerHTML = '<div class="loading-spinner"></div>';
    document.body.appendChild(loadingScreen);
    return loadingScreen;
}

const attendanceData = [
    { subject: 'Data Mining', code: 'CA355' },
    { subject: 'Distributed Computing', code: 'CA356' },
    { subject: 'Unix and Shell Programming', code: 'CA325' },
    { subject: 'Distributed Database Systems', code: 'CA328' },
];
const options = { method: 'GET' };

const baseURL = "https://script.google.com/macros/s/AKfycbwgUAwkJdCD2TabDINjZNp7Qr-xbGV5FUtHeLbcG2VJ2gSrIScejsVo9iz5y9jzb5o/exec";
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

async function fetchDataForAllSubjects() {
    const loadingScreen = displayLoadingScreen();
    try {
        let subjectCodeArray = [];
        attendanceData.forEach(data => { subjectCodeArray.push(data.code); });
        const resultantParallelDataResponseArray = await Promise.all(subjectCodeArray.map(fetchData));

        for (let elementAt = 0; elementAt < attendanceData.length; elementAt++) {
            const subject = attendanceData[elementAt].subject;
            const code = attendanceData[elementAt].code;
            const totalStatuses = resultantParallelDataResponseArray[elementAt].totalStatuses;
            const totalPresent = resultantParallelDataResponseArray[elementAt].totalPresent;

            new AttendanceCard(subject, code, totalStatuses, totalPresent, baseURL);
        }
    } catch (err) {
        console.error(err);
    } finally {
        document.body.removeChild(loadingScreen);
    }
}

async function fetchLastAttendanceData(sheetnumber) {
    const loadingScreen = displayLoadingScreen();

    try {
        const response = await fetch(`${baseURL}?sheetname=${sheetnumber}`, options);
        const data = await response.json();
        if (data.data.length === 0) {
            return null;
        } else {
            const totalNumberOfStatuses = data.data.length;
            const lastDate = data.data[totalNumberOfStatuses - 1].date;
            const lastStatus = data.data[totalNumberOfStatuses - 1].status;

            return { lastDate, lastStatus };
        }
    } catch (err) {
        console.error(err);
    } finally {
        document.body.removeChild(loadingScreen);
    }
}

function scrollUp() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
    });
}

async function login() {
    return new Promise(async (resolve) => {
        const loginScreen = document.createElement('div');
        loginScreen.classList.add('login-message-screen');
        loginScreen.innerHTML = `
            <div class="message-box login-message-box">
                <p>Login</p>
                <label for="password">Enter Password:</label>
                <input type="password" id="password" name="password" required>
                <br>
                <button class="confirmLogin">Login</button>
                <!-- <button class="cancel cancelLogin">Cancel</button> -->
            </div>
        `;
        document.body.appendChild(loginScreen);

        const passwordInput = loginScreen.querySelector('#password');
        const loginMessageBox = document.querySelector(".login-message-box");
        const errorMessage = document.createElement('h2');
        errorMessage.classList.add('error-message');
        loginMessageBox.appendChild(errorMessage);

        const confirmLoginButton = loginScreen.querySelector('.confirmLogin');
        // const cancelLoginButton = loginScreen.querySelector('.cancelLogin');
        confirmLoginButton.addEventListener('click', () => confirmLogin());
        // cancelLoginButton.addEventListener('click', () => cancelLogin());

        async function confirmLogin() {
            scrollUp();

            const loadingScreen = displayLoadingScreen();
            const inputPassword = passwordInput.value;

            try {
                const authenticationBody = {
                    method: 'POST',
                    headers: {},
                    body: JSON.stringify({
                        type: 'Authentication',
                        password: inputPassword
                    })
                }
                const response = await fetch(baseURL, authenticationBody);

                if (response.ok) {
                    const result = await response.json();
                    if (result.status) {
                        // console.log(result.message);
                        cancelLogin();
                        fetchDataForAllSubjects();
                        resolve(true);
                    } else {
                        // console.log(result.error);
                        errorMessage.innerText = result.error;
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                document.body.removeChild(loadingScreen);
            }
        }

        async function cancelLogin() {
            document.body.removeChild(loginScreen);
        }
    });
}

let loginStatus = false;

window.onload = async () => {
    loginStatus = await login();
}

window.onresize = () => {
    if (loginStatus) {
        // console.log("Logged in");
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
        if (viewportWidth <= 394) {
            // console.log("Viewport width: " + viewportWidth + "px");
            for (let i = 0; i < globalObject.instances.length; i++) {
                globalObject.instances[i].defaultProgressBar();
                // console.log(globalObject.instances[i]);
                // console.log(globalObject.instances[i].attendanceCount);
                // console.log(globalObject.instances[i].totalAttendanceCount);
            }
        } else {
            for (let i = 0; i < globalObject.instances.length; i++) {
                globalObject.instances[i].defaultProgressBar();
            }
        }
    }
}