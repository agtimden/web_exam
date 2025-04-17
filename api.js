// Константы для работы с API
const API_KEY = 'b76e208c-3e19-4004-ab0e-5f84b574e50c'; // Ключ для аутентификации в API
const BASE_URL = 'http://exam-api-courses.std-900.ist.mospolytech.ru/api'; // Базовый URL API

// Функции для работы с курсами
async function getCourses() {
    try {
        // Отправка GET-запроса для получения списка курсов
        const response = await fetch(`${BASE_URL}/courses?api_key=${API_KEY}`);
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        // Маппинг данных курсов в нужный формат
        return data.map(course => ({
            id: course.id, // Уникальный идентификатор курса
            name: course.name, // Название курса
            description: course.description, // Описание курса
            teacher: course.teacher, // Преподаватель курса
            level: course.level, // Уровень сложности курса
            total_length: course.total_length, // Общая длительность курса
            week_length: course.week_length, // Длительность занятий в неделю
            start_dates: course.start_dates, // Даты начала курса
            course_fee_per_hour: course.course_fee_per_hour, // Стоимость курса за час
            created_at: course.created_at // Дата создания курса
        }));
    } catch (error) {
        // Обработка ошибок при получении курсов
        console.error('Error fetching courses:', error);
        throw error;
    }
}

// Получение информации о конкретном курсе
async function getCourse(courseId) {
    try {
        // Отправка GET-запроса для получения информации о курсе
        const response = await fetch(`${BASE_URL}/courses/${courseId}?api_key=${API_KEY}`);
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        return data;
    } catch (error) {
        // Обработка ошибок при получении информации о курсе
        console.error('Error fetching course details:', error);
        throw error;
    }
}

// Функции для работы с репетиторами
async function getTutors() {
    try {
        // Отправка GET-запроса для получения списка репетиторов
        const response = await fetch(`${BASE_URL}/tutors?api_key=${API_KEY}`);
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        // Маппинг данных репетиторов в нужный формат
        return data.map(tutor => ({
            id: tutor.id, // Уникальный идентификатор репетитора
            name: tutor.name, // Имя репетитора
            work_experience: tutor.work_experience, // Опыт работы
            languages_spoken: tutor.languages_spoken, // Языки, которыми владеет репетитор
            languages_offered: tutor.languages_offered, // Языки, которым обучает репетитор
            language_level: tutor.language_level, // Уровень владения языком
            price_per_hour: tutor.price_per_hour // Стоимость занятий за час
        }));
    } catch (error) {
        // Обработка ошибок при получении репетиторов
        console.error('Error fetching tutors:', error);
        throw error;
    }
}

// Получение информации о конкретном репетиторе
async function getTutor(tutorId) {
    try {
        // Отправка GET-запроса для получения информации о репетиторе
        const response = await fetch(`${BASE_URL}/tutors/${tutorId}?api_key=${API_KEY}`);
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        return data;
    } catch (error) {
        // Обработка ошибок при получении информации о репетиторе
        console.error('Error fetching tutor details:', error);
        throw error;
    }
}

// Функции для работы с заявками
async function getOrders() {
    try {
        // Отправка GET-запроса для получения списка заявок
        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`);
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        return data;
    } catch (error) {
        // Обработка ошибок при получении заявок
        console.error('Error fetching orders:', error);
        throw error;
    }
}

// Получение информации о конкретной заявке
async function getOrder(orderId) {
    try {
        // Отправка GET-запроса для получения информации о заявке
        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`);
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        return data;
    } catch (error) {
        // Обработка ошибок при получении информации о заявке
        console.error('Error fetching order details:', error);
        throw error;
    }
}

