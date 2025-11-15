let initialBooks = [];

// Load books.json at the start
fetch("books.json")
    .then(res => res.json())
    .then(data => {
        // Add rented:false to all books
        initialBooks = data.map(b => ({...b, rented: false }));

        // Only set books in localStorage if not already created
        if (!localStorage.getItem("books")) {
            localStorage.setItem("books", JSON.stringify(initialBooks));
        }
    })
    .catch(err => console.error("Error loading books.json:", err));


// SIGNUP
function signup() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.username === username)) {
        alert("Username already exists.");
        return;
    }

    users.push({ username, password });
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful! You can now login.");
    window.location.href = "index.html";
}


// LOGIN
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem("currentUser", username);
        window.location.href = "dashboard.html";
    } else {
        alert("Invalid credentials.");
    }
}


// LOGOUT
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
}

//dhbhdfdhfhdfdhbhf
// LOAD ALL BOOKS
function loadBooks() {
    const books = JSON.parse(localStorage.getItem("books")) || [];
    const container = document.getElementById("bookList");

    container.innerHTML = '';

    books.forEach(book => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 shadow rounded";
        //first line adds shadow on hover
        div.innerHTML = `
        <div class="flex items-center justify-between gap-3 shadow-md transition duration-300 hover:scale-105 hover:shadow-mg">
        <div class="flex-1">
            <h3 class="font-bold text-lg">${book.title}</h3>
            <h2 class="italic text-gray-600">${book.author}</h2>
            <p class="text-gray-700">Year released-${book.year}</p>
            <p class="mb-2">${book.rented ? "📕 Rented" : "📗 Available"}</p>
        </div>

        <img src="${book.image}" class="w-20 h-24 object-cover rounded shadow" alt="book"></div>`;



        if (!book.rented) {
            const btn = document.createElement("button");
            btn.textContent = "Rent";
            btn.className = "bg-blue-600 text-white px-3 py-1 rounded transition duration-300 hover:bg-blue-700 hover:scale-105 hover:shadow-2x1";
            btn.onclick = () => rentBook(book.title);
            div.appendChild(btn);
        }


        container.appendChild(div);
    });
}


// RENT BOOK
function rentBook(title) {
    const username = localStorage.getItem("currentUser");
    if (!username) return alert("Please login first.");

    const books = JSON.parse(localStorage.getItem("books"));
    const book = books.find(b => b.title === title);

    if (book.rented) return alert("Already rented.");

    book.rented = true;

    const rentDate = new Date();
    const dueDate = new Date(rentDate.getTime() + 5000); // 5 sec for testing

    const rentedBooks = JSON.parse(localStorage.getItem("rentedBooks")) || [];
    rentedBooks.push({
        username,
        title,
        rentDate: rentDate.toISOString(),
        dueDate: dueDate.toISOString()
    });

    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("rentedBooks", JSON.stringify(rentedBooks));

    alert("Book rented!");
    loadBooks();
}


function loadMyBooks() {
    const username = localStorage.getItem("currentUser");
    const rentedBooks = JSON.parse(localStorage.getItem("rentedBooks")) || [];
    const userBooks = rentedBooks.filter(b => b.username === username);

    const container = document.getElementById("myBookList");
    container.innerHTML = "";
    //card
    userBooks.forEach(book => {
        const div = document.createElement("div");
        div.className = "bg-white p-4 shadow rounded";

        div.innerHTML = `
      <h3 class="font-bold text-lg">${book.title}</h3>
      <p>Due: ${new Date(book.dueDate).toLocaleTimeString()}</p>
    `;

        const btn = document.createElement("button");
        btn.textContent = "Return";
        btn.className = "bg-red-500 text-white px-3 py-1 rounded mt-2";
        btn.onclick = () => returnBook(book.title);

        div.appendChild(btn);
        container.appendChild(div);
    });
}


// RETURN BOOK
function returnBook(title) {
    const username = localStorage.getItem("currentUser");

    const rentedBooks = JSON.parse(localStorage.getItem("rentedBooks")) || [];
    const books = JSON.parse(localStorage.getItem("books"));

    const index = rentedBooks.findIndex(b => b.username === username && b.title === title);
    if (index === -1) return;

    const rental = rentedBooks[index];
    const now = new Date();
    const due = new Date(rental.dueDate);

    let fine = 0;
    if (now > due) {
        const secondsLate = Math.floor((now - due) / 1000);
        fine = Math.floor(secondsLate / 10) * 10;
    }

    books.find(b => b.title === title).rented = false;

    rentedBooks.splice(index, 1);

    localStorage.setItem("books", JSON.stringify(books));
    localStorage.setItem("rentedBooks", JSON.stringify(rentedBooks));

    alert(fine > 0 ? `Late! Fine paid: ₹${fine}` : "Returned on time!");
    loadMyBooks();
}


// RESET BOOKS (uses your books.json)
function resetBooks() {
    const freshList = initialBooks.map(b => ({...b, rented: false }));

    localStorage.setItem("books", JSON.stringify(freshList));
    localStorage.removeItem("rentedBooks");

    alert("Books reset.");
    location.reload();
}