const express = require('express');
const path = require('path');
const dateUtils = require('./helper/dates.js');
const getData = require('./helper/query.js');
const tableObj = require('./helper/table.js');
const limiter = require('./helper/limits.js');
const custUtils = require('./helper/customUtils.js');
const bcrypt = require('bcrypt');
const session = require('express-session');
const store = new session.MemoryStore();
const csurf = require("tiny-csrf");
const cookieParser = require("cookie-parser");
const helmet = require('helmet');


// Programmer Name      : Mr. Eugene Tye Wee Chin
// Program Name         : socatreservation
// Description          : To reserve timeslots in the Security Operations Center of Asia Pacific University
// First Written On     : 20/12/2022

//Create express server instance
const app = express();

//EXPRESS SERVER SETTINGS
//Sets the 'views' directory path to 'views' for EJS files
app.set('views', path.resolve(__dirname, './views'));
//Sets the view engine to EJS
app.set('view engine', 'ejs');


//API MIDDLEWARES
//Serves files from 'public' directory
app.use(express.static('./public'));
//Enable parsing HTML forms
app.use(express.urlencoded());
//Enable parsing of JSON
app.use(express.json());
//Enable cookie parser
app.use(cookieParser("secret-cookie-30020"));
//Enable and setup sessions
app.use(session({
    name: "confidential",
    secret: "thisismysecret2iihfy37fgeh",
    saveUninitialized: true,
    cookie: {maxAge: dateUtils.oneDay},
    resave: false,
    store: store,
}));
//Enable anti-forgery tokens 
app.use(csurf("123456789iamasecret987654321feet"))

app.use(helmet({contentSecurityPolicy: false}))

app.get('/', (req,res) => {
    res.redirect('/login');
})


//API ROUTES FOR LOGIN/SIGNUP
//Display login page
app.get('/login', async (req,res) => {    
    
    const csrfToken = req.csrfToken();
    res.render('login', {
        show: req.session.notifShow,
        message: req.session.notifMessage,
        color: req.session.notifColor,
        csrfToken: csrfToken
    });
})


// When login button pressed
app.post('/login', async (req,res) => {

    // Checks if any input fields are empty, redirects if true
    if (req.body.tp == "" || req.body.password == ""){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "Please fill in all fields.";
        req.session.notifColor = false;
        console.log("Please fill in all fields.")
        return res.redirect('/login')
    }
    
    // Checks if TP contains special characters, redirects if true
    if (custUtils.containsSpecialChars(req.body.tp)){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "TP Number cannot contain special characters.";
        req.session.notifColor = false;
        console.log("TP Number cannot contain special characters.")
        return res.redirect('/login')
    }
    
    // Queries database for user, redirects if not found
    const user = await getData.getUser(req.body.tp);
    if (user == undefined){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "User Does Not Exist";
        req.session.notifColor = false;
        console.log("User not found")
        return res.redirect('/login')
    }
    
    // Compare inputted password and queried password (from db)
    if(await bcrypt.compare(req.body.password, user.userPass)){
        req.session.userID = user.userID.toUpperCase();
        req.session.role = await getData.queryRole(user.userID);
        req.session.notifShow = false; // Remove Old Notifications
        req.session.save();
        console.log('Successfully Logged In');
        
        if (req.session.role.userRole == 'administrator'){
            return res.redirect('/admin');
        } else {
            return res.redirect('/dashboard');
        }
        
    } else {
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "Incorrect Password";
        req.session.notifColor = false;
        console.log("Password is not correct.");
        res.redirect('/login')
    }
})

// Displays the sign-up page
app.get('/sign-up', async (req,res) => {
    const csrfToken = req.csrfToken();
    res.render('signup',{
        show: req.session.notifShow,
        message: req.session.notifMessage,
        color: req.session.notifColor,
        csrfToken: csrfToken    
    });
})

// When sign-up button pressed
app.post('/sign-up', async (req,res) => {
    const tp = req.body.tp.toUpperCase();
    const name = req.body.name;
    const pass = req.body.password;
    const hashedPass = await bcrypt.hash(pass, 10);
    const role = "user";

    // Checks if any input fields are empty, redirects if true
    if (tp == "" || name == "" || pass == ""){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "Please fill in all fields.";
        req.session.notifColor = false;
        console.log("Please fill in all fields.")
        return res.redirect('/sign-up')
    }

    // Checks if TP contains special characters, redirects if true
    if (custUtils.containsSpecialChars(tp) || custUtils.containsSpecialChars(name)){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "TP Number and Name cannot contain special characters.";
        req.session.notifColor = false;
        console.log("TP Number cannot and Name contain special characters.")
        return res.redirect('/sign-up')
    }

    const success = await getData.addUser(tp, name, hashedPass, role)
    if(success){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "Successfully Created New User.";
        req.session.notifColor = true;
        console.log("Successfully added new user.")
    } else {
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "User already exists.";
        req.session.notifColor = false;
        console.log("Failed to add new user. User already exists")
    }

    res.redirect('/login');
})

