const deleteBtn = document.getElementById('deleteBtn');


// Retrieves data from all checked rows of table    
function getSelected() {
    console.log("getSelected() is working")
    const grid = document.getElementById("table");
    const checkBoxes = grid.getElementsByTagName("input");
    let arr = []
    for (i = 0; i < checkBoxes.length; i++) {
        if (checkBoxes[i].checked) {
            let row = checkBoxes[i].parentNode.parentNode;
            let data = {
                reservationID: row.cells[0].innerHTML,
                reservationDate: row.cells[1].innerHTML,
                reservationTime: row.cells[2].innerHTML,
                userID: row.cells[3].innerHTML
            };
            arr.push(data);
        }
    }
    fetch('/adminDelete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({row: arr})
    })
    .then(response => {
        console.log(response);
        location.reload();
        
    })
    .catch(error => {
        console.error(error);
    });
}

deleteBtn.addEventListener('click', () => {
    return getSelected();
})