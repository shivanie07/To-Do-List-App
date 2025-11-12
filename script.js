document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');

    const taskInput = document.getElementById('taskInput');
    const addTaskButton = document.getElementById('addTaskButton');
    const taskList = document.getElementById('taskList');

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

    //Data structure to hold tasks(Array of objects)
    let tasks = [];

    //Reminder functionality
    function showReminders() {
        const reminderBox = document.getElementById('task-reminder');
        const reminderList = document.getElementById('reminderList');
        reminderList.innerHTML = ''; // Clear existing reminders

        const today = new Date();
        let hasReminders = false;

        tasks.forEach(task => {
            if (!task.dueDate) return; // Skip tasks without due dates

            const dueDate = new Date(task.dueDate);
            const timeDiff = dueDate - today;
            const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

            // Due within 3 days and not completed
            if (daysDiff >= 0 && daysDiff <= 3 && !task.completed) {
                hasReminders = true;
                const li = document.createElement('li'); // Create list item for reminder
                li.textContent = `${task.text} - Due in ${daysDiff} day(s)`; // Reminder text
                reminderList.appendChild(li);
            }
        });

        // Show or hide reminder box based on whether there are reminders
        reminderBox.style.display = hasReminders ? 'block' : 'none';
    }

    showReminders(); // Initial call to show reminders


    //Event listener for add task button
    addTaskButton.addEventListener('click', addTask);
    let currentEditId = null; // To track the task being edited


    //Dark mode toggle functionality
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.classList.add('active');
    }

    //Event listener for dark mode toggle
    darkModeToggle.addEventListener('click', () => {
        darkModeToggle.classList.toggle('active');
        document.body.classList.toggle('dark-mode');

        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });


    //function to add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDateInput = document.getElementById('dueDateInput').value;

        if (!taskText) return alert('Please enter a task.');

        //Create task object and add to tasks array
        const task = {
            id: Date.now(),// unique id based on timestamp
            text: taskText,
            completed: false,
            dueDate: dueDateInput || null // Store due date or null if not set
        };

        tasks.push(task);
        renderTask(task);
        saveTasks();
        taskInput.value = ''; // Clear input field
        document.getElementById('dueDateInput').value = ''; // Clear due date input
    }


    //Function to render task in the UI
    function renderTask(task) {
        const li = document.createElement('li');
        li.classList.add('task-item');
        li.setAttribute('data-id', task.id);

        // Create checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('task-checkbox');
        checkbox.addEventListener('change', () => {
            task.completed = checkbox.checked; // Update task completion status
            if (task.completed) {
                li.classList.add('completed');
            } else {
                li.classList.remove('completed');
            }
            saveTasks();
            updateTaskCounter();
        });

        //create span to hold task text
        const taskSpan = document.createElement('span');
        taskSpan.textContent = task.text;
        taskSpan.classList.add('task-text');
        if (task.completed) taskSpan.classList.add('completed');

        //create edit button
        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.classList.add('edit-btn');

        editBtn.addEventListener('click', () => {
            currentEditId = task.id; // Store current task id being edited
            editTaskInput.value = task.text; // Populate input with current task text
            editModal.style.display = 'flex'; // Show modal

        });

        //create delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));

        // Append elements to list
        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(editBtn);
        li.appendChild(deleteBtn);

        taskList.appendChild(li);// Append list item to task list
    }

    //Function to save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    //Function to load tasks from local storage
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks); //convert string back to array
            renderAllTasks(); //Render all tasks
        }
    }


    //function to delete a task
    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId); // Remove task from array
        saveTasks();
        renderAllTasks();
        updateTaskCounter();
    }

    function renderAllTasks() {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(renderTask); // Render each task
        updateTaskCounter();
    }

    //Function to update task count
    function updateTaskCounter() {
        const totalTasks = document.getElementById('taskCount');
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        totalTasks.textContent = `Total: ${total}, Completed: ${completed}, Pending: ${pending}`;
    }

    //Modal functionality
    //Modal Save button
    saveEditBtn.addEventListener('click', () => {
        const task = tasks.find(t => t.id === currentEditId);
        if (task && editTaskInput.value.trim() !== '') {
            task.text = editTaskInput.value.trim();
            saveTasks();
            renderAllTasks();
            editModal.style.display = 'none'; // Hide modal
        }
    });

    //Modal Cancel button
    cancelEditBtn.addEventListener('click', () => {
        editModal.style.display = 'none'; // Hide modal
    });


    //Filter functionality
    function renderFilteredTasks(customTasks = null, selectedDate = null) {
        let filteredTasks = customTasks ? [...customTasks] : [...tasks]; // Use custom tasks if provided, else all tasks

        //Filter tasks
        const filter = filterSelect.value;
        if (filter === 'completed') {
            filteredTasks = filteredTasks.filter(t => t.completed);
        } else if (filter === 'pending') {
            filteredTasks = filteredTasks.filter(t => !t.completed);
        } else if (filter === 'dueDate') {
            if(selectedDate){
                filteredTasks = filteredTasks.filter(t => t.dueDate === selectedDate);
            }else{
                filteredTasks = filteredTasks.filter(t => t.dueDate);
            }
        }

        //Render filtered tasks
        taskList.innerHTML = '';
        filteredTasks.forEach(renderTask);
    }

    filterSelect.addEventListener('change',() => renderFilteredTasks());
    searchInput.addEventListener('imput', () => renderFilteredTasks());

    //Clear all & completed tasks
    clearAllBtn.addEventListener('click', () => {
        showConfirmation('Are you sure you want to clear all tasks?', (confirmed) => {
            if (confirmed) {
                tasks = [];
                saveTasks();
                renderAllTasks();
            }
        });
    });

    clearCompletedBtn.addEventListener('click', () => {
        showConfirmation('Are you sure you want to clear completed tasks?', (confirmed) => {
            if (confirmed) {
                tasks = tasks.filter(t => !t.completed);
                saveTasks();
                renderAllTasks();
            }
        });
    });


    //Confirmation functionality
    function showConfirmation(message, onConfirm) {
        confirmMessage.textContent = message;
        confirmModal.style.display = 'flex';

        confirmYes.onclick = () => {
            onConfirm(true);
            confirmModal.style.display = 'none';
        }

        confirmNo.onclick = () => {
            onConfirm(false);
            confirmModal.style.display = 'none';
        }
    }

    //Calendar functionality
    function generateCalendar(month = currentMonth, year = currentYear) {
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = ''; // Clear existing calendar

        //Update month/year header
        const monthNames = ['January', 'February', 'March', 'April', 'May','June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        calendarHeader.textContent = `${monthNames[month]} ${year}`;

        const todayStr = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD

        // Week Days Header
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        daysOfWeek.forEach(day => {
            const cell = document.createElement('div');
            cell.classList.add('calendar-header');
            cell.textContent = day;
            calendarGrid.appendChild(cell);
        });

        // Calculate first day and number of days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        //Dates 
        for (let date = 1; date <= daysInMonth; date++) {
            const cell = document.createElement("div");
            cell.textContent = date;

            //create cellDate in YYYY-MM-DD format
            const cellMonth = String(month+1).padStart(2, '0'); // Months are 0-indexed
            const cellDay = String(date).padStart(2, '0');
            const cellDate = `${year}-${cellMonth}-${cellDay}`;

            if (cellDate === todayStr) cell.classList.add('today');

            if(Array.isArray(tasks) && tasks.some(t => t.dueDate === cellDate)){
                cell.classList.add('has-task');
            }

            cell.addEventListener('click', () => {
                renderFilteredTasks(null, cellDate);
            });

            calendarGrid.appendChild(cell); // Append cell to calendar grid
        }
    }

    function changeMonth(direction){
        currentMonth += direction;
        if(currentMonth < 0){
            currentMonth = 11;
            currentYear--;
        }else if(currentMonth > 11){
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
    }
    generateCalendar();

    //Load tasks on page load
    loadTasks();
});