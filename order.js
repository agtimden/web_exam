// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded'); // Логирование загрузки DOM
    
    // Инициализация выбора курса с пагинацией
    initializeCourseSelection();
    
    // Инициализация выбора репетитора с пагинацией
    initializeTutorSelection();
    
    // Инициализация формы заказа
    const orderForm = document.getElementById('tutoring-request-form');
    console.log('Order form element:', orderForm); // Логирование элемента формы
    
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit); // Добавление обработчика отправки формы
        console.log('Submit event listener added to form'); // Логирование добавления обработчика
    } else {
        console.error('Order form not found in the document'); // Логирование ошибки, если форма не найдена
    }
    
    // Инициализация всплывающих подсказок
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl); // Создание всплывающих подсказок
    });

    // Инициализация поиска репетиторов
    initializeTutorSearch();
});

// Глобальные переменные для пагинации курсов
let allCourses = []; // Массив всех курсов
let currentCoursePage = 1; // Текущая страница курсов
const coursesPerPage = 2; // Количество курсов на странице

// Глобальные переменные для пагинации репетиторов
let allTutors = []; // Массив всех репетиторов
let currentTutorPage = 1; // Текущая страница репетиторов
const tutorsPerPage = 2; // Количество репетиторов на странице

let tutorsData = []; // Массив данных о репетиторах

// Инициализация выбора курса
async function initializeCourseSelection() {
    try {
        // Получение всех курсов
        allCourses = await api.courses.getAll();
        
        // Инициализация пагинации курсов
        initializeCoursePagination();
        
        // Отображение первой страницы курсов
        displayCoursePage(1);

        // Заполнение выпадающего списка курсов
        const courseSelect = document.getElementById('course-select');
        courseSelect.innerHTML = '<option value="">Select a course</option>'; // Добавление пустой опции
        allCourses.forEach(course => {
            courseSelect.innerHTML += `<option value="${course.id}">${course.name}</option>`; // Добавление опций курсов
        });

        // Добавление обработчика изменения выбора курса
        courseSelect.addEventListener('change', handleCourseSelect);
    } catch (error) {
        showNotification('Error loading courses', 'error'); // Показ уведомления об ошибке
    }
}

// Инициализация пагинации курсов
function initializeCoursePagination() {
    const pagination = document.querySelector('.courses-section .pagination'); // Получение элемента пагинации
    pagination.addEventListener('click', (e) => {
        e.preventDefault(); // Предотвращение стандартного поведения
        const button = e.target.closest('button'); // Получение нажатой кнопки
        if (!button) return; // Выход, если клик не по кнопке

        const page = button.dataset.page; // Получение номера страницы
        if (page === 'prev') {
            if (currentCoursePage > 1) {
                displayCoursePage(currentCoursePage - 1); // Переход на предыдущую страницу
            }
        } else if (page === 'next') {
            if (currentCoursePage < Math.ceil(allCourses.length / coursesPerPage)) {
                displayCoursePage(currentCoursePage + 1); // Переход на следующую страницу
            }
        } else {
            displayCoursePage(parseInt(page)); // Переход на указанную страницу
        }
    });
}

