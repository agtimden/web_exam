// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализация обработчиков уведомлений
    initNotification();
    
    // Загрузка заявок при открытии страницы
    loadOrders();

    // Инициализация обработчиков модальных окон
    initModalHandlers();
});

// Инициализация системы уведомлений
function initNotification() {
    // Получение области уведомлений и кнопки закрытия
    const notificationArea = document.getElementById('notification-area');
    const closeButton = notificationArea.querySelector('.notification-close');
    
    // Добавление обработчика клика на кнопку закрытия
    closeButton.addEventListener('click', () => {
        // Удаление области уведомлений при клике
        notificationArea.remove();
    });
}

// Переменные для пагинации заявок
let currentPage = 1; // Текущая страница
const ordersPerPage = 5; // Количество заявок на странице
let allOrders = []; // Массив всех заявок

// Загрузка заявок с сервера
async function loadOrders() {
    try {
        // Получение заявок и связанных данных
        const [orders, courses, tutors] = await Promise.all([
            api.orders.getAll(),
            api.courses.getAll(),
            api.tutors.getAll()
        ]);

        console.log('Loaded orders:', orders);

        // Обработка и сохранение заявок
        allOrders = orders.map(order => {
            // Поиск связанного курса
            const course = courses.find(c => c.id === order.course_id);
            // Поиск связанного преподавателя
            const tutor = tutors.find(t => t.id === order.tutor_id);
            
            console.log('Order price:', order.price);
            
            // Возврат обработанной заявки с дополнительными данными
            return {
                ...order,
                course_name: course ? course.name : 'Unknown Course',
                tutor_name: tutor ? tutor.name : 'Unknown Tutor',
                total_cost: order.price
            };
        });

        console.log('Processed orders:', allOrders);

        // Отображение первой страницы
        displayOrdersPage(1);
    } catch (error) {
        // Обработка ошибок при загрузке
        console.error('Error loading orders:', error);
        showNotification('Error loading orders', 'error');
    }
}

// Расчет общей стоимости заявки
function calculateTotalCost(order, course) {
    // Проверка наличия курса
    if (!course) return 0;
    
    // Расчет базовой стоимости
    let basePrice = course.course_fee_per_hour * order.duration;
    
    // Применение множителей для дополнительных опций
    if (order.group_enrollment) basePrice *= order.persons;
    if (order.intensive_course) basePrice *= 1.2;
    if (order.early_registration) basePrice *= 0.9;
    
    return basePrice;
}

// Отображение заявок на указанной странице
function displayOrdersPage(page) {
    currentPage = page;
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ''; // Очистка текущих заявок

    // Расчет индексов для текущей страницы
    const startIndex = (page - 1) * ordersPerPage;
    const endIndex = Math.min(startIndex + ordersPerPage, allOrders.length);

    // Отображение заявок текущей страницы
    for (let i = startIndex; i < endIndex; i++) {
        const order = allOrders[i];
        const row = createOrderRow(order);
        tbody.appendChild(row);
    }

    // Обновление пагинации
    updatePagination();
}

// Создание строки таблицы для заявки
function createOrderRow(order) {
    console.log('Creating row for order:', order);
    
    const row = document.createElement('tr');
    row.setAttribute('data-order-id', order.id);
    row.innerHTML = `
        <td>${order.id}</td>
        <td data-bs-toggle="tooltip" title="${order.course_name}">${truncateText(order.course_name, 30)}</td>
        <td>${formatDateTime(order.date_start, order.time_start)}<br>Duration: ${order.duration} weeks</td>
        <td>${order.price ? order.price + ' Rubles' : 'Стоимость не указана'}</td>
        <td>
            <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#detailsModal" data-order-id="${order.id}">Details</button>
            <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#editModal" data-order-id="${order.id}">Edit</button>
            <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#deleteModal" data-order-id="${order.id}">Delete</button>
        </td>
    `;

    // Инициализация подсказок
    const tooltips = row.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(element => {
        new bootstrap.Tooltip(element);
    });

    return row;
}

// Форматирование даты и времени
function formatDateTime(date, time) {
    return `${date} ${time}`;
}