// When "Register Admin" button is clicked from Admin-registration page
app.post('/sign-up-admin', async (req,res) => {
    
    // Check if session expired, if so, redirect to login
    if (req.session.userID == undefined){
        console.log("Session has expired, please login again.");
        return res.redirect('login');
    }
    
    const tp = req.body.tp.toUpperCase();
    const name = req.body.name;
    const pass = req.body.password;
    const role = "administrator";
    const hashedPass = await bcrypt.hash(pass, 10);

    // Checks if any input fields are empty, redirects if true
    if (tp == "" || name == "" || pass == ""){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "Please fill in all fields.";
        req.session.notifColor = false;
        console.log("Please fill in all fields.")
        return res.redirect('/sign-up-admin')
    }

    // Checks if TP contains special characters, redirects if true
    if (custUtils.containsSpecialChars(tp) || custUtils.containsSpecialChars(name)){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "TP Number and Name cannot contain special characters.";
        req.session.notifColor = false;
        console.log("TP Number cannot and Name contain special characters.")
        return res.redirect('/sign-up-admin')
    }

    const success = await getData.addUser(tp, name, hashedPass, role)
    if(success){
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "Successfully Created New Administrator.";
        req.session.notifColor = true;
        console.log("Successfully added new administrator.")
    } else {
        req.session.notifShow = true; // Notification settings
        req.session.notifMessage = "User already exists.";
        req.session.notifColor = false;
        console.log("Failed to add new user. User already exists")
    }

    res.redirect('/sign-up-admin');

})

app.get('/logout', (req,res) => {
    req.session.destroy((err) => {
        res.redirect('/login')
    })
})


//API ROUTES FOR ADMIN
//Display Admin Page
app.get('/admin', async (req,res) => {

    const csrfToken = req.csrfToken();

    // Check if session expired, if so, redirect to login
    if (req.session.userID == undefined || req.session.role.userRole == 'user'){
        console.log("Session has expired, please login again.");
        return res.redirect('login');
    }

    // Get user info
    const id = req.session.userID;
    const role = req.session.role;

    let table = await tableObj.adminTable;
    
    // Decide whether to show notification
    const notif = {
        show: req.session.notifShow,
        message: req.session.notifMessage,
        color: req.session.notifColor
    };

    res.render('admin', {
        id: id,
        role: role,
        reservation: table,
        maxRes: limiter.maxRes,
        maxDel: limiter.maxDel,
        maxUser: limiter.maxUser,
        notif: notif,
        csrfToken: csrfToken
    })
})

// When Search button is pressed, filter table
app.post('/search', async (req,res) => {

    tableObj.adminTable = await tableObj.filterSearch(tableObj.adminTable, req.body.search)
 
    res.redirect('/admin')
})

// When Reset button is pressed, reset table
app.get('/adminReset', async (req,res) => {

    tableObj.adminTable = await tableObj.createAdminTable();
    res.redirect('/admin')
})

// When New Admin button is pressed from admin page, render Admin-registration Page
app.get('/sign-up-admin', async (req,res) => {

    const csrfToken = req.csrfToken();

    // Check if session expired, if so, redirect to login
    if (req.session.userID == undefined || req.session.role.userRole == 'user'){
        console.log("Session has expired, please login again.");
        return res.redirect('login');
    }

    // Get user info
    const id = req.session.userID;
    const role = req.session.role;

    // Decide whether to show notification
    const notif = {
        show: req.session.notifShow,
        message: req.session.notifMessage,
        color: req.session.notifColor
    };


    res.render('signup-admin', {
        id: id,
        role: role,
        notif: notif,
        csrfToken: csrfToken
    });
})



// When Delete button is pressed, delete the checked rows
app.delete('/adminDelete', async (req,res) => {
    // Row is an array of reservation objects
    const row = req.body.row;

    // If no reservations are selected, return error message
    if (row.length == 0) {
        req.session.notifShow = true;
        req.session.notifMessage = "Please Select Reservations from Table";
        req.session.notifColor = false;
        console.log("Please Select Reservations from Table.");
        return res.redirect('/admin');
    }

    // For each object in row, delete
    for (i = 0; i < row.length; i++){
        const time = row[i].reservationTime.concat(":00");
        await getData.deleteRes(row[i].userID, row[i].reservationDate, time);
    };

    // Recreate the updated table
    tableObj.adminTable = await tableObj.createAdminTable();
    
    // Notify user
    req.session.notifShow = true;
    req.session.notifMessage = "Successfully Deleted Selected Reservations";
    req.session.notifColor = true;
    console.log("Successfully Deleted Selected Reservations.");
    
    res.redirect('/admin');
})

