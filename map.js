// Инициализация карты и маркеров
let map; // Глобальная переменная для хранения экземпляра карты
let markers = []; // Массив для хранения всех маркеров на карте

// Массив ресурсов с информацией о местах для изучения языка
const resources = [
    {
        type: 'library', // Тип ресурса - библиотека
        name: 'Central Library', // Название библиотеки
        description: 'Large collection of Russian language learning materials and literature', // Описание ресурса
        address: '12 Main Street, Moscow', // Адрес
        coordinates: [55.7558, 37.6173], // Координаты на карте
        hours: 'Mon-Fri: 9:00-20:00, Sat-Sun: 10:00-18:00', // Часы работы
        contact: '+7 (495) 123-4567', // Контактный телефон
        website: 'www.centrallibrary.com' // Веб-сайт
    },
    {
        type: 'cafe', // Тип ресурса - кафе
        name: 'Language Exchange Cafe', // Название кафе
        description: 'Popular spot for language exchange meetings and practice sessions', // Описание ресурса
        address: '45 Culture Street, Moscow', // Адрес
        coordinates: [55.7539, 37.6208], // Координаты на карте
        hours: 'Daily: 10:00-22:00', // Часы работы
        contact: '+7 (495) 765-4321', // Контактный телефон
        website: 'www.langcafe.com' // Веб-сайт
    },
    {
        type: 'cultural_center', // Тип ресурса - культурный центр
        name: 'Russian Culture Hub', // Название центра
        description: 'Cultural center offering language courses and cultural events', // Описание ресурса
        address: '78 Education Avenue, Moscow', // Адрес
        coordinates: [55.7522, 37.6156], // Координаты на карте
        hours: 'Mon-Sat: 9:00-21:00', // Часы работы
        contact: '+7 (495) 987-6543', // Контактный телефон
        website: 'www.rusculture.org' // Веб-сайт
    }
];

// Инициализация карты после загрузки API Яндекс.Карт
ymaps.ready(initMap);

// Основная функция инициализации карты
function initMap() {
    // Создание экземпляра карты
    map = new ymaps.Map('resources-map', {
        center: [55.7558, 37.6173], // Центр карты (координаты Москвы)
        zoom: 13, // Уровень масштабирования
        controls: ['zoomControl', 'searchControl'] // Элементы управления картой
    });

    // Добавление маркеров для каждого ресурса
    resources.forEach(addMarker);

    // Инициализация поиска и фильтров
    initializeSearch();
    initializeFilters();
}

// Функция добавления маркера на карту
function addMarker(resource) {
    // Создание маркера с заданными параметрами
    const marker = new ymaps.Placemark(
        resource.coordinates, // Координаты маркера
        {
            balloonContentHeader: resource.name, // Заголовок балуна
            balloonContentBody: `
                <p><strong>Type:</strong> ${capitalizeFirstLetter(resource.type)}</p>
                <p><strong>Address:</strong> ${resource.address}</p>
                <p><strong>Hours:</strong> ${resource.hours}</p>
                <p><strong>Contact:</strong> ${resource.contact}</p>
                <p><strong>Website:</strong> <a href="http://${resource.website}" target="_blank">${resource.website}</a></p>
                <p>${resource.description}</p>
            ` // Содержимое балуна
        },
        {
            preset: getMarkerPreset(resource.type) // Стиль маркера в зависимости от типа
        }
    );

    // Добавление маркера на карту и в массив маркеров
    map.geoObjects.add(marker);
    markers.push({ marker, resource });
}

// Функция получения стиля маркера в зависимости от типа ресурса
function getMarkerPreset(type) {
    // Объект с соответствием типов ресурсов и стилей маркеров
    const presets = {
        library: 'islands#blueBookIcon', // Стиль для библиотек
        cafe: 'islands#orangeCafeIcon', // Стиль для кафе
        cultural_center: 'islands#greenEducationIcon' // Стиль для культурных центров
    };
    return presets[type] || 'islands#blueIcon'; // Возврат стиля по умолчанию, если тип не найден
}

// Функция инициализации поиска
function initializeSearch() {
    const searchInput = document.getElementById('resource-search'); // Получение поля поиска
    if (searchInput) {
        // Добавление обработчика ввода в поле поиска
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase(); // Получение поискового запроса
            filterMarkers(searchTerm, getCurrentFilter()); // Фильтрация маркеров
        });
    }
}

// Функция инициализации фильтров
function initializeFilters() {
    const filterSelect = document.getElementById('resource-filter'); // Получение селекта фильтров
    if (filterSelect) {
        // Добавление обработчика изменения фильтра
        filterSelect.addEventListener('change', (e) => {
            filterMarkers(getSearchTerm(), e.target.value); // Фильтрация маркеров
        });
    }
}

// Функция получения текущего поискового запроса
function getSearchTerm() {
    const searchInput = document.getElementById('resource-search'); // Получение поля поиска
    return searchInput ? searchInput.value.toLowerCase() : ''; // Возврат запроса или пустой строки
}

// Функция получения текущего фильтра
function getCurrentFilter() {
    const filterSelect = document.getElementById('resource-filter'); // Получение селекта фильтров
    return filterSelect ? filterSelect.value : 'all'; // Возврат значения фильтра или 'all'
}

// Функция фильтрации маркеров
function filterMarkers(searchTerm, filterType) {
    // Перебор всех маркеров
    markers.forEach(({ marker, resource }) => {
        // Проверка соответствия поисковому запросу
        const matchesSearch = resource.name.toLowerCase().includes(searchTerm) ||
                            resource.description.toLowerCase().includes(searchTerm);
        // Проверка соответствия фильтру
        const matchesFilter = filterType === 'all' || resource.type === filterType;
        
        // Установка видимости маркера в зависимости от результатов фильтрации
        marker.options.set('visible', matchesSearch && matchesFilter);
    });
}

// Функция отображения детальной информации о ресурсе
function showResourceDetails(resourceName) {
    // Поиск ресурса по имени
    const resource = resources.find(r => r.name === resourceName);
    if (!resource) return; // Выход, если ресурс не найден

    // Получение элементов модального окна
    const modalTitle = document.querySelector('#resourceModal .modal-title');
    const modalBody = document.querySelector('#resourceModal .modal-body');
    
    if (modalTitle && modalBody) {
        // Установка заголовка и содержимого модального окна
        modalTitle.textContent = resource.name;
        modalBody.innerHTML = `
            <p><strong>Type:</strong> ${capitalizeFirstLetter(resource.type)}</p>
            <p><strong>Address:</strong> ${resource.address}</p>
            <p><strong>Hours:</strong> ${resource.hours}</p>
            <p><strong>Contact:</strong> ${resource.contact}</p>
            <p><strong>Website:</strong> <a href="http://${resource.website}" target="_blank">${resource.website}</a></p>
            <p><strong>Description:</strong> ${resource.description}</p>
        `;
        
        // Отображение модального окна
        const modal = new bootstrap.Modal(document.getElementById('resourceModal'));
        modal.show();
    }
}

// Вспомогательная функция для форматирования строки
function capitalizeFirstLetter(string) {
    // Преобразование первой буквы в верхний регистр и замена подчеркиваний на пробелы
    return string.charAt(0).toUpperCase() + string.slice(1).replace('_', ' ');
} 