// Сокращение текста с добавлением многоточия
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Обновление пагинации
function updatePagination() {
    const pagination = document.querySelector('.pagination');
    const totalPages = Math.ceil(allOrders.length / ordersPerPage);

    // Создание HTML для пагинации
    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="prev">&laquo;</button>
        </li>
    `;

    // Добавление кнопок страниц
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }

    // Добавление кнопки "следующая"
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="next">&raquo;</button>
        </li>
    `;

    pagination.innerHTML = paginationHTML;

    // Добавление обработчиков кликов
    pagination.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {
            const page = e.target.dataset.page;
            if (page === 'prev' && currentPage > 1) {
                displayOrdersPage(currentPage - 1);
            } else if (page === 'next' && currentPage < totalPages) {
                displayOrdersPage(currentPage + 1);
            } else if (page !== 'prev' && page !== 'next') {
                displayOrdersPage(parseInt(page));
            }
        });
    });
}

// Инициализация обработчиков модальных окон
function initModalHandlers() {
    // Обработчик модального окна деталей
    const detailsModal = document.getElementById('detailsModal');
    if (detailsModal) {
        detailsModal.addEventListener('show.bs.modal', async (event) => {
            const button = event.relatedTarget;
            const orderId = button.getAttribute('data-order-id');
            await loadOrderDetails(orderId);
        });
    }

    // Обработчик модального окна редактирования
    const editModal = document.getElementById('editModal');
    if (editModal) {
        editModal.addEventListener('show.bs.modal', async (event) => {
            const button = event.relatedTarget;
            const orderId = button.getAttribute('data-order-id');
            await loadOrderForEdit(orderId);
        });
    }

    // Обработчик формы редактирования
    const editForm = document.getElementById('edit-order-form');
    if (editForm) {
        editForm.addEventListener('submit', handleEditFormSubmit);
    }

    // Обработчик модального окна удаления
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('show.bs.modal', (event) => {
            const button = event.relatedTarget;
            const orderId = button.getAttribute('data-order-id');
            const confirmButton = deleteModal.querySelector('#confirm-delete');
            confirmButton.setAttribute('data-order-id', orderId);
        });
    }

    // Обработчик подтверждения удаления
    const confirmDeleteButton = document.getElementById('confirm-delete');
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', handleDeleteConfirm);
    }
}

// Загрузка деталей заявки
async function loadOrderDetails(orderId) {
    try {
        const order = allOrders.find(o => o.id === parseInt(orderId));
        if (!order) throw new Error('Заявка не найдена');

        // Заполнение полей модального окна
        document.getElementById('detail-course-name').textContent = order.course_name;
        document.getElementById('detail-date').textContent = formatDateTime(order.date_start, order.time_start);
        document.getElementById('detail-duration').textContent = `${order.duration} week(s)`;
        document.getElementById('detail-persons').textContent = order.persons;
        document.getElementById('detail-price').textContent = order.price ? `${order.price} Rubles` : 'Стоимость не указана';
        
        // Отображение дополнительных опций
        const features = document.getElementById('detail-features');
        features.innerHTML = `
            <li>Early Registration: ${order.early_registration ? 'Yes' : 'No'}</li>
            <li>Group Enrollment: ${order.group_enrollment ? 'Yes' : 'No'}</li>
            <li>Intensive Course: ${order.intensive_course ? 'Yes' : 'No'}</li>
            <li>Supplementary Materials: ${order.supplementary ? 'Yes' : 'No'}</li>
            <li>Personalized Program: ${order.personalized ? 'Yes' : 'No'}</li>
            <li>Cultural Excursions: ${order.excursions ? 'Yes' : 'No'}</li>
            <li>Assessment Included: ${order.assessment ? 'Yes' : 'No'}</li>
            <li>Interactive Learning: ${order.interactive ? 'Yes' : 'No'}</li>
        `;
    } catch (error) {
        console.error('Error loading order details:', error);
        showNotification('Ошибка при загрузке деталей заявки: ' + error.message, 'error');
    }
}