// Increase Maximum Reservations Per User
app.post('/maxResPlus', (req,res) => {
    limiter.maxRes++;

    // Notify user
    req.session.notifShow = true;
    req.session.notifMessage = "Max Reservations Per User +1";
    req.session.notifColor = true;

    res.redirect('/admin');
})

// Decrease Maximum Reservations Per User
app.post('/maxResMinus', (req,res) => {
    
    if (limiter.maxRes > 0){
        limiter.maxRes--;
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Max Reservations Per User -1";
        req.session.notifColor = true;
    } else {
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Number cannot be negative.";
        req.session.notifColor = false;
    }

    res.redirect('/admin');
})

// Increase Maximum Deletions Per User Per Week
app.post('/maxDelPlus', (req,res) => {
    limiter.maxDel++;

    // Notify user
    req.session.notifShow = true;
    req.session.notifMessage = "Max Deletes Per User +1";
    req.session.notifColor = true;

    res.redirect('/admin');
})

// Decrease Maximum Deletions Per User Per Week
app.post('/maxDelMinus', (req,res) => {
    if(limiter.maxDel > 0){
        limiter.maxDel--;

        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Max Deletes Per User -1";
        req.session.notifColor = true;
    } else {
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Number cannot be negative.";
        req.session.notifColor = false;
    }

    res.redirect('/admin');
})

// Increase Maximum User Per Timeslot
app.post('/maxUserPlus', (req,res) => {
    limiter.maxUser++;

    // Notify user
    req.session.notifShow = true;
    req.session.notifMessage = "Max User Per Timeslot +1";
    req.session.notifColor = true;

    res.redirect('/admin');
})

// Decrease Maximum User Per Timeslot
app.post('/maxUserMinus', (req,res) => {
    
    if (limiter.maxUser > 0) {
        limiter.maxUser--;

        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Max User Per Timeslot -1";
        req.session.notifColor = true;
    } else {
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Number cannot be negative.";
        req.session.notifColor = false;
    }

    res.redirect('/admin');
})

//API ROUTES FOR USER
//Display Dashboard Page
app.get('/dashboard', async (req,res) => {
    
    const csrfToken = req.csrfToken();

    // Check if session expired, if so, redirect to login
    if (req.session.userID == undefined || req.session.role.userRole == 'administrator'){
        return res.redirect('login');
    }

    // Get user info
    const id = req.session.userID;
    const role = req.session.role;

    // Get Date data
    const displayDay = dateUtils.simpleDays(dateUtils.week);
    const displayWeek = dateUtils.simpleWeek(dateUtils.week[0], dateUtils.week[4]);

    // Get table data
    let table = tableObj.resetTable();
    table = await tableObj.setUserRes(table, dateUtils.week, id);

    // Decide whether to show notification
    const notif = {
        show: req.session.notifShow,
        message: req.session.notifMessage,
        color: req.session.notifColor
    };

    res.render('dashboard', {
        day: displayDay,
        week: displayWeek,
        role: role,
        id: id,
        table: table,
        notif: notif,
        csrfToken: csrfToken
    });
})

//Display New Reservations Page
app.get('/new', async (req,res) => {
    
    const csrfToken = req.csrfToken();

    // Check if session expired, if so, redirect to login
    if (req.session.userID == undefined || req.session.role.userRole == 'administrator'){
        console.log("Session has expired, please login again.");
        return res.redirect('login');
    }

    // Get user info
    const id = req.session.userID;
    const role = req.session.role;

    // Get Date data
    dateUtils.week = dateUtils.resetWeek();
    dateUtils.week = dateUtils.getNextWeek(dateUtils.week);

    const displayDay = dateUtils.simpleDays(dateUtils.week);
    const displayWeek = dateUtils.simpleWeek(dateUtils.week[0], dateUtils.week[4]);

    // Get table data
    let table = tableObj.resetTable();
    table = await tableObj.setUserRes(table, dateUtils.week, id);
    table = await tableObj.setFullSlot(table, dateUtils.week, limiter.maxUser);

    // Decide whether to show notification
    const notif = {
        show: req.session.notifShow,
        message: req.session.notifMessage,
        color: req.session.notifColor
    };

    res.render('new', {
        day: displayDay,
        week: displayWeek,
        role: role,
        id: id,
        table: table,
        notif: notif,
        csrfToken: csrfToken
    });
})

