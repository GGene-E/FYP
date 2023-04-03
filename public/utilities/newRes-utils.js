const addBtn = document.getElementsByClassName('addBtn');

for (i = 0; i < addBtn.length; i++){

    addBtn[i].addEventListener('click', (event) => {
        if (!confirm('Are you sure?')) {
            event.preventDefault();
        }
    }, false);
}