// Загрузка заявки для редактирования
async function loadOrderForEdit(orderId) {
    try {
        const order = allOrders.find(o => o.id === parseInt(orderId));
        if (!order) throw new Error('Заявка не найдена');

        const form = document.getElementById('edit-order-form');
        form.setAttribute('data-order-id', orderId);
        
        // Заполнение полей формы
        document.getElementById('edit-date').value = order.date_start;
        document.getElementById('edit-time').value = order.time_start;
        document.getElementById('edit-duration').value = order.duration;
        document.getElementById('edit-persons').value = order.persons;
        
        // Установка значений чекбоксов
        document.getElementById('edit-early-registration').checked = order.early_registration || false;
        document.getElementById('edit-group-enrollment').checked = order.group_enrollment || false;
        document.getElementById('edit-intensive').checked = order.intensive_course || false;
        document.getElementById('edit-supplementary').checked = order.supplementary || false;
        document.getElementById('edit-personalized').checked = order.personalized || false;
        document.getElementById('edit-excursions').checked = order.excursions || false;
        document.getElementById('edit-assessment').checked = order.assessment || false;
        document.getElementById('edit-interactive').checked = order.interactive || false;

        // Расчет даты последнего занятия
        calculateLastClassDate('edit-');

        // Расчет начальной стоимости
        calculateTotalCost('edit-');

        // Добавление обработчиков событий для расчета стоимости
        document.getElementById('edit-duration').addEventListener('change', () => calculateLastClassDate('edit-'));
        document.getElementById('edit-calculate-cost').addEventListener('click', () => calculateTotalCost('edit-'));
        
        // Добавление обработчиков для автоматических опций
        document.getElementById('edit-persons').addEventListener('change', () => {
            const persons = parseInt(document.getElementById('edit-persons').value);
            document.getElementById('edit-group-enrollment').checked = persons >= 5;
            calculateTotalCost('edit-');
        });

        document.getElementById('edit-date').addEventListener('change', () => {
            const startDate = new Date(document.getElementById('edit-date').value);
            const today = new Date();
            const monthDiff = (startDate.getFullYear() - today.getFullYear()) * 12 + 
                           (startDate.getMonth() - today.getMonth());
            document.getElementById('edit-early-registration').checked = monthDiff >= 1;
            calculateTotalCost('edit-');
        });

        // Добавление обработчиков для всех чекбоксов
        ['intensive', 'supplementary', 'personalized', 'excursions', 'assessment', 'interactive'].forEach(option => {
            document.getElementById(`edit-${option}`).addEventListener('change', () => calculateTotalCost('edit-'));
        });

        // Обновление заголовка модального окна
        const modalTitle = document.querySelector('#editModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = 'Редактирование заявки';
        }
    } catch (error) {
        console.error('Error loading order for edit:', error);
        showNotification('Ошибка при загрузке данных заявки: ' + error.message, 'error');
    }
}

// Расчет даты последнего занятия
function calculateLastClassDate(prefix = '') {
    const startDate = document.getElementById(prefix + 'date').value;
    const weeks = parseInt(document.getElementById(prefix + 'duration').value);
    
    if (startDate && weeks) {
        const lastDate = new Date(startDate);
        lastDate.setDate(lastDate.getDate() + (weeks * 7));
        document.getElementById(prefix + 'last-class-date').textContent = 
            `Last class will be on ${lastDate.toLocaleDateString()}`;
    }
}

