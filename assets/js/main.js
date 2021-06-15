window.onerror = function(msg, url, line){
    console.log("Poruka: " + msg);
    console.log("URL: " + url);
    console.log("Greska je nastala u liniji: " + line);
}

const path = window.location.pathname;
const url = window.location.href;
const BASEURL = "assets/data/";

window.onload = function(){

    // Hamburger menu
    let burger = document.querySelector(".burger");
    let nav = document.querySelector(".nav-links");
    burger.addEventListener("click", e =>{
        if(e.currentTarget.classList.contains("open")){
            e.currentTarget.classList.remove("open");
            nav.classList.remove('open');
            document.documentElement.style.overflowY = 'auto';
            return;
        }

        e.currentTarget.classList.add("open");
        nav.classList.add('open');
        document.documentElement.style.overflowY = 'hidden';
    })

    pozicioniranje(".find-btn", ".about");
    pozicioniranje(".explore-btn", ".genres"); 
    backToTop(".back-to-top", 300, 1500); 
    

    try{
        ajaxCallback(BASEURL + "menu.json", function(result){
            ispisNavMenija("#navLinks", result);
            ispisBrojaPesamaUPlejlisti();
        });
    
        ajaxCallback(BASEURL + "footer-menu.json", function(result){
            ispisNavMenija("#footer-nav", result);
        });
    
        ajaxCallback(BASEURL + "social.json", function(result){
            ispisListeSocialMeni(result);
        });
        
        ajaxCallback(BASEURL + "genres.json", function(result){
            setToLS("zanrovi", result);
        });

        ajaxCallback(BASEURL + "songs.json", function(result){
            setToLS("pesme", result);
        });

        if(url.indexOf("index.html") != -1){
            ajaxCallback(BASEURL + "genres.json", function(result){
                ispisivanjeZanrova(result);
            })
        }
        if(url.indexOf("songs.html") != -1){
            ajaxCallback(BASEURL + "songs.json", function(result){
                ispisivanjePesama(result);
                ispisChbZanrova();
            });
            
            document.querySelector("#pretraga").addEventListener("keyup", pretraga);
            document.querySelector("#sort").addEventListener("change", sort);
            document.querySelector("#clear-ls").addEventListener("click", removeFromLS);
        }
        if(url.indexOf("playlist.html") != -1){
            ispisPlejliste();
            document.querySelector("#delete-playlist").addEventListener("click", removePlFromLS);
        }
    }
    catch(e){
        alert("Oops something went wrong..." + e);
    }
}

// Funkcija za pozicioniranje klikom na odredjeni element
function pozicioniranje(dugme, pozicija){
    $(dugme).click(function(e) {
        e.preventDefault();
        $('html,body').animate({
            scrollTop: $(pozicija).offset().top},
            2000);
    });
}

// Funkcija za povratak na vrh stranice
function backToTop(pozicija, pikseli, interval){
    $(pozicija).hide();
    $(window).scroll(function(){
        let top = $(this)[0].scrollY;
        if(top > pikseli){
            $(pozicija).show();
        }
        else{
            $(pozicija).hide();
        }
    });

    $(pozicija).click(function(){
        $("html").animate({
            scrollTop: 0
        }, interval);
    });
}

// Funkcija ajax callback
function ajaxCallback(url, result){
    $.ajax({
        url: url,
        method: "get",
        dataType: "json",
        success: result,
        error: function(xhr){
            console.log(xhr)
        }
    })
}

// Funkcija za postavljanje podataka u LS
function setToLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Funkcija za preuzimanje podataka iz LS
function getFromLS(key) {
    return JSON.parse(localStorage.getItem(key));
}

// Funkcija za brisanje filtera
function removeFromLS(){
    localStorage.removeItem("trenutniPrikazPesama");
    location.reload();
}

// Funkcija za brisanje plejliste
function removePlFromLS(){
    localStorage.removeItem("plejlista");
    location.reload();
}

// Funkcija za ispisivanje navigacionog menija
function ispisListeSocialMeni(socMeni){
    let html = "";
    
    socMeni.forEach(link => {    
        html += `<a href="${link.href}" target="_blank"><i class="fab fa-${link.naziv}"></i></a>`
    });

    document.querySelector(".social-links").innerHTML = html;
}