// Отображение страницы курсов
async function displayCoursePage(page) {
    currentCoursePage = page; // Обновление текущей страницы
    const courseList = document.querySelector('.course-list'); // Получение списка курсов
    courseList.innerHTML = ''; // Очистка текущего списка

    // Расчет индексов для отображения
    const startIndex = (page - 1) * coursesPerPage;
    const endIndex = Math.min(startIndex + coursesPerPage, allCourses.length);

    // Отображение курсов для текущей страницы
    for (let i = startIndex; i < endIndex; i++) {
        const course = allCourses[i];
        // Получение детальной информации о курсе
        const courseDetails = await api.courses.getById(course.id);
        const courseElement = document.createElement('div');
        courseElement.className = 'col-md-6 mb-4'; // Установка классов для стилизации
        courseElement.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h3 class="card-title" data-bs-toggle="tooltip" title="${courseDetails.name}">${truncateText(courseDetails.name, 30)}</h3>
                    <p class="card-text" data-bs-toggle="tooltip" title="${courseDetails.description}">${truncateText(courseDetails.description, 100)}</p>
                    <p class="card-text"><strong>Level:</strong> ${courseDetails.level || 'Not specified'}</p>
                    <p class="card-text"><strong>Duration:</strong> ${courseDetails.total_length || courseDetails.week_length || 'Not specified'} weeks</p>
                    <p class="card-text"><strong>Schedule:</strong> ${courseDetails.schedule || 'Flexible'}</p>
                    <p class="card-text"><strong>Price:</strong> ${courseDetails.course_fee_per_hour ? courseDetails.course_fee_per_hour + ' Rubles per hour' : 'Price on request'}</p>
                    <button class="btn btn-primary" onclick="showCourseDetails(${courseDetails.id})">Select Course</button>
                </div>
            </div>
        `;
        courseList.appendChild(courseElement); // Добавление элемента курса в список

        // Инициализация всплывающих подсказок
        const tooltips = courseElement.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(element => {
            new bootstrap.Tooltip(element); // Создание всплывающих подсказок
        });
    }

    // Обновление состояния пагинации
    updatePaginationState(currentCoursePage, allCourses.length, coursesPerPage, '.courses-section');
}

// Функция для отображения модального окна с деталями курса
async function showCourseDetails(courseId) {
    try {
        const courseDetails = await api.courses.getById(courseId); // Получение детальной информации о курсе
        
        // Создание модального окна, если его еще нет
        let courseModal = document.getElementById('courseDetailsModal');
        if (!courseModal) {
            const modalHTML = `
                <div class="modal fade" id="courseDetailsModal" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Course Details</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="course-details">
                                    <h3 id="modal-course-name"></h3>
                                    <div class="course-info mt-4">
                                        <p id="modal-course-description" class="lead"></p>
                                        <div class="row mt-4">
                                            <div class="col-md-6">
                                                <h4>Course Information</h4>
                                                <ul class="list-unstyled">
                                                    <li><strong>Level:</strong> <span id="modal-course-level"></span></li>
                                                    <li><strong>Duration:</strong> <span id="modal-course-duration"></span></li>
                                                    <li><strong>Schedule:</strong> <span id="modal-course-schedule"></span></li>
                                                    <li><strong>Price:</strong> <span id="modal-course-price"></span></li>
                                                </ul>
                                            </div>
                                            <div class="col-md-6">
                                                <h4>Additional Information</h4>
                                                <ul class="list-unstyled">
                                                    <li><strong>Teacher:</strong> <span id="modal-course-teacher"></span></li>
                                                    <li><strong>Start Dates:</strong> <span id="modal-course-dates"></span></li>
                                                    <li><strong>Weekly Hours:</strong> <span id="modal-course-weekly"></span></li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" onclick="selectCourse(${courseId})" data-bs-dismiss="modal">Enroll in Course</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML); // Добавление HTML модального окна
            courseModal = document.getElementById('courseDetailsModal');
        }

        // Заполнение данных курса в модальном окне
        document.getElementById('modal-course-name').textContent = courseDetails.name;
        document.getElementById('modal-course-description').textContent = courseDetails.description;
        document.getElementById('modal-course-level').textContent = courseDetails.level || 'Not specified';
        document.getElementById('modal-course-duration').textContent = `${courseDetails.total_length || courseDetails.week_length || 'Not specified'} weeks`;
        document.getElementById('modal-course-schedule').textContent = courseDetails.schedule || 'Flexible';
        document.getElementById('modal-course-price').textContent = courseDetails.course_fee_per_hour ? `${courseDetails.course_fee_per_hour} Rubles per hour` : 'Price on request';
        document.getElementById('modal-course-teacher').textContent = courseDetails.teacher || 'To be assigned';
        document.getElementById('modal-course-dates').textContent = courseDetails.start_dates ? courseDetails.start_dates.join(', ') : 'Flexible start dates';
        document.getElementById('modal-course-weekly').textContent = courseDetails.week_length ? `${courseDetails.week_length} hours` : 'Varies';

        // Отображение модального окна
        const modal = new bootstrap.Modal(courseModal);
        modal.show();
    } catch (error) {
        console.error('Error loading course details:', error); // Логирование ошибки
        showNotification('Error loading course details', 'error'); // Показ уведомления об ошибке
    }
}

