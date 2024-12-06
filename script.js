// ปรับค่าคำนวณให้ใช้หน่วย kg และ cm เป็นหลัก
window.onload = () => {
    const inputsContainer = document.querySelector("#inputsContainer");
    const resultsContainer = document.querySelector("#resultsContainer");
    const infoContainer = document.querySelector("#infoContainer");

    resultsContainer.style.width = window.getComputedStyle(inputsContainer).getPropertyValue("width");
    infoContainer.style.width = window.getComputedStyle(inputsContainer).getPropertyValue("width");
};

const KILOGRAMS_PER_POUND = 0.4536;
const CENTIMETERS_PER_INCH = 2.54;
const CM2_PER_M2 = 10000;

const MIN_CAL_FEMALE = 1200;
const MIN_CAL_MALE = 1500;

const MALE_CAL_MODIFIER = 5;
const FEMALE_CAL_MODIFIER = -161;

// ฟังก์ชันตรวจสอบข้อมูลของฟอร์ม
function validateFormInputs(inputs) {
    inputs.age = parseInt(document.querySelector("#age").value);
    inputs.weight = parseInt(document.querySelector("#weight").value);
    inputs.height = parseInt(document.querySelector("#height").value);

    inputs.bodyFatPercent = parseInt(document.querySelector("#bodyFatPercent").value);
    inputs.bodyFatEntered = !isNaN(inputs.bodyFatPercent) && inputs.bodyFatPercent >= 0 && inputs.bodyFatPercent <= 100;

    if (!inputs.bodyFatEntered) {
        alert("Please enter a valid body fat percentage!");
        return false;
    }

    if (isNaN(inputs.age) || inputs.age === "" || inputs.age < 0) {    
        alert("Please enter a valid age!");
        return false;
    }

    if (isNaN(inputs.weight) || inputs.weight === "" || inputs.weight < 0) {    
        alert("Please enter a valid weight!");
        return false;
    }

    if (isNaN(inputs.height) || inputs.height === "" || inputs.height < 0) {    
        alert("Please enter a valid height!");
        return false;
    }

    // getting values of dropdowns
    const gender = document.querySelector("#gender");
    const activityLevel = document.querySelector("#activityLevel");

    inputs.gender = gender.options[gender.selectedIndex].value;
    inputs.activityLevel = activityLevel.options[activityLevel.selectedIndex].value;

    return true;
}

// ฟังก์ชันคำนวณ TDEE โดยไม่ใช้ Body Fat
function calculateTDEEnoBF(gender, age, weight, height, activityMultiplier) {
    // Mifflin St. Jeor
    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;
    const genderModifier = (gender === "M") ? MALE_CAL_MODIFIER : FEMALE_CAL_MODIFIER;

    // คำนวณ BMR
    const BMR = (10 * weight) + (6.25 * height) - (5.0 * age) + genderModifier;

    // ถ้า TDEE ต่ำกว่าค่ามินิมัม ให้ใช้ค่ามินิมัม
    const TDEE = Math.max(safeMinCalories, Math.round(BMR * activityMultiplier));

    return TDEE;
}

// ฟังก์ชันคำนวณ TDEE โดยใช้ Body Fat
function calculateTDEEwithBF(gender, weight, bodyFatPercent, activityMultiplier) {
    // Katch-McArdle
    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;

    const LBM = (100 - bodyFatPercent) * 0.01 * weight; // Lean Body Mass
    const BMR = (21.6 * LBM) + 370;

    const TDEE = Math.round(BMR * activityMultiplier);

    return TDEE;
}

// ฟังก์ชันคำนวณ BMI
function calculateBMI(weight, height) {
    // BMI = [weight(kg) / height(cm) / height(cm)] * 10,000
    const BMI = (weight / (height * height)) * CM2_PER_M2;

    return BMI.toFixed(1);
}

// ฟังก์ชันแสดงผลลัพธ์
function printOutput(TDEE, BMI, gender) {
    const safeMinCalories = (gender === "M") ? MIN_CAL_MALE : MIN_CAL_FEMALE;

    BMI = parseFloat(BMI);

    let BMI_RANGE = "";
    if (BMI < 18.5) {
        BMI_RANGE = "underweight";
    }
    else if (BMI < 25) {
        BMI_RANGE = "healthy";
    }
    else if (BMI < 30) {
        BMI_RANGE = "overweight";
    }
    else {
        BMI_RANGE = "obese";
    }

    let infoHTML = 
        `Your TDEE is <strong>${Math.max(TDEE, safeMinCalories)}</strong> calories per day.
        <br/>
        Your BMI is <strong>${BMI}</strong>, which is <strong>${BMI_RANGE}</strong>.`;

    let resultsHTML = 
        `To lose 2 lbs/week, eat <strong>${Math.max(TDEE - 1000, safeMinCalories)}</strong> calories per day.<br/>
        To lose 1 lbs/week, eat <strong>${Math.max(TDEE - 500, safeMinCalories)}</strong> calories per day.<br/>
        To maintain weight, eat <strong>${Math.max(TDEE, safeMinCalories)}</strong> calories per day.<br/>
        To gain 1 lbs/week, eat <strong>${Math.max(TDEE + 500, safeMinCalories)}</strong> calories per day.<br/>
        To gain 2 lbs/week, eat <strong>${Math.max(TDEE + 1000, safeMinCalories)}</strong> calories per day.`;

    document.querySelector("#resultsContainer").innerHTML = resultsHTML;
    document.querySelector("#infoContainer").innerHTML = infoHTML;
    
    document.querySelector("#resultsContainer").style.visibility = "visible";
    document.querySelector("#infoContainer").style.visibility = "visible";
}

// ฟังก์ชันที่เรียกเมื่อกดปุ่ม submit
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

    // คำนวณ TDEE และ BMI
    const TDEE = (inputs.bodyFatEntered) ? calculateTDEEwithBF(inputs.gender, inputs.weight, inputs.bodyFatPercent, inputs.activityLevel) : calculateTDEEnoBF(inputs.gender, inputs.age, inputs.weight, inputs.height, inputs.activityLevel);
    const BMI = calculateBMI(inputs.weight, inputs.height);

    // แสดงผลลัพธ์
    printOutput(TDEE, BMI, inputs.gender);
}

document.querySelector("#submitBtn").addEventListener("click", formSubmit);