// Funkcija za ispisivanje menija socijalnih mreza
function ispisNavMenija(pozicija, meni){
    let html = "";
    let klasa = "";
    
    meni.forEach(link => {
        if(path.includes(link.href)){
            klasa = "active"
        }
        else{
            klasa = ""
        }
        html += `<li><a class="${klasa}" href="${link.href}">${link.naziv}</a></li>`
    });

    document.querySelector(pozicija).innerHTML = html;
}

// Funkcija za ispisivanje blokova sa zanrovima i ispisivanje informacija o zanru koji je kliknut
function ispisivanjeZanrova(zanrovi){
    let html = "";

    zanrovi.forEach(zanr => {
        html += `<div class="card" data-idkat="${zanr.id}">
                    <p>${zanr.naslov}</p>
                </div>`
    });

    document.querySelector(".genres-wrapper").innerHTML = html;
    
    let cards = document.querySelectorAll(".card");
    cards.forEach(card => {
        card.addEventListener("click", e => {
            let id = e.currentTarget.dataset.idkat;
    
            document.querySelector(".genres-description").innerHTML = zanrovi[id-1].tekst;
        });
    })
}

// Funkcija za ispisivanje checkbox-eva sa imenima zanrova
function ispisChbZanrova(){
    let html = "";
    let zanrovi = getFromLS("zanrovi");

    zanrovi.forEach(zanr => {
        html += `<li><input type="checkbox" class="filter" id="checkbox${zanr.id}" value="${zanr.id}">
                        <label for="checkbox${zanr.id}">${zanr.naslov}</label><span> (${brojPesama(zanr.id)})</span>
                    </li>`
    });

    document.querySelector(".filter-chb").innerHTML = html;
    $(".filter").change(filterZanrova);
}

// Funkcija koja vraca broj pesama za odredjeni zanr
function brojPesama(zanrId){
    let pesme = getFromLS("pesme");
    
    return pesme.filter(p => zanrId == p.zanrovi).length
}

// Funkcija za ispisivanje pesama u songs.html
function ispisivanjePesama(pesme){
    let html = "<ul>";
    
    pesme.forEach(pesma => {
        html += `<li>
        <div class="song-card">
            <img src="${pesma.slika.src}" alt="${pesma.slika.alt}">
            <p>${obradaZanrova(pesma.zanrovi)}</p>
            <div class="full-name">
            <h2>${pesma.pesma}</h2>
            <h3>${pesma.autor}</h3>
            </div>
            <p><b>${pesma.godina}</b></p>
            <p><i data-id="${pesma.id}" class="fas fa-heart add-to-playlist"></i></p>
        </div>
        <div id="info-pop-up" class="sakrij">
            <div id="child-pop">
                <p class="alert-text"></p>
                <button class="close"> Close <button>
            </div>
        </div>
    </li>`
    });

    html += `</ul>`;
    
    document.querySelector(".songs-container").innerHTML = html;
    $(".add-to-playlist").click(dodajUPlejlistu);
    $(".add-to-playlist").click(function(){
        $("#info-pop-up").removeClass("sakrij");
    });
    $(".close").click(function(){
        $("#info-pop-up").addClass("sakrij");
    });
}

// Funkcija za ispis zanrova 
function obradaZanrova(id){
    let zanrovi = getFromLS("zanrovi");
    return zanrovi.filter(d => d.id == id)[0].naslov;
}

// Funkcija za pretragu po nazivu izvodjaca i nazivu pesme
function pretraga(){
    let unos = this.value.toLowerCase();
    let pesme = getFromLS("pesme");

    let filtriranePesme = pesme.filter(p => {
        if(p.autor.toLowerCase().indexOf(unos) !== -1){
            return true
        }
        else if(p.pesma.toLowerCase().indexOf(unos) !== -1){
            return true
        }
    });
    if(filtriranePesme.length){
        ispisivanjePesama(filtriranePesme);
    }
    else{
        document.querySelector(".songs-container").innerHTML = "<p class='src-err'><i class='far fa-frown'></i>  Sorry, we don't have a song with that name at the moment...</p>";
    }
}

