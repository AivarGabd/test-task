// --- Функции сериализации и десериализации ---

/**
 * Сериализует массив чисел [1-300] в компактную строку Base64.
 * @param numbers Массив чисел для сериализации.
 * @returns Строка в формате Base64.
 */
function serialize(numbers) {
    if (!numbers || numbers.length === 0) {
        return "";
    }

    const count = numbers.length;

    // 1. Создаем заголовок: 2 байта для хранения количества чисел (до 65535).
    // ArrayBuffer представляет собой фрагмент бинарных данных.
    const headerBuffer = new ArrayBuffer(2);
    // DataView позволяет читать и записывать данные в ArrayBuffer.
    const headerView = new DataView(headerBuffer);
    // Записываем количество как 16-битное беззнаковое целое.
    // `false` в конце означает big-endian порядок байтов.
    headerView.setUint16(0, count, false);
    const headerBytes = new Uint8Array(headerBuffer);

    // 2. Преобразуем все числа в одну длинную битовую строку.
    // Каждое число кодируется 9 битами.
    const bitString = numbers.map(num => num.toString(2).padStart(9, '0')).join('');

    // 3. Дополняем битовую строку нулями до длины, кратной 8.
    const paddingLength = (8 - (bitString.length % 8)) % 8;
    const paddedBitString = bitString + '0'.repeat(paddingLength);

    // 4. Преобразуем битовую строку в массив байтов (Uint8Array).
    const dataBytes = new Uint8Array(paddedBitString.length / 8);
    for (let i = 0; i < dataBytes.length; i++) {
        const byteString = paddedBitString.substring(i * 8, (i + 1) * 8);
        dataBytes[i] = parseInt(byteString, 2);
    }

    // 5. Соединяем заголовок и данные.
    const fullPayload = new Uint8Array([...headerBytes, ...dataBytes]);

    // 6. Кодируем в Base64.
    // Сначала преобразуем байты в строку символов, затем кодируем.
    const binaryString = String.fromCharCode(...fullPayload);
    return btoa(binaryString);
}


/**
 * Десериализует строку Base64 обратно в массив чисел.
 * @param s Строка в формате Base64.
 * @returns Исходный массив чисел.
 */
function deserialize(s) {
    if (!s) {
        return [];
    }

    // 1. Декодируем строку из Base64.
    const binaryString = atob(s);
    const fullPayload = new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));

    // 2. Извлекаем заголовок и получаем количество чисел N.
    const headerView = new DataView(fullPayload.buffer, 0, 2);
    const count = headerView.getUint16(0, false);

    // 3. Получаем только байты с данными.
    const dataBytes = fullPayload.slice(2);

    // 4. Преобразуем байты данных в одну длинную битовую строку.
    let bitString = '';
    for (const byte of dataBytes) {
        bitString += byte.toString(2).padStart(8, '0');
    }

    // 5. Читаем битовую строку по 9 бит и преобразуем в числа.
    const numbers = [];
    for (let i = 0; i < count; i++) {
        const numBits = bitString.substring(i * 9, (i + 1) * 9);
        if (numBits.length < 9) break; // Защита от неполных данных
        numbers.push(parseInt(numBits, 2));
    }

    return numbers;
}


// --- Функция для тестирования ---

function runTest(description, numbers) {
    // Простейшая сериализация
    const simpleSerialization = numbers.join(',');
    const simpleLen = simpleSerialization.length;

    // Наша сериализация
    const compressedSerialization = serialize(numbers);
    const compressedLen = compressedSerialization.length;

    // Десериализация для проверки
    const deserializedNumbers = deserialize(compressedSerialization);

    // Сравниваем отсортированные массивы, т.к. порядок не важен
    const is_valid = JSON.stringify([...numbers].sort((a, b) => a - b)) === JSON.stringify([...deserializedNumbers].sort((a, b) => a - b));

    const compressionRatio = simpleLen > 0 && compressedLen > 0 ? (simpleLen / compressedLen).toFixed(2) : 'N/A';

    console.log(`--- Тест: ${description} ---`);
    console.log(`Исходные числа (первые 10): ${numbers.slice(0, 10).join(',')}... (Всего: ${numbers.length})`);
    console.log(`Простая строка (начало): '${simpleSerialization.substring(0, 60)}...' (Длина: ${simpleLen})`);
    console.log(`Сжатая строка: '${compressedSerialization}' (Длина: ${compressedLen})`);
    console.log(`Коэффициент сжатия: ${compressionRatio}x`);
    console.log(`Проверка корректности: ${is_valid ? 'УСПЕХ' : 'ПРОВАЛ'}`);
    console.log("-".repeat(25 + description.length) + "\n");
}