// Инициализация выбора репетитора
async function initializeTutorSelection() {
    try {
        // Получение всех репетиторов
        allTutors = await api.tutors.getAll();
        
        // Инициализация пагинации репетиторов
        initializeTutorPagination();
        
        // Отображение первой страницы репетиторов
        displayTutorPage(1);
    } catch (error) {
        showNotification('Error loading tutors', 'error'); // Показ уведомления об ошибке
    }
}

// Инициализация пагинации репетиторов
function initializeTutorPagination() {
    const pagination = document.querySelector('.tutors-section .pagination'); // Получение элемента пагинации
    pagination.addEventListener('click', (e) => {
        e.preventDefault(); // Предотвращение стандартного поведения
        const button = e.target.closest('button'); // Получение нажатой кнопки
        if (!button) return; // Выход, если клик не по кнопке

        const page = button.dataset.page; // Получение номера страницы
        if (page === 'prev') {
            if (currentTutorPage > 1) {
                displayTutorPage(currentTutorPage - 1); // Переход на предыдущую страницу
            }
        } else if (page === 'next') {
            if (currentTutorPage < Math.ceil(allTutors.length / tutorsPerPage)) {
                displayTutorPage(currentTutorPage + 1); // Переход на следующую страницу
            }
        } else {
            displayTutorPage(parseInt(page)); // Переход на указанную страницу
        }
    });
}

