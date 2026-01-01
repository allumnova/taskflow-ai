// Firebase Configuration
const firebaseConfig = {
    projectId: "allumnova-dashboard-1337",
    appId: "1:918687174104:web:d4c9f0a19091ad1f27f6ad",
    storageBucket: "allumnova-dashboard-1337.firebasestorage.app",
    apiKey: "AIzaSyCXu6k5Zo1Tm53mMtVJ8XfUjOiHVhUDEl0",
    authDomain: "allumnova-dashboard-1337.firebaseapp.com",
    messagingSenderId: "918687174104",
    projectNumber: "918687174104"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// DOM Elements
const taskTitle = document.getElementById('taskTitle');
const taskImpact = document.getElementById('taskImpact');
const taskEffort = document.getElementById('taskEffort');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const loader = document.getElementById('loader');

// Add Task
addBtn.addEventListener('click', async () => {
    const title = taskTitle.value.trim();
    if (!title) return alert('Please enter a task title');

    const impact = parseInt(taskImpact.value);
    const effort = parseInt(taskEffort.value);

    // AI Priority Formula: (Impact * 2) - Effort
    const priority = (impact * 2) - effort;

    try {
        loader.classList.remove('hidden');
        await db.collection('tasks').add({
            title,
            impact,
            effort,
            priority,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        taskTitle.value = '';
    } catch (error) {
        console.error("Error adding task: ", error);
        alert("Failed to sync with cloud. Check console.");
    } finally {
        loader.classList.add('hidden');
    }
});

// Load and Listen for Tasks
db.collection('tasks')
    .orderBy('priority', 'desc')
    .onSnapshot((snapshot) => {
        taskList.innerHTML = '';
        snapshot.forEach((doc) => {
            const task = doc.data();
            renderTask(doc.id, task);
        });
    });

function renderTask(id, task) {
    const div = document.createElement('div');
    div.className = 'glass rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all hover:border-white/20 animate-fadeIn';

    const priorityColor = task.priority > 10 ? 'text-orange-500' : 'text-blue-400';

    div.innerHTML = `
        <div class="flex-1">
            <h3 class="text-xl font-bold mb-1">${task.title}</h3>
            <div class="flex gap-3 text-xs font-medium text-gray-500">
                <span>IMPACT: ${task.impact}</span>
                <span>EFFORT: ${task.effort}</span>
            </div>
        </div>
        <div class="flex items-center gap-6 w-full md:w-auto mt-2 md:mt-0">
            <div class="text-right">
                <span class="text-[10px] block font-bold text-gray-400 uppercase tracking-widest">Priority Score</span>
                <span class="text-2xl font-black ${priorityColor}">${task.priority}</span>
            </div>
            <button onclick="deleteTask('${id}')" class="p-2 hover:bg-white/10 rounded-lg transition-colors group">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 group-hover:text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `;
    taskList.appendChild(div);
}

window.deleteTask = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
        loader.classList.remove('hidden');
        await db.collection('tasks').doc(id).delete();
    } catch (e) {
        console.error(e);
    } finally {
        loader.classList.add('hidden');
    }
};
