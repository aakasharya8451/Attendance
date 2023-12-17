// JavaScript Class for Attendance Card
class AttendanceCard {
    constructor(subject, code, totalAttendanceCount, attendanceCount) {
        this.subject = subject;
        this.code = code;
        this.attendanceCount = attendanceCount;
        this.totalAttendanceCount = totalAttendanceCount;
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
                </div>
            </div>
        `;

        // Append the card to the attendance card container
        document.querySelector('.attendance-card-container').appendChild(card);
    }
    defaultProgressBar() {
        const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
        progressBarContainer.innerHTML = "";
        console.log(progressBarContainer);
        const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount) * 100).toFixed(2);
        var varTempPrecentage = isNaN(percentageForProgressbar) ? 0 : percentageForProgressbar;
        console.log(varTempPrecentage);
        const progressBar = new AttendanceProgressBarCard(varTempPrecentage, `${this.code}-progressbar`);
        progressBar.createCard();
    }
    addEventListeners() {
        // Add event listeners for the present and absent buttons
        const presentButton = document.querySelector(`.${this.code}-present-button`);
        const absentButton = document.querySelector(`.${this.code}-absent-button`);

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
        progressBarContainer.innerHTML = "";
        // console.log(progressBarContainer);
        // console.log(`#${this.code}-progressbar`);
        // const CA355Card = new AttendanceProgressBarCard(30, "CA355-progressbar");
        // CA355Card.createCard();
        const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount)*100).toFixed(2);
        // console.log(percentageForProgressbar)
        const progressBar = new AttendanceProgressBarCard(percentageForProgressbar, `${this.code}-progressbar`);
        progressBar.createCard();

    }
    markAttendanceAbsent() {
        this.totalAttendanceCount++
        const countElement = document.querySelector(`#${this.code}-subheading-details-text`);
        countElement.textContent = `${this.attendanceCount}/${this.totalAttendanceCount}`;
        const progressBarContainer = document.querySelector(`#${this.code}-progressbar`);
        progressBarContainer.innerHTML = "";
        const percentageForProgressbar = ((this.attendanceCount / this.totalAttendanceCount)*100).toFixed(2);
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


// Instantiate objects for each attendance card using the sample data
// attendanceData.forEach(data => new AttendanceCard(data.subject, data.code));

const attendanceData = [
  { subject: 'Data Mining', code: 'CA355' },
  { subject: 'Distributed Computing', code: 'CA356' },
  { subject: 'Unix and Shell Programming', code: 'CA325' },
  { subject: 'Distributed Database Systems', code: 'CA328' },
];
const options = { method: 'GET' };

async function fetchData(sheetnumber) {
  const baseURL = "https://script.google.com/macros/s/AKfycbzWm-rHa-iVxcpDy9-csHtTXyUcBxrBilsbQ7ejYHCnp7VMDXUMBqcymcHBiYmMQN0/exec";
  try {
    const response = await fetch(`${baseURL}?sheetname=${sheetnumber}`, options);
    const data = await response.json();
    const totalStatuses = data.data.length;
    const totalPresent = data.data.filter(item => item.status === 'Present').length;

    console.log(`Subject: ${sheetnumber}`);
    console.log('Total number of statuses:', totalStatuses);
    console.log('Total number of Present statuses:', totalPresent);
    return { totalStatuses, totalPresent };
  } catch (err) {
    console.error(err);
  }
}

async function fetchDataForAllSubjects() {
  for (let elementAt = 0; elementAt < attendanceData.length; elementAt++) {
    const subject = attendanceData[elementAt].subject;
    const code = attendanceData[elementAt].code;
    
    const { totalStatuses, totalPresent } = await fetchData(code);
    new AttendanceCard(subject, code, totalStatuses, totalPresent);
  }
}

fetchDataForAllSubjects();
