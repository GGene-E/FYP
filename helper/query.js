const mysql = require('mysql2/promise');

const dbCred = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'socat'
};

// Gets total hours for user
const getHrs = async(userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = 'SELECT `soc_hrs` FROM `users` WHERE `userID` = ?;'

        const rows = await connection.execute(SQL,[userID]);
        await connection.end();

        const row = rows[0][0];
        return row; 

    } catch(error) {
        console.error(error)
    }
}

// Gets total hours for user
const saveHrs = async(hours,userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = 'UPDATE `users` SET `soc_hrs` = ? WHERE `userID` = ?;'

        await connection.execute(SQL,[hours, userID]);
        await connection.end();
        return true; 

    } catch(error) {
        console.error(error)
    }
}

// Returns all users
const allUsers = async () => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = `
            SELECT userID, userName, soc_hrs 
            FROM Users;`

        const rows = await connection.execute(SQL);
        await connection.end();

        const row = rows[0];
        return row; 

    } catch(error) {
        console.error(error)
    }
}

// Returns all reservations
const allRes = async () => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = `
            SELECT reservationID, reservationDate, reservationTime, userID 
            FROM Reservations;`

        const rows = await connection.execute(SQL);
        await connection.end();

        const row = rows[0];
        return row; 

    } catch(error) {
        console.error(error)
    }
}


// Returns reservation time based on date and user
const userRes = async (date, userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = 'SELECT `reservationDate`, `reservationTime` FROM `Reservations` WHERE `reservationDate` = ? AND `userID` = ?;';
        
        const row = await connection.execute(SQL, [date, userID]);
        await connection.end();

        const rows = row[0]
        return rows;

    } catch (error) {
        console.error(error);
        return false
    }
}

// Returns slots that are at max capacity
const fullSlot = async (date, max) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'SELECT `reservationDate`, `reservationTime` FROM `Reservations` WHERE `reservationDate` = ? GROUP BY `reservationDate`, `reservationTime` HAVING COUNT(*) >= ?;';

        const row = await connection.execute(SQL, [date, max]);
        await connection.end();
        
        const rows = row[0];
        return rows;

    } catch (error) {
        console.error(error);
        return false
    }
}


// Returns the role of a user based on ID
const queryRole = async (userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'SELECT `userRole` FROM `Users` WHERE `userID` = ?;';

        const row = await connection.execute(SQL,[userID]);
        await connection.end();
        
        const userRole = row[0][0];
        return userRole;

    } catch (error) {
        console.error(error);
        return false
    }
}

// Adds in new reservation into the database
const createRes = async (userID, date, time) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'INSERT INTO `Reservations` (`reservationDate`, `reservationTime`, `userID`) VALUES (?, ?, ?);';

        await connection.execute(SQL, [date, time, userID]);
        return true;

    } catch (error) {
        console.error(error);
        return false
    }
}

// Removes a particular reservation for a user
const deleteRes = async (userID, date, time) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'DELETE FROM `Reservations` WHERE `reservationDate` = ? AND `reservationTime` = ? AND `userID` = ?;';

        await connection.execute(SQL, [date, time, userID]);
        return true;
 

    } catch(error) {
        console.error(error);
    }
}

// Removes a particular reservation for a user
const deleteUser = async (userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'DELETE FROM `Users` WHERE `userID` = ?;';

        await connection.execute(SQL, [userID]);
        return true;

    } catch(error) {
        console.error(error);
    }
}

const logDel = async (userID, date) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'INSERT INTO `Deletions` VALUES (?, ?)';

        await connection.execute(SQL, [userID, date]);
        return true;
 

    } catch(error) {
        console.error(error);
    }
}

// Get number of deletions in the current week
const getLogDel = async (userID, weekStart, weekEnd) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = 'SELECT COUNT(*) as count FROM `Deletions` WHERE `userID` = ? AND `delDate` BETWEEN ? AND ? ;';

        const rows = await connection.execute(SQL, [userID, weekStart, weekEnd]);
        const row = rows[0][0]
        const deleteQuantity = row.count;
        return deleteQuantity;  

    } catch(error) {
        console.error(error);
    }
}

// Adds user into database
const addUser = async (userID, name, password, role) => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = 'INSERT INTO `Users` (`userID`, `userName`, `userPass`, `userRole`) VALUES ( ?, ?, ?, ? );';

        await connection.execute(SQL, [ userID, name, password, role, ]);
        return true;

    } catch(error) {
        return false;
    }
}

// Returns a user of a TP ID
const getUser = async (userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = 'SELECT * FROM `Users` WHERE `userID` = ?;';

        const rows = await connection.execute(SQL, [userID]);
        const row = rows[0][0];
        return row

    } catch(error) {
        console.error(error)
    }
}


module.exports = {queryRole, fullSlot, userRes, createRes, deleteRes, allRes, logDel, getLogDel, addUser, getUser, getHrs, saveHrs, allUsers, deleteUser};



