// JavaScript Class for Attendance Card
class AttendanceCard {
    constructor(subject, code) {
        this.subject = subject;
        this.code = code;
        this.attendanceCount = 0;
        this.totalAttendanceCount = 0;
        this.attendanceStatus = '';

        this.createCard();
        this.addEventListeners();
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
                    <div class="present-button"><i class="material-symbols-outlined icon-size">check_circle</i></div>
                    <div class="absent-button"><i class="material-symbols-outlined icon-size">cancel</i></div>
                </div>
            </div>
        `;

        // Append the card to the attendance card container
        document.querySelector('.attendance-card-container').appendChild(card);
    }

    addEventListeners() {
        // Add event listeners for the present and absent buttons
        const presentButton = document.querySelector('.present-button');
        const absentButton = document.querySelector('.absent-button');

        presentButton.addEventListener('click', () => this.markAttendancePresent());
        absentButton.addEventListener('click', () => this.markAttendanceAbsent());
    }

    markAttendancePresent() {
        this.attendanceCount++;
        this.totalAttendanceCount++;
        const countElement = document.querySelector(`#${this.code}-subheading-details-text`);
        // console.log(countElement);
        countElement.textContent = `${this.attendanceCount}/${this.totalAttendanceCount}`;
        const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
        // console.log(progressBarContainer);
        // console.log(`#${this.code}-progressbar`);
        // const CA355Card = new AttendanceProgressBarCard(30, "CA355-progressbar");
        // CA355Card.createCard();
        const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount)*100).toFixed(2);
        // console.log(percentageForProgressbar)
        progressBarContainer.innerHTML = "";
        const progressBar = new AttendanceProgressBarCard(percentageForProgressbar, `${this.code}-progressbar`);
        progressBar.createCard();

    }
    markAttendanceAbsent() {
        this.totalAttendanceCount++
        const countElement = document.querySelector(`#${this.code}-subheading-details-text`);
        countElement.textContent = `${this.attendanceCount}/${this.totalAttendanceCount}`;
        const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
        const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount)*100).toFixed(2);
        progressBarContainer.innerHTML = "";
        const progressBar = new AttendanceProgressBarCard(percentageForProgressbar, `${this.code}-progressbar`);
        progressBar.createCard();
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

}

// Sample data for attendance cards
const attendanceData = [
    { subject: 'Data Mining', code: 'CA355' },
    // Add more data for additional cards
];

// Instantiate objects for each attendance card using the sample data
attendanceData.forEach(data => new AttendanceCard(data.subject, data.code));
