DROP TYPE IF EXISTS tip_produs CASCADE;
CREATE TYPE tip_produs AS ENUM ('pui', 'vita', 'garnitura', 'desert', 'bautura');

DROP TYPE IF EXISTS subcategorie_bautura CASCADE;
CREATE TYPE subcategorie_bautura AS ENUM ('racoritoare', 'cafea', 'shake');

DROP TYPE IF EXISTS tip_meniu CASCADE;
CREATE TYPE tip_meniu AS ENUM ('standard', 'special');

DROP TYPE IF EXISTS tip_ambalaj CASCADE;
CREATE TYPE tip_ambalaj AS ENUM ('hartie', 'plastic', 'carton');

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
    imagine VARCHAR(300),
    disponibil BOOLEAN DEFAULT TRUE,
    data_adaugare DATE DEFAULT CURRENT_DATE,
    ambalaj tip_ambalaj
);

DROP TABLE IF EXISTS meniuri CASCADE;
CREATE TABLE meniuri (
    id serial PRIMARY KEY,
    nume VARCHAR(100) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL,
    tip tip_meniu NOT NULL,
    produse_incluse INT[] NOT NULL,
    imagine VARCHAR(300),
    data_adaugare DATE DEFAULT CURRENT_DATE
);

INSERT INTO produse (nume, descriere, pret, gramaj, calorii, tip, ingrediente, imagine, ambalaj)
VALUES
('Crispy Strips', 'Bucăți crocante de pui', 18.5, 250, 520, 'pui', 'pui, pesmet, condimente', 'crispy.png', 'hartie'),
('Aripioare picante', 'Aripioare marinate și prăjite', 19.9, 300, 680, 'pui', 'pui, condimente, ulei', 'aripioare.png', 'carton'),
('Burger Vita', 'Burger suculent din carne de vită', 24.0, 280, 850, 'vita', 'vita, chifla, rosii, salata, sos', 'burger-vita.png', 'plastic'),
('Cartofi prăjiți', 'Cartofi crocanți', 8.5, 150, 400, 'garnitura', 'cartofi, ulei, sare', 'cartofi.png', 'hartie'),
('Rondele de ceapă', 'Ceapă pane prăjită', 10.0, 180, 350, 'garnitura', 'ceapa, faina, pesmet', 'rondele-ceapa.png', 'hartie'),
('Cheesecake', 'Desert cremos cu brânză dulce', 14.0, 200, 450, 'desert', 'branza, oua, zahar, biscuiti', 'cheesecake.png', 'plastic'),
('Cola 0.5L', 'Băutură răcoritoare carbogazoasă', 6.5, 500, 210, 'bautura', 'apa, zahar, cofeina', 'cola.png', 'plastic'),
('Espresso', 'Cafea tare pentru zile grele', 7.0, 50, 5, 'bautura', 'cafea', 'espresso.png', 'hartie'),
('Shake vanilie', 'Milkshake cu vanilie', 12.0, 300, 380, 'bautura', 'lapte, zahar, vanilie', 'shake_vanilie.png', 'plastic'),
('Shake capsuni', 'Milkshake cu capsuni', 12.0, 300, 380, 'bautura', 'lapte, zahar, capsuni', 'shake_capsuni.png', 'plastic'),
('Nuggets', 'Bucăți mici de pui pane', 16.0, 220, 490, 'pui', 'pui, faina, ulei', 'nuggets.png', 'carton'),
('Brownie', 'Prăjitură cu ciocolată', 11.0, 180, 510, 'desert', 'ciocolata, zahar, oua', 'brownie.png', 'hartie');

INSERT INTO meniuri (nume, descriere, pret, tip, produse_incluse, imagine)
VALUES
('Meniu Pui Standard', 'Crispy Strips + cartofi + Cola', 28.5, 'standard', '{1, 4, 7}', 'meniu-pui.png'),
('Meniu Vita Deluxe', 'Burger Vita + rondele de ceapă + shake', 36.0, 'special', '{3, 5, 9}', 'meniu-vita.png'),
('Meniu Sweet Break', 'Cheesecake + Brownie + Espresso', 25.0, 'special', '{6, 11, 8}', 'meniu-dulce.png');
