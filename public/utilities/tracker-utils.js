const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const elapsed = document.getElementById("elapsed");

let startTime
let interval
let elapsedTime

function updateElapsedTime() {
    const currentTime = new Date().getTime();
    elapsedTime = Math.floor((currentTime - startTime) / 1000);
    
    // Calculate hours, minutes, and seconds
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = elapsedTime % 60;

    // Format the time display
    const formattedTime = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    elapsed.textContent = formattedTime;
}

function startTimer() {
    startTime = new Date().getTime();
    interval = setInterval(updateElapsedTime, 1000);
    startBtn.disabled = true;
    stopBtn.disabled = false;
}


function sendElapsedTime() {
    
    const data = {
        time: elapsedTime
    };
  
    fetch('/trackHrs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log('Elapsed time sent successfully!');
        } else {
            console.log('Failed to send elapsed time.');
        }
    })
    .catch(error => {
        console.log('Error:', error);
    });
}

function stopTimer() {
    clearInterval(interval);
    sendElapsedTime();
    startBtn.disabled = false;
    stopBtn.disabled = true;

}
startBtn.addEventListener('click', startTimer)

stopBtn.addEventListener('click', stopTimer)

