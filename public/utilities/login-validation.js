const tp = document.getElementById('tp');
const tpLabel = document.getElementById('tpLabel');
const password = document.getElementById('password');
const passwordLabel = document.getElementById('passwordLabel');
const loginBtn = document.getElementById('loginBtn');

let tpCheck = false;
let passwordCheck = false;

// Function to check for special characters
const containsSpecialChars = (str) => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
};

// Check if all fields are satisfactory, and enable if true
const enableButton = () => {
    if (tpCheck && passwordCheck) {
        loginBtn.disabled = false;
    } else {
        loginBtn.disabled = true;
    }
    return
};

// If TP has special characters or exceed 8 characters, notify user
tp.addEventListener('keyup', () => {
    if (containsSpecialChars(tp.value)) {
        tpLabel.textContent = "No Special Characters Allowed!";
        tpLabel.classList.remove('hidden');
        tpCheck = false;
    } else if (tp.value.length > 8) {
        tpLabel.textContent = "Cannot Exceed 8 Characters!";
        tpLabel.classList.remove('hidden');
        tpCheck = false;
    } else if (tp.value.length == 0) {
        tpLabel.textContent = "Please Enter TP!";
        tpLabel.classList.remove('hidden');
        tpCheck = false;
    } else {
        tpLabel.textContent = "";
        tpLabel.classList.add('hidden');
        tpCheck = true;
    }
    enableButton();
})

// If password too short or does not have special characters, notify user
password.addEventListener('keyup', () => {
    if (password.value.length == 0) {
        passwordLabel.textContent = "Please Enter Password!";
        passwordLabel.classList.remove('hidden');
        passwordCheck = false;
    } else {
        passwordLabel.textContent = "";
        passwordLabel.classList.add('hidden');
        passwordCheck = true;
    }
    enableButton();
})
