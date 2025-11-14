CREATE DATABASE filminis;
USE filminis;
-- Tabelas principais

CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE atores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE diretores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE linguagens (
    id_linguagem INT AUTO_INCREMENT PRIMARY KEY,
    linguagem VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE filmes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    ano INT,
    sinopse TEXT NOT NULL, 
    poster_url VARCHAR(255),
    duracao VARCHAR(20),
    id_linguagem INT NOT NULL,
    FOREIGN KEY (id_linguagem) REFERENCES linguagens(id_linguagem)
);

CREATE TABLE solicitacoes_adicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    ano INT,
    sinopse TEXT NOT NULL,
    poster_url VARCHAR(255),
    duracao VARCHAR(20),
    generos_texto VARCHAR(255),
    diretores_texto VARCHAR(255),
    atores_texto VARCHAR(255),
    solicitado_por_id INT NOT NULL,
    id_linguagem INT NOT NULL,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    FOREIGN KEY (solicitado_por_id) REFERENCES usuarios(id),
    FOREIGN KEY (id_linguagem) REFERENCES linguagens(id_linguagem)
);

CREATE TABLE solicitacoes_edicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT NOT NULL,
    campo_alterado VARCHAR(100) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    solicitado_por_id INT NOT NULL,
    data_solicitacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovado', 'rejeitado') DEFAULT 'pendente',
    FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE,
    FOREIGN KEY (solicitado_por_id) REFERENCES usuarios(id)
);

-- Tabelas intermediarias

CREATE TABLE filmes_atores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT NOT NULL,
    ator_id INT NOT NULL,
    FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE,
    FOREIGN KEY (ator_id) REFERENCES atores(id) ON DELETE CASCADE
);

CREATE TABLE filmes_diretores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT NOT NULL,
    diretor_id INT NOT NULL,
    FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE,
    FOREIGN KEY (diretor_id) REFERENCES diretores(id) ON DELETE CASCADE
);

CREATE TABLE filmes_generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filme_id INT NOT NULL,
    genero_id INT NOT NULL,
    FOREIGN KEY (filme_id) REFERENCES filmes(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
);

-- Inserts
INSERT INTO roles (nome) VALUES ('comum'), ('adm');

INSERT INTO usuarios (nome, email, senha, role_id) VALUES
('user', 'user@gmail.com', '$2b$12$u5EawdCHDFN0RBIummfqV.jdWZB7pLQcjTmijbcK2t4f801BIjLX6', 1),
('adm', 'adm@gmail.com', '$2b$12$Ptga2K5uDbGMf.lHVNbp0.mARAQCrMZFb5kgtTfQGDxa8sFDnung.', 2);

INSERT INTO linguagens (linguagem) VALUES
('Português'),('Inglês'),('Espanhol'),('Francês'),('Alemão'),
('Italiano'),('Japonês'),('Coreano'),('Mandarim'),('Hindi');

INSERT INTO generos (nome) VALUES
('Animação'), ('Aventura'), ('Comédia'), ('Fantasia'), ('Família'),
('Musical'), ('Conto de Fadas'), ('Educativo'), ('Terror'),
('Misterio'), ('Ficção Científica');

