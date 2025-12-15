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
    image TEXT NULL,
    giturl VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Member table
CREATE TABLE IF NOT EXISTS members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    introduction TEXT NOT NULL,
    imageUrl TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Semester table
CREATE TABLE IF NOT EXISTS semester (
    id INT PRIMARY KEY AUTO_INCREMENT,
    authorId INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    imageUrl TEXT NULL,
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
    image TEXT NULL,
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
    roomId VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
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
(4, 'chagnmin', '$2b$10$uQHk1625HRiSDkYQQMLXeeBB8xsOO7et0JOoRM3ulZyOBp3XA1cCq', '이창민', NULL, 'https://github.com/mu4404');

-- Semester
INSERT IGNORE INTO semester (id, authorId, title, description, imageUrl, createdAt) VALUES
(1, 1, '오사카 외국어 학원 (大阪外語学院)', '오사카 중심부에 위치한 외국인 대상 일본어 교육 전문 학원으로, 회화 중심 수업으로 다양한 과정이 개설되어 있습니다. 실생활 속 일본어를 익히고, 일본 문화와 지역사회에 자연스럽게 녹아들 수 있도록 돕는 커리큘럼을 제공합니다.', 'https://lh6.googleusercontent.com/proxy/_3QmCl4sfy-aIW5pS_g2miHEG6dfqGqUkgpKVImPwDe9Tpoq5rLUMnuTxQlwsDbFNb1wzvhEIXuK', '2024-05-12 14:00:00'),
(2, 2, '나라 공원 (奈良公園)', '조별활동의 일환으로 방문한 나라 공원은 야생 사슴과 인간이 공존하는 일본 특유의 자연·문화 환경을 직접 체험할 수 있는 장소입니다. 공원 내 안내판과 관광객을 위한 설명문을 통해 일상적인 일본어 표현과 지역 문화 관련 어휘를 접할 수 있었으며, 조원들과 함께 현장에서 관찰한 내용을 바탕으로 일본의 자연관과 전통적 가치관에 대해 토의하는 학습 활동을 진행하였습니다.', 'https://images.unsplash.com/photo-1726737699208-bee1475d3a3f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-06-01 10:00:00'),
(3, 3, '도다이지 (東大寺)', '나라 시대를 대표하는 불교 사찰인 도다이지는 조별답사를 통해 일본 불교 문화와 역사적 배경을 심층적으로 이해할 수 있었던 장소입니다. 대불전과 불상에 대한 설명 자료를 함께 읽고 해석하며 불교 관련 일본어 용어와 문어체 표현을 학습하였고, 조원 간 토론을 통해 일본 종교 문화가 사회 전반에 미친 영향에 대해 의견을 나누는 활동을 수행하였습니다.', 'https://images.unsplash.com/photo-1704199051944-9084749c9ee5?q=80&w=864&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-06-10 11:00:00'),
(4, 4, '후시미 이나리 신사 (伏見稲荷大社)', '수천 개의 도리이가 이어지는 후시미 이나리 신사는 조별활동을 통해 일본 신토 신앙과 상징 체계를 직접 체험한 장소입니다. 현장에서 신사 안내문과 설명 표지를 함께 읽으며 신토 관련 고유 명사와 의례 표현을 학습하였고, 조별로 도리이의 의미와 신앙적 상징성에 대해 조사·발표하는 학습 활동을 진행하였습니다.', 'https://images.unsplash.com/photo-1571754687694-15eb9a3ac00b?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-06-20 12:00:00'),
(5, 1, '기요미즈데라 (清水寺)', '교토를 대표하는 사찰인 기요미즈데라는 조별 현장학습을 통해 일본 전통 건축과 불교 문화의 특징을 관찰한 장소입니다. 사찰의 역사와 관련된 설명문을 조원들과 함께 해석하며 문어체 일본어 표현과 전통 문화 어휘를 학습하였고, 관광지로서의 역할과 종교 시설로서의 의미를 비교·분석하는 토의 활동을 수행하였습니다.', 'https://images.unsplash.com/photo-1568074621893-303fdea4735a?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-07-01 13:00:00'),
(6, 2, '기타노이진칸 (北野異人館街)', '고베의 기타노이진칸 거리는 조별활동을 통해 일본의 근대화 과정과 외국 문화 수용 양상을 이해할 수 있었던 장소입니다. 서양식 건축물에 대한 설명을 함께 조사하며 일본어에 포함된 외래어와 근대 사회 관련 어휘를 학습하였고, 조원들과 일본 사회가 외국 문화를 어떻게 받아들였는지에 대해 의견을 교환하는 학습 활동을 진행하였습니다.', 'https://media.istockphoto.com/id/665946702/ko/%EC%82%AC%EC%A7%84/kazamidori-%EA%B3%A0%EB%B2%A0.jpg?s=2048x2048&w=is&k=20&c=fgTACQtSE60o7NE1lT-SfZtTfqnFPxZjF0Y6_WaspGA=', '2024-07-10 14:00:00'),
(7, 3, '고베항 (神戸港)', '조별 현장학습으로 방문한 고베항은 일본의 국제 무역과 항만 산업을 이해할 수 있는 대표적인 장소입니다. 항만 시설과 주변 안내 자료를 통해 무역·해양 산업 관련 일본어 표현을 접하였으며, 조원들과 함께 고베항이 일본 경제와 지역 발전에 미친 영향에 대해 조사하고 정리하는 활동을 수행하였습니다.', 'https://images.unsplash.com/photo-1706172216985-a7fdb4efcfc8?q=80&w=776&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-07-20 15:00:00'),
(8, 4, '해유관 (海遊館)', '오사카에 위치한 해유관은 조별활동을 통해 해양 생태계와 환경 문제를 주제로 학습한 장소입니다. 전시 설명문을 함께 읽고 분석하며 일본어 설명문 구조와 과학·환경 관련 어휘를 학습하였고, 조원들과 각 전시의 주제를 정리하여 공유하는 협동 학습을 진행하였습니다.', 'https://images.unsplash.com/photo-1753256059077-8c435a568153?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-08-01 10:00:00'),
(9, 1, '고베 전자전문학교 (神戸電子専門学校)', '조별 견학 및 조사 대상으로 선정한 고베 전자전문학교는 일본의 실무 중심 교육 시스템을 이해할 수 있는 교육 기관입니다. 학교 소개 자료를 통해 전공 관련 일본어 표현과 학교 생활 어휘를 학습하였으며, 조원들과 일본 전문학교 교육이 취업과 산업 현장에 어떻게 연결되는지에 대해 분석하는 학습 활동을 진행하였습니다.', 'https://images.unsplash.com/photo-1715520174040-41f526543b2b?q=80&w=1770&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', '2024-09-01 13:00:00');

-- Posts
INSERT IGNORE INTO posts (id, title, content, userId, createdAt, views, image) VALUES
(3, '오사카 어디로 가고싶어요?', '저는 유니버셜 스튜디오 재팬에 가고싶습니다.', 3, '2025-05-10 09:00:00', 8, NULL),
(4, '저는 건물 좋아해서', '오사카 성이나 이케다 성에 가보고 싶네요', 3, '2025-05-18 10:00:00', 8, NULL),
(5, '일본 편의점 음식 추천', '편의점 BEST 3!\n1. 세븐일레븐 - 명란 마요 주먹밥\n2. 로손 - 치즈 인 치킨\n3. 패밀리마트 - 푸딩\n -> 이건 꼭 먹어야함 밤마다 먹으면 기분 좋아짐', 3, '2025-03-03 11:00:00', 24, NULL),
(6, '돈키호테 쇼핑리스트(후쿠오카 기준으로)', '사보리노 마스크팩,\n나라치카 립밤,\n간장 과자 + 우마이봉\n나라치카 립밤,\n간장 과자 + 우마이봉\n\n사보리노 마스크팩은 1분 안에 올인원 스킨케어까지 가능!!\n하면서 우마이봉 하나 먹으면 끝', 3, '2025-02-28 12:00:00', 13, NULL),
(7, '유후인 온천 마을 가보신 분?', '후쿠오카 근처라 들었는데 조용하고 힐링되나요? 혼자 여행이라 걱정도 좀 되네요ㅠㅠ', 3, '2024-08-29 13:00:00', 14, NULL),
(8, '편의점 말고 마트 간식 뭐가 좋을까요?', '돈키호테 말고 이온이나 세이유 같은 데서 사기 좋은 일본 간식 뭐 있을까요?? 추천 좀요!', 2, '2024-07-06 14:00:00', 11, NULL),
(9, '교토에서 기모노 체험 해보신 분?', '여름에도 많이들 입으시나요? 덥진 않을지 고민돼요. 사진은 예쁘게 나올 것 같긴 한데 ㅎㅎ', 1, '2025-05-25 15:00:00', 49, NULL),
(10, '일본 자판기 진짜 미쳤네요;;', '심야에 뜨끈한 옥수수수프 뽑아먹고 감동받았습니다. 자판기만 투어해도 재밌을 듯 ㅋㅋ', 4, '2024-12-20 16:00:00', 31, NULL),
(11, '바나나 먹으면 나한테 바나나?', '캬캬캬캬컄ㅋ', 2, '2023-04-15 17:00:00', 104, NULL);

-- Comments
INSERT IGNORE INTO comments (id, text, postId, userId, parentId, createdAt, likes, likedUserIds) VALUES
(1, 'UFO 야끼소바도 JMT', 5, 1, NULL, '2025-06-20 14:30:42', 4, NULL),
(2, '푸딩 못 참즤~', 5, 2, NULL, '2025-06-20 14:32:41', 1, NULL),
(3, '다음에 메론빵도 먹어보세요', 5, 4, NULL, '2025-06-20 14:33:08', 43, NULL),
(4, '유후인 진짜 조용하고 좋아요~ 노천탕 강추입니다', 7, 1, NULL, '2025-06-20 15:02:12', 5, NULL),
(5, '저도 혼자 갔다왔는데 혼자여서 더 힐링됐어요 ㅎㅎ', 7, 4, NULL, '2025-06-20 15:04:18', 2, NULL),
(6, '마트 간식은 감자칩 ''쟈가리코'' 추천이요! 맥주랑 찰떡!', 8, 3, NULL, '2025-06-20 15:05:44', 0, NULL),
(14, '이게 무슨 드립이야 ㅋㅋㅋㅋㅋ 터졌음', 11, 3, NULL, '2025-06-20 16:00:00', 0, NULL),
(15, '우마이봉 진짜 일본 갈 때마다 꼭 사요 ㅋㅋ', 6, 3, NULL, '2025-06-20 16:00:01', 0, NULL),
(16, '이케다 성은 덜 알려졌는데 은근 매력 있죠~', 4, 1, NULL, '2025-06-20 16:00:02', 0, NULL);

-- Messages
INSERT IGNORE INTO messages (id, senderId, receiverId, title, content, createdAt, isRead) VALUES
(1, 1, 2, '안녕하세요', '반가워요!', '2025-06-20 17:00:00', FALSE),
(2, 2, 1, 'Re: 안녕하세요', '저도 반가워요!', '2025-06-20 17:05:00', FALSE);

-- Members
INSERT IGNORE INTO members (id, user_id, name, introduction, imageUrl) VALUES
(1, 1, '강희준', '안녕하세요, 강희준입니다.', https://plus.unsplash.com/premium_photo-1683133319664-d77396ed81aa?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D),
(2, 2, '김성민', '안녕하세요, 김성민입니다.', https://images.unsplash.com/photo-1737729991003-521d47240eb3?q=80&w=2062&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D),
(3, 3, '권혁빈', '안녕하세요, 권혁빈입니다.', https://images.unsplash.com/photo-1752856408620-2e6fc6ac072f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D),
(4, 4, '이창민', '안녕하세요, 이창민입니다.', https://images.unsplash.com/photo-1737573477556-ac3ed2db618c?q=80&w=627&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D);

-- Chat rooms (예시 채팅방)
INSERT IGNORE INTO chat_rooms (roomId, name, description, createdBy, createdAt) VALUES
('general', '일반 채팅방', '모든 사용자가 이용할 수 있는 일반 채팅방입니다.', 1, '2025-06-20 10:00:00'),
('travel', '여행 정보 채팅방', '여행 정보를 공유하는 채팅방입니다.', 2, '2025-06-20 10:00:00'),
('food', '음식 추천 채팅방', '맛집과 음식 추천을 공유하는 채팅방입니다.', 3, '2025-06-20 10:00:00');