// Отображение страницы репетиторов
async function displayTutorPage(page) {
    currentTutorPage = page; // Обновление текущей страницы
    const tutorList = document.querySelector('.tutor-list'); // Получение списка репетиторов
    tutorList.innerHTML = ''; // Очистка текущего списка

    // Расчет индексов для отображения
    const startIndex = (page - 1) * tutorsPerPage;
    const endIndex = Math.min(startIndex + tutorsPerPage, allTutors.length);

    // Отображение репетиторов для текущей страницы
    for (let i = startIndex; i < endIndex; i++) {
        const tutor = allTutors[i];
        const tutorElement = document.createElement('div');
        tutorElement.className = 'col-md-6 mb-4'; // Установка классов для стилизации
        tutorElement.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h3 class="card-title" data-bs-toggle="tooltip" title="${tutor.name}">${truncateText(tutor.name, 30)}</h3>
                    <p class="card-text"><strong>Work Experience:</strong> ${tutor.work_experience} years</p>
                    <p class="card-text"><strong>Languages Spoken:</strong> ${tutor.languages_spoken}</p>
                    <p class="card-text"><strong>Languages Taught:</strong> ${tutor.languages_offered}</p>
                    <p class="card-text"><strong>Language Level:</strong> ${tutor.language_level}</p>
                    <p class="card-text"><strong>Price:</strong> $${tutor.price_per_hour} per hour</p>
                    <button class="btn btn-primary w-100" onclick="selectTutor(${tutor.id})">Select Tutor</button>
                </div>
            </div>
        `;
        tutorList.appendChild(tutorElement); // Добавление элемента репетитора в список

        // Инициализация всплывающих подсказок
        const tooltips = tutorElement.querySelectorAll('[data-bs-toggle="tooltip"]');
        tooltips.forEach(element => {
            new bootstrap.Tooltip(element); // Создание всплывающих подсказок
        });
    }

    // Обновление состояния пагинации
    updatePaginationState(currentTutorPage, allTutors.length, tutorsPerPage, '.tutors-section');
}

// Обновление состояния пагинации
function updatePaginationState(currentPage, totalItems, itemsPerPage, sectionSelector) {
    const pagination = document.querySelector(`${sectionSelector} .pagination`); // Получение элемента пагинации
    const totalPages = Math.ceil(totalItems / itemsPerPage); // Расчет общего количества страниц

    let paginationHTML = `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <button class="page-link" data-page="prev">&laquo;</button>
        </li>
    `; // HTML для кнопки "Назад"

    // Генерация кнопок страниц
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${currentPage === i ? 'active' : ''}">
                <button class="page-link" data-page="${i}">${i}</button>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <button class="page-link" data-page="next">&raquo;</button>
        </li>
    `; // HTML для кнопки "Вперед"

    pagination.innerHTML = paginationHTML; // Обновление HTML пагинации
}

// Обработка выбора курса в форме
function handleCourseSelect(event) {
    const courseId = parseInt(event.target.value); // Получение ID выбранного курса
    const course = allCourses.find(c => c.id === courseId); // Поиск курса по ID
    if (course) {
        document.getElementById('instructor-name').value = course.teacher; // Установка имени преподавателя
        calculateLastClassDate(); // Расчет даты последнего занятия
        calculateTotalCost(); // Расчет общей стоимости
    } else {
        document.getElementById('instructor-name').value = ''; // Очистка поля преподавателя
    }
}

// Расчет даты последнего занятия
function calculateLastClassDate() {
    const startDate = document.getElementById('lesson-date').value; // Получение даты начала
    const weeks = parseInt(document.getElementById('lesson-duration').value); // Получение длительности в неделях
    
    if (startDate && weeks) {
        const lastDate = new Date(startDate); // Создание объекта даты
        lastDate.setDate(lastDate.getDate() + (weeks * 7)); // Расчет даты последнего занятия
        document.getElementById('last-class-date').textContent = 
            `Last class will be on ${lastDate.toLocaleDateString()}`; // Отображение даты
    }
}

// Расчет общей стоимости
function calculateTotalCost() {
    const courseId = parseInt(document.getElementById('course-select').value); // Получение ID курса
    const course = allCourses.find(c => c.id === courseId); // Поиск курса по ID
    
    if (!course) {
        document.getElementById('total-cost').textContent = '0 Rubles'; // Установка нулевой стоимости
        return 0;
    }
    
    // Получение базовых параметров
    const courseFeePerHour = course.course_fee_per_hour; // Стоимость за час
    const durationInWeeks = parseInt(document.getElementById('lesson-duration').value) || 1; // Длительность в неделях
    const durationInHours = durationInWeeks * 2; // Длительность в часах (2 часа в неделю)
    const studentsNumber = parseInt(document.getElementById('group-size').value) || 1; // Количество студентов
    
    // Расчет множителя для выходных
    const startDate = new Date(document.getElementById('lesson-date').value);
    const isWeekendOrHoliday = startDate && (startDate.getDay() === 0 || startDate.getDay() === 6) ? 1.5 : 1;
    
    // Расчет надбавок за время
    const startTime = document.getElementById('lesson-time').value;
    const hour = parseInt(startTime.split(':')[0]);
    
    let morningSurcharge = 0;
    let eveningSurcharge = 0;
    
    if (hour >= 9 && hour < 12) {
        morningSurcharge = 400; // Надбавка за утренние часы
    } else if (hour >= 18 && hour < 20) {
        eveningSurcharge = 1000; // Надбавка за вечерние часы
    }

    // Расчет базовой стоимости
    let baseCost = (courseFeePerHour * durationInHours * isWeekendOrHoliday);
    baseCost = (baseCost + morningSurcharge + eveningSurcharge) * studentsNumber;
    
    // Применение скидок и дополнительных опций
    let totalCost = baseCost;

    // Скидка за раннюю регистрацию (-10%)
    if (document.getElementById('earlyRegistration').checked) {
        totalCost *= 0.9;
    }

    // Скидка за групповое обучение (-15%) - автоматически для 5 и более студентов
    const isGroupEnrollment = studentsNumber >= 5;
    document.getElementById('groupEnrollment').checked = isGroupEnrollment;
    if (isGroupEnrollment) {
        totalCost *= 0.85;
    }

    // Интенсивный курс (+20%)
    if (document.getElementById('intensiveCourse').checked) {
        totalCost *= 1.2;
    }

    // Дополнительные материалы (+2000₽/студент)
    if (document.getElementById('supplementary').checked) {
        totalCost += 2000 * studentsNumber;
    }

    // Персональные занятия (+1500₽/неделя)
    if (document.getElementById('personalized').checked) {
        totalCost += 1500 * durationInWeeks;
    }

    // Культурные экскурсии (+25%)
    if (document.getElementById('excursions').checked) {
        totalCost *= 1.25;
    }

    // Оценка уровня (+300₽)
    if (document.getElementById('assessment').checked) {
        totalCost += 300;
    }

    // Интерактивная платформа (+50%)
    if (document.getElementById('interactive').checked) {
        totalCost *= 1.5;
    }
    
    // Обновление отображения
    document.getElementById('total-cost').textContent = `${Math.round(totalCost)} Rubles`;
    
    // Обновление детальной информации о стоимости
    const costBreakdown = document.createElement('div');
    costBreakdown.innerHTML = `
        <small class="text-muted">
            <div>Базовая стоимость:</div>
            <div>Стоимость за час: ${courseFeePerHour}₽</div>
            <div>Длительность: ${durationInHours} часов (${durationInWeeks} недель)</div>
            <div>Количество студентов: ${studentsNumber}</div>
            <div>Базовая стоимость за курс (до умножения на количество студентов): ${Math.round(courseFeePerHour * durationInHours)}₽</div>
            <div>Базовая стоимость для ${studentsNumber} студентов: ${Math.round(baseCost)}₽</div>
            ${isWeekendOrHoliday > 1 ? '<div>Надбавка за выходные: ×1.5</div>' : ''}
            ${morningSurcharge ? `<div>Утренняя надбавка: +${morningSurcharge * studentsNumber}₽ (${morningSurcharge}₽ × ${studentsNumber})</div>` : ''}
            ${eveningSurcharge ? `<div>Вечерняя надбавка: +${eveningSurcharge * studentsNumber}₽ (${eveningSurcharge}₽ × ${studentsNumber})</div>` : ''}
            
            <div class="mt-3">Дополнительные опции:</div>
            ${document.getElementById('earlyRegistration').checked ? '<div class="text-success">Скидка за раннюю регистрацию: -10%</div>' : ''}
            ${isGroupEnrollment ? '<div class="text-success">Групповая скидка: -15%</div>' : ''}
            ${document.getElementById('intensiveCourse').checked ? '<div>Интенсивный курс: +20%</div>' : ''}
            ${document.getElementById('supplementary').checked ? `<div>Дополнительные материалы: +${2000 * studentsNumber}₽ (2000₽ × ${studentsNumber})</div>` : ''}
            ${document.getElementById('personalized').checked ? `<div>Персональные занятия: +${1500 * durationInWeeks}₽</div>` : ''}
            ${document.getElementById('excursions').checked ? '<div>Культурные экскурсии: +25%</div>' : ''}
            ${document.getElementById('assessment').checked ? '<div>Оценка уровня: +300₽</div>' : ''}
            ${document.getElementById('interactive').checked ? '<div>Интерактивная платформа: +50%</div>' : ''}
            
            <div class="mt-2"><strong>Итоговая стоимость: ${Math.round(totalCost)}₽</strong></div>
        </small>
    `;
    
    // Обновление отображения детальной информации о стоимости
    const existingBreakdown = document.querySelector('#total-cost').nextElementSibling;
    if (existingBreakdown && existingBreakdown.tagName === 'DIV') {
        existingBreakdown.remove();
    }
    document.getElementById('total-cost').parentNode.appendChild(costBreakdown);
    
    return Math.round(totalCost);
}

// Обработка отправки формы
async function handleOrderSubmit(event) {
    event.preventDefault(); // Предотвращение стандартной отправки формы
    console.log('Form submission started'); // Логирование начала отправки
    
    try {
        // Расчет итоговой стоимости
        const finalCost = calculateTotalCost();
        console.log('Calculated final cost:', finalCost); // Логирование итоговой стоимости
        
        // Сбор данных формы
        const formData = {
            student_name: document.getElementById('student-name').value,
            course_id: parseInt(document.getElementById('course-select').value),
            tutor_id: parseInt(document.getElementById('instructor-name').value),
            date_start: document.getElementById('lesson-date').value,
            time_start: document.getElementById('lesson-time').value,
            duration: parseInt(document.getElementById('lesson-duration').value),
            persons: parseInt(document.getElementById('group-size').value),
            price: finalCost,
            early_registration: document.getElementById('earlyRegistration').checked,
            group_enrollment: document.getElementById('groupEnrollment').checked,
            intensive_course: document.getElementById('intensiveCourse').checked,
            supplementary: document.getElementById('supplementary').checked,
            personalized: document.getElementById('personalized').checked,
            excursions: document.getElementById('excursions').checked,
            assessment: document.getElementById('assessment').checked,
            interactive: document.getElementById('interactive').checked
        };

        console.log('Form data collected:', formData); // Логирование собранных данных

        // Валидация обязательных полей
        if (!formData.course_id || !formData.date_start || !formData.time_start) {
            throw new Error('Пожалуйста, заполните все обязательные поля');
        }

        console.log('Sending request to API with price:', formData.price); // Логирование отправки запроса
        // Создание заказа
        const response = await api.orders.create(formData);
        console.log('API Response:', response); // Логирование ответа API
        
        // Показ сообщения об успехе
        showNotification('Заявка успешно отправлена! Стоимость: ' + formData.price + ' рублей', 'success');
        
        // Закрытие модального окна
        const modal = bootstrap.Modal.getInstance(document.getElementById('tutoringModal'));
        if (modal) {
            modal.hide();
        }
        
        // Сброс формы
        event.target.reset();
        
    } catch (error) {
        console.error('Error submitting form:', error); // Логирование ошибки
        showNotification(`Ошибка при отправке заявки: ${error.message}`, 'error'); // Показ уведомления об ошибке
    }
}

// Обработка выбора курса
function selectCourse(courseId) {
    const course = allCourses.find(c => c.id === courseId); // Поиск курса по ID
    document.getElementById('selected-course-id').value = courseId; // Установка ID курса
    document.getElementById('course-name').value = course.name; // Установка названия курса
    showNotification('Course selected', 'success'); // Показ уведомления
}

// Обработка выбора репетитора
function selectTutor(tutorId) {
    const tutor = allTutors.find(t => t.id === tutorId); // Поиск репетитора по ID
    document.getElementById('selected-tutor-id').value = tutorId; // Установка ID репетитора
    document.getElementById('tutor-name').value = tutor.name; // Установка имени репетитора
    showNotification('Tutor selected', 'success'); // Показ уведомления
}

// Обрезка текста с добавлением многоточия
function truncateText(text, maxLength) {
    if (!text) return ''; // Возврат пустой строки, если текст отсутствует
    if (text.length <= maxLength) return text; // Возврат текста, если он короче максимальной длины
    return text.substring(0, maxLength - 3) + '...'; // Обрезка текста и добавление многоточия
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    console.log('Showing notification:', message, type); // Логирование уведомления
    const notificationArea = document.getElementById('notification-area'); // Получение области уведомлений
    if (!notificationArea) {
        console.error('Notification area not found'); // Логирование ошибки, если область не найдена
        return;
    }
    
    const notificationContent = notificationArea.querySelector('.notification-content'); // Получение содержимого уведомления
    if (!notificationContent) {
        console.error('Notification content element not found'); // Логирование ошибки, если элемент не найден
        return;
    }
    
    notificationContent.textContent = message; // Установка текста уведомления
    notificationArea.className = `notification-area ${type}`; // Установка класса для стилизации
    notificationArea.style.display = 'flex'; // Отображение уведомления
    
    // Автоматическое скрытие уведомления через 5 секунд
    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 5000);
}

