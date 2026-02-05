// main.js

const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");

  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const title = document.getElementById("bookFormTitle").value;
  const author = document.getElementById("bookFormAuthor").value;
  const year = parseInt(document.getElementById("bookFormYear").value);
  const isComplete = document.getElementById("bookFormIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    title,
    author,
    year,
    isComplete,
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return { id, title, author, year, isComplete };
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookList = document.getElementById("incompleteBookList");
  incompleteBookList.innerHTML = "";

  const completeBookList = document.getElementById("completeBookList");
  completeBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;
  textTitle.dataset.testid = "bookItemTitle";

  const textAuthor = document.createElement("p");
  textAuthor.innerText = "Penulis: " + bookObject.author;
  textAuthor.dataset.testid = "bookItemAuthor";

  const textYear = document.createElement("p");
  textYear.innerText = "Tahun: " + bookObject.year;
  textYear.dataset.testid = "bookItemYear";

  const textContainer = document.createElement("div");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("book-item");
  container.dataset.bookid = bookObject.id;
  container.dataset.testid = "bookItem";
  container.append(textContainer);

  const actionContainer = document.createElement("div");

  const toggleButton = document.createElement("button");
  toggleButton.innerText = bookObject.isComplete
    ? "Belum selesai dibaca"
    : "Selesai dibaca";
  toggleButton.dataset.testid = "bookItemIsCompleteButton";
  toggleButton.addEventListener("click", function () {
    toggleBookStatus(bookObject.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "Hapus Buku";
  deleteButton.dataset.testid = "bookItemDeleteButton";
  deleteButton.addEventListener("click", function () {
    removeBook(bookObject.id);
  });

  const editButton = document.createElement("button");
  editButton.innerText = "Edit Buku";
  editButton.dataset.testid = "bookItemEditButton";
  editButton.addEventListener("click", function () {
    editBook(bookObject.id);
  });

  actionContainer.append(toggleButton, deleteButton, editButton);
  container.append(actionContainer);

  return container;
}

function toggleBookStatus(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplete = !bookTarget.isComplete;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  const newTitle = prompt("Edit judul buku:", bookTarget.title);
  const newAuthor = prompt("Edit penulis buku:", bookTarget.author);
  const newYear = prompt("Edit tahun rilis:", bookTarget.year);

  if (newTitle && newAuthor && newYear) {
    bookTarget.title = newTitle;
    bookTarget.author = newAuthor;
    bookTarget.year = parseInt(newYear);
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === "undefined") {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook() {
  const searchInput = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();
  const bookItems = document.querySelectorAll("[data-testid='bookItem']");

  for (const book of bookItems) {
    const title = book
      .querySelector("[data-testid='bookItemTitle']")
      .innerText.toLowerCase();
    if (title.includes(searchInput)) {
      book.style.display = "block";
    } else {
      book.style.display = "none";
    }
  }
}