// --- Функции сериализации и десериализации ---

/**
 * Сериализует массив чисел [1-300] в компактную строку Base64.
 * @param numbers Массив чисел для сериализации.
 * @returns Строка в формате Base64.
 */
function serialize(numbers) {
    if (!numbers || numbers.length === 0) {
        return "";
    }

    const count = numbers.length;

    // 1. Создаем заголовок: 2 байта для хранения количества чисел (до 65535).
    // ArrayBuffer представляет собой фрагмент бинарных данных.
    const headerBuffer = new ArrayBuffer(2);
    // DataView позволяет читать и записывать данные в ArrayBuffer.
    const headerView = new DataView(headerBuffer);
    // Записываем количество как 16-битное беззнаковое целое.
    // `false` в конце означает big-endian порядок байтов.
    headerView.setUint16(0, count, false);
    const headerBytes = new Uint8Array(headerBuffer);

    // 2. Преобразуем все числа в одну длинную битовую строку.
    // Каждое число кодируется 9 битами.
    const bitString = numbers.map(num => num.toString(2).padStart(9, '0')).join('');

    // 3. Дополняем битовую строку нулями до длины, кратной 8.
    const paddingLength = (8 - (bitString.length % 8)) % 8;
    const paddedBitString = bitString + '0'.repeat(paddingLength);

    // 4. Преобразуем битовую строку в массив байтов (Uint8Array).
    const dataBytes = new Uint8Array(paddedBitString.length / 8);
    for (let i = 0; i < dataBytes.length; i++) {
        const byteString = paddedBitString.substring(i * 8, (i + 1) * 8);
        dataBytes[i] = parseInt(byteString, 2);
    }

    // 5. Соединяем заголовок и данные.
    const fullPayload = new Uint8Array([...headerBytes, ...dataBytes]);

    // 6. Кодируем в Base64.
    // Сначала преобразуем байты в строку символов, затем кодируем.
    const binaryString = String.fromCharCode(...fullPayload);
    return btoa(binaryString);
}


/**
 * Десериализует строку Base64 обратно в массив чисел.
 * @param s Строка в формате Base64.
 * @returns Исходный массив чисел.
 */
function deserialize(s) {
    if (!s) {
        return [];
    }

    // 1. Декодируем строку из Base64.
    const binaryString = atob(s);
    const fullPayload = new Uint8Array(binaryString.length).map((_, i) => binaryString.charCodeAt(i));

    // 2. Извлекаем заголовок и получаем количество чисел N.
    const headerView = new DataView(fullPayload.buffer, 0, 2);
    const count = headerView.getUint16(0, false);

    // 3. Получаем только байты с данными.
    const dataBytes = fullPayload.slice(2);

    // 4. Преобразуем байты данных в одну длинную битовую строку.
    let bitString = '';
    for (const byte of dataBytes) {
        bitString += byte.toString(2).padStart(8, '0');
    }

    // 5. Читаем битовую строку по 9 бит и преобразуем в числа.
    const numbers = [];
    for (let i = 0; i < count; i++) {
        const numBits = bitString.substring(i * 9, (i + 1) * 9);
        if (numBits.length < 9) break; // Защита от неполных данных
        numbers.push(parseInt(numBits, 2));
    }

    return numbers;
}


// --- Функция для тестирования ---

function runTest(description, numbers) {
    // Простейшая сериализация
    const simpleSerialization = numbers.join(',');
    const simpleLen = simpleSerialization.length;

    // Наша сериализация
    const compressedSerialization = serialize(numbers);
    const compressedLen = compressedSerialization.length;

    // Десериализация для проверки
    const deserializedNumbers = deserialize(compressedSerialization);

    // Сравниваем отсортированные массивы, т.к. порядок не важен
    const is_valid = JSON.stringify([...numbers].sort((a, b) => a - b)) === JSON.stringify([...deserializedNumbers].sort((a, b) => a - b));

    const compressionRatio = simpleLen > 0 && compressedLen > 0 ? (simpleLen / compressedLen).toFixed(2) : 'N/A';

    console.log(`--- Тест: ${description} ---`);
    console.log(`Исходные числа (первые 10): ${numbers.slice(0, 10).join(',')}... (Всего: ${numbers.length})`);
    console.log(`Простая строка (начало): '${simpleSerialization.substring(0, 60)}...' (Длина: ${simpleLen})`);
    console.log(`Сжатая строка: '${compressedSerialization}' (Длина: ${compressedLen})`);
    console.log(`Коэффициент сжатия: ${compressionRatio}x`);
    console.log(`Проверка корректности: ${is_valid ? 'УСПЕХ' : 'ПРОВАЛ'}`);
    console.log("-".repeat(25 + description.length) + "\n");
}