// Инициализация поиска репетиторов
async function initializeTutorSearch() {
    try {
        tutorsData = await api.tutors.getAll(); // Получение всех репетиторов
        console.log('Loaded tutors:', tutorsData); // Логирование загруженных данных
        updateTutorResults(tutorsData); // Обновление результатов поиска
        setupSearchListeners(); // Настройка обработчиков поиска
    } catch (error) {
        console.error('Error loading tutors:', error); // Логирование ошибки
        showNotification('Ошибка при загрузке списка репетиторов', 'error'); // Показ уведомления об ошибке
    }
}

// Настройка обработчиков поиска
function setupSearchListeners() {
    // Обработчики для фильтров
    document.getElementById('language-level').addEventListener('change', filterTutors); // Фильтр по уровню языка
    document.getElementById('min-experience').addEventListener('input', filterTutors); // Фильтр по минимальному опыту
    
    // Обработчики для дней недели
    const dayCheckboxes = document.querySelectorAll('input[name="available-days"]');
    dayCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterTutors); // Фильтр по доступным дням
    });

    // Обработчики для временных интервалов
    document.getElementById('time-from').addEventListener('change', filterTutors); // Фильтр по времени начала
    document.getElementById('time-to').addEventListener('change', filterTutors); // Фильтр по времени окончания
}

