const mysql = require('mysql2/promise');

const dbCred = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'socat'
};

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

        const SQL = `
            SELECT reservationDate, reservationTime 
            FROM Reservations 
            WHERE reservationDate = '${date}' AND userID = '${userID}';`;
        
        const row = await connection.execute(SQL);
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
        
        const SQL = `
            SELECT reservationDate, reservationTime
            FROM Reservations
            WHERE reservationDate = '${date}'
            GROUP BY reservationDate, reservationTime
            HAVING COUNT(*) >= ${max};`;

        const row = await connection.execute(SQL);
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
        
        const SQL = `
            SELECT userRole
            FROM Users
            WHERE userID = '${userID}';`;

        const row = await connection.execute(SQL);
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
        
        const SQL = `
            INSERT INTO Reservations (reservationDate, reservationTime, userID)
            VALUES ('${date}', '${time}', '${userID}');`;

        await connection.execute(SQL);
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
        
        const SQL = `
            DELETE 
            FROM Reservations
            WHERE reservationDate = '${date}' AND reservationTime = '${time}' AND userID = '${userID}';`;

        await connection.execute(SQL);
        return true;
 

    } catch(error) {
        console.error(error);
    }
}

const logDel = async (userID, date) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = `
            INSERT INTO Deletions
            VALUES ('${userID}', '${date}')`;

        await connection.execute(SQL);
        return true;
 

    } catch(error) {
        console.error(error);
    }
}

// Get number of deletions in the current week
const getLogDel = async (userID, weekStart, weekEnd) => {
    try {
        const connection = await mysql.createConnection(dbCred);
        
        const SQL = `
            SELECT COUNT(*) as count
            FROM Deletions
            WHERE userID = '${userID}'
            AND delDate BETWEEN '${weekStart}' AND '${weekEnd}';`;

        const rows = await connection.execute(SQL);
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

        const SQL = `
            INSERT INTO Users (userID, userName, userPass, userRole)
            VALUES ('${userID}', '${name}', '${password}', '${role}');`;

        await connection.execute(SQL);
        return true;

    } catch(error) {
        return false;
    }
}

// Returns a user of a TP ID
const getUser = async (userID) => {
    try {
        const connection = await mysql.createConnection(dbCred);

        const SQL = `
            SELECT * 
            FROM Users
            WHERE userID = '${userID}';`;

        const rows = await connection.execute(SQL);
        const row = rows[0][0];
        return row

    } catch(error) {
        console.error(error)
    }
}


module.exports = {queryRole, fullSlot, userRes, createRes, deleteRes, allRes, logDel, getLogDel, addUser, getUser};