// Расчет общей стоимости
function calculateTotalCost(prefix = '') {
    const order = allOrders.find(o => o.id === parseInt(document.getElementById('edit-order-form').getAttribute('data-order-id')));
    if (!order) return;

    const course = allCourses.find(c => c.id === order.course_id);
    if (!course) return;
    
    // Получение базовых параметров
    const courseFeePerHour = course.course_fee_per_hour;
    const durationInWeeks = parseInt(document.getElementById(prefix + 'duration').value) || 1;
    const durationInHours = durationInWeeks * 2; // 2 часа на занятие в неделю
    const studentsNumber = parseInt(document.getElementById(prefix + 'persons').value) || 1;
    
    // Расчет множителя для выходных
    const startDate = new Date(document.getElementById(prefix + 'date').value);
    const isWeekendOrHoliday = startDate && (startDate.getDay() === 0 || startDate.getDay() === 6) ? 1.5 : 1;
    
    // Расчет надбавок за время
    const startTime = document.getElementById(prefix + 'time').value;
    const hour = parseInt(startTime.split(':')[0]);
    
    let morningSurcharge = 0;
    let eveningSurcharge = 0;
    
    if (hour >= 9 && hour < 12) {
        morningSurcharge = 400;
    } else if (hour >= 18 && hour < 20) {
        eveningSurcharge = 1000;
    }

    // Расчет базовой стоимости по формуле:
    // ((courseFeePerHour × durationInHours × isWeekendOrHoliday) + morningSurcharge + eveningSurcharge) × studentsNumber
    let baseCost = (courseFeePerHour * durationInHours * isWeekendOrHoliday);
    
    // Добавление надбавок перед умножением на количество студентов
    baseCost = (baseCost + morningSurcharge + eveningSurcharge) * studentsNumber;
    
    // Применение дополнительных опций
    let totalCost = baseCost;

    // Скидка за раннюю регистрацию (-10%)
    if (document.getElementById(prefix + 'early-registration').checked) {
        totalCost *= 0.9;
    }

    // Скидка за групповое обучение (-15%) - автоматически для 5 и более студентов
    const isGroupEnrollment = studentsNumber >= 5;
    document.getElementById(prefix + 'group-enrollment').checked = isGroupEnrollment;
    if (isGroupEnrollment) {
        totalCost *= 0.85;
    }

    // Интенсивный курс (+20%)
    if (document.getElementById(prefix + 'intensive').checked) {
        totalCost *= 1.2;
    }

    // Дополнительные материалы (+2000₽/студент)
    if (document.getElementById(prefix + 'supplementary').checked) {
        totalCost += 2000 * studentsNumber;
    }

    // Персональные занятия (+1500₽/неделя)
    if (document.getElementById(prefix + 'personalized').checked) {
        totalCost += 1500 * durationInWeeks;
    }

    // Культурные экскурсии (+25%)
    if (document.getElementById(prefix + 'excursions').checked) {
        totalCost *= 1.25;
    }

    // Оценка уровня (+300₽)
    if (document.getElementById(prefix + 'assessment').checked) {
        totalCost += 300;
    }

    // Интерактивная платформа (+50%)
    if (document.getElementById(prefix + 'interactive').checked) {
        totalCost *= 1.5;
    }
    
    // Обновление отображения
    document.getElementById(prefix + 'total-cost').textContent = `${Math.round(totalCost)} Rubles`;
    
    // Обновление детализации стоимости
    const costBreakdown = document.createElement('div');
    costBreakdown.innerHTML = `
        <small class="text-muted">
            <div>Базовая стоимость:</div>
            <div>Стоимость за час: ${courseFeePerHour}₽</div>
            <div>Длительность: ${durationInHours} часов (${durationInWeeks} недель)</div>
            <div>Количество студентов: ${studentsNumber}</div>
            <div>Базовая стоимость за курс: ${Math.round(courseFeePerHour * durationInHours)}₽</div>
            ${isWeekendOrHoliday > 1 ? '<div>Надбавка за выходные: ×1.5</div>' : ''}
            ${morningSurcharge ? '<div>Утренняя надбавка: +400₽</div>' : ''}
            ${eveningSurcharge ? '<div>Вечерняя надбавка: +1000₽</div>' : ''}
            <div class="mt-2">Промежуточная стоимость: ${Math.round(baseCost)}₽</div>
            
            <div class="mt-3">Дополнительные опции:</div>
            ${document.getElementById(prefix + 'early-registration').checked ? '<div class="text-success">Скидка за раннюю регистрацию: -10%</div>' : ''}
            ${isGroupEnrollment ? '<div class="text-success">Групповая скидка: -15%</div>' : ''}
            ${document.getElementById(prefix + 'intensive').checked ? '<div>Интенсивный курс: +20%</div>' : ''}
            ${document.getElementById(prefix + 'supplementary').checked ? `<div>Дополнительные материалы: +${2000 * studentsNumber}₽</div>` : ''}
            ${document.getElementById(prefix + 'personalized').checked ? `<div>Персональные занятия: +${1500 * durationInWeeks}₽</div>` : ''}
            ${document.getElementById(prefix + 'excursions').checked ? '<div>Культурные экскурсии: +25%</div>' : ''}
            ${document.getElementById(prefix + 'assessment').checked ? '<div>Оценка уровня: +300₽</div>' : ''}
            ${document.getElementById(prefix + 'interactive').checked ? '<div>Интерактивная платформа: +50%</div>' : ''}
            
            <div class="mt-2"><strong>Итоговая стоимость: ${Math.round(totalCost)}₽</strong></div>
        </small>
    `;
    
    const existingBreakdown = document.querySelector('#' + prefix + 'total-cost').nextElementSibling;
    if (existingBreakdown && existingBreakdown.tagName === 'DIV') {
        existingBreakdown.remove();
    }
    document.getElementById(prefix + 'total-cost').parentNode.appendChild(costBreakdown);
    
    return Math.round(totalCost);
}

