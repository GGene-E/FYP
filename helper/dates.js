//Gets all necessary current dates for the application

const fns = require('date-fns');

//One Day
const oneDay = 1000 * 60 * 60 * 24;

//Today
const date = new Date();

//Dates for current week
const mon = fns.startOfWeek(date, {weekStartsOn: 1});
const tue = fns.add(mon, {days: 1});
const wed = fns.add(mon, {days: 2});
const thu = fns.add(mon, {days: 3});
const fri = fns.add(mon, {days: 4});

let week = [mon, tue, wed, thu, fri];

// Format Current day, monday and friday to 'yyyy-mm-dd'
const formattedMon = fns.formatISO(mon, {representation: 'date'});
const formattedFri = fns.formatISO(fri, {representation: 'date'});
const today = fns.formatISO(date, {representation: 'date'});


// Resets the week array
const resetWeek = () => {
    let week = [mon, tue, wed, thu, fri];
    return week
}

// Returns array with dates of next week
const getNextWeek = (week) => {
    let newDates = [];
    for (i = 0; i < 5; i++) {
        newDates.push(fns.add(week[i], {days: 7}))
    };
    return newDates;
}

// Returns object with dates of prev week
const getPrevWeek = (week) => {
    let newDates = [];
    for (i = 0; i < 5; i++) {
        newDates.push(fns.sub(week[i], {days: 7}))
    };
    return newDates;
}

// returns simple formatted date (1, 2, 3,..., 31)
const simpleDays = (week) => {
    let days = [];
    for (i = 0; i < 5; i++){
        days.push(fns.format(week[i], 'd'));
    };

    return days;
}

// returns the simple formatted start and end of a week
const simpleWeek = (mon, fri) => {
    const newMon = fns.format(mon, 'PP');
    const newFri = fns.format(fri, 'PP');
    const simpleWeek = {start: newMon, end: newFri};
    return simpleWeek;
}


module.exports = {
    oneDay, today, formattedMon, formattedFri, week, getNextWeek, getPrevWeek ,simpleDays, simpleWeek, resetWeek
}