// Фильтрация репетиторов
function filterTutors() {
    const selectedLevel = document.getElementById('language-level').value; // Получение выбранного уровня языка
    const minExperience = document.getElementById('min-experience').value; // Получение минимального опыта
    const timeFrom = document.getElementById('time-from').value; // Получение времени начала
    const timeTo = document.getElementById('time-to').value; // Получение времени окончания
    
    // Получение выбранных дней
    const selectedDays = Array.from(document.querySelectorAll('input[name="available-days"]:checked'))
        .map(checkbox => checkbox.value);

    // Фильтрация репетиторов
    const filteredTutors = tutorsData.filter(tutor => {
        // Фильтр по уровню языка
        const levelMatch = !selectedLevel || 
            tutor.language_level.toLowerCase().includes(selectedLevel.toLowerCase());

        // Фильтр по опыту
        const experienceMatch = !minExperience || 
            tutor.work_experience >= parseInt(minExperience);

        // Фильтр по времени
        const timeMatch = (!timeFrom && !timeTo) || 
            (tutor.available_time_start <= timeFrom && tutor.available_time_end >= timeTo);

        // Возврат true только если все условия соблюдены
        return levelMatch && experienceMatch && timeMatch;
    });

    updateTutorResults(filteredTutors); // Обновление результатов
}

