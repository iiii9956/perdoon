Как запустить backend на другом ноутбуке
======================================

Это Spring Boot API социальной сети. Оно слушает порт 8080 и ходит в PostgreSQL на том же компьютере, где запущено.

Что установить на новом ноутбуке
--------------------------------
1. JDK 17 (например Eclipse Temurin 17).
   Проверка в PowerShell:
   java -version

2. PostgreSQL 15 или новее.
   Сервис PostgreSQL должен быть запущен.

3. Maven ставить не нужно: в папке проекта есть mvnw.cmd.

Скопируйте на ноутбук всю папку backend. Папку target можно не копировать.

База данных
-----------
1. Откройте src\main\resources\application.yaml.
2. Поля spring.datasource.username и spring.datasource.password замените на логин и пароль PostgreSQL этого ноутбука.
   Сейчас там логин postgres и пароль с вашего текущего компьютера. На другом ноутбуке пароль почти наверняка другой.
3. База должна называться social_network_bd, адрес jdbc:postgresql://localhost:5432/social_network_bd.
   Если PostgreSQL стоит на этом же ноутбуке, localhost менять не нужно.

Создайте пустую базу в psql или pgAdmin:

    CREATE DATABASE social_network_bd;

Таблицы создавать руками не нужно. При старте Hibernate сам создаст и дополнит их (ddl-auto: update).

Если публикация только с картинкой падает с ошибкой NOT NULL на колонке content, один раз выполните:

    ALTER TABLE posts ALTER COLUMN content DROP NOT NULL;

JWT
---
Секрет подписи токена лежит в jwt.secret. Это Base64, после декодирования не короче 32 байт.
Если переменная JWT_SECRET не задана, берётся ключ из application.yaml.
Одинаковый ключ на двух компьютерах нужен только если вы хотите, чтобы старые токены продолжали работать.

Сгенерировать новый ключ в PowerShell:

    [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))

Запуск из консоли
-----------------
Откройте PowerShell в папке backend.

Первый запуск скачает зависимости, нужен интернет.

Проверка тестов:

    .\mvnw.cmd test

Запуск сервера:

    .\mvnw.cmd spring-boot:run

Либо собрать jar и запустить его без Maven-обёртки:

    .\mvnw.cmd -DskipTests package
    java -jar target\backend-0.0.1-SNAPSHOT.jar

Свой JWT на один запуск:

    $env:JWT_SECRET = "сюда-вставьте-base64"
    .\mvnw.cmd spring-boot:run

Сервер готов, когда в консоли есть строка Started BackendApplication.
Остановка: Ctrl+C.

Как открыть API с другого устройства в той же сети
---------------------------------------------------
Узнайте IP ноутбука, где запущен backend:

    ipconfig

Ищите IPv4, например 192.168.0.20.
Проверка с другого устройства: http://192.168.0.20:8080

Если страница не открывается, разрешите входящие подключения на порт 8080 в брандмауэре Windows.
PostgreSQL с другого ноутбука открывать не нужно: к базе ходит только сам backend.

Фронтенд на Vite (порт 5173) по умолчанию разрешён только с http://localhost:5173.
Если сайт открыт с другого адреса, допишите его в application.yaml в app.cors.allowed-origins через запятую:

    allowed-origins: http://localhost:5173,http://192.168.0.15:5173

Тот же список используется для WebSocket. После правки перезапустите backend.

Чаты через WebSocket
--------------------
Писать можно только пользователям, у которых заявка в друзья уже принята (статус ACCEPTED).

Обычные HTTP-запросы, заголовок Authorization: Bearer <jwt>:

    GET  /api/chats
         список своих диалогов

    POST /api/chats/with/{userId}
         открыть или создать диалог с другом

    GET  /api/chats/{conversationId}/messages
         история

    POST /api/chats/{conversationId}/messages
         тело: { "content": "привет" }
         тоже рассылает сообщение по WebSocket

WebSocket-адрес:

    ws://IP:8080/ws?token=JWT

Токен можно передать и так:
- query-параметр token
- STOMP-заголовок Authorization: Bearer JWT
- STOMP-заголовок token

После подключения клиент подписывается на:

    /user/queue/messages
    /user/queue/errors

Отправка сообщения:

    назначение /app/chat.send
    тело JSON: { "conversationId": 1, "content": "привет" }

Сервер сохраняет сообщение в таблицу chat_messages и кладёт его обоим участникам в /user/queue/messages.
Ошибки (не друг, пустой текст, чужой диалог) приходят в /user/queue/errors.

Пример на фронтенде с библиотекой @stomp/stompjs:

    import { Client } from "@stomp/stompjs";

    const client = new Client({
      brokerURL: "ws://192.168.0.20:8080/ws?token=" + jwt
    });

    client.onConnect = () => {
      client.subscribe("/user/queue/messages", (frame) => {
        console.log(JSON.parse(frame.body));
      });
      client.subscribe("/user/queue/errors", (frame) => {
        console.log(JSON.parse(frame.body));
      });
    };

    client.activate();

    client.publish({
      destination: "/app/chat.send",
      body: JSON.stringify({ conversationId: 1, content: "привет" })
    });

Регистрация и вход, чтобы получить JWT:

    POST /api/auth/register
    { "email": "a@mail.com", "password": "password1" }

    POST /api/auth/login
    { "login": "a@mail.com", "password": "password1" }

В ответе login есть поле token. Его и подставляйте в Authorization и в WebSocket.
