DROP TYPE IF EXISTS tip_produs CASCADE;
DROP TYPE IF EXISTS subcategorie_bautura CASCADE;
DROP TYPE IF EXISTS tip_ambalaj CASCADE;

CREATE TYPE tip_produs AS ENUM ('pui', 'vita', 'garnitura', 'desert', 'bautura');
CREATE TYPE subcategorie_bautura AS ENUM ('racoritoare', 'cafea', 'shake');
CREATE TYPE tip_ambalaj AS ENUM ('hartie', 'plastic', 'carton');

DROP TABLE IF EXISTS asociere_set CASCADE;
DROP TABLE IF EXISTS seturi CASCADE;
DROP TABLE IF EXISTS produse CASCADE;

CREATE TABLE produse (
    id serial PRIMARY KEY,
    nume VARCHAR(100) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL CHECK (pret >= 0),
    gramaj INT CHECK (gramaj >= 0),
    calorii INT CHECK (calorii >= 0),
    tip tip_produs NOT NULL,
    subcategorie subcategorie_bautura,
    ingrediente TEXT,
    imagine VARCHAR(300), -- imagine principală
    folder_imagini VARCHAR(300), -- nou: folder cu toate imaginile produsului
    disponibil BOOLEAN DEFAULT TRUE,
    data_adaugare DATE DEFAULT CURRENT_DATE,
    ambalaj tip_ambalaj
);

CREATE TABLE seturi (
    id serial PRIMARY KEY,
    nume_set VARCHAR(100) UNIQUE NOT NULL,
    descriere_set TEXT,
    imagine VARCHAR(300)
);

CREATE TABLE asociere_set (
    id serial PRIMARY KEY,
    id_set INT NOT NULL REFERENCES seturi(id) ON DELETE CASCADE,
    id_produs INT NOT NULL REFERENCES produse(id) ON DELETE CASCADE
);

-- Inserturi actualizate cu folder_imagini (exemplu: folder numit ca numele produsului în minuscules fără spații)
INSERT INTO produse (nume, descriere, pret, gramaj, calorii, tip, subcategorie, ingrediente, imagine, folder_imagini, ambalaj)
VALUES
('Crispy Strips', 'Bucăți crocante de pui', 18.5, 250, 520, 'pui', NULL, 'pui, pesmet, condimente', 'crispy.png', 'crispy_strips', 'hartie'),
('Aripioare picante', 'Aripioare marinate și prăjite', 19.9, 300, 680, 'pui', NULL, 'pui, condimente, ulei', 'aripioare.png', 'aripioare_picante', 'carton'),
('Burger Vita', 'Burger suculent din carne de vită', 24.0, 280, 850, 'vita', NULL, 'vita, chifla, rosii, salata, sos', 'burger-vita.png', 'burger_vita', 'plastic'),
('Cartofi prăjiți', 'Cartofi crocanți', 8.5, 150, 400, 'garnitura', NULL, 'cartofi, ulei, sare', 'cartofi.png', 'cartofi_prajiti', 'hartie'),
('Rondele de ceapă', 'Ceapă pane prăjită', 10.0, 180, 350, 'garnitura', NULL, 'ceapa, faina, pesmet', 'rondele-ceapa.png', 'rondele_ceapa', 'hartie'),
('Cheesecake', 'Desert cremos cu brânză dulce', 14.0, 200, 450, 'desert', NULL, 'branza, oua, zahar, biscuiti', 'cheesecake.png', 'cheesecake', 'plastic'),
('Cola 0.5L', 'Băutură răcoritoare carbogazoasă', 6.5, 500, 210, 'bautura', 'racoritoare', 'apa, zahar, cofeina', 'cola.png', 'cola_05l', 'plastic'),
('Espresso', 'Cafea tare pentru zile grele', 7.0, 50, 5, 'bautura', 'cafea', 'cafea', 'espresso.png', 'espresso', 'hartie'),
('Shake vanilie', 'Milkshake cu vanilie', 12.0, 300, 380, 'bautura', 'shake', 'lapte, zahar, vanilie', 'shake_vanilie.png', 'shake_vanilie', 'plastic'),
('Shake capsuni', 'Milkshake cu capsuni', 13, 300, 380, 'bautura', 'shake', 'lapte, zahar, capsuni', 'shake_capsuni.png', 'shake_capsuni', 'plastic'),
('Nuggets', 'Bucăți mici de pui pane', 16.0, 220, 490, 'pui', NULL, 'pui, faina, ulei', 'nuggets.png', 'nuggets', 'carton'),
('Brownie', 'Prăjitură cu ciocolată', 11.0, 180, 510, 'desert', NULL, 'ciocolata, zahar, oua', 'brownie.png', 'brownie', 'hartie');

INSERT INTO seturi (nume_set, descriere_set, imagine)
VALUES
('Set Pui Clasic', 'Un set complet și crocant: bucăți fragede de pui crispy, cartofi prăjiți aurii și o Cola rece pentru un prânz rapid și satisfăcător.', 'puiclasic.png'),
('Set Vita Shake', 'O combinație suculentă pentru pofticioși: burger de vită cu legume proaspete, rondele de ceapă crocante și un milkshake cremos cu vanilie.', 'vitashake.png'),
('Set Dulce', 'Perfect pentru momente dulci: cheesecake fin, brownie intens cu ciocolată și un espresso tare pentru echilibru.', 'dulce.png'),
('Set Light', 'Un set ușor și energizant: aripioare picante bine condimentate și o băutură răcoritoare Cola, ideal pentru o gustare rapidă.', 'light.png'),
('Set Kids', 'Gustul preferat al celor mici: nuggets crocanți, cartofi prăjiți delicioși și un shake aromat de căpșuni – totul ambalat cu grijă pentru cei mici.','kids.png');

INSERT INTO asociere_set (id_set, id_produs) VALUES
(1, 1), (1, 4), (1, 7),
(2, 3), (2, 5), (2, 9),
(3, 6), (3, 12), (3, 8),
(4, 2), (4, 7),
(5, 11), (5, 4), (5, 10);
