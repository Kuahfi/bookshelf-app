const books = [];
const RENDER_BOOK = 'render-book';

function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = parseInt(document.getElementById('bookFormYear').value);
    const isRead = document.getElementById('bookFormIsComplete').checked; // ✅ FIX: Read checkbox state

    const generatedId = generateId();
    const bookObject = generateBookObject(generatedId, bookTitle, bookAuthor, bookYear, isRead);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_BOOK));
    saveBook();
    console.log(bookObject);
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isRead) {
    return {
        id,
        title,
        author,
        year,
        isRead
    };
}

document.addEventListener(RENDER_BOOK, () => {
    const incompleteBook = document.getElementById('incompleteBookList');
    incompleteBook.innerHTML = '';

    const completeBook = document.getElementById('completeBookList');
    completeBook.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isRead) {
            incompleteBook.append(bookElement);
        } else {
            completeBook.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;

    const container = document.createElement('div');
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute('id', `book-${bookObject.id}`);
    container.setAttribute('data-testid', 'bookItem');

    if (bookObject.isRead) {
        const incompleteButton = document.createElement('button')
        incompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
        incompleteButton.innerText = "Belum Selesai Dibaca"
        incompleteButton.addEventListener('click', () => {
            incompleteBook(bookObject.id)
        })

        const deleteButton = document.createElement('button')
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton')
        deleteButton.innerText = "Hapus Buku"
        deleteButton.addEventListener('click', () => {
            removeBook(bookObject.id)
        })

        const editButton = document.createElement('button')
        editButton.setAttribute('data-testid', 'bookItemEditButton')
        editButton.innerText = "Edit Buku"
        editButton.addEventListener('click', () => {
            editBook(bookObject)
        })

        const buttonContainer = document.createElement('div')
        buttonContainer.append(incompleteButton ,deleteButton, editButton)
        container.append(buttonContainer)
    } else {
        const completeButton = document.createElement('button')
        completeButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
        completeButton.innerText = "Selesai Dibaca"
        completeButton.addEventListener('click', () => {
            completeBook(bookObject.id)
        })

        const deleteButton = document.createElement('button')
        deleteButton.setAttribute('data-testid', 'bookItemDeleteButton')
        deleteButton.innerText = "Hapus Buku"
        deleteButton.addEventListener('click', () => {
            removeBook(bookObject.id)
        })

        const editButton = document.createElement('button')
        editButton.setAttribute('data-testid', 'bookItemEditButton')
        editButton.innerText = "Edit Buku"
        editButton.addEventListener('click', () => {
            editBook(bookObject)
        })

        const buttonContainer = document.createElement('div')
        buttonContainer.append(completeButton, deleteButton, editButton)
        container.append(buttonContainer)
    }

    return container;
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem
        }
    }
    return null
}

function findBookIndex(bookId) {
    for (const i in books) {
        if (books[i].id === bookId) {
            return i
        }
    }

    return -1
}

function completeBook(bookId) {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return;

    bookTarget.isRead = true;
    document.dispatchEvent(new Event(RENDER_BOOK))
    saveBook()
}

function incompleteBook(bookId) {
    const bookTarget = findBook(bookId)
    if (bookTarget == null) return;

    bookTarget.isRead = false;
    document.dispatchEvent(new Event(RENDER_BOOK))
    saveBook()
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId)
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1)
    document.dispatchEvent(new Event(RENDER_BOOK))
    saveBook()
}

function editBook(bookObject) {
    document.getElementById("editTitle").value = bookObject.title;
    document.getElementById("editAuthor").value = bookObject.author;
    document.getElementById("editYear").value = bookObject.year;
    document.getElementById("editBookId").value = bookObject.id;

    document.getElementById("editModal").style.display = "block";
}

document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("editModal").style.display = "none";
});

window.addEventListener("click", (e) => {
    const modal = document.getElementById("editModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

document.getElementById("editBookForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const bookId = parseInt(document.getElementById("editBookId").value);
    const bookTitle = document.getElementById("editTitle").value;
    const bookAuthor = document.getElementById("editAuthor").value;
    const bookYear = parseInt(document.getElementById("editYear").value);

    const bookTarget = findBook(bookId);
    if (bookTarget) {
        bookTarget.title = bookTitle;
        bookTarget.author = bookAuthor;
        bookTarget.year = bookYear;
        saveBook()
    }

    document.getElementById("editModal").style.display = "none";
    document.dispatchEvent(new Event(RENDER_BOOK));
});

document.getElementById("searchBook").addEventListener("submit", (e) => {
    e.preventDefault();
    searchBook();
});

function searchBook() {
    const searchTitle = document.getElementById("searchBookTitle").value.toLowerCase();
    const incompleteBook = document.getElementById("incompleteBookList");
    const completeBook = document.getElementById("completeBookList");

    incompleteBook.innerHTML = "";
    completeBook.innerHTML = "";
    let foundBook = false;

    for (const bookItem of books) {
        if (bookItem.title.toLowerCase().includes(searchTitle)) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isRead) {
                incompleteBook.append(bookElement);
            } else {
                completeBook.append(bookElement);
            }
            foundBook = true
        }
    }

    if (!foundBook) {
        alert("Buku tidak ditemukan!")
        document.dispatchEvent(new Event(RENDER_BOOK));
    }
}

const SAVED_EVENT = 'saved-book'
const STORAGE_KEY = 'BOOK-SHELF'

function saveBook(){
    if(isStorageExist()){
        const parsed = JSON.stringify(books)
        localStorage.setItem(STORAGE_KEY, parsed)
        document.dispatchEvent(new Event(SAVED_EVENT))
    }
}

function isStorageExist(){
    if(typeof (Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage')
        return false;
    }
    return true;
}

function loadDataFromStorage(){
    const serializedData = localStorage.getItem(STORAGE_KEY)
    let data = JSON.parse(serializedData)

    if(data !== null){
        for(const book of data){
            books.push(book)
        }
    }

    document.dispatchEvent(new Event(RENDER_BOOK))
}

window.addEventListener("DOMContentLoaded", () => {
    const submitForm = document.getElementById('bookForm');
    submitForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addBook();
    })
    if (isStorageExist()){
        loadDataFromStorage();
    }
});