// Funkcija za sortiranje pesama
function sort(){
    let izbor = this.value;
    let pesme = getFromLS("pesme");

    if(izbor == "nameAsc"){
        pesme.sort((a, b) => {
            if(a.pesma < b.pesma){
                return -1
            }
            else if(a.pesma > b.pesma){
                return 1
            }
            else{
                return 0
            }
        })
    }
    if(izbor == "nameDesc"){
        pesme.sort((a, b) => {
            if(a.pesma > b.pesma){
                return -1
            }
            else if(a.pesma < b.pesma){
                return 1
            }
            else{
                return 0
            }
        })
    }
    if(izbor == "dateAsc"){
        pesme.sort((a, b) => {
            return a.godina - b.godina
        })
    }
    if(izbor == "dateDesc"){
        pesme.sort((a, b) => {
            return b.godina - a.godina
        })
    }

    ispisivanjePesama(pesme);
}

// Funkcija za filtriranje pesama po zanrovima
function filterZanrova(){
    let izabraniZanrovi = [];
    let pesme = getFromLS("pesme");
    let filtriranePesme = [];

    $(".filter:checked").each(function() {
        izabraniZanrovi.push(parseInt($(this).val()));
    });

    if(izabraniZanrovi.length != 0){
        filtriranePesme = pesme.filter(p => izabraniZanrovi.includes(p.zanrovi));
        ispisivanjePesama(filtriranePesme);
        setToLS("trenutniPrikazPesama", filtriranePesme);
    }
    else{
        ispisivanjePesama(pesme);
    }
}

// Funkcija za obradu plejliste
function dodajUPlejlistu(){
    let id = $(this).data("id");
    let plejlista = getFromLS("plejlista");

    if(plejlista){
        if(pesmaPostoji()){
            $(".alert-text").html("This song is already in the playlist");
        }
        else{
            dodajPesmuULS();
            ispisBrojaPesamaUPlejlisti();
        }
    }
    else{
        dodajPrvuPesmuUPlejlistu();
        ispisBrojaPesamaUPlejlisti();
    }

    // Funkcija za ubacivanje prve pesme u plejlistu
    function dodajPrvuPesmuUPlejlistu(){
        let pesme = [];
        pesme[0] = {
            id: id
        };

        setToLS("plejlista", pesme);
        $(".alert-text").html("You have successfully added a song to the playlist");
    }

    // Funkcija koja proverava da li izabrana pesma vec postoji u plejlisti
    function pesmaPostoji(){
        return plejlista.filter(pl => pl.id == id).length;
    }

    // Funkcija za dodavanje pesme koja ne postoji u plejlisti
    function dodajPesmuULS(){
        let plejlista = getFromLS("plejlista");
        plejlista.push({
            id: id
        });

        setToLS("plejlista", plejlista);
        $(".alert-text").html("You have successfully added a song to the playlist");
    }
}

// Funkcija za ispisivanje broja pesama koje se trenutno nalaze u plejlisti
function ispisBrojaPesamaUPlejlisti(){
    let pesmeIzPlejliste = getFromLS("plejlista");
    
    if(pesmeIzPlejliste != null){
        let brojPesama = pesmeIzPlejliste.length;
        document.querySelector("#broj").innerHTML = brojPesama;
    }
    else{
        document.querySelector("#broj").innerHTML = "0";
    }
}

// Funkcija za ispisivanje plejliste na stranici playlist.html
function ispisPlejliste(){
    let plejlista = getFromLS("plejlista");

    if(plejlista != null && plejlista.length != 0){
        ispisivanjePesamaUPlejlistu();
    }
    else{
        ispisPraznePlejliste();
    }

    // Funkcija prikaz sadrzaja iz LS u plejlisti
    function ispisivanjePesamaUPlejlistu(){
        let html = "";
        let plejlista = getFromLS("plejlista");
        let pesme = getFromLS("pesme");
        let filtriranePesme = [];

        filtriranePesme = pesme.filter(p => {
            for(let plej of plejlista){
                if(p.id == plej.id){
                    return p
                }
            }
        })

        filtriranePesme.forEach((pesma, index) => {
            html += `<li class="partial-wrapper">
                        <div class="about-section">
                            <div class="song-image">
                                <img src="${pesma.slika.src}" alt="${pesma.slika.alt}">
                            </div>
                            <div class="song-name">
                                <span>${index + 1}. </span><p> ${pesma.autor} - ${pesma.pesma}</p>
                            </div>
                        </div>
                        <div class="player-control">
                        <div class="player">
                            <audio controls>
                                <source src="${pesma.traka}" type="audio/mpeg">
                            </audio>
                            </div>
                            <div class="remove-song">
                            <i class="fas fa-minus-circle red" data-idpesme=${pesma.id}></i>
                        </div>
                    </li>`
        });

        document.querySelector("#playlist").innerHTML = html;
        document.querySelector(".headline").innerHTML = `<h1>Enjoy your playlist!</h1>`;
        $(".red").click(brisanjePesme);
        obradaTrajanjaPlejliste(filtriranePesme);
    }

    // Funkcija za prikaz plejliste za koju nema podataka u LS
    function ispisPraznePlejliste(){
        document.querySelector(".headline").innerHTML = `<h1>Your playlist is currently empty...</h1>`;
    }

    // Funkcija za brisanje pesme iz plejliste
    function brisanjePesme(){
    let id = $(this).data("idpesme");

    let plejlista = getFromLS("plejlista");
    let filtriranePesme = plejlista.filter(p => p.id != id);

    setToLS("plejlista", filtriranePesme);
    ispisivanjePesamaUPlejlistu();
    ispisBrojaPesamaUPlejlisti();

    if(filtriranePesme.length == 0){
        ispisPraznePlejliste();
    }
    }
}

