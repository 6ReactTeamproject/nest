-- ======================================
-- CHARACTER SET 설정
-- ======================================
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;
SET collation_connection = utf8mb4_unicode_ci;

-- ======================================
-- SCHEMA CREATION
-- ======================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loginId VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NULL,
    giturl VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Member table
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    introduction TEXT NOT NULL,
    imageUrl VARCHAR(255) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semester table
CREATE TABLE IF NOT EXISTS semester (
    id INT PRIMARY KEY AUTO_INCREMENT,
    authorId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    imageUrl VARCHAR(255) NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_authorId (authorId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    userId INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    views INT DEFAULT 0,
    image VARCHAR(255) NULL,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    text TEXT NOT NULL,
    postId INT NOT NULL,
    userId INT NOT NULL,
    parentId INT DEFAULT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    likedUserIds TEXT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_postId (postId),
    INDEX idx_userId (userId),
    INDEX idx_parentId (parentId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    senderId INT NOT NULL,
    receiverId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_senderId (senderId),
    INDEX idx_receiverId (receiverId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh tokens table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(255) NOT NULL UNIQUE,
    userId INT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat rooms table (채팅방 정보)
CREATE TABLE IF NOT EXISTS chat_rooms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roomId VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_roomId (roomId),
    INDEX idx_createdBy (createdBy)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table (채팅 메시지)
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roomId VARCHAR(50) NOT NULL,
    userId INT NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (roomId) REFERENCES chat_rooms(roomId) ON DELETE CASCADE,
    INDEX idx_roomId (roomId),
    INDEX idx_userId (userId),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat room participants table (채팅방 참여자 - 선택사항)
CREATE TABLE IF NOT EXISTS chat_room_participants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    roomId VARCHAR(50) NOT NULL,
    userId INT NOT NULL,
    joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastReadAt TIMESTAMP NULL,
    FOREIGN KEY (roomId) REFERENCES chat_rooms(roomId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_participant (roomId, userId),
    INDEX idx_roomId (roomId),
    INDEX idx_userId (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- INSERT DATA
-- ======================================

-- Users (password는 bcrypt 해시: 1111, 2222, 2222, 4444, 5555)
INSERT IGNORE INTO users (id, loginId, password, name, image, giturl) VALUES
(1, 'heejun', '$2b$10$0zuFPcx/adkBizbuSeW0dudYyjifbe0J3kdjMyp4.baOIl5PQMgBK', '강희준', NULL, 'https://github.com/Kanghuijun'),
(2, 'seongmin', '$2b$10$2yXUv5vjJQjBqrXQqG8.G.NKZa6d9VZGcNo.UHMKCkrReKM9gwjvW', '김성민', NULL, 'https://github.com/kimmin042'),
(3, 'hyukbin', '$2b$10$OVVjzyEcv/40UBunILRZ7uoETZZ05wfghetB96vfsxWsyn0hg2tUy', '권혁빈', NULL, 'https://github.com/HB-KWon'),
(4, 'yoochan', '$2b$10$q72A8Wqy10RM5fPBewZsj.gAk1oZXmdZKAnz/es/VFtG0DoCN3Fcm', '이유찬', NULL, 'https://github.com/kgh6a'),
(5, 'chagnmin', '$2b$10$uQHk1625HRiSDkYQQMLXeeBB8xsOO7et0JOoRM3ulZyOBp3XA1cCq', '이창민', NULL, 'https://github.com/mu4404');

-- Semester
INSERT IGNORE INTO semester (id, authorId, title, description, imageUrl, createdAt) VALUES
(1, 1, '교토 고쇼 (京都御所)', '일본 천황이 거주하던 궁궐로, 일본 전통 건축양식과 궁중 문화를 직접 체험하며 일본어 속의 고어 및 의례 표현을 학습하기에 적합한 장소입니다.', 'https://images.unsplash.com/photo-1714066598304-7dcf3bd32c24?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-01-15 10:00:00'),
(2, 2, '에도 도쿄 박물관 (江戸東京博物館)', '에도 시대부터 현대에 이르는 일본의 생활과 도시 발전을 전시한 박물관으로, 일본어 자료 해석과 역사적 용어 학습에 도움이 됩니다.', 'https://media.triple.guide/triple-cms/c_limit,f_auto,h_1024,w_1024/6ee01bda-f840-4589-af23-a0bb4758858d.jpeg', '2024-02-20 11:00:00'),
(3, 3, '와세다 대학 캠퍼스 (早稲田大学)', '일본 내 인문학 연구로 유명한 명문 대학으로, 일본어 관련 강연이나 전시도 종종 개최되어 학문적 자극을 받을 수 있는 교육적 장소입니다.', 'https://images.unsplash.com/photo-1720238189486-2b090d9a9459?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-03-10 12:00:00'),
(4, 4, '교토 국제만화뮤지엄 (京都国際マンガミュージアム)', '일본어와 일본 대중문화를 동시에 공부할 수 있는 곳으로, 다양한 시대의 만화를 통해 언어의 변화와 문화를 함께 이해할 수 있습니다.', 'https://img.enjoy-osaka-kyoto-kobe.com/wp-content/uploads/2021/07/04112229/Kyoto-International-Manga-Museum06-1024x683.webp', '2024-04-05 13:00:00'),
(5, 5, '오사카 외국어 학원 (大阪外語学院)', '오사카 중심부에 위치한 외국인 대상 일본어 교육 전문 학원으로, 회화 중심 수업으로 다양한 과정이 개설되어 있습니다. 실생활 속 일본어를 익히고, 일본 문화와 지역사회에 자연스럽게 녹아들 수 있도록 돕는 커리큘럼을 제공합니다.', 'https://lh6.googleusercontent.com/proxy/_3QmCl4sfy-aIW5pS_g2miHEG6dfqGqUkgpKVImPwDe9Tpoq5rLUMnuTxQlwsDbFNb1wzvhEIXuK', '2024-05-12 14:00:00');

-- Posts
INSERT IGNORE INTO posts (id, title, content, userId, createdAt, views, image) VALUES
(3, '오사카 어디로 가고싶어요?', '저는 유니버셜 스튜디오 재팬에 가고싶습니다.', 3, '2025-05-10 09:00:00', 8, NULL),
(4, '저는 건물 좋아해서', '오사카 성이나 이케다 성에 가보고 싶네요', 3, '2025-05-18 10:00:00', 8, NULL),
(5, '일본 편의점 음식 추천', '편의점 BEST 3!\n1. 세븐일레븐 - 명란 마요 주먹밥\n2. 로손 - 치즈 인 치킨\n3. 패밀리마트 - 푸딩\n -> 이건 꼭 먹어야함 밤마다 먹으면 기분 좋아짐', 3, '2025-03-03 11:00:00', 24, NULL),
(6, '돈키호테 쇼핑리스트(후쿠오카 기준으로)', '사보리노 마스크팩,\n나라치카 립밤,\n간장 과자 + 우마이봉\n나라치카 립밤,\n간장 과자 + 우마이봉\n\n사보리노 마스크팩은 1분 안에 올인원 스킨케어까지 가능!!\n하면서 우마이봉 하나 먹으면 끝', 3, '2025-02-28 12:00:00', 13, NULL),
(7, '유후인 온천 마을 가보신 분?', '후쿠오카 근처라 들었는데 조용하고 힐링되나요? 혼자 여행이라 걱정도 좀 되네요ㅠㅠ', 4, '2024-08-29 13:00:00', 14, NULL),
(8, '편의점 말고 마트 간식 뭐가 좋을까요?', '돈키호테 말고 이온이나 세이유 같은 데서 사기 좋은 일본 간식 뭐 있을까요?? 추천 좀요!', 2, '2024-07-06 14:00:00', 11, NULL),
(9, '교토에서 기모노 체험 해보신 분?', '여름에도 많이들 입으시나요? 덥진 않을지 고민돼요. 사진은 예쁘게 나올 것 같긴 한데 ㅎㅎ', 1, '2025-05-25 15:00:00', 49, NULL),
(10, '일본 자판기 진짜 미쳤네요;;', '심야에 뜨끈한 옥수수수프 뽑아먹고 감동받았습니다. 자판기만 투어해도 재밌을 듯 ㅋㅋ', 5, '2024-12-20 16:00:00', 31, NULL),
(11, '바나나 먹으면 나한테 바나나?', '캬캬캬캬컄ㅋ', 2, '2023-04-15 17:00:00', 104, NULL);

-- Comments
INSERT IGNORE INTO comments (id, text, postId, userId, parentId, createdAt, likes, likedUserIds) VALUES
(1, 'UFO 야끼소바도 JMT', 5, 1, NULL, '2025-06-20 14:30:42', 4, NULL),
(2, '푸딩 못 참즤~', 5, 2, NULL, '2025-06-20 14:32:41', 1, NULL),
(3, '다음에 메론빵도 먹어보세요', 5, 4, NULL, '2025-06-20 14:33:08', 43, NULL),
(4, '유후인 진짜 조용하고 좋아요~ 노천탕 강추입니다', 7, 1, NULL, '2025-06-20 15:02:12', 5, NULL),
(5, '저도 혼자 갔다왔는데 혼자여서 더 힐링됐어요 ㅎㅎ', 7, 5, NULL, '2025-06-20 15:04:18', 2, NULL),
(6, '마트 간식은 감자칩 ''쟈가리코'' 추천이요! 맥주랑 찰떡!', 8, 3, NULL, '2025-06-20 15:05:44', 0, NULL),
(14, '이게 무슨 드립이야 ㅋㅋㅋㅋㅋ 터졌음', 11, 2, NULL, '2025-06-20 16:00:00', 0, NULL),
(15, '우마이봉 진짜 일본 갈 때마다 꼭 사요 ㅋㅋ', 6, 3, NULL, '2025-06-20 16:00:01', 0, NULL),
(16, '이케다 성은 덜 알려졌는데 은근 매력 있죠~', 4, 1, NULL, '2025-06-20 16:00:02', 0, NULL);

-- Messages
INSERT IGNORE INTO messages (id, senderId, receiverId, title, content, createdAt, isRead) VALUES
(1, 1, 2, '안녕하세요', '반가워요!', '2025-06-20 17:00:00', FALSE),
(2, 2, 1, 'Re: 안녕하세요', '저도 반가워요!', '2025-06-20 17:05:00', FALSE);

-- Members
INSERT IGNORE INTO members (id, user_id, name, introduction, imageUrl) VALUES
(1, 1, '강희준', '안녕하세요, 강희준입니다.', NULL),
(2, 2, '김성민', '안녕하세요, 김성민입니다.', NULL),
(3, 3, '권혁빈', '안녕하세요, 권혁빈입니다.', NULL),
(4, 4, '이유찬', '안녕하세요, 이유찬입니다.', NULL),
(5, 5, '이창민', '안녕하세요, 이창민입니다.', NULL);

-- Chat rooms (예시 채팅방)
INSERT IGNORE INTO chat_rooms (id, roomId, name, description, createdBy, createdAt) VALUES
(1, 'general', '일반 채팅방', '모든 사용자가 이용할 수 있는 일반 채팅방입니다.', 1, '2025-06-20 10:00:00'),
(2, 'travel', '여행 정보 채팅방', '여행 정보를 공유하는 채팅방입니다.', 2, '2025-06-20 10:00:00'),
(3, 'food', '음식 추천 채팅방', '맛집과 음식 추천을 공유하는 채팅방입니다.', 3, '2025-06-20 10:00:00');

-- Chat room participants (채팅방 참여자 예시)
INSERT IGNORE INTO chat_room_participants (id, roomId, userId, joinedAt) VALUES
(1, 'general', 1, '2025-06-20 10:00:00'),
(2, 'general', 2, '2025-06-20 10:00:00'),
(3, 'general', 3, '2025-06-20 10:00:00'),
(4, 'travel', 1, '2025-06-20 10:00:00'),
(5, 'travel', 4, '2025-06-20 10:00:00'),
(6, 'food', 2, '2025-06-20 10:00:00'),
(7, 'food', 3, '2025-06-20 10:00:00'),
(8, 'food', 5, '2025-06-20 10:00:00');

-- Chat messages (예시 채팅 메시지)
INSERT IGNORE INTO chat_messages (id, roomId, userId, message, createdAt) VALUES
(1, 'general', 1, '안녕하세요! 모두 환영합니다.', '2025-06-20 10:05:00'),
(2, 'general', 2, '반가워요!', '2025-06-20 10:06:00'),
(3, 'travel', 1, '오사카 여행 계획 중인데 추천해주세요!', '2025-06-20 10:10:00'),
(4, 'travel', 4, '유니버셜 스튜디오 재팬 강추입니다!', '2025-06-20 10:12:00'),
(5, 'food', 2, '일본 편의점 음식 중에 뭐가 제일 맛있나요?', '2025-06-20 10:15:00'),
(6, 'food', 3, '우마이봉 진짜 맛있어요!', '2025-06-20 10:16:00');
