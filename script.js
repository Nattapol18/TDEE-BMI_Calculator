// Constants
const KILOGRAMS_PER_POUND = 0.4536;
const CENTIMETERS_PER_INCH = 2.54;
const CM2_PER_M2 = 10000;
const MIN_CAL_FEMALE = 1200;
const MIN_CAL_MALE = 1500;
const MALE_CAL_MODIFIER = 5;
const FEMALE_CAL_MODIFIER = -161;

// Initialize form layout
window.onload = () => {
    const inputsContainer = document.querySelector("#inputsContainer");
    const resultsContainer = document.querySelector("#resultsContainer");
    const infoContainer = document.querySelector("#infoContainer");

    // Handle unit conversions on change
    document.querySelector("#weightUnit").addEventListener("change", handleUnitChange);
    document.querySelector("#heightUnit").addEventListener("change", handleUnitChange);
};

function handleUnitChange(event) {
    const input = event.target.id === "weightUnit" ? 
        document.querySelector("#weight") : 
        document.querySelector("#height");
    
    const value = input.value;
    if (value === "") return;

    if (event.target.id === "weightUnit") {
        input.value = event.target.value === "KG" ? 
            (parseFloat(value) * KILOGRAMS_PER_POUND).toFixed(1) : 
            (parseFloat(value) / KILOGRAMS_PER_POUND).toFixed(1);
    } else {
        input.value = event.target.value === "CM" ? 
            (parseFloat(value) * CENTIMETERS_PER_INCH).toFixed(1) : 
            (parseFloat(value) / CENTIMETERS_PER_INCH).toFixed(1);
    }
}

function validateFormInputs(inputs) {
    // Convert units to kg and cm if necessary
    const weightUnit = document.querySelector("#weightUnit").value;
    const heightUnit = document.querySelector("#heightUnit").value;
    
    inputs.weight = parseFloat(document.querySelector("#weight").value);
    inputs.height = parseFloat(document.querySelector("#height").value);
    
    if (weightUnit === "LBS") {
        inputs.weight *= KILOGRAMS_PER_POUND;
    }
    if (heightUnit === "IN") {
        inputs.height *= CENTIMETERS_PER_INCH;
    }

    inputs.age = parseInt(document.querySelector("#age").value);
    inputs.bodyFatPercent = parseFloat(document.querySelector("#bodyFatPercent").value);
    inputs.bodyFatEntered = !isNaN(inputs.bodyFatPercent) && inputs.bodyFatPercent >= 0 && inputs.bodyFatPercent <= 100;

    // Validation checks
    if (isNaN(inputs.age) || inputs.age < 0 || inputs.age > 120) {
        alert("Please enter a valid age between 0 and 120!");
        return false;
    }

    if (isNaN(inputs.weight) || inputs.weight <= 0) {
        alert("Please enter a valid weight!");
        return false;
    }

    if (isNaN(inputs.height) || inputs.height <= 0) {
        alert("Please enter a valid height!");
        return false;
    }

    // Get dropdown values
    const gender = document.querySelector("#gender");
    const activityLevel = document.querySelector("#activityLevel");

    if (!gender.value || !activityLevel.value) {
        alert("Please select both gender and activity level!");
        return false;
    }

    inputs.gender = gender.value;
    inputs.activityLevel = parseFloat(activityLevel.value);

    return true;
}

function calculateTDEEnoBF(gender, age, weight, height, activityMultiplier) {
    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;
    const genderModifier = (gender === "M") ? MALE_CAL_MODIFIER : FEMALE_CAL_MODIFIER;
    
    // Mifflin St. Jeor Formula
    const BMR = (10 * weight) + (6.25 * height) - (5.0 * age) + genderModifier;
    return Math.max(safeMinCalories, Math.round(BMR * activityMultiplier));
}

function calculateTDEEwithBF(gender, weight, bodyFatPercent, activityMultiplier) {
    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;
    
    // Katch-McArdle Formula
    const LBM = (100 - bodyFatPercent) * 0.01 * weight;
    const BMR = (21.6 * LBM) + 370;
    return Math.max(safeMinCalories, Math.round(BMR * activityMultiplier));
}

function calculateBMI(weight, height) {
    return ((weight / (height * height)) * CM2_PER_M2).toFixed(1);
}

function getBMICategory(bmi) {
    if (bmi < 18.5) return ["underweight", "#FFC107"];
    if (bmi < 25) return ["healthy", "#2ECC71"];
    if (bmi < 30) return ["overweight", "#FF9800"];
    return ["obese", "#E74C3C"];
}

function printOutput(TDEE, BMI, gender) {
    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;
    const [bmiCategory, bmiColor] = getBMICategory(parseFloat(BMI));

    const infoHTML = `
        <h2>Your Results</h2>
        <p>Your TDEE is <strong>${Math.max(TDEE, safeMinCalories)}</strong> calories per day</p>
        <p>Your BMI is <strong>${BMI}</strong> 
        (<span style="color: ${bmiColor}; font-weight: bold;">${bmiCategory}</span>)</p>
    `;

    const resultsHTML = `
        <h2>Daily Calorie Targets</h2>
        <p>Weight Loss (2 lbs/week): <strong>${Math.max(TDEE - 1000, safeMinCalories)}</strong> calories</p>
        <p>Weight Loss (1 lb/week): <strong>${Math.max(TDEE - 500, safeMinCalories)}</strong> calories</p>
        <p>Maintain Weight: <strong>${Math.max(TDEE, safeMinCalories)}</strong> calories</p>
        <p>Weight Gain (1 lb/week): <strong>${TDEE + 500}</strong> calories</p>
        <p>Weight Gain (2 lbs/week): <strong>${TDEE + 1000}</strong> calories</p>
    `;

    document.querySelector("#infoContainer").innerHTML = infoHTML;
    document.querySelector("#resultsContainer").innerHTML = resultsHTML;
    
    document.querySelector("#infoContainer").style.visibility = "visible";
    document.querySelector("#resultsContainer").style.visibility = "visible";
}

function formSubmit() {
    const inputs = {
        age: -1,
        weight: -1,
        height: -1,
        bodyFatEntered: false,
        bodyFatPercent: -1,
        gender: "M",
        activityLevel: -1,
    };

    if (!validateFormInputs(inputs)) {
        return;
    }

    const TDEE = inputs.bodyFatEntered ? 
        calculateTDEEwithBF(inputs.gender, inputs.weight, inputs.bodyFatPercent, inputs.activityLevel) : 
        calculateTDEEnoBF(inputs.gender, inputs.age, inputs.weight, inputs.height, inputs.activityLevel);
    
    const BMI = calculateBMI(inputs.weight, inputs.height);
    printOutput(TDEE, BMI, inputs.gender);
}

document.querySelector("#submitBtn").addEventListener("click", formSubmit);
