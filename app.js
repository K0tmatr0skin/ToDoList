(function() {
    const serverPath = 'https://jsonplaceholder.typicode.com/';
    let todos = [];
    let users = [];
    const todoList = document.getElementById('todo-list');
    const userSelect = document.getElementById('user-todo');
    const form = document.querySelector('form');


    document.addEventListener('DOMContentLoaded', init);
    form.addEventListener('submit', handleSubmit);


    function init() {
        Promise.all([getTodos(), getUsers()]).then(receivedData => {
            [todos, users] = receivedData;

            todos.forEach(el => printTodo(el));
            users.forEach(el => createUserOption(el));
        });
    }

    function createUserOption(user) {
        const option = document.createElement('option');
        option.value = user.id;
        option.innerText = user.name;

        userSelect.append(option);
    }

    function printTodo({id, userId, title, completed}) {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.dataset.id = id;
        li.innerHTML = `<span>${title}<i> by </i> <b>${getUserName(userId)}</b></span>`;

        const status = document.createElement('input');
        status.type = 'checkbox';
        status.checked = completed;
        status.addEventListener('change', handleTodoChange);

        const close = document.createElement('span');
        close.innerHTML = '&times;';
        close.className = 'close';
        close.addEventListener('click', handleClose);

        li.prepend(status);
        li.append(close);
        todoList.prepend(li);
    }

    function getUserName(userId) {
        const user = users.find(el => el.id === userId);
        return user.name
    }

    function removeTodo(todoId) {
        todos = todos.filter(el => el.id !== todoId);

        const todo = todoList.querySelector(`[data-id="${todoId}"]`)
        todo.querySelector('input').removeEventListener('change', handleTodoChange);
        todo.querySelector('.close').removeEventListener('click', handleClose);

        todo.remove();
    }

    function alertError(error) {
        alert(error.message);
    }


    function handleSubmit(event) {
        event.preventDefault();

        createTodo({
            userId: Number(form.user.value),
            title: form.todo.value,
            completed: false
        });
    }

    function handleTodoChange() {
        const todoId = this.parentElement.dataset.id;
        const completed = this.checked;

        toggleTodoComplete(todoId, completed);
    }

    function handleClose() {
        const todoId = this.parentElement.dataset.id;

        deleteTodo(todoId);
    }


    async function getTodos() {
        try {
            const response = await fetch(serverPath + 'todos?_limit=20');
            return await response.json();
        } catch (error) {
            alertError(error);
        }
    }

    async function getUsers() {
        try {
            const response = await fetch(serverPath + 'users');
            return await response.json();
        } catch (error) {
            alertError(error);
        }
    }

    async function createTodo(todo) {
        try {
            const response = await fetch(serverPath + 'todos', {
                method: 'POST',
                body: JSON.stringify(todo),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const newTodo = await response.json();
            printTodo(newTodo);
        } catch (error) {
            alertError(error);
        }

    }

    async function toggleTodoComplete(todoId, completed) {
        try {
            const response = await fetch(serverPath + `todos/${todoId}`, {
                method: 'PATCH',
                body: JSON.stringify({completed}),
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Unknown error!');
            }
        } catch (error) {
            alertError(error);
        }

    }

    async function deleteTodo(todoId) {
        try {
            const response = await fetch(serverPath + `todos/${todoId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                removeTodo(todoId);
            } else {
                throw new Error('Unknown error!');
            }
        } catch (error) {
            alertError(error);
        }

    }
})();