// GENERAL BUTTON API ROUTES
// When a table cell is clicked on New Reservations page
app.post('/timeslotForNew', async (req,res) => {
    
    // Get date, time, and user ID from req
    const id = req.session.userID;
    const selectedDateTime = tableObj.getDateTime(req.body.row, req.body.col);

    // Return an array of objects, if length of array > 2, do not create
    const checkRes = await tableObj.checkMax(id, req.body.col);         //Remove 2nd parameter to check reservations by week
    if (checkRes.length < limiter.maxRes){
        await getData.createRes(id, selectedDateTime.date, selectedDateTime.time);
        
        // Update admin's table data
        tableObj.adminTable = await tableObj.createAdminTable();
        
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Successfully added a new reservation on: " + selectedDateTime.date + ", " + selectedDateTime.time.slice(0,5) + "Hrs";
        req.session.notifColor = true; //Set green notif    
        console.log("Successfully added a new reservation on:\n" + selectedDateTime.date + "\n" + selectedDateTime.time);

    } else {
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Sorry, you have reached the maximum number of reservations for that day.";
        req.session.notifColor = false; //Set red notif
        console.log("Sorry, you have reached the maximum number of reservations for that day.");
    }; 

    res.redirect('/new');
})

// When a delete table cell button is clicked on Dashboard page
app.post('/timeslotForDel', async (req,res) => {
    
    // Get date, time, and user ID from req
    const id = req.session.userID;

    // Get number of deletions by user in current week
    const logQuantity = await getData.getLogDel(id, dateUtils.formattedMon, dateUtils.formattedFri);

    if (logQuantity < limiter.maxDel){
        const selectedDateTime = tableObj.getDateTime(req.body.row, req.body.col);
        await getData.deleteRes(id, selectedDateTime.date, selectedDateTime.time);         // Delete at selected date & time
        await getData.logDel(id, dateUtils.today);                                         // Logs the reservations into a database
        
        // Update admin's table data
        tableObj.adminTable = await tableObj.createAdminTable();

        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Successfully removed reservation on: " + selectedDateTime.date + ", " + selectedDateTime.time.slice(0,5) + "Hrs";
        req.session.notifColor = true; //Set green notif    
        console.log("Successfully removed reservation at " + selectedDateTime.date + selectedDateTime.time);

    } else {
        // Notify user
        req.session.notifShow = true;
        req.session.notifMessage = "Sorry, you have reached maximum number of deletions this week.";
        req.session.notifColor = false; //Set red notif background
        console.log("Sorry, you have reached maximum number of deletions this week.");
    }

    res.redirect('/dashboard');
})

// When the previous week is requested
app.get('/prevWeek', (req,res) => {
    dateUtils.week = dateUtils.getPrevWeek(dateUtils.week);
    res.redirect('/dashboard');
})

// When the next week is requested
app.get('/nextWeek', (req,res) => {
    dateUtils.week = dateUtils.getNextWeek(dateUtils.week);
    res.redirect('/dashboard');
})

// When "Dashboard" button clicked from navbar
app.get('/dashboardOnClick', (req,res) => {
    res.redirect('/dashboard');
})

// When "New Reservation" button clicked from navbar
app.get('/newOnClick', (req,res) => {
    res.redirect('/new');
})

// NOTIFICATION BUTTONS
// To close dashboard notification
app.get('/closeNotifUser', (req,res) => {
    req.session.notifShow = false;
    res.redirect('/dashboard');
})

// To close new-reservations notification
app.get('/closeNotif', (req,res) => {
    req.session.notifShow = false;
    res.redirect('/new');
})

// To close admin notification for admin
app.get('/closeNotifAdmin', (req,res) => {
    req.session.notifShow = false;
    res.redirect('/admin');
})

// To close login notification
app.get('/closeNotifLogin', (req,res) => {
    req.session.notifShow = false;
    res.redirect('/login');
})

// To close sign-up notification
app.get('/closeNotifSign', (req,res) => {
    req.session.notifShow = false;
    res.redirect('/sign-up');
})

// To close sign-up notification
app.get('/closeNotifSignAdmin', (req,res) => {
    req.session.notifShow = false;
    res.redirect('/sign-up-admin');
})


// Catch-all route for unused API routes
app.use((req, res, next) => {
    res.status(404).send('404 Error: Page Not Found');
  });


//Listen on port 3000
app.listen(3000, () => {
    console.log('Server is listening on port 3000');
})











