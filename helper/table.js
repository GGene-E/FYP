const getData = require('./query.js')
const dateUtils = require('./dates.js')
const fns = require('date-fns');
const { reset } = require('nodemon');

// Returns date depending on column
const colToDate = (col) => {
	let date;
	switch(col){
		case '0':
			date = dateUtils.week[0];
			return date;
		case '1':
			date = dateUtils.week[1];
			return date;
		case '2':
			date = dateUtils.week[2];
			return date;
		case '3':
			date = dateUtils.week[3];
			return date;
		case '4':
			date = dateUtils.week[4];
			return date;
		default: 
			return date;
	}
}

// Returns time depending on row
const rowToTime = (row) => {
	let time;
	switch(row){
		case '0':
			time = '08:00:00';
			return time;
		case '1':
			time = '09:00:00';
			return time;
		case '2':
			time = '10:00:00';
			return time;
		case '3':
			time = '11:00:00';
			return time;
		case '4':
			time = '12:00:00';
			return time;
		case '5':
			time = '13:00:00';
			return time;
		case '6':
			time = '14:00:00';
			return time;
		case '7':
			time = '15:00:00';
			return time;
		case '8':
			time = '16:00:00';
			return time;
		case '9':
			time = '17:00:00';
			return time;
		case '10':
			time = '18:00:00';
			return time;
	}
}

// Returns column based on day (Mo, Tu, We, Th, Fr)
const dayToCol = (date) => {
	let col;
	switch(date){
		case 'Mo':
			col = 0;
			return col;
		case 'Tu':
			col = 1;
			return col;
		case 'We':
			col = 2;
			return col;
		case 'Th':
			col = 3;
			return col;
		case 'Fr':
			col = 4;
			return col;
		default:
			console.log("Please use correct day format.")
	}
}

// Returns row based on time ('08:00:00')
const timeToRow = (time) => {
	let row;
	switch(time){
		case '08:00:00':
			row = 0;
			return row;
		case '09:00:00':
			row = 1;
			return row;
		case '10:00:00':
			row = 2;
			return row;
		case '11:00:00':
			row = 3;
			return row;
		case '12:00:00':
			row = 4;
			return row;
		case '13:00:00':
			row = 5;
			return row;
		case '14:00:00':
			row = 6;
			return row;
		case '15:00:00':
			row = 7;
			return row;
		case '16:00:00':
			row = 8;
			return row;
		case '17:00:00':
			row = 9;
			return row;
		case '18:00:00':
			row = 10;
			return row;
		default:
			console.log("Please use correct time format ('hr:mn:ss')")
	}
}

// returns an array of objects for the user for that WEEK
// const checkMax = async (userID) => {
// 	let checkRes = [];
// 	for (let i = 0; i < dateUtils.week.length; i++) {  //This is to switch max two reservations per day or per week
// 		let date = fns.formatISO(dateUtils.week[i], { representation: 'date'});
// 		let reservation = await getData.userRes(date, userID);
// 		checkRes = checkRes.concat(reservation);
// 	}
// 	return checkRes
// }

// returns an array of objects for the user for that DAY
const checkMax = async (userID, day) => {
	let checkRes = [];
	let date = fns.formatISO(dateUtils.week[day], { representation: 'date'});
	let reservation = await getData.userRes(date, userID);
	checkRes = checkRes.concat(reservation);

	return checkRes
}

// accepts an object array, formats each object's date, and return the array 
const formatDateTime = (objArray) => {
	for (i = 0; i < objArray.length; i++){
		objArray[i].reservationDate = fns.formatISO(objArray[i].reservationDate, { representation: 'date'});
		objArray[i].reservationTime = objArray[i].reservationTime.slice(0, 5)
	}
	return objArray;
}

// Returns the column and row as object from unformated Date & Time
const getCoordinate = (date, time) => {
	const formattedDate = fns.format(date, 'EEEEEE'); 	// Format the date

	const column = dayToCol(formattedDate);				// Convert to column and row
	const row = timeToRow(time);
	
	const coordinate = {								// Create coordinate object using col and row
		column: column,
		row: row
	}
	return coordinate
}

const getDateTime = (row, col) => {
	
	const time = rowToTime(row);
	const date = colToDate(col);
	
	const formattedDate = fns.formatISO(date, {representation: 'date'});

	const dateTime = {
		time: time,
		date: formattedDate
	}
	return dateTime
}

const createAdminTable = async () => {
	let allResData = await getData.allRes();
    allResData = formatDateTime(allResData);
	return allResData;
}

const resetTable = () => {
	let table = [
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
		[ false , false, false , false, false],
	]

	return table
}

const setFullSlot = async (table, week, max) => {
	
	for ( let x = 0; x <week.length; x++) {

		let date = fns.formatISO(week[x], { representation: 'date'});

		// Get the array of fullSlot objects
		const full = await getData.fullSlot(date, max);

		// For each object in array, get coordinate and set true
		for ( let i = 0; i < full.length; i++){

			const slotCoordinate = getCoordinate(full[i].reservationDate, full[i].reservationTime)
			table[slotCoordinate.row][slotCoordinate.column] = true;
		}
	}

	return table
}


const setUserRes = async (table, week, userID) => {
	
	for ( let x = 0; x <week.length; x++) {
		let date = fns.formatISO(week[x], { representation: 'date'});

		// Get the array of user's reservation objects
		const reservation = await getData.userRes(date, userID);

		// For each object in array, get coordinate
		for ( let i = 0; i < reservation.length; i++){
			const slotCoordinate = getCoordinate(reservation[i].reservationDate, reservation[i].reservationTime)
			table[slotCoordinate.row][slotCoordinate.column] = true;
		}
	}

	return table
}

const filterSearch = async (resArray, filter) => {
	resArray = await resArray;
	const filteredArray = resArray.filter(row => {
	  // Converts values of the object into an array Ex. ['1075', '2023-02-28', '11:00','TP000003']
	  let values = Object.values(row).map(value => value.toString());
  
	  // Check if filter exists in any attribute of the row
	  return values.some(value => value.includes(filter));
	});
	return filteredArray;
  }

let adminTable = createAdminTable();

module.exports = {setFullSlot, setUserRes, getDateTime, resetTable, checkMax, formatDateTime, createAdminTable, adminTable ,filterSearch}