INSERT INTO filmes (id, titulo, ano, sinopse, poster_url, duracao, id_linguagem) VALUES
(1, 'Divertida Mente 2', 2024, 'Novas emoções chegam à mente da adolescente Riley: Ansiedade, Tédio, Inveja e Vergonha, causando um caos na sala de controle.', 'https://p2.trrsf.com/image/fget/cf/940/0/images.terra.com/2024/04/19/1325831308-poster.jpg', '1h 36m', 2),
(2, 'Super Mario Bros: O Filme', 2023, 'Mario e Luigi, dois encanadores, vão parar no Reino dos Cogumelos, governado pela Princesa Peach, e precisam salvá-lo das garras do temível Bowser.', 'https://cdn.awsli.com.br/800x800/1610/1610163/produto/208807923/poster-super-mario-bros-o-filme-i-f04111d3.jpg', '1h 32m', 7),
(3, 'Encanto', 2021, 'Na Colômbia, a mágica família Madrigal vive em uma casa encantada. Mirabel é a única sem um dom mágico, mas pode ser a última esperança da família.', 'https://br.web.img3.acsta.net/pictures/21/09/29/18/02/2861381.jpg', '1h 42m', 3),
(4, 'Barbie e o Castelo de Diamante', 2008, 'Liana e Alexa saem da sua cabana humilde para vender flores na vila e acabam conhecendo Melody, a guardiã do Castelo de Diamante. As duas decidem ajudá-la a impedir que a chave do castelo seja roubada por Lídia, uma musa egoísta.', 'https://i.pinimg.com/736x/e3/a0/ec/e3a0ec94cdb45d3f7e73728e203567df.jpg', '1h 19m', 2),
(5, 'Homem-Aranha no Aranhaverso', 2018, 'Miles Morales descobre um multiverso com diferentes Homens-Aranha e precisa se unir a eles para salvar todas as realidades.', 'https://www.sonypictures.com.br/sites/brazil/files/2023-06/1400x2100.jpg', '1h 57m', 1),
(6, 'Elementos', 2023, 'Na Cidade Elemento, a impetuosa Faísca (fogo) e o tranquilo Gota (água) descobrem que, apesar de opostos, eles têm muito em comum.', 'https://br.web.img3.acsta.net/pictures/22/11/17/20/58/0132283.jpg', '1h 41m', 2),
(7, 'Soul', 2020, 'Joe, um professor de música, sofre um acidente e sua alma é transportada para o "Pré-Vida". Ele precisa da ajuda da alma 22 para voltar ao seu corpo.', 'https://apostiladecinema.com.br/wp-content/uploads/2021/01/soul-poster-scaled.jpg', '1h 40m', 2),
(8, 'Red: Crescer é uma Fera', 2022, 'Mei Lee é uma garota de 13 anos que se transforma em um panda vermelho gigante sempre que fica muito animada ou estressada.', 'https://ingresso-a.akamaihd.net/prd/img/movie/red-crescer-e-uma-fera/ff8826af-fead-443a-917d-215bcee486e2.jpg', '1h 40m', 2),
(9, 'Viva: A Vida é uma Festa', 2017, 'Miguel sonha em ser músico, mas sua família baniu a música. Ele acidentalmente vai para a Terra dos Mortos e descobre seu passado.', 'https://br.web.img3.acsta.net/pictures/17/12/07/11/33/0502209.jpg', '1h 49m', 3),
(10, 'Frozen 2', 2019, 'Elsa, Anna, Kristoff, Olaf e Sven partem para a floresta encantada para descobrir a origem dos poderes de Elsa e salvar o reino de Arendelle.', 'https://ingresso-a.akamaihd.net/img/cinema/cartaz/22550-cartaz.jpg', '1h 43m', 1),
(11, 'Zootopia', 2016, 'A coelha Judy Hopps se torna a primeira de sua espécie na polícia e precisa desvendar um caso misterioso com a ajuda da raposa Nick Wilde.', 'https://ingresso-a.akamaihd.net/img/cinema/cartaz/14839-cartaz.jpg', '1h 48m', 1),
(12, 'Os Incríveis 2', 2018, 'Helena Pêra (Mulher-Elástica) assume os holofotes, enquanto Beto (Sr. Incrível) cuida das crianças. Um novo vilão ameaça a cidade.', 'https://pbs.twimg.com/media/DgOW5tlWsAEzwla.jpg', '1h 58m', 2),
(13, 'Toy Story 4', 2019, 'Woody, Buzz e a turma embarcam em uma viagem com Bonnie, que cria um novo brinquedo chamado Garfinho, que está em crise existencial.', 'https://m.media-amazon.com/images/I/81haAVSwaWL._UF894,1000_QL80_.jpg', '1h 40m', 2),
(14, 'Procurando Dory', 2016, 'Dory, a peixinha com perda de memória recente, de repente se lembra de seus pais e parte em uma jornada épica pelo oceano para encontrá-los.', 'https://br.web.img2.acsta.net/pictures/16/06/30/20/49/544752.jpg', '1h 37m', 2),
(15, 'Luca', 2021, 'Na Riviera Italiana, dois jovens monstros marinhos, Luca e Alberto, se disfarçam de humanos para viver um verão inesquecível.', 'https://br.web.img2.acsta.net/r_1280_720/pictures/21/04/28/15/52/1967183.jpg', '1h 35m', 6),
(16, 'Moana', 2016, 'A corajosa Moana parte em uma missão ousada pelo oceano para salvar seu povo, contando com a ajuda do semideus Maui.', 'https://m.media-amazon.com/images/I/A1JOaV3B6fL._AC_SL1500_.jpg', '1h 47m', 2),
(17, 'Carros 3', 2017, 'Relâmpago McQueen precisa provar que ainda é o melhor carro de corrida contra uma nova geração de corredores ultrarrápidos.', 'https://ingresso-a.akamaihd.net/img/cinema/cartaz/19186-cartaz.jpg', '1h 42m', 2),
(18, 'O Rei do Show', 2017, 'A história de P.T. Barnum, um showman que saiu do nada para criar um espetáculo que se tornou uma sensação mundial e celebrou a diversidade.', 'https://br.web.img2.acsta.net/pictures/17/11/14/20/38/1278231.jpg', '1h 45m', 2),
(19, 'Lightyear', 2022, 'A história de origem do patrulheiro espacial Buzz Lightyear, o herói que inspirou o brinquedo de Toy Story.', 'https://ingresso-a.akamaihd.net/prd/img/movie/lightyear/799e6039-8200-4925-aeaa-98ef20a319bb.jpg', '1h 45m', 1),
(20, 'O Bom Dinossauro', 2015, 'Em um mundo onde os dinossauros não foram extintos, o jovem Arlo faz uma amizade improvável com um menino humano chamado Spot.', 'https://ingresso-a.akamaihd.net/img/cinema/cartaz/13406-cartaz.jpg', '1h 33m', 2);

