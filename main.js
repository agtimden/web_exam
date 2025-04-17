// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обработка уведомлений
    const notification = document.getElementById('notification-area'); // Получение элемента области уведомлений
    const closeButton = notification?.querySelector('.notification-close'); // Получение кнопки закрытия уведомления
    
    // Добавление обработчика клика на кнопку закрытия
    if (closeButton && notification) {
        closeButton.addEventListener('click', () => {
            notification.remove(); // Удаление уведомления при клике
        });
    }

    // Обработка формы запроса на репетиторство
    const tutoringForm = document.getElementById('tutoring-request-form'); // Получение формы
    if (tutoringForm) {
        // Добавление обработчика отправки формы
        tutoringForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Предотвращение стандартной отправки формы

            // Сбор данных формы
            const formData = {
                name: document.getElementById('name').value, // Имя пользователя
                email: document.getElementById('email').value, // Email пользователя
                message: document.getElementById('message').value // Сообщение пользователя
            };

            // Логирование данных формы
            console.log('Form submitted:', formData);
            // Показ уведомления об успешной отправке
            alert('Thank you! Your request has been submitted.');

            // Закрытие модального окна и сброс формы
            const modal = bootstrap.Modal.getInstance(document.getElementById('tutoringModal'));
            modal.hide();
            tutoringForm.reset();
        });
    }

    // Инициализация карты ресурсов
    const mapElement = document.getElementById('resourcesMap'); // Получение элемента карты
    if (mapElement) {
        // Загрузка Google Maps API
        const script = document.createElement('script'); // Создание элемента скрипта
        script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initGoogleMap`; // Установка источника скрипта
        script.async = true; // Асинхронная загрузка
        script.defer = true; // Отложенная загрузка
        document.head.appendChild(script); // Добавление скрипта в head документа
    }
});

// Функция инициализации карты
function initGoogleMap() {
    // Координаты центра карты (Москва)
    const center = { lat: 55.7558, lng: 37.6173 };
    
    // Создание карты
    const map = new google.maps.Map(document.getElementById('resourcesMap'), {
        zoom: 12, // Уровень масштабирования
        center: center, // Центр карты
        styles: [
            {
                "featureType": "poi.business", // Тип объектов
                "stylers": [
                    { "visibility": "off" } // Скрытие бизнес-точек
                ]
            }
        ]
    });

    // Массив ресурсов для отображения на карте
    const resources = [
        {
            position: { lat: 55.7539, lng: 37.6208 }, // Координаты центральной библиотеки
            type: 'library', // Тип ресурса
            title: 'Central Library' // Название ресурса
        },
        {
            position: { lat: 55.7589, lng: 37.6123 }, // Координаты языкового кафе
            type: 'cafe', // Тип ресурса
            title: 'Language Cafe "Speaking Club"' // Название ресурса
        },
        {
            position: { lat: 55.7629, lng: 37.6083 }, // Координаты культурного центра
            type: 'culture', // Тип ресурса
            title: 'Russian Cultural Center' // Название ресурса
        }
    ];

    // Добавление маркеров для каждого ресурса
    resources.forEach(resource => {
        // Создание маркера
        const marker = new google.maps.Marker({
            position: resource.position, // Позиция маркера
            map: map, // Карта для отображения
            title: resource.title, // Название маркера
            icon: getMarkerIcon(resource.type) // Иконка маркера
        });

        // Добавление обработчика клика на маркер
        marker.addListener('click', () => {
            // Создание информационного окна
            const infoWindow = new google.maps.InfoWindow({
                content: `<h3>${resource.title}</h3>` // Содержимое информационного окна
            });
            // Открытие информационного окна
            infoWindow.open(map, marker);
        });
    });
}

// Вспомогательная функция для получения иконки маркера
function getMarkerIcon(type) {
    // Объект с иконками для разных типов ресурсов
    const icons = {
        library: '📚', // Иконка для библиотеки
        cafe: '☕', // Иконка для кафе
        culture: '🎭' // Иконка для культурного центра
    };
    return icons[type] || '📍'; // Возврат иконки по типу или стандартной иконки
} 