// Создание новой заявки
async function createOrder(orderData) {
    try {
        // Логирование данных для создания заявки
        console.log('Creating order with data:', orderData);
        // Отправка POST-запроса для создания заявки
        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tutor_id: orderData.tutor_id, // ID репетитора
                course_id: orderData.course_id, // ID курса
                date_start: orderData.date_start, // Дата начала занятий
                time_start: orderData.time_start, // Время начала занятий
                duration: orderData.duration, // Длительность курса
                persons: orderData.persons, // Количество человек
                price: orderData.total_cost, // Общая стоимость
                student_name: orderData.student_name, // Имя студента
                early_registration: orderData.early_registration, // Ранняя регистрация
                group_enrollment: orderData.group_enrollment, // Групповое обучение
                intensive_course: orderData.intensive_course, // Интенсивный курс
                supplementary: orderData.supplementary, // Дополнительные материалы
                personalized: orderData.personalized, // Персональная программа
                excursions: orderData.excursions, // Культурные экскурсии
                assessment: orderData.assessment, // Оценка уровня
                interactive: orderData.interactive // Интерактивное обучение
            })
        });

        // Логирование статуса ответа
        console.log('API Response status:', response.status);
        // Преобразование ответа в JSON
        const responseData = await response.json();
        // Логирование данных ответа
        console.log('API Response data:', responseData);

        // Проверка успешности ответа
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. Message: ${responseData.message || 'Unknown error'}`);
        }
        
        return responseData;
    } catch (error) {
        // Обработка ошибок при создании заявки
        console.error('Error creating order:', error);
        throw error;
    }
}

// Вспомогательная функция для расчета стоимости заявки
function calculateOrderPrice(orderData) {
    let basePrice = 0;
    
    // Поиск информации о курсе и репетиторе
    const course = allCourses.find(c => c.id === orderData.course_id);
    const tutor = allTutors.find(t => t.id === orderData.tutor_id);
    
    if (course && tutor) {
        // Расчет базовой стоимости
        basePrice = course.course_fee_per_hour * orderData.duration;
        
        // Применение множителей для дополнительных опций
        if (orderData.group_enrollment) basePrice *= orderData.persons; // Групповое обучение
        if (orderData.intensive_course) basePrice *= 1.2; // Интенсивный курс
        if (orderData.early_registration) basePrice *= 0.9; // Ранняя регистрация
        if (orderData.supplementary) basePrice *= 1.1; // Дополнительные материалы
        if (orderData.personalized) basePrice *= 1.15; // Персональная программа
        if (orderData.excursions) basePrice *= 1.3; // Культурные экскурсии
    }
    
    return Math.round(basePrice); // Округление до целого числа
}

// Обновление существующей заявки
async function updateOrder(orderId, orderData) {
    try {
        // Отправка PUT-запроса для обновления заявки
        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        // Преобразование ответа в JSON
        const data = await response.json();
        return data;
    } catch (error) {
        // Обработка ошибок при обновлении заявки
        console.error('Error updating order:', error);
        throw error;
    }
}

// Удаление заявки
async function deleteOrder(orderId) {
    try {
        // Отправка DELETE-запроса для удаления заявки
        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE'
        });
        // Проверка успешности ответа
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return true;
    } catch (error) {
        // Обработка ошибок при удалении заявки
        console.error('Error deleting order:', error);
        throw error;
    }
}

// Экспорт всех функций API
const api = {
    courses: {
        getAll: getCourses, // Получение всех курсов
        getById: getCourse // Получение курса по ID
    },
    tutors: {
        getAll: getTutors, // Получение всех репетиторов
        getById: getTutor // Получение репетитора по ID
    },
    orders: {
        getAll: getOrders, // Получение всех заявок
        getById: getOrder, // Получение заявки по ID
        create: createOrder, // Создание новой заявки
        update: updateOrder, // Обновление заявки
        delete: deleteOrder // Удаление заявки
    }
};

// Сделать API доступным глобально
window.api = api;

// Тестирование подключения при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🔄 Тестируем подключение к API...');
        
        // Тестирование получения курсов
        console.log('📚 Загружаем курсы...');
        const courses = await getCourses();
        console.log('✅ Курсы успешно загружены:', courses);
        
        if (courses.length > 0) {
            console.log('📖 Загружаем детали первого курса...');
            const courseDetails = await getCourse(courses[0].id);
            console.log('✅ Детали курса:', courseDetails);
        }

        // Тестирование получения репетиторов
        console.log('👥 Загружаем репетиторов...');
        const tutors = await getTutors();
        console.log('✅ Репетиторы успешно загружены:', tutors);
        
        if (tutors.length > 0) {
            console.log('👤 Загружаем детали первого репетитора...');
            const tutorDetails = await getTutor(tutors[0].id);
            console.log('✅ Детали репетитора:', tutorDetails);
        }

        // Тестирование получения заявок
        console.log('📝 Загружаем заявки...');
        const orders = await getOrders();
        console.log('✅ Заявки успешно загружены:', orders);
        
        if (orders.length > 0) {
            console.log('📋 Загружаем детали первой заявки...');
            const orderDetails = await getOrder(orders[0].id);
            console.log('✅ Детали заявки:', orderDetails);
        }

        console.log('✅ Все API эндпоинты работают корректно!');
        
        // Вывод сводной информации
        console.log('📊 Сводная информация:');
        console.log(`- Количество курсов: ${courses.length}`);
        console.log(`- Количество репетиторов: ${tutors.length}`);
        console.log(`- Количество заявок: ${orders.length}`);

    } catch (error) {
        // Обработка ошибок при тестировании
        console.error('❌ Ошибка при тестировании подключения:', error);
    }
});