INSERT INTO atores (nome) VALUES
('Alegria'), ('Ansiedade'), ('Tristeza'), ('Raiva'), ('Mario'), ('Luigi'),
('Princesa Peach'), ('Bowser'),
('Mirabel Madrigal'), ('Bruno Madrigal'), ('Isabela Madrigal'),
('Liana '), ('Alexa'), ('Melody'),
('Miles Morales'), ('Peter B. Parker'), ('Gwen Stacy'),
('Faísca (Ember)'), ('Gota (Wade)'), ('Fagulha (Bernie)'),
('Joe Gardner'), ('22'), ('Sr. Bigodes (Gato)'),
('Mei Lee'), ('Ming Lee'), ('Priya'), ('Miriam'),
('Miguel Rivera'), ('Héctor'), ('Ernesto de la Cruz'),
('Elsa'), ('Anna'), ('Olaf'), ('Kristoff'),
('Judy Hopps'), ('Nick Wilde'), ('Flash'),
('Beto Pêra (Sr. Incrível)'), ('Helena Pêra (Mulher-Elástica)'), ('Flecha'), ('Zezé Pêra'),
('Woody'), ('Buzz Lightyear'), ('Garfinho (Forky)'), ('Betty'),
('Dory'), ('Nemo'), ('Marlin'), ('Hank'),
('Luca Paguro'), ('Alberto Scorfano'), ('Giulia Marcovaldo'),
('Moana'), ('Maui'), ('Heihei'),
('Relâmpago McQueen'), ('Cruz Ramirez'), ('Jackson Storm'),
('P.T. Barnum'), ('Phillip Carlyle'), ('Anne Wheeler'),
('Sox'), ('Izzy Hawthorne'),
('Arlo'), ('Spot');

INSERT INTO diretores (nome) VALUES
('Kelsey Mann'), ('Aaron Horvath'), ('Byron Howard'), (' Gino Nichele'),
('Peter Ramsey'), ('Peter Sohn'), ('Pete Docter'), ('Domee Shi'),
('Lee Unkrich'), ('Chris Buck'), ('Rich Moore'), ('Brad Bird'),
('Josh Cooley'), ('Andrew Stanton'), ('Enrico Casarosa'),
('Ron Clements'), ('Brian Fee'), ('Michael Gracey'),
('Angus MacLane');

INSERT INTO filmes_atores (filme_id, ator_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 5), (2, 6), (2, 7), (2, 8),
(3, 9), (3, 10), (3, 11),
(4, 12), (4, 13), (4, 14),
(5, 15), (5, 16), (5, 17),
(6, 18), (6, 19), (6, 20),
(7, 21), (7, 22), (7, 23),
(8, 24), (8, 25), (8, 26), (8, 27),
(9, 28), (9, 29), (9, 30),
(10, 31), (10, 32), (10, 33), (10, 34),
(11, 35), (11, 36), (11, 37),
(12, 38), (12, 39), (12, 40), (12, 41),
(13, 42), (13, 43), (13, 44), (13, 45),
(14, 46), (14, 47), (14, 48), (14, 49),
(15, 50), (15, 51), (15, 52),
(16, 53), (16, 54), (16, 55),
(17, 56), (17, 57), (17, 58),
(18, 59), (18, 60), (18, 61),
(19, 43), (19, 62), (19, 63),
(20, 64), (20, 65);

INSERT INTO filmes_diretores (filme_id, diretor_id) VALUES
(1,1),(2,2),(3,3),(4,4),(5,5),
(6,6),(7,7),(8,8),(9,9),(10,10),
(11,11),(12,12),(13,13),(14,14),
(15,15),(16,16),(17,17),(18,18),
(19,19),(20,6);

INSERT INTO filmes_generos (filme_id, genero_id) VALUES
(1, 1), (1, 3), (1, 5), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 5),
(3, 1), (3, 5), (3, 6), (3, 4),
(4, 2), (4, 4), (4, 6), (4, 7),
(5, 1), (5, 2), (5, 11), (5, 5),
(6, 1), (6, 3), (6, 5), (6, 4),
(7, 1), (7, 4), (7, 6), (7, 5),
(8, 1), (8, 3), (8, 5), (8, 4),
(9, 1), (9, 2), (9, 6), (9, 5),
(10, 1), (10, 2), (10, 7), (10, 6),
(11, 1), (11, 2), (11, 3), (11, 5),
(12, 1), (12, 2), (12, 5), (12, 11),
(13, 1), (13, 2), (13, 3), (13, 5),
(14, 1), (14, 2), (14, 3), (14, 5),
(15, 1), (15, 2), (15, 4), (15, 5),
(16, 1), (16, 2), (16, 7), (16, 6),
(17, 1), (17, 2), (17, 3), (17, 8),
(18, 6), (18, 5),  (18, 3),
(19, 1), (19, 2), (19, 11), (19, 5),
(20, 1), (20, 2), (20, 5);