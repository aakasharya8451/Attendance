class AttendanceProgressBarCard {
    constructor(percent, parentElement) {
        this.percent = percent;
        this.parentElement = parentElement;
        this.determineColor();
    }

    determineColor() {
        if (this.percent > 80) {
            this.strokeColor = "#2ecc71"; // Green
        } else if (this.percent >= 75 && this.percent <= 80) {
            this.strokeColor = "#f39c12"; // Orange
        } else {
            this.strokeColor = "#e74c3c"; // Red
        }
    }

    createCard() {
        const card = document.createElement("div");
        card.className = "card";
        var parentElementID = document.getElementById(this.parentElement);
        parentElementID.appendChild(card);

        var cardWidth = card.offsetWidth;

        const percentDiv = document.createElement("div");
        percentDiv.className = "percent";

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const circle1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        const circle2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        circle1.setAttribute("cx", `${cardWidth / 2}`);
        circle1.setAttribute("cy", `${cardWidth / 2}`);
        circle1.setAttribute("r", `${(cardWidth / 2) - 5}`);

        circle2.setAttribute("cx", `${cardWidth / 2}`);
        circle2.setAttribute("cy", `${cardWidth / 2}`);
        circle2.setAttribute("r", `${(cardWidth / 2) - 5}`);
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

    }
}

// const CA355Card = new AttendanceProgressBarCard(0, "CA355-progressbar");
// CA355Card.createCard();
