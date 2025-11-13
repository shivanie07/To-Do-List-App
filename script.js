document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');

    // Task elements
    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');
    const dueDateInput = document.getElementById('dueDateInput');

    //Modal elements
    const editModal = document.getElementById('editModal');
    const editTaskInput = document.getElementById('editTaskInput');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');

    //Task Control elements
    const filterSelect = document.getElementById('filterTasks');
    const searchInput = document.getElementById('searchTask');

    //Clear buttons
    const clearAllBtn = document.getElementById('clear-all-btn');
    const clearCompletedBtn = document.getElementById('clearCompletedTasks');

    //Confirmation message element
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    //Calendar elements
    const calendarGrid = document.getElementById('calendarGrid');
    const calendarHeader = document.getElementById('CalendarHeader');

    //Get current month and year
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();

    //Array to hold tasks
    let tasks = [];
    let currentEditId = null;

    //Dark mode toggle functionality
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.classList.add('active');
    }

    //Event listener for dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        darkModeToggle.classList.toggle('active');
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });

    //Add Task
    addTaskButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask();
    });

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;

        if (!taskText) {
            alert('Please enter a task.');
            return;
        }

        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            dueDate: dueDate || null
        };

        tasks.push(task);
        saveTasks();
        renderAllTasks();

        // clear inputs
        taskInput.value = '';
        dueDateInput.value = '';
    }

    //Render all tasks
    function renderAllTasks() {
        taskList.innerHTML = '';
        tasks.forEach(renderTask);
        updateTaskCounter();
    }

    //Render a single task
    function renderTask(task) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.dataset.id = task.id;

        if (task.completed) li.classList.add('completed');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderAllTasks();
        });

        const span = document.createElement('span');
        span.textContent = task.text;

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.addEventListener('click', () => {
            currentEditId = task.id;
            editTaskInput.value = task.text;
            editModal.style.display = 'flex';
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        li.append(checkbox, span, editBtn, deleteBtn);
        taskList.appendChild(li);
    }

    //Save & Load Tasks
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const stored = localStorage.getItem('tasks');
        if (stored) tasks = JSON.parse(stored);
        renderAllTasks();
    }

    //Update Task Counter
    function updateTaskCounter() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        document.getElementById(
            'taskCount'
        ).textContent = `Total: ${total}, Completed: ${completed}, Pending: ${pending}`;
    }

    //Save Edited Task
    saveEditBtn.addEventListener('click', () => {
        const task = tasks.find(t => t.id === currentEditId);
        if (task && editTaskInput.value.trim()) {
            task.text = editTaskInput.value.trim();
            saveTasks();
            renderAllTasks();
            editModal.style.display = 'none';
        }
    });

    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    //Delete Task
    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderAllTasks();
    }

    //Confirmation Modal Handler
    function showConfirmation(message, onConfirm) {
        confirmMessage.textContent = message;
        confirmModal.style.display = 'flex';

        confirmYes.onclick = () => {
            onConfirm(true);
            confirmModal.style.display = 'none';
        };
        confirmNo.onclick = () => {
            onConfirm(false);
            confirmModal.style.display = 'none';
        };
    }

    //Clear All Tasks
    clearAllBtn.addEventListener('click', () =>
        showConfirmation('Clear all tasks?', confirmed => {
            if (confirmed) {
                tasks = [];
                saveTasks();
                renderAllTasks();
            }
        })
    );

    //Clear Completed Tasks
    clearCompletedBtn.addEventListener('click', () =>
        showConfirmation('Clear completed tasks?', confirmed => {
            if (confirmed) {
                tasks = tasks.filter(t => !t.completed);
                saveTasks();
                renderAllTasks();
            }
        })
    );

    //Filter & Search
    filterSelect.addEventListener('change', () => {
        let filtered = [...tasks];
        if (filterSelect.value === 'completed')
            filtered = tasks.filter(t => t.completed);
        if (filterSelect.value === 'pending')
            filtered = tasks.filter(t => !t.completed);
        renderFiltered(filtered);
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filtered = tasks.filter(t => t.text.toLowerCase().includes(query));
        renderFiltered(filtered);
    });

    function renderFiltered(list) {
        taskList.innerHTML = '';
        list.forEach(renderTask);
    }

    //Calendar Generator
    function generateCalendar(month = currentMonth, year = currentYear) {
        calendarGrid.innerHTML = '';
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        calendarHeader.textContent = `${monthNames[month]} ${year}`;

        const todayStr = new Date().toISOString().split('T')[0];
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        daysOfWeek.forEach(day => {
            const cell = document.createElement('div');
            cell.classList.add('calendar-header');
            cell.textContent = day;
            calendarGrid.appendChild(cell);
        });

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty cells for alignment
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Dates
        for (let date = 1; date <= daysInMonth; date++) {
            const cell = document.createElement('div');
            cell.textContent = date;

            const cellMonth = String(month + 1).padStart(2, '0');
            const cellDay = String(date).padStart(2, '0');
            const cellDate = `${year}-${cellMonth}-${cellDay}`;

            if (cellDate === todayStr) cell.classList.add('today');
            if (tasks.some(t => t.dueDate === cellDate)) cell.classList.add('has-task');

            cell.addEventListener('click', () => renderFiltered(tasks.filter(t => t.dueDate === cellDate)));

            calendarGrid.appendChild(cell);
        }
    }

    //Initialize
    loadTasks();
    generateCalendar();
});
