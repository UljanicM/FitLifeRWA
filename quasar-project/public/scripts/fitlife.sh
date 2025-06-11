#!/bin/bash

# Globalne varijable koje pamte stanje aplikacije
user_role=""
email=""

# Funkcija za pauzu, ekvivalent "pause" naredbi
function pause() {
    read -n 1 -s -r -p "Pritisnite bilo koju tipku za nastavak..."
    echo
}

# Funkcija za čišćenje ekrana, ekvivalent "cls"
function clear_screen() {
    clear
}

# ======================================================================
#                          ZAJEDNIČKE STRANICE
# ======================================================================

function onama_page() {
    clear_screen
    echo "======================================================================"
    echo "                                 O nama"
    echo "======================================================================"
    echo ""
    echo "   FitLife je aplikacija namijenjena praćenju vašeg napretka"
    echo "   u teretani, planiranju treninga i prehrane."
    echo ""
    echo "   Naš cilj je pomoći vam da ostvarite svoje fitness ciljeve"
    echo "   na jednostavan i učinkovit način."
    echo ""
    echo "----------------------------------------------------------------------"
    pause
}

function trazitrenere_page() {
    clear_screen
    echo "======================================================================"
    echo "                              Popis Trenera"
    echo "======================================================================"
    echo ""
    echo "Pretraži po imenu, prezimenu ili stručnosti: [_____________________]"
    echo ""
    echo "----------------------------------------------------------------------"
    echo ""
    echo "   Ime: Marta Vuković"
    echo "   Stručnost: Zumba"
    echo ""
    echo "   Ime: Ivan Horvat"
    echo "   Stručnost: Fitness"
    echo ""
    pause
}

function popisplanova_page() {
    clear_screen
    echo "======================================================================"
    echo "                            Odaberite svoj plan"
    echo "======================================================================"
    echo ""
    echo "[...lista planova...]"
    echo ""
    echo "   [1] Bodybuilding za početnike"
    echo "       Trajanje: 90 dana, Cijena: 70.00 EUR"
    echo ""
    echo "   [2] Funkcionalni trening za snagu"
    echo "       Trajanje: 75 dana, Cijena: 64.99 EUR"
    echo ""
    pause
}

# ======================================================================
#                          ADMINISTRATORSKI DIO
# ======================================================================

function unesitrenere_page() {
    clear_screen
    echo "======================================================================"
    echo "                          FitLife admin"
    echo "======================================================================"
    echo ""
    echo "Unesite podatke trenera za registraciju."
    echo ""
    read -p "   Ime trenera: " ime_t
    read -p "   Prezime trenera: " prezime_t
    read -p "   Email trenera: " email_t
    echo ""
    echo "[UNESI TRENERA]"
    echo ""
    echo "Novi trener je uspješno unesen u bazu."
    echo ""
    pause
}

function naslovnica_admin() {
    while true; do
        clear_screen
        echo "======================================================================"
        echo "                          FitLife admin"
        echo "======================================================================"
        echo ""
        echo "                 Dobrodošli u administratorsko sučelje."
        echo ""
        echo "----------------------------------------------------------------------"
        echo "   Glavni linkovi (Prijavljeni kao: Administrator)"
        echo "----------------------------------------------------------------------"
        echo "   [1] Traži trenera"
        echo "   [2] Unesi trenera"
        echo "   [3] Pregled planova"
        echo ""
        echo "   [4] Odjava"
        echo "----------------------------------------------------------------------"
        echo ""
        read -p "Unesite svoj odabir (1-4): " choice_admin

        case $choice_admin in
            1) trazitrenere_page ;;
            2) unesitrenere_page ;;
            3) popisplanova_page ;;
            4) 
                echo "Uspješno ste se odjavili."
                user_role=""
                email=""
                return # Vraća na glavni izbornik
                ;;
            *)
                echo "Nevažeći unos. Pokušajte ponovo."
                pause
                ;;
        esac
    done
}


# ======================================================================
#                             ČLANSKI DIO
# ======================================================================

function profil_page() {
    clear_screen
    echo "======================================================================"
    echo "                                Vaš profil"
    echo "======================================================================"
    echo ""
    echo "   Ime: korisnik                      Prezime: korisnik"
    echo "   Email: $email                   Telefon: 0987654537"
    echo "   Kilaža (kg): 90.00                 Kategorija: Srednja razina"
    echo ""
    echo "----------------------------------------------------------------------"
    echo "                                 Vaš plan"
    echo "----------------------------------------------------------------------"
    echo ""
    echo "   Naziv plana: Bodybuilding za početnike"
    echo "   Datum početka: 6. lipnja 2025."
    echo "   Datum isteka: 4. rujna 2025."
    echo ""
    echo "----------------------------------------------------------------------"
    echo "                             Dodijeljeni Trener"
    echo "----------------------------------------------------------------------"
    echo ""
    echo "   Ime trenera: Marija Kovač"
    echo "   Stručnost: Yoga"
    echo "   Email trenera: marija.kovac.trener@example.com"
    echo "   Telefon trenera: 0922345678"
    echo ""
    echo "----------------------------------------------------------------------"
    echo "                             Prati Napredak"
    echo "----------------------------------------------------------------------"
    echo ""
    read -p "   Unesite trenutnu težinu (kg): " tezina
    echo "   [DODAJ NAPREDAK]"
    echo ""
    pause
}

