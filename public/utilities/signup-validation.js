const tp = document.getElementById('tp');
const tpLabel = document.getElementById('tpLabel');
const name2 = document.getElementById('name');
const nameLabel = document.getElementById('nameLabel');
const password = document.getElementById('password');
const passwordLabel = document.getElementById('passwordLabel');
const password2 = document.getElementById('password2');
const password2Label = document.getElementById('password2Label')
const signUpBtn = document.getElementById('signUpBtn');

let tpCheck = false;
let nameCheck = false;
let passwordCheck = false;
let password2Check = false;

// Function to check for special characters
const containsSpecialChars = (str) => {
    const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
    return specialChars.test(str);
};

// Check if all fields are satisfactory, and enable if true
const enableButton = () => {
    if (tpCheck && nameCheck && passwordCheck && password2Check) {
        signUpBtn.disabled = false;
    } else {
        signUpBtn.disabled = true;
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

// If name has special characters or exceed 8 characters, notify user
name2.addEventListener('keyup', () => {
    if (containsSpecialChars(name2.value)) {
        nameLabel.textContent = "No Special Characters Allowed!";
        nameLabel.classList.remove('hidden');
        nameCheck = false;
    } else if (name2.value.length > 30) {
        nameLabel.textContent = "Cannot Exceed 30 Characters!";
        nameLabel.classList.remove('hidden');
        nameCheck = false;
    } else if (name2.value.length == 0) {
        nameLabel.textContent = "Please Enter Name!";
        nameLabel.classList.remove('hidden');
        nameCheck = false;
    } else {
        nameLabel.textContent = "";
        nameLabel.classList.add('hidden')
        nameCheck = true;
    }
    enableButton();
})

// If password too short or does not have special characters, notify user
password.addEventListener('keyup', () => {
    if (password.value.length < 8) {
        passwordLabel.textContent = "Must be at least 8 characters!";
        passwordLabel.classList.remove('hidden');
        passwordCheck = false;
    } else if (!containsSpecialChars(password.value)) {
        passwordLabel.textContent = "Must Contain Special Characters!";
        passwordLabel.classList.remove('hidden');
        passwordCheck = false;
    } else {
        passwordLabel.textContent = "";
        passwordLabel.classList.add('hidden');
        passwordCheck = true;
    }
    enableButton();
})

// Check if password and re-typed password is correct
password2.addEventListener('keyup', () => {
    if (password.value == password2.value){
        password2Label.classList.add('hidden');
        password2Check = true;
    } else {
        password2Label.classList.remove('hidden');
        password2Check = false;
    }
    enableButton();
})