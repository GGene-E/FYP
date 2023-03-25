const showInstrButton = document.getElementById('showInstrButton');
const closeInstrButton = document.getElementById('closeInstrButton');
const instruction = document.getElementById('instruction');

showInstrButton.addEventListener('click', () => {
    instruction.classList.toggle('hidden');
});

closeInstrButton.addEventListener('click', () => {
    instruction.classList.toggle('hidden');
});


