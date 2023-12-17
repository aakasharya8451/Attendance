class AttendanceProgressBarCard {
    constructor(percent, parentElement) {
        this.percent = percent;
        this.parentElement = parentElement;
        this.determineColor();
    }

    determineColor() {
        if (this.percent > 85) {
            this.strokeColor = "#2ecc71"; // Green
        } else if (this.percent >= 75 && this.percent <= 85) {
            this.strokeColor = "#f39c12"; // Orange
        } else {
            this.strokeColor = "#e74c3c"; // Red
        }
    }

    createCard() {
        const card = document.createElement("div");
        card.className = "card";

        const percentDiv = document.createElement("div");
        percentDiv.className = "percent";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        circle1.setAttribute("cx", "105");
        circle1.setAttribute("cy", "105");
        circle1.setAttribute("r", "100");

        circle2.setAttribute("cx", "105");
        circle2.setAttribute("cy", "105");
        circle2.setAttribute("r", "100");
        circle2.style.setProperty("--percent", this.percent);

        svg.appendChild(circle1);
        svg.appendChild(circle2);

        const numberDiv = document.createElement("div");
        numberDiv.className = "number";

        const h3 = document.createElement("h3");
        h3.innerHTML = `${this.percent}<span>%</span>`;

        numberDiv.appendChild(h3);

        percentDiv.appendChild(svg);
        percentDiv.appendChild(numberDiv);

        card.appendChild(percentDiv);

          // Set stroke color
        if (this.strokeColor) {
            circle2.style.setProperty("--stroke-color", this.strokeColor);
        }

        var parentElementID = document.getElementById(this.parentElement);
        parentElementID.appendChild(card);
        }
      }

const CA355Card = new AttendanceProgressBarCard(30, "CA355");
CA355Card.createCard();
 