// Обновление результатов поиска репетиторов
function updateTutorResults(tutors) {
    const tableBody = document.querySelector('#tutors-table tbody'); // Получение тела таблицы
    if (!tableBody) {
        console.error('Table body not found'); // Логирование ошибки, если тело таблицы не найдено
        return;
    }
    
    tableBody.innerHTML = ''; // Очистка таблицы

    // Добавление строк для каждого репетитора
    tutors.forEach(tutor => {
        const row = document.createElement('tr'); // Создание строки
        row.innerHTML = `
            <td>${tutor.name}</td>
            <td>${tutor.language_level}</td>
            <td>${tutor.languages_spoken}</td>
            <td>${tutor.work_experience} years</td>
            <td>$${tutor.price_per_hour}</td>
            <td>
                <button class="btn btn-primary btn-select-tutor" data-tutor-id="${tutor.id}">
                    Select
                </button>
            </td>
        `;
        tableBody.appendChild(row); // Добавление строки в таблицу
    });

    // Обновление обработчиков кнопок выбора
    document.querySelectorAll('.btn-select-tutor').forEach(button => {
        button.addEventListener('click', handleTutorSelection); // Добавление обработчика выбора
    });
}

// Обработка выбора репетитора
function handleTutorSelection(event) {
    const button = event.target; // Получение нажатой кнопки
    const tutorId = button.dataset.tutorId; // Получение ID репетитора
    const tutor = tutorsData.find(t => t.id === parseInt(tutorId)); // Поиск репетитора по ID
    const row = button.closest('tr'); // Получение строки таблицы

    // Проверка, была ли строка уже выбрана
    if (row.classList.contains('selected')) {
        // Отмена выбора
        row.classList.remove('selected'); // Удаление класса выбранной строки
        button.classList.remove('selected'); // Удаление класса выбранной кнопки
        button.textContent = 'Select'; // Изменение текста кнопки
        // Скрытие детальной информации
        document.getElementById('selected-tutor-details').style.display = 'none';
        showNotification('Выбор преподавателя отменён', 'info'); // Показ уведомления
    } else {
        // Удаление выделения со всех строк и кнопок
        document.querySelectorAll('#tutors-table tbody tr').forEach(r => {
            r.classList.remove('selected');
        });
        document.querySelectorAll('.btn-select-tutor').forEach(btn => {
            btn.classList.remove('selected');
            btn.textContent = 'Select';
        });

        // Выделение новой строки и кнопки
        row.classList.add('selected'); // Добавление класса выбранной строки
        button.classList.add('selected'); // Добавление класса выбранной кнопки
        button.textContent = 'Selected'; // Изменение текста кнопки

        // Обновление и отображение детальной информации
        updateTutorDetails(tutor); // Обновление деталей репетитора
        document.getElementById('selected-tutor-details').style.display = 'block'; // Отображение деталей
        showNotification(`Выбран преподаватель: ${tutor.name}`, 'success'); // Показ уведомления
    }
}