function pretragaclanova_page() {
    clear_screen
    echo "======================================================================"
    echo "                          Pretraži Druge Članove"
    echo "======================================================================"
    echo ""
    echo "[...lista članova...]"
    echo ""
    pause
}

function pitajai_page() {
    clear_screen
    echo "======================================================================"
    echo "                                 Pitaj AI"
    echo "======================================================================"
    echo ""
    read -p "Unesite svoje pitanje: " pitanje
    echo ""
    echo "Gemini AI Odgovor: Hvala na pitanju! Preporučam konzistentnost."
    echo ""
    pause
}

function naslovnica_clan() {
    while true; do
        clear_screen
        echo "======================================================================"
        echo "                            FitLife"
        echo "======================================================================"
        echo ""
        echo "               \"Tvoje tijelo može podnijeti gotovo sve...\""
        echo ""
        echo "----------------------------------------------------------------------"
        echo "   Glavni linkovi (Prijavljeni kao: $email)"
        echo "----------------------------------------------------------------------"
        echo "   [1] Profil"
        echo "   [2] Traži trenera"
        echo "   [3] Popis Planova"
        echo "   [4] Pretraži Druge Članove"
        echo "   [5] Pitaj AI"
        echo "   [6] O nama"
        echo ""
        echo "   [7] Odjava"
        echo "----------------------------------------------------------------------"
        echo ""
        read -p "Unesite svoj odabir (1-7): " choice_clan

        case $choice_clan in
            1) profil_page ;;
            2) trazitrenere_page ;;
            3) popisplanova_page ;;
            4) pretragaclanova_page ;;
            5) pitajai_page ;;
            6) onama_page ;;
            7) 
                echo "Uspješno ste se odjavili."
                user_role=""
                email=""
                return # Vraća na glavni izbornik
                ;;
            *)
                echo "Nevažeći unos. Pokušajte ponovo."
                pause
                ;;
        esac
    done
}

# ======================================================================
#                             JAVNI DIO
# ======================================================================

function login_page() {
    clear_screen
    echo "======================================================================"
    echo "                                 Prijava"
    echo "======================================================================"
    echo ""
    echo "(Za admin sučelje unesite: admin@fitlife.com)"
    echo ""
    read -p "   Email adresa: " input_email
    read -s -p "   Lozinka: " pass # -s sakriva unos lozinke
    echo ""
    echo ""
    echo "Prijavljujem vas..."
    sleep 1 # Pauza od 1 sekunde

    email=$input_email
    if [[ "$email" == "admin@fitlife.com" ]]; then
        user_role="admin"
        naslovnica_admin
    else
        user_role="clan"
        naslovnica_clan
    fi
}

function registracija_page() {
    clear_screen
    echo "======================================================================"
    echo "                              Registracija"
    echo "======================================================================"
    echo ""
    read -p "   Ime: " ime
    read -p "   Prezime: " prezime
    read -p "   OIB: " oib
    read -p "   Email: " reg_email
    read -s -p "   Lozinka: " reg_pass1
    echo ""
    read -s -p "   Potvrda lozinke: " reg_pass2
    echo ""
    echo ""
    echo "Uspješno ste se registrirali! Molimo prijavite se."
    echo ""
    pause
    # Vraća kontrolu glavnoj petlji koja će ponovno prikazati meni
}

# Glavna petlja aplikacije
while true; do
    clear_screen
    echo "======================================================================"
    echo "                            FitLife"
    echo "======================================================================"
    echo ""
    echo "               \"Tvoje tijelo može podnijeti gotovo sve,"
    echo "                tvoj um mora biti jači od svih izgovora.\""
    echo ""
    echo "----------------------------------------------------------------------"
    echo "   Glavni linkovi (Niste prijavljeni)"
    echo "----------------------------------------------------------------------"
    echo "   [1] Login"
    echo "   [2] Registracija"
    echo "   [3] O nama"
    echo ""
    echo "   [4] Izlaz"
    echo "----------------------------------------------------------------------"
    echo ""
    read -p "Unesite svoj odabir (1-4): " choice

    case $choice in
        1) login_page ;;
        2) registracija_page ;;
        3) onama_page ;;
        4) exit 0 ;;
        *)
            echo "Nevažeći unos. Pokušajte ponovo."
            pause
            ;;
    esac
done