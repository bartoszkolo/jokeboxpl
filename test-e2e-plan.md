# Kompleksowe testy E2E - Aplikacja Dowcipy

## URL: https://vqctaxdjcrop.space.minimax.io

## Plan testów E2E

### 1. Rejestracja użytkownika (PRIORYTET)
- Sprawdź czy formularz rejestracji działa
- Zarejestruj nowego użytkownika
- Sprawdź czy nie ma błędu "Database error"

### 2. Logowanie
- Zaloguj się na utworzone konto
- Sprawdź czy użytkownik widzi swoje dane

### 3. Strona główna i przeglądanie
- Sprawdź czy dowcip testowy się wyświetla
- Sprawdź filtry kategorii
- Sprawdź responsywność

### 4. Dodawanie dowcipu
- Dodaj nowy dowcip
- Sprawdź czy trafia do poczekalni (status: pending)

### 5. Głosowanie
- Zagłosuj na dowcip (up/down)
- Sprawdź czy liczniki się aktualizują

### 6. Ulubione
- Dodaj dowcip do ulubionych
- Sprawdź stronę ulubionych

### 7. Ranking
- Sprawdź czy ranking wyświetla dowcipy
- Przetestuj filtry czasowe

### 8. Panel admin (wymaga ustawienia is_admin=true)
- Sprawdź dostęp do panelu
- Przetestuj moderację dowcipów

## Status: W TRAKCIE
