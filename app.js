// НАСТРОЙКИ СУПАБЕЙС (замени на свои значения)
const SUPABASE_URL = 'https://lumbwmdjpesfhwtcoach.supabase.co';
const SUPABASE_KEY = 'ВСТАВЬ_СЮДА_СВОЙ_PUBLIC_КЛЮЧ';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// Элементы интерфейса
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const emailInput = document.getElementById('email-input');
const loginBtn = document.getElementById('login-btn');
const userIdDisplay = document.getElementById('user-id-display');

// Авторизация (упрощенный вход по email через Supabase Auth)
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) return alert('Введите ID (Email)');

    // Пробуем войти или зарегистрироваться
    let { data, error } = await supabaseClient.auth.signInWithOtp({ email });
    
    if (error) {
        // Если через OTP не вышло, создаем демо-профиль локально для теста
        currentUser = { id: Date.now(), email: email };
        userIdDisplay.innerText = email;
        switchToMain();
    } else {
        alert('Ссылка для входа отправлена на почту (или проверьте консоль)! Для теста используем прямой вход.');
        currentUser = { id: Date.now(), email: email };
        userIdDisplay.innerText = email;
        switchToMain();
    }
});

function switchToMain() {
    authScreen.classList.remove('active');
    mainScreen.classList.add('active');
    loadPosts();
    loadMessages();
}

// Переключение вкладок
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        e.target.classList.add('active');
        const tabId = e.target.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
});

// Публикация постов (Лента «Локальный пульс»)
const sendPostBtn = document.getElementById('send-post-btn');
const postContentInput = document.getElementById('post-content');
const postsFeed = document.getElementById('posts-feed');

sendPostBtn.addEventListener('click', async () => {
    const content = postContentInput.value.trim();
    if (!content) return;

    // Сохраняем пост в таблицу posts
    const { error } = await supabaseClient
        .from('posts')
        .insert([{ content: content, user_id: 1 }]); // Временный ID для тестов

    if (error) {
        console.error('Ошибка отправки поста:', error);
        alert('Ошибка трансляции сигнала');
    } else {
        postContentInput.value = '';
        loadPosts();
    }
});

async function loadPosts() {
    const { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Ошибка загрузки ленты:', error);
        return;
    }

    postsFeed.innerHTML = '';
    data.forEach(post => {
        const item = document.createElement('div');
        item.className = 'post-item';
        item.innerHTML = `
            <div class="post-text">${escapeHtml(post.content)}</div>
            <div class="post-footer">
                <span>ID: ${post.user_id}</span>
                <span>${new Date(post.created_at).toLocaleTimeString()}</span>
            </div>
        `;
        postsFeed.appendChild(item);
    });
}

// Чат
const sendMsgBtn = document.getElementById('send-msg-btn');
const messageInput = document.getElementById('message-input');
const messagesList = document.getElementById('messages-list');

sendMsgBtn.addEventListener('click', async () => {
    const content = messageInput.value.trim();
    if (!content) return;

    const { error } = await supabaseClient
        .from('messages')
        .insert([{ content: content, user_id: 1, chat_id: '00000000-0000-0000-0000-000000000000' }]);

    if (!error) {
        messageInput.value = '';
        loadMessages();
    }
});

async function loadMessages() {
    const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) return;

    messagesList.innerHTML = '';
    data.forEach(msg => {
        const div = document.createElement('div');
        div.className = 'msg-item';
        div.innerText = `${msg.content}`;
        messagesList.appendChild(div);
    });
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