// Funkcija za sabiranje ukupnog trajanja pesama koje se nalaze u plejlisti
function obradaTrajanjaPlejliste(pesme){
    let nizMin = [];
    let nizSec = [];
    
    pesme.forEach(z => {
        nizMin.push(z.trajanje.min);
        nizSec.push(z.trajanje.sec)
    });
    
    let sumMin = nizMin.reduce(function(a, b){
        return a + b;
    }, 0);

    let sumSec = nizSec.reduce(function(a, b){
        return a + b;
    }, 0);

    let ostatak = sumSec%60;
    let finalMin = sumSec/60 >= 1 ? sumMin + Math.floor(sumSec/60) : sumMin;
    
    document.querySelector("#dur").innerHTML = finalMin + "min " + ostatak + "sec";
}

// Funkcija za proveru regularnih izraza
function proveraRegEx(reg, element){
    if(!$(element).val().match(reg)){
        $(element).addClass("error");
        return false;
    }
    else{
        $(element).removeClass("error");
        $(element).addClass("ok");
        return true;
    }
}
// Validacija forme
let ime = $("#tbIme");
let prezime = $("#tbPrezime");
let email = $("#tbEmail");
let lista = $("#ddlAnketa");
let poruka = $("#taPoruka");
let reIme = /^[A-ZČĆŽŠĐ][a-zčćžšđ]{2,14}$/;
let rePrezime = /^[A-ZČĆŽŠĐ][a-zčćžšđ]{2,19}(\s[A-ZČĆŽŠĐ][a-zčćžšđ]{2,19})*$/;
let reEmail = /^[a-z][\w\.]*\@[a-z0-9]{3,20}(\.[a-z]{3,5})?(\.[a-z]{2,3})+$/;
let brojGresaka = 0;

$(ime).blur(function(){
    proveraRegEx(reIme, ime);
})

$(prezime).blur(function(){
    proveraRegEx(rePrezime, prezime);
})

$(email).blur(function(){
    proveraRegEx(reEmail, email);
})

$(lista).blur(function(){
    if(lista.val() == "0"){
        $(lista).addClass("error");
    }
    else{
        $(lista).removeClass("error");
        $(lista).addClass("ok");
    }
})

$(poruka).blur(function(){
    if(poruka.val() == ""){
        $(poruka).addClass("error");
    }
    else{
        $(poruka).removeClass("error");
        $(poruka).addClass("ok");
    }
})

$("#btnSend").click(function() {
    let brojGresaka = 0;

    if(!proveraRegEx(reIme, ime)){
        brojGresaka++;
    }

    if(!proveraRegEx(rePrezime, prezime)){
        brojGresaka++;
    }

    if(!proveraRegEx(reEmail, email)){
        brojGresaka++;
    }

    if(lista.val() == "0"){
        $(lista).addClass("error");
        brojGresaka++;
    }
    else{
        $(lista).removeClass("error");
        $(lista).addClass("ok");
    }

    if(poruka.val() == ""){
        $(poruka).addClass("error");
        brojGresaka++;
    }
    else{
        $(poruka).removeClass("error");
        $(poruka).addClass("ok");
    }

    if(brojGresaka == 0){
        $(".success").removeClass("hide");
        $(".red").addClass("hide");
        window.setTimeout(function()
        {
            location.reload()
        }, 1000)
    }

})