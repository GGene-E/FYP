const removeBtn = document.getElementsByClassName('removeBtn');

for (i = 0; i < removeBtn.length; i++){

    removeBtn[i].addEventListener('click', (event) => {
        if (!confirm('Are you sure?')) {
            event.preventDefault();
        }
    }, false);
}