// Обновление детальной информации о репетиторе
function updateTutorDetails(tutor) {
    const detailedRow = document.getElementById('detailed-tutor-row'); // Получение строки с деталями
    
    // Заполнение детальной информации
    detailedRow.innerHTML = `
        <td>
            <div class="tutor-name">${tutor.name}</div>
            <div class="tutor-email">${tutor.email || 'Email not provided'}</div>
        </td>
        <td>
            <div class="languages-list">
                <div>Teaching: ${tutor.languages_offered}</div>
                <div class="text-muted">Also speaks: ${tutor.languages_spoken}</div>
            </div>
        </td>
        <td>
            <div class="experience-details">
                <div>${tutor.work_experience} years</div>
                <div class="text-muted">Level: ${tutor.language_level}</div>
            </div>
        </td>
        <td>
            <div class="price-details">
                <div>$${tutor.price_per_hour}</div>
                <div class="text-muted">per hour</div>
            </div>
        </td>
        <td>
            <button class="btn btn-success w-100" onclick="confirmTutorSelection(${tutor.id})">
                Confirm Selection
            </button>
        </td>
    `;
}

// Подтверждение выбора репетитора
function confirmTutorSelection(tutorId) {
    const tutor = tutorsData.find(t => t.id === parseInt(tutorId)); // Поиск репетитора по ID
    if (tutor) {
        showNotification(`Вы выбрали преподавателя: ${tutor.name}`, 'success'); // Показ уведомления
        // Здесь можно добавить дополнительную логику, например, 
        // заполнение формы заказа или переход к следующему шагу
    }
} 