// Обработка отправки формы редактирования
async function handleEditFormSubmit(event) {
    event.preventDefault();
    
    try {
        const form = event.target;
        const orderId = form.getAttribute('data-order-id');
        
        // Проверка длительности
        const duration = parseInt(document.getElementById('edit-duration').value);
        if (duration < 1 || duration > 52) {
            throw new Error('Длительность курса должна быть от 1 до 52 недель');
        }
        
        // Сбор только измененных полей
        const formData = {
            date_start: document.getElementById('edit-date').value,
            time_start: document.getElementById('edit-time').value,
            duration: duration,
            persons: parseInt(document.getElementById('edit-persons').value)
        };

        // Включение булевых полей только если они отмечены
        const booleanFields = {
            early_registration: 'edit-early-registration',
            group_enrollment: 'edit-group-enrollment',
            intensive_course: 'edit-intensive',
            supplementary: 'edit-supplementary',
            personalized: 'edit-personalized',
            excursions: 'edit-excursions',
            assessment: 'edit-assessment',
            interactive: 'edit-interactive'
        };

        for (const [key, elementId] of Object.entries(booleanFields)) {
            const checkbox = document.getElementById(elementId);
            if (checkbox.checked) {
                formData[key] = true;
            }
        }

        // Отправка запроса на обновление
        console.log('Updating order:', orderId, formData);
        await api.orders.update(orderId, formData);
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        modal.hide();
        
        // Перезагрузка заявок и показ сообщения об успехе
        await loadOrders();
        showNotification('Заявка успешно обновлена!', 'success');
        
    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Ошибка при обновлении заявки: ' + error.message, 'error');
    }
}

// Обработка подтверждения удаления
async function handleDeleteConfirm(event) {
    const button = event.target;
    const orderId = button.getAttribute('data-order-id');
    
    try {
        console.log('Deleting order:', orderId);
        const response = await api.orders.delete(orderId);
        console.log('Delete response:', response);

        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        modal.hide();

        // Удаление строки из таблицы
        const row = document.querySelector(`tr[data-order-id="${orderId}"]`);
        if (row) {
            row.remove();
        }

        // Перезагрузка заявок для обновления пагинации
        await loadOrders();
        
        // Показ сообщения об успехе
        showNotification('Заявка успешно удалена!', 'success');
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Ошибка при удалении заявки: ' + error.message, 'error');
    }
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type);
    const notificationArea = document.getElementById('notification-area');
    if (!notificationArea) {
        console.error('Notification area not found');
        return;
    }
    
    const notificationContent = notificationArea.querySelector('.notification-content');
    if (!notificationContent) {
        console.error('Notification content element not found');
        return;
    }
    
    // Установка классов Bootstrap в зависимости от типа уведомления
    const typeClasses = {
        success: 'alert alert-success',
        error: 'alert alert-danger',
        info: 'alert alert-info',
        warning: 'alert alert-warning'
    };
    
    notificationContent.textContent = message;
    notificationArea.className = `notification-area ${typeClasses[type] || typeClasses.info}`;
    notificationArea.style.display = 'flex';
    
    // Автоматическое скрытие уведомления через 5 секунд
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 